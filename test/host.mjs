// Host 半的端到端 RPC 测试：不连真模型，用假的 ctx.llm 验证路由、校验、提示词拼装与 JSON 解析。
// 运行：node test/host.mjs
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { apply } from '../index.js'

let reply = ''
let seen = []
let failures = 0
let failureMessage = 'DeepSeek message transport fail'
let finishFailure = ''

const llm = {
  async *stream(options) {
    seen.push(options)
    if (failures > 0) {
      failures -= 1
      throw new Error(failureMessage)
    }
    if (finishFailure) {
      const message = finishFailure
      finishFailure = ''
      yield { type: 'finish', reason: { kind: 'error', failure: { message } } }
      return
    }
    yield { type: 'text-delta', text: reply.slice(0, Math.ceil(reply.length / 2)) }
    yield { type: 'text-delta', text: reply.slice(Math.ceil(reply.length / 2)) }
    yield { type: 'finish', reason: { kind: 'stop' } }
  },
  async resolveModelInfo() {
    return { reasoning: { efforts: [{ id: 'low' }, { id: 'high' }], defaultEffort: 'low' } }
  },
}

let registered = null
const ctx = {
  get(name) {
    if (name === 'llm') return llm
    if (name === 'agentDefaultModel') return { currentSelection: () => ({ provider: 'test-provider', model: 'test-model' }) }
    return undefined
  },
  inject(deps, callback) {
    callback({
      connection: { requestRejection: () => undefined },
      webServer: {
        register(route) {
          registered = route
          return () => {}
        },
      },
      effect(run) {
        run()
      },
    })
  },
  effect(callback) {
    callback()
  },
}

apply(ctx, {})
assert.ok(registered, 'web route registered')
assert.equal(registered.kind, 'prefix')
assert.equal(registered.path, '/_dsh/dsh-learning-studio')

function call(method, body) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter()
    req.method = 'POST'
    req.url = '/_dsh/dsh-learning-studio/' + method
    req.headers = { 'content-type': 'application/json' }
    const res = new EventEmitter()
    res.destroyed = false
    res.headersSent = false
    res.writableEnded = false
    res.writeHead = (status) => { res.status = status; res.headersSent = true }
    res.end = (payload) => { res.writableEnded = true; res.body = payload }
    registered.handler(req, res).then(() => {
      const text = res.body || ''
      let json = null
      try { json = JSON.parse(text) } catch { /* 非 JSON 由断言暴露 */ }
      resolve({ status: res.status, json, text })
    }, reject)
    process.nextTick(() => {
      if (body !== undefined) req.emit('data', Buffer.from(JSON.stringify(body)))
      req.emit('end')
    })
  })
}

// ping
{
  const result = await call('ping', {})
  assert.equal(result.status, 200)
  assert.equal(result.json.ok, true)
  assert.equal(result.json.modelReady, true)
  assert.equal(result.json.model.model, 'test-model')
}

// generate
{
  reply = '## 定义\n\n第一段。\n\n## 机制\n\n第二段。'
  const result = await call('generate', { topic: '机会成本', level: 'intro' })
  assert.equal(result.status, 200)
  assert.equal(result.json.markdown, reply)
  assert.match(seen.at(-1).messages[0].content[0].text, /机会成本/)
  assert.equal(seen.at(-1).provider, 'test-provider')
  assert.equal(seen.at(-1).temperature, 0.45)
}

// outline：解析带围栏的 JSON，规范化去重，保留 keyQuestions
{
  reply = '```json\n[{"title":"定义与本质","summary":"它到底是什么","keyQuestions":["一句话定义？","和什么容易混？"]},{"title":"为什么重要","summary":"解决什么问题","keyQuestions":[]},{"title":"核心机制","summary":"如何运作","keyQuestions":["关键步骤？"]},{"title":"定义与本质","summary":"重复项","keyQuestions":[]}]\n```'
  const result = await call('outline', { topic: '机会成本', level: 'standard' })
  assert.equal(result.status, 200)
  assert.equal(result.json.aspects.length, 3)
  assert.equal(result.json.aspects[0].title, '定义与本质')
  assert.deepEqual(result.json.aspects[0].keyQuestions, ['一句话定义？', '和什么容易混？'])
  assert.equal(seen.at(-1).temperature, 0.35)
}

// outline：不足 3 个方面 -> 502
{
  reply = '[{"title":"只有一项"}]'
  const result = await call('outline', { topic: '机会成本' })
  assert.equal(result.status, 502)
  assert.match(result.json.error, /知识模板/)
}

