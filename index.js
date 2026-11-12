// 学习台（dsh-learning-studio）— Host 半。
// 职责：把「生成概念导读 / 追问回答 / 关联发现 / 费曼提问 / 复述评价」包装成本包私有的 JSON RPC，
// 由 Web 半通过 POST /_dsh/dsh-learning-studio/<method> 调用。模型调用走 ctx.llm，不写入任何会话日志。
//
// 依赖都是按能力读取的：llm 缺失时返回可读的 503，webServer/connection 缺失时（例如 CLI 运行）
// 整个 RPC 注册被跳过，但 Host 插件本身仍正常加载。
const PACKAGE = 'dsh-learning-studio'
const ROUTE_PREFIX = '/_dsh/' + PACKAGE
const VERSION = '0.1.4'

const DEFAULT_MODEL_PREFERENCE = {
  generate: { temperature: 0.45, maxTokens: 5600, effort: 'medium' },
  outline: { temperature: 0.35, maxTokens: 1400, effort: 'low' },
  ask: { temperature: 0.3, maxTokens: 1800, effort: 'low' },
  link: { temperature: 0.1, maxTokens: 900, effort: 'low' },
  feynman: { temperature: 0.4, maxTokens: 1400, effort: 'medium' },
  grade: { temperature: 0.1, maxTokens: 1400, effort: 'low' },
}

const LEVEL_TEXT = {
  intro: '入门（假定读者第一次接触它，多用类比，少用术语）',
  standard: '系统（假定读者有相关背景，讲清机制与边界）',
  deep: '深入（假定读者要能迁移运用，讲清前提、失效条件与相邻概念的区别）',
}

function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

function asText(value, name, max) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw httpError(400, `缺少 ${name}`)
  }
  const text = value.trim()
  if (text.length > max) throw httpError(400, `${name} 太长（上限 ${max} 字）`)
  return text
}

function optionalText(value, max) {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  return text.length > max ? text.slice(0, max) : text
}

/**
 * 从模型回复里抽出第一个完整 JSON 值。
 * 模型偶尔会包 ```json 围栏、或者先写一句「以下是结果」，所以不能直接 JSON.parse。
 */
