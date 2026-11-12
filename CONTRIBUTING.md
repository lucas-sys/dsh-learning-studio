# 参与开发

感谢你愿意改进学习台。这个仓库刻意保持「零构建、零运行时依赖」：Host 半是普通的 ES module，Client 半是 `window.__ModuleLoader__` 直接加载的单文件 bundle。改完文件即可运行，不需要打包器。

## 环境

- Node.js 20 或更新版本（仅用于跑测试与语法检查）。
- 一个支持插件 bundle 的 DeepSeek Harness（桌面端或 Web 端）。
- 不需要安装任何 npm 依赖。

## 目录

```
index.js              Host 半：RPC 路由、提示词、模型调用与重试
client.js             Client 半：面板、划线锚定、问答卡、知识网络、费曼、导出
cordis.patch.yml      bundle 的 Loader 补丁
locale/zh.json        中英文展示元数据
locale/en.json
test/smoke.mjs        客户端注册、冷启动、渲染与交互属性
test/host.mjs         Host 路由、校验、解析与重试
docs/architecture.svg 架构图
```

## 本地开发

把仓库克隆到任意目录，然后在 Harness 里安装：

```
plugin_manager({ action: "install_bundle", target: "<仓库绝对路径>" })
```

安装器会建立符号链接，因此之后修改 `index.js` / `client.js` 不需要重装：

- 只改 Client 半：刷新 Web UI（`Cmd+Shift+R`）即可。
- 改了 Host 半：重启一次 Harness。
- 冷启动相关改动：真正重启一次 Harness 才能验证。

## 约定

- Client 半顶层不要引入任何绑定，整个文件包在 `window.__ModuleLoader__.load({...})` 的 factory 里；不同插件的顶层变量共享同一个作用域，重名会拖垮整页。
- Client 半只能 `require('react')`，不要 require Harness 的客户端包，也不要使用 JSX。
- Host 半不要 `import` `@deepseek-ai/dsh-*` 包，所有能力从 `ctx` 取（`ctx.llm`、`ctx.fs` 等）。
- 颜色使用 `--dsw-alias-*` 主题 token，并保留字面回退值。
- 界面文案中文为主，`locale/zh.json` 与 `locale/en.json` 的键要与 `client.js` 里的字典保持同步。
- 不新增会话事件类型，不改 Harness 的会话数据；学习数据放在浏览器 `localStorage`。
- 模型输出一律按不可信文本处理：先解析、再校验、最后才渲染。

## 测试

```bash
node --check index.js
node --check client.js
node test/smoke.mjs
node test/host.mjs
```

- 改动提示词拼装、RPC 入参或错误处理时，在 `test/host.mjs` 里补断言。
- 改动注册、渲染或交互属性时，在 `test/smoke.mjs` 里补断言。
- 不依赖真实模型：`test/host.mjs` 用 mock 的 `ctx.llm`，可以精确控制抛错、空回复和 JSON 内容。

## 提交

1. 保持改动聚焦，一个 PR 解决一件事。
2. 更新 `CHANGELOG.md`；行为变化时同步 `package.json` 与 `index.js` 的版本号。
3. 确认上面的四条命令全部通过。
4. Commit message 用简短的祈使句，例如 `fix: 冷启动时等待槽位声明`。

## 发布

发布前请确认 `package.json` 的 `repository` / `homepage` / `bugs` 与 README 徽章指向实际仓库地址。