// generate 带 aspects：提示词按方面逐节展开，超长/重复标题被过滤
{
  reply = '## 定义与本质\n\n第一段。\n\n## 核心机制\n\n第二段。'
  const result = await call('generate', {
    topic: '机会成本',
    level: 'standard',
    aspects: [
      { title: '定义与本质' },
      { title: '核心机制', summary: '如何运作' },
      { title: '定义与本质' },
      { title: 'x'.repeat(50) },
    ],
  })
  assert.equal(result.status, 200)
  const prompt = seen.at(-1).messages[0].content[0].text
  assert.match(prompt, /定义与本质/)
  assert.match(prompt, /核心机制/)
  assert.match(prompt, /共 2 节/)
  assert.equal(result.json.aspects.length, 2)
  assert.equal(seen.at(-1).maxTokens, 5600)
}

// ask 输入校验
{
  const result = await call('ask', { topic: '机会成本' })
  assert.equal(result.status, 400)
}

// link：解析带围栏的 JSON，过滤未知 id，最多 3 条
{
  reply = '```json\n[{"id":"q2","kind":"前提","reason":"两者都需要先承认稀缺"},{"id":"nope","kind":"因果","reason":"x"}]\n```'
  const result = await call('link', {
    newCard: { id: 'q1', question: '为什么?', answer: '因为稀缺' },
    cards: [{ id: 'q2', question: '稀缺意味着什么?', answer: '必须取舍' }],
  })
  assert.equal(result.status, 200)
  assert.equal(result.json.links.length, 1)
  assert.equal(result.json.links[0].id, 'q2')
  assert.equal(result.json.links[0].kind, '前提')
}

// feynman：坏的 JSON 必须报 502，而不是给出空题
{
  reply = '我建议你思考以下问题……'
  const result = await call('feynman', { topic: '机会成本', markdown: '## 定义\n\n正文。' })
  assert.equal(result.status, 502)
}

// grade：正常 JSON
{
  reply = '{"verdict":"pass","score":88,"missing":[],"feedback":"讲清了取舍。","hint":""}'
  const result = await call('grade', {
    markdown: '## 定义\n\n正文。', prompt: '什么是机会成本?', answer: '为了得到一样东西放弃的最好的替代方案。',
  })
  assert.equal(result.status, 200)
  assert.equal(result.json.verdict, 'pass')
  assert.equal(result.json.score, 88)
}

// grade：解析失败时降级为 partial，并保留原始反馈
{
  reply = '这段复述基本正确，但少了一个关键点。'
  const result = await call('grade', {
    markdown: '## 定义\n\n正文。', prompt: '什么是机会成本?', answer: '放弃的东西。',
  })
  assert.equal(result.status, 200)
  assert.equal(result.json.verdict, 'partial')
  assert.equal(result.json.parseError, true)
  assert.match(result.json.feedback, /少了一个关键点/)
}

// 未知方法与错误的 HTTP 方法
{
  const result = await call('nope', {})
  assert.equal(result.status, 404)
}

// 空回复 -> 502
{
  reply = ''
  const result = await call('generate', { topic: '机会成本' })
  assert.equal(result.status, 502)
}

// 传输类失败：自动重试一次后成功
{
  failures = 1
  reply = '重试后拿到的回答。'
  const before = seen.length
  const result = await call('ask', { topic: '机会成本', quote: '稀缺', question: '为什么？' })
  assert.equal(result.status, 200)
  assert.equal(result.json.answer, reply)
  assert.equal(seen.length, before + 2, 'transport failure must be retried exactly once')
}

// 连续两次传输失败：502，且提示可以点「重试」
{
  failures = 2
  const result = await call('generate', { topic: '机会成本' })
  assert.equal(result.status, 502)
  assert.match(result.json.error, /模型连接中断/)
  assert.match(result.json.error, /重试/)
}

// 流内 finish(error) 的传输失败同样要重试
{
  finishFailure = 'DeepSeek message transport fail'
  reply = '第二次流成功。'
  const before = seen.length
  const result = await call('ask', { topic: '机会成本', quote: '稀缺', question: '为什么？' })
  assert.equal(result.status, 200)
  assert.equal(result.json.answer, reply)
  assert.equal(seen.length, before + 2)
}

// 非传输类错误不重试（避免无效重复扣费）
{
  failures = 1
  failureMessage = 'invalid api key'
  const before = seen.length
  const result = await call('generate', { topic: '机会成本' })
  assert.equal(result.status, 502)
  assert.equal(result.json.error, 'invalid api key')
  assert.equal(seen.length, before + 1, 'non-transient errors must not be retried')
  failureMessage = 'DeepSeek message transport fail'
}

console.log('host: OK')