export function parseJsonLoose(raw) {
  if (typeof raw !== 'string') return null
  let text = raw.trim()
  if (text === '') return null
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  try {
    return JSON.parse(text)
  } catch {
    /* 继续从文本里截取 */
  }
  const start = text.search(/[{[]/)
  if (start < 0) return null
  const open = text[start]
  const close = open === '{' ? '}' : ']'
  // 从后往前找最后一个闭合符，容忍被截断的尾巴。
  for (let end = text.lastIndexOf(close); end > start; end = text.lastIndexOf(close, end - 1)) {
    const candidate = text.slice(start, end + 1)
    try {
      return JSON.parse(candidate)
    } catch {
      /* 换更短的候选 */
    }
  }
  return null
}

function clampArray(value, max) {
  return Array.isArray(value) ? value.slice(0, max) : []
}

/**
 * 学习维度：客户端勾选后回传，Host 再清洗一遍，避免把过长/重复的标题塞进提示词。
 * 上限 9 个，标题作为小节骨架，所以宁可少而清楚。
 */
function normalizeAspects(value) {
  const out = []
  const seen = new Set()
  for (const item of clampArray(value, 12)) {
    if (!item || typeof item !== 'object') continue
    const title = optionalText(item.title, 80)
    if (title === '' || title.length > 40 || seen.has(title)) continue
    seen.add(title)
    out.push({ title, summary: optionalText(item.summary, 160) })
    if (out.length >= 9) break
  }
  return out
}

function normalizeVerdict(value) {
  return value === 'pass' || value === 'partial' || value === 'fail' ? value : 'partial'
}

// 上游偶尔会在流开始/中途断开（例如 "DeepSeek message transport fail"）。
// 这类失败重试一次通常就好了；配置错误、鉴权失败之类不能重试，否则只是重复扣费。
const TRANSIENT_PATTERN = /transport|network|fetch failed|econn|etimedout|esocket|socket hang up|stream (?:error|closed)|temporar|too many requests|rate.?limit|\b(?:429|500|502|503|504)\b/i

function isTransientFailure(message) {
  return TRANSIENT_PATTERN.test(String(message || ''))
}

function modelFailureText(raw) {
  const text = String(raw || '模型调用失败')
  if (isTransientFailure(text)) {
    return '模型连接中断了（' + text + '）。已自动重试一次仍未成功，可以点卡片上的「重试」再发一次。'
  }
  return text
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function apply(ctx, config = {}) {
  const cfg = config && typeof config === 'object' ? config : {}

  /** 读取默认模型；显式配置优先。 */
  function selection() {
    let current = {}
    try {
      const service = ctx.get('agentDefaultModel')
      if (service && typeof service.currentSelection === 'function') {
        current = service.currentSelection() || {}
      }
    } catch {
      /* 服务缺失时退回模型目录 */
    }
    const provider = optionalText(cfg.provider, 200) || optionalText(current.provider, 200)
    const model = optionalText(cfg.model, 200) || optionalText(current.model, 200)
    return {
      provider,
      model,
      reasoningEffort: optionalText(cfg.reasoningEffort, 40) || optionalText(current.reasoningEffort, 40),
    }
  }

  async function pickEffort(llm, provider, model, wanted) {
    if (!wanted) return undefined
    try {
      const info = await llm.resolveModelInfo(provider, model)
      const efforts = info && info.reasoning && Array.isArray(info.reasoning.efforts) ? info.reasoning.efforts : []
      if (efforts.length === 0) return undefined
      const hit = efforts.find((item) => item && item.id === wanted)
      if (hit) return hit.id
      const fallback = info.reasoning.defaultEffort || (efforts[0] && efforts[0].id)
      return typeof fallback === 'string' ? fallback : undefined
    } catch {
      // 能力查询失败时宁可省略 effort，让适配器使用自己的默认值。
      return undefined
    }
  }

  /**
   * 一次非流式模型调用：内部累加 delta，对上层只给最终文本。
   * 学习台不需要 token 级渲染，但必须拿到完整文本后再解析 JSON / Markdown。
   */
  async function complete(spec) {
    const llm = ctx.get('llm')
    if (!llm || typeof llm.stream !== 'function') {
      throw httpError(503, '模型服务尚未就绪（ctx.llm 不可用），请确认 Harness 已登录模型提供商')
    }
    const picked = selection()
    const provider = picked.provider
    const model = picked.model
    if (!provider || !model) {
      throw httpError(503, '还没有可用的默认模型，请先在 Harness 里选择一个模型')
    }
    const style = DEFAULT_MODEL_PREFERENCE[spec.kind] || DEFAULT_MODEL_PREFERENCE.ask
    const effort = await pickEffort(llm, provider, model, spec.effort || picked.reasoningEffort || style.effort)
    const options = {
      provider,
      model,
      system: spec.system,
      messages: [{ role: 'user', content: [{ type: 'text', text: spec.user }] }],
      temperature: typeof spec.temperature === 'number' ? spec.temperature : style.temperature,
      maxTokens: spec.maxTokens || style.maxTokens,
      signal: spec.signal,
    }
    if (effort) options.reasoningEffort = effort

    const deltas = []
    let blockText = ''
    let failure = ''
    let streamError = null
    let failureMessage = ''
    // 一次自动重试：只在「传输类」失败时进行，且不吞掉用户主动取消。
    for (let attempt = 0; attempt < 2; attempt++) {
      deltas.length = 0
      blockText = ''
      failure = ''
      streamError = null
      try {
        for await (const chunk of llm.stream(options)) {
          if (!chunk || typeof chunk !== 'object') continue
          if (chunk.type === 'text-delta' && typeof chunk.text === 'string') {
            deltas.push(chunk.text)
          } else if (chunk.type === 'block-end' && chunk.block && chunk.block.type === 'text') {
            blockText += typeof chunk.block.text === 'string' ? chunk.block.text : ''
          } else if (chunk.type === 'finish' && chunk.reason) {
            if (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted') {
              failure = chunk.reason.kind === 'aborted'
                ? '模型调用被中断'
                : String((chunk.reason.failure && chunk.reason.failure.message) || '模型调用失败')
            }
          }
        }
      } catch (error) {
        if (spec.signal && spec.signal.aborted) throw httpError(502, '模型调用被中断')
        streamError = error
        failure = String((error && error.message) || error)
      }
      const rawFailure = failure || (streamError ? String(streamError.message || streamError) : '')
      if (rawFailure) {
        failureMessage = rawFailure
        if (attempt === 0 && !(spec.signal && spec.signal.aborted) && isTransientFailure(rawFailure)) {
          await wait(800)
          continue
        }
        throw httpError(502, modelFailureText(rawFailure))
      }
      const text = (deltas.join('') || blockText).trim()
      if (text === '') throw httpError(502, '模型返回了空内容，请重试')
      return { text, provider, model }
    }
    throw httpError(502, modelFailureText(failureMessage || '模型调用失败'))
  }

  const SYSTEM = '你是一位中文学习教练，擅长把复杂概念拆成可逐段阅读的讲解，并以提问推进理解。'
    + '你只输出用户要求的内容：不写寒暄、不写"以下是"、不解释自己的输出格式。'

  function generatePrompt(topic, level, aspects) {
    const titles = (aspects || []).map((aspect) => aspect.title).filter(Boolean)
    const lines = [`请为概念「${topic}」写一份${LEVEL_TEXT[level] || LEVEL_TEXT.standard}导读。`]
    if (titles.length > 0) {
      lines.push('学习者已经确认要了解下面这些方面。请严格按这个顺序、一个方面一节来展开：')
      titles.forEach((title, index) => lines.push(`${index + 1}. ${title}`))
      lines.push('小节标题直接使用上面这些方面名（可小幅调整措辞），不要合并、拆分或新增无关小节；每个方面都要讲透，不要平均用力到空话。')
      lines.push('格式要求：')
      lines.push(`1. 用 Markdown；一级小节标题用 "## "，共 ${titles.length} 节；`)
    } else {
      lines.push('格式要求：')
      lines.push('1. 用 Markdown；一级小节标题用 "## "（共 4-8 节），标题简短具体；')
    }
    lines.push(
      '2. 每节 2-4 个自然段；每个自然段单独一行，段与段之间空一行；',
      '3. 不要使用列表、表格、代码块、引用块、加粗或链接——正文就是普通中文段落；',
      '4. 如果选定的方面里没有"定义"，第一节仍要先用一两句话给出定义，再进入该方面；最后一节若涉及边界或相邻概念，要讲清它和相近概念的区别；',
      `5. 术语第一次出现时用一句同位语解释；全篇 ${titles.length > 0 ? '1500-3000' : '1200-2000'} 字；`,
      '6. 直接输出正文，不要标题以外的开场白或结束语。',
    )
    return lines.join('\n')
  }

  function outlinePrompt(topic, level) {
    return [
      `请为概念「${topic}」设计一份用于系统学习的知识模板，学习深度是${LEVEL_TEXT[level] || LEVEL_TEXT.standard}。`,
      '输出 JSON 数组，包含 6-9 个学习方面，按从基础到应用的顺序排列。每项格式：',
      '{"title":"方面名，不超过 10 个字","summary":"这个方面要回答什么，20-40 字","keyQuestions":["2-3 个具体问题"]}',
      '方面要覆盖：定义与本质、为什么重要/解决什么问题、核心机制/如何运作、关键要素与分类、具体例子与反例、适用边界与常见误解、与相邻概念的区别、历史脉络或应用前沿。',
      '可以按这个概念的特点取舍或合并相近方面，但不要只给泛泛的"概述""应用"这类空标题；title 不要带序号。',
      '只输出 JSON 数组，不要输出 markdown 围栏或任何其他文字。',
    ].join('\n')
  }

  function askPrompt(args) {
    const lines = [
      `概念：${args.topic}`,
      args.section ? `所在小节：${args.section}` : '',
      args.paragraph ? `原文段落：\n${args.paragraph}` : '',
      `用户划线的片段：「${args.quote}」`,
      `用户的问题：${args.question}`,
    ]
    if (args.parentQuestion) {
      lines.push(`这是追问。上一轮的问答：\n问：${args.parentQuestion}\n答：${optionalText(args.parentAnswer, 1600)}`)
    }
    lines.push(
      '请用中文回答，150-400 字。要求：',
      '- 先直接回答问题，再说明它在这段原文、以及整个概念中的位置；',
      '- 如果答案依赖原文没有写出的前提，先明确说"原文没有展开这一点"，再补充；',
      '- 不要复述整段原文；不要用"好问题""当然可以"之类的空话；',
      '- 只有在确实有助于理解时才用类比，且类比后要点明它在哪里不成立。',
    )
    return lines.filter(Boolean).join('\n')
  }

  function linkPrompt(newCard, cards) {
    return [
      '你在帮学习者把零散的问答组织成知识网络。',
      `新卡片：\n${JSON.stringify(newCard, null, 2)}`,
      `已有卡片（最多 20 条）：\n${JSON.stringify(cards, null, 2)}`,
      '找出新卡片与已有卡片之间真实存在的知识关联，最多 3 条，宁缺毋滥。',
      'kind 只能取：因果、前提、对比、同一机制、延伸。',
      'reason 不超过 30 个汉字，必须点出具体的关联点，不要写"两者相关"这种空话。',
      '只输出 JSON 数组，例如：[{"id":"c1","kind":"前提","reason":"两者都依赖同一前提：…"}]',
      '没有真实关联就输出 []。不要输出任何其他文字。',
    ].join('\n')
  }

  function feynmanPrompt(topic, markdown) {
    return [
      `下面是关于「${topic}」的学习材料：\n\n${markdown}`,
      '',
      '请设计 5 个用于费曼自测的关键问题，覆盖不同角度：核心定义、为什么需要它、机制如何运作、具体例子中的判断、边界或常见误解、与相邻概念的关系（从中选 5 个）。',
      '每题只问一个点，必须逼迫学习者用自己的话解释，而不是复述原文措辞。',
      '只输出 JSON 数组，例如：[{"prompt":"如果要用一句话向没学过的人解释 X，你会怎么说？","focus":"核心定义"}]',
      '不要输出任何其他文字。',
    ].join('\n')
  }

  function gradePrompt(args) {
    return [
      `学习材料：\n${args.markdown}`,
      '',
      `自测问题：${args.prompt}`,
      `学习者的复述：${args.answer}`,
      '',
      '请以严格但建设性的标准评价这段复述，判断他是否真的用自己的话讲清了这个问题。',
      '只输出 JSON 对象：',
      '{"verdict":"pass|partial|fail","score":0-100,"missing":["遗漏的关键点，最多 3 条"],"feedback":"2-4 句具体评价：哪里讲对了、哪里含糊或错误、下一步该补什么","hint":"一句启发式提示，帮助他自己想起来，不要直接给完整答案"}',
      '判定标准：pass 仅当关键点齐全、没有概念性错误、且确实是自己的解释；有关键遗漏或错误用 partial/fail。',
      '不要输出任何其他文字。',
    ].join('\n')
  }

  const ROUTES = {
    async ping() {
      const picked = selection()
      const llm = ctx.get('llm')
      return {
        ok: true,
        version: VERSION,
        modelReady: Boolean(llm && typeof llm.stream === 'function'),
        model: { provider: picked.provider, model: picked.model },
      }
    },

    async outline(args) {
      const input = args || {}
      const topic = asText(input.topic, '概念名称', 120)
      const level = typeof input.level === 'string' ? input.level : 'standard'
      const out = await complete({
        kind: 'outline',
        system: SYSTEM,
        user: outlinePrompt(topic, level),
        signal: input.__signal,
      })
      const parsed = parseJsonLoose(out.text)
      const raw = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.aspects) ? parsed.aspects : [])
      const aspects = []
      const seen = new Set()
      for (const item of clampArray(raw, 9)) {
        if (!item || typeof item !== 'object') continue
        const title = optionalText(item.title, 40)
        if (title === '' || seen.has(title)) continue
        seen.add(title)
        const keyQuestions = clampArray(item.keyQuestions, 3)
          .map((question) => optionalText(question, 120))
          .filter((question) => question !== '')
        aspects.push({ title, summary: optionalText(item.summary, 160), keyQuestions })
      }
      if (aspects.length < 3) throw httpError(502, '模型没有返回可用的知识模板，请重试')
      return { aspects, model: { provider: out.provider, model: out.model } }
    },

    async generate(args) {
      const topic = asText(args && args.topic, '概念名称', 120)
      const level = args && typeof args.level === 'string' ? args.level : 'standard'
      const aspects = normalizeAspects(args && args.aspects)
      const signal = args && args.__signal
      const out = await complete({
        kind: 'generate',
        system: SYSTEM,
        user: generatePrompt(topic, level, aspects),
        signal,
      })
      return { markdown: out.text, aspects, model: { provider: out.provider, model: out.model } }
    },

    async ask(args) {
      const input = args || {}
      const topic = asText(input.topic, '概念名称', 120)
      const quote = asText(input.quote, '划线内容', 2000)
      const question = asText(input.question, '问题', 4000)
      const out = await complete({
        kind: 'ask',
        system: SYSTEM,
        user: askPrompt({
          topic,
          section: optionalText(input.section, 200),
          paragraph: optionalText(input.paragraph, 4000),
          quote,
          question,
          parentQuestion: optionalText(input.parentQuestion, 2000),
          parentAnswer: optionalText(input.parentAnswer, 4000),
        }),
        signal: input.__signal,
      })
      return { answer: out.text, model: { provider: out.provider, model: out.model } }
    },

    async link(args) {
      const input = args || {}
      const newCard = input.newCard && typeof input.newCard === 'object' ? input.newCard : null
      if (!newCard) throw httpError(400, '缺少 newCard')
      const cards = clampArray(input.cards, 20).map((card) => ({
        id: optionalText(card && card.id, 80),
        question: optionalText(card && card.question, 400),
        answer: optionalText(card && card.answer, 600),
      })).filter((card) => card.id !== '' && card.id !== optionalText(newCard.id, 80))
      if (cards.length === 0) return { links: [] }
      const out = await complete({
        kind: 'link',
        system: SYSTEM,
        user: linkPrompt({
          id: optionalText(newCard.id, 80),
          quote: optionalText(newCard.quote, 400),
          question: optionalText(newCard.question, 600),
          answer: optionalText(newCard.answer, 1200),
        }, cards),
        signal: input.__signal,
      })
      const parsed = parseJsonLoose(out.text)
      const list = Array.isArray(parsed) ? parsed : []
      const known = new Set(cards.map((card) => card.id))
      const links = []
      for (const item of list) {
        if (!item || typeof item !== 'object') continue
        const id = optionalText(item.id, 80)
        if (!known.has(id) || links.some((link) => link.id === id)) continue
        links.push({
          id,
          kind: optionalText(item.kind, 20) || '延伸',
          reason: optionalText(item.reason, 120),
        })
        if (links.length >= 3) break
      }
      return { links }
    },

    async feynman(args) {
      const input = args || {}
      const topic = asText(input.topic, '概念名称', 120)
      const markdown = asText(input.markdown, '学习材料', 20000)
      const out = await complete({
        kind: 'feynman',
        system: SYSTEM,
        user: feynmanPrompt(topic, markdown),
        signal: input.__signal,
      })
      const parsed = parseJsonLoose(out.text)
      const raw = Array.isArray(parsed) ? parsed : []
      const questions = raw.slice(0, 6).map((item) => ({
        prompt: optionalText(item && item.prompt, 500),
        focus: optionalText(item && item.focus, 40),
      })).filter((item) => item.prompt !== '')
      if (questions.length === 0) throw httpError(502, '模型没有给出可用的自测问题，请重试')
      return { questions }
    },

    async grade(args) {
      const input = args || {}
      const markdown = asText(input.markdown, '学习材料', 20000)
      const prompt = asText(input.prompt, '自测问题', 1000)
      const answer = asText(input.answer, '复述内容', 6000)
      const out = await complete({
        kind: 'grade',
        system: SYSTEM,
        user: gradePrompt({ markdown, prompt, answer }),
        signal: input.__signal,
      })
      const parsed = parseJsonLoose(out.text)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        // 解析失败不能伪装成一次正常评价：把原文交给学习者自己判断，并标记为「未评分」。
        return {
          verdict: 'partial',
          score: 0,
          missing: [],
          feedback: '评价结果没有按要求的 JSON 返回，下面这段是模型的原始反馈：\n\n' + out.text.slice(0, 1200),
          hint: '',
          parseError: true,
        }
      }
      return {
        verdict: normalizeVerdict(parsed.verdict),
        score: Number.isFinite(Number(parsed.score)) ? Math.max(0, Math.min(100, Math.round(Number(parsed.score)))) : 0,
        missing: clampArray(parsed.missing, 5).map((item) => optionalText(item, 200)).filter(Boolean),
        feedback: optionalText(parsed.feedback, 2000),
        hint: optionalText(parsed.hint, 500),
      }
    },
  }

  // ---------- Web RPC ----------
  function readBody(req, maxBytes) {
    return new Promise((resolve, reject) => {
      const chunks = []
      let size = 0
      req.on('data', (chunk) => {
        size += chunk.length
        if (size > maxBytes) {
          const err = httpError(413, '请求体过大')
          reject(err)
          req.destroy()
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', reject)
    })
  }

  function respond(res, status, payload) {
    // 调用方已经断开（切换面板、刷新页面）时不再写入，否则会抛 ERR_STREAM_DESTROYED。
    if (res.destroyed || res.writableEnded) return
    const body = JSON.stringify(payload)
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
      'Cache-Control': 'no-store',
    })
    res.end(body)
  }

  ctx.inject(['connection', 'webServer'], (webCtx) => {
    webCtx.effect(() => {
      const dispose = webCtx.webServer.register({
        kind: 'prefix',
        path: ROUTE_PREFIX,
        handler: async (req, res) => {
          let method = ''
          try {
            // Desktop 会移除 renderer 的 Origin/Host 并补自己的 Host cookie；必须走这把共享校验。
            const rejection = webCtx.connection.requestRejection(req)
            if (rejection !== undefined) {
              respond(res, rejection, { error: rejection === 401 ? '需要登录 Harness' : '请求被拒绝' })
              return
            }
            const url = new URL(req.url || '/', 'http://localhost')
            if (!url.pathname.startsWith(ROUTE_PREFIX + '/')) {
              respond(res, 404, { error: 'not found' })
              return
            }
            method = decodeURIComponent(url.pathname.slice(ROUTE_PREFIX.length + 1))
            const fn = Object.hasOwn(ROUTES, method) ? ROUTES[method] : null
            if (typeof fn !== 'function') {
              respond(res, 404, { error: '未知方法：' + method })
              return
            }
            if (req.method !== 'POST') {
              respond(res, 405, { error: '学习台的 RPC 只接受 POST' })
              return
            }
            const raw = await readBody(req, 256 * 1024)
            let args = {}
            if (raw.length > 0) {
              try {
                args = JSON.parse(raw)
              } catch {
                respond(res, 400, { error: '请求体不是合法 JSON' })
                return
              }
            }
            if (!args || typeof args !== 'object' || Array.isArray(args)) args = {}
            // 调用方断开时中止模型流，避免继续消耗额度。
            if (typeof AbortController === 'function') {
              const controller = new AbortController()
              const onClose = () => {
                if (!res.writableEnded) controller.abort()
              }
              res.on('close', onClose)
              args.__signal = controller.signal
              try {
                const result = await fn(args)
                respond(res, 200, result)
              } finally {
                res.removeListener('close', onClose)
              }
              return
            }
            const result = await fn(args)
            respond(res, 200, result)
          } catch (err) {
            const status = (err && err.status) || 500
            if (status === 500) {
              console.warn('[' + PACKAGE + '] RPC ' + (method || 'unknown') + ' failed: ' + String((err && err.stack) || err))
            }
            if (res.headersSent) {
              res.destroy(err)
              return
            }
            respond(res, status, { error: status === 500 ? '学习台内部错误，请重试' : String((err && err.message) || err) })
          }
        },
      })
      return () => dispose()
    }, PACKAGE + ': Web RPC')
  })
}

export const name = PACKAGE
