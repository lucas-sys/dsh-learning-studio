// 无浏览器冒烟测试：验证 client bundle 能被 ModuleLoader 接收、apply 能注册两个槽位，
// 以及 host 半的 JSON 提取器能容忍模型常见的围栏/前后缀。
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import assert from 'node:assert/strict'

process.env.DSH_LS_TEST = '1'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

// ---- client bundle ----
let captured = null
globalThis.window = {
  __ModuleLoader__: {
    load(config) {
      captured = config
    },
  },
  localStorage: {
    store: new Map(),
    getItem(key) { return this.store.has(key) ? this.store.get(key) : null },
    setItem(key, value) { this.store.set(key, String(value)) },
  },
  confirm: () => true,
  getSelection: () => null,
}
globalThis.document = {
  head: { appendChild() {} },
  createElement: () => ({ setAttribute() {}, remove() {}, style: {}, textContent: '' }),
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
  querySelector: () => null,
}
Object.defineProperty(globalThis, 'navigator', {
  value: { clipboard: { writeText: async () => {} } },
  configurable: true,
  writable: true,
})
globalThis.fetch = async () => {
  throw new Error('network disabled in smoke test')
}

const ReactStub = {
  createElement: (type, props, ...children) => ({ type, props: { ...(props || {}), children } }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useCallback: (fn) => fn,
  useRef: (initial) => ({ current: initial }),
}
const requireStub = (name) => {
  if (name === 'react') return ReactStub
  throw new Error('unexpected require: ' + name)
}

const source = await import('node:fs').then((fs) => fs.readFileSync(join(root, 'client.js'), 'utf8'))
const boot = new Function('window', 'require', source)
boot(globalThis.window, requireStub)

assert.ok(captured, 'client bundle must register with the ModuleLoader')
assert.equal(captured.id, 'dsh-learning-studio')
const exported = captured.factory(requireStub)
assert.equal(typeof exported.apply, 'function', 'client exports apply')
assert.deepEqual(exported.inject, ['slots', 'locale'])

const slots = []
const injects = []
const localeRegistered = []
const effects = []
const ctx = {
  effect(fn) {
    effects.push(fn)
    const dispose = fn()
    return () => { if (typeof dispose === 'function') dispose() }
  },
  locale: {
    register(ns, dict) {
      localeRegistered.push([ns, dict])
    },
    bind: () => (key) => key,
  },
  slots: {
    // 冷启动时 slot 声明还不存在：inject 先登记 callback，等声明建立后再执行。
    inject(owner, callback) {
      injects.push([owner, callback])
      return () => {}
    },
    register(declaration, component) {
      slots.push([declaration, component])
    },
  },
}
await exported.apply(ctx)
assert.equal(injects.length, 2, 'uses slots.inject to wait for slot declarations')
assert.equal(injects[0][0], 'sidebar.panellist')
assert.equal(injects[1][0], 'main')
assert.equal(slots.length, 0, 'must not register before the slot is declared')
// 模拟 Slot 声明建立（重启后 sidebar/main 晚于插件加载）。
injects[0][1]()
injects[1][1]()
assert.equal(slots.length, 2, 'registers sidebar icon and main panel once declared')
assert.equal(slots[0][0].name, 'sidebar.panellist')
assert.equal(slots[0][0].id, 'learning-studio')
assert.equal(slots[1][0].name, 'main')
assert.equal(slots[1][0].key, 'learning-studio')
assert.ok(localeRegistered.some(([ns, dict]) => ns === 'learning-studio' && dict.zh && dict.en))

// 用 stub 渲染一次主面板，确保组件树在空数据下不抛错。
const Panel = slots[1][1]
const tree = Panel({})
assert.equal(tree.type, 'div')
assert.equal(tree.props.className, 'ls-app')

// 新建流程：先确认学习范围，再生成框架；默认不再要求粘贴长文。
const Dialog = exported.__test && exported.__test.NewTopicDialog
assert.equal(typeof Dialog, 'function', 'test hook exposes the new-topic dialog')
const dialog = Dialog({ tr: (key, fallback) => fallback, busy: false, error: '', hint: '', onSubmit() {}, onCancel() {} })
const dialogText = flatten(dialog).join('')
assert.match(dialogText, /下一步：选择范围/)
assert.match(dialogText, /学习方面/)
assert.ok(source.includes("rpc('outline'"), 'wizard must request the knowledge template')
assert.ok(source.includes('生成系统框架'), 'wizard must confirm aspects before generating')

// 旧数据缺少 questions / feynman 时，loadDb 必须补齐字段，否则阅读视图会崩。
globalThis.window.localStorage.setItem('dsh-learning-studio/v1', JSON.stringify({
  version: 1,
  activeId: 'topic-1',
  topics: [{
    id: 'topic-1',
    title: '机会成本',
    article: { title: '机会成本', sections: [{ id: 'sec-1', title: '定义', paras: [{ id: 'p-1', text: '机会成本是放弃的最佳替代方案。' }] }] },
  }],
}))
const seeded = Panel({})
assert.equal(seeded.props.className, 'ls-app')
const seededText = JSON.stringify(seeded)
assert.match(seededText, /机会成本/)
assert.match(seededText, /放弃的最佳替代方案/)

// 正文段落：有提问的段落要能点击跳到对应问答，没有提问的段落不要有 pointer 行为。
function findParas(node, out = []) {
  if (node == null) return out
  if (Array.isArray(node)) {
    node.forEach((item) => findParas(item, out))
    return out
  }
  if (typeof node !== 'object') return out
  if (typeof node.type === 'function') {
    findParas(node.type(node.props), out)
    return out
  }
  if (node.props && node.props['data-para-id']) out.push(node)
  if (node.props) findParas(node.props.children, out)
  return out
}
const seededParas = findParas(seeded)
assert.equal(seededParas.length, 1, 'seeded article must render one paragraph')
assert.equal(seededParas[0].props['data-hasq'], 'false')
assert.equal(seededParas[0].props.onClick, undefined)

// 回答失败时必须给出「重试」按钮，而不是只显示一行错误。
globalThis.window.localStorage.setItem('dsh-learning-studio/v1', JSON.stringify({
  version: 1,
  activeId: 'topic-2',
  topics: [{
    id: 'topic-2',
    title: '机会成本',
    createdAt: 1,
    updatedAt: 1,
    article: { title: '机会成本', sections: [{ id: 'sec-1', title: '定义', paras: [{ id: 'p-1', text: '机会成本是放弃的最佳替代方案。' }] }] },
    questions: [{
      id: 'q-1', secId: 'sec-1', paraId: 'p-1', start: 0, end: 4,
      quote: '机会成本', question: '为什么它重要？', answer: '',
      status: 'error', error: 'DeepSeek message transport fail',
      parentId: null, links: [], linkAttempted: false, createdAt: 2,
    }],
    feynman: { questions: [] },
  }],
}))
const failed = Panel({})
// 把函数组件展开一层层渲染，才能看到卡片内部的按钮文案。
function flatten(node) {
  if (node == null) return []
  if (Array.isArray(node)) return node.flatMap(flatten)
  if (typeof node === 'string' || typeof node === 'number') return [String(node)]
  if (typeof node.type === 'function') return flatten(node.type(node.props))
  return flatten(node.props && node.props.children)
}
const failedText = flatten(failed).join('')
assert.match(failedText, /DeepSeek message transport fail/)
assert.match(failedText, /重试/)
assert.match(failedText, /问题已经保存/)

// 有提问的段落：data-hasq 标记 + 可点击跳转。
const failedParas = findParas(failed)
assert.equal(failedParas.length, 1)
assert.equal(failedParas[0].props['data-hasq'], 'true')
assert.equal(failedParas[0].props.title, '点击跳到这一段的提问')
assert.equal(typeof failedParas[0].props.onClick, 'function')
// 点击段落应真的把对应卡片滚进视口并闪烁，而不是只挂一个空 handler。
let scrolled = 0
let flashed = ''
const fakeCard = {
  scrollIntoView() { scrolled += 1 },
  setAttribute(name) { flashed = name },
  removeAttribute() {},
}
document.querySelector = (selector) => (selector === '[data-qid="q-1"]' ? fakeCard : null)
failedParas[0].props.onClick({ target: { closest: () => null } })
await new Promise((resolve) => setTimeout(resolve, 150))
assert.ok(scrolled >= 1, 'paragraph click must scroll the corresponding card into view')
assert.equal(flashed, 'data-flash')

// 侧栏疑问必须按文章位置排序：小节 → 段落 → 段内偏移 → 创建时间。
// 旧实现只比 section + start，会把「第 1 段第 50 字」排到「第 2 段第 3 字」后面。
globalThis.window.localStorage.setItem('dsh-learning-studio/v1', JSON.stringify({
  version: 1,
  activeId: 'topic-3',
  topics: [{
    id: 'topic-3',
    title: '排序测试',
    createdAt: 1,
    updatedAt: 1,
    article: {
      title: '排序测试',
      sections: [
        { id: 's1', title: '第一节', paras: [{ id: 'p1', text: '第一段正文。' }, { id: 'p2', text: '第二段正文。' }] },
        { id: 's2', title: '第二节', paras: [{ id: 'p3', text: '第三节正文。' }] },
      ],
    },
    questions: [
      { id: 'q-a', secId: 's1', paraId: 'p2', start: 3, end: 5, quote: '第二段', question: '问题乙', answer: '答案乙', status: 'done', error: '', parentId: null, links: [], linkAttempted: true, createdAt: 3 },
      { id: 'q-b', secId: 's1', paraId: 'p1', start: 50, end: 52, quote: '第一段', question: '问题甲', answer: '答案甲', status: 'done', error: '', parentId: null, links: [], linkAttempted: true, createdAt: 2 },
      { id: 'q-c', secId: 's2', paraId: 'p3', start: 0, end: 2, quote: '第三节', question: '问题丙', answer: '答案丙', status: 'done', error: '', parentId: null, links: [], linkAttempted: true, createdAt: 1 },
    ],
    feynman: { questions: [] },
  }],
}))
const orderedText = flatten(Panel({})).join('')
const atJia = orderedText.indexOf('问题甲')
const atYi = orderedText.indexOf('问题乙')
const atBing = orderedText.indexOf('问题丙')
assert.ok(atJia >= 0 && atYi >= 0 && atBing >= 0, 'three questions must render')
assert.ok(atJia < atYi && atYi < atBing, 'questions must follow article order, got ' + [atJia, atYi, atBing].join(','))

// ---- host helpers ----
const host = await import(join(root, 'index.js'))
assert.deepEqual(host.parseJsonLoose('```json\n[{"id":"a"}]\n```'), [{ id: 'a' }])
assert.deepEqual(host.parseJsonLoose('以下是结果：\n[{"id":"b"}]\n希望有帮助'), [{ id: 'b' }])
assert.deepEqual(host.parseJsonLoose('{"verdict":"pass","score":90}'), { verdict: 'pass', score: 90 })
assert.equal(host.parseJsonLoose('not json'), null)
assert.equal(host.parseJsonLoose(''), null)
assert.equal(host.name, 'dsh-learning-studio')
assert.equal(typeof host.apply, 'function')

console.log('smoke: OK')
