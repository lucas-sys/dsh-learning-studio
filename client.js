window.__ModuleLoader__.load({ id: "dsh-learning-studio", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
'use strict';
// 学习台（dsh-learning-studio）— Client 半（静态 bundle，零构建）。
// 形态：sidebar 图标 + main 全页面板；数据存 localStorage；模型能力走本包 Host 半的
// POST /_dsh/dsh-learning-studio/<method>。
// 阅读区支持段内划词提问，回答卡按原文位置排列并与划线互相跳转；回答之间的关联构成网络；
// 费曼检验全部通过后才解锁 Markdown 笔记导出。
const React = require('react');
const h = React.createElement;

const PACKAGE = 'dsh-learning-studio';
const PANEL_ID = 'learning-studio';
const NS = 'learning-studio';
const STORAGE_KEY = 'dsh-learning-studio/v1';

const DICT = {
  zh: {
    'meta.title': '学习台',
    'meta.description': '划线提问、回答成网、费曼自检，最后导出 Markdown 笔记。',
    'nav': '学习台',
    'title': '学习台',
    'subtitle': '把一段讲解读成自己的知识网络',
    'newTopic': '新建学习',
    'emptyTitle': '从一个概念开始',
    'emptyBody': 'AI 会先写一份完整而简洁的导读。读到有疑问的地方，划词就能在侧边追问；问题之间会自动连线，最后用费曼复述检验自己是否真的讲得清。',
    'emptyAction': '新建学习',
    'topic': '概念',
    'level': '讲解深度',
    'levelIntro': '入门',
    'levelStandard': '系统',
    'levelDeep': '深入',
    'material': '已有材料（可选）',
    'materialHint': '粘贴一段现成文字，就直接在你的材料上划线提问，不再让 AI 重写。',
    'generate': '生成导读',
    'cancel': '取消',
    'generating': '正在写导读',
    'read': '阅读',
    'graph': '知识网络',
    'feynman': '费曼检验',
    'notes': '笔记',
    'ask': '就这里提问',
    'askPlaceholder': '写下你的疑问…',
    'send': '提问',
    'quote': '划线',
    'followUp': '追问',
    'delete': '删除',
    'related': '关联',
    'linkTo': '手动关联到',
    'linkPick': '选择一张卡片',
    'loadingAnswer': '正在回答…',
    'retry': '重试',
    'retryHint': '问题已经保存，重试不会重新创建卡片',
    'retryGradeHint': '你的复述还在，直接重试评价即可',
    'unknownError': '未知错误',
    'questionN': '问',
    'feynmanIntro': '合上原文，用自己的话回答下面这些问题。关键点没有遗漏，才算真正理解。',
    'startFeynman': '生成关键问题',
    'yourAnswer': '用你自己的话复述…',
    'submit': '提交复述',
    'evaluating': '正在评估…',
    'verdictPass': '通过',
    'verdictPartial': '还需补充',
    'verdictFail': '需要重来',
    'missing': '还缺这些关键点',
    'feedback': '评价',
    'hint': '提示',
    'next': '下一题',
    'prev': '上一题',
    'retryAnswer': '再答一次',
    'progress': '已通过',
    'export': '导出笔记',
    'exportLocked': '所有问题通过后解锁导出',
    'copy': '复制 Markdown',
    'copied': '已复制',
    'download': '下载 .md',
    'deleteTopic': '删除这次学习',
    'deleteConfirm': '删除后这篇导读、问答和检验记录都会消失，确定吗？',
    'model': '模型',
    'error': '出错了',
    'emptyQuestions': '还没有提问。在左边选中一段文字，点「就这里提问」。',
    'emptyGraph': '至少有两张回答卡后，这里会显示它们之间的关联。',
    'graphHint': '按原文小节分列；连线表示问答之间的知识关联。点击卡片可跳回原文。',
    'allPassed': '全部通过，可以整理成笔记了。',
    'notesEmpty': '完成至少一次提问后，这里会生成笔记预览。',
    'backToRead': '回到阅读',
    'close': '关闭',
    'noModel': '模型未就绪',
    'loading': '加载中…',
    'topicPlaceholder': '例如：机会成本、注意力机制、复利',
    'materialPlaceholder': '把一段讲稿、书摘或论文段落粘贴到这里…',
    'confirmDeleteQuestion': '删除这张问答卡？与它相连的关联也会一起移除。',
    'cancelGeneration': '停止等待',
    'exportAnyway': '仍要导出',
  },
  en: {
    'meta.title': 'Learning Studio',
    'meta.description': 'Ask beside the text, link answers into a network, test yourself with Feynman questions, export Markdown notes.',
    'nav': 'Learning Studio',
    'title': 'Learning Studio',
    'subtitle': 'Read a concept into a knowledge network of your own',
    'newTopic': 'New session',
    'emptyTitle': 'Start with one concept',
    'emptyBody': 'The AI writes a compact introduction. Select any phrase to ask beside it, link related answers, then prove you can explain it in your own words.',
    'emptyAction': 'New session',
    'topic': 'Concept',
    'level': 'Depth',
    'levelIntro': 'Intro',
    'levelStandard': 'Standard',
    'levelDeep': 'Deep',
    'material': 'Existing material (optional)',
    'materialHint': 'Paste text you already have and annotate it directly instead of regenerating.',
    'generate': 'Write introduction',
    'cancel': 'Cancel',
    'generating': 'Writing introduction',
    'read': 'Read',
    'graph': 'Network',
    'feynman': 'Feynman test',
    'notes': 'Notes',
    'ask': 'Ask here',
    'askPlaceholder': 'What is unclear?',
    'send': 'Ask',
    'quote': 'Quote',
    'followUp': 'Follow up',
    'delete': 'Delete',
    'related': 'Related',
    'linkTo': 'Link to',
    'linkPick': 'Pick a card',
    'loadingAnswer': 'Answering…',
    'retry': 'Retry',
    'retryHint': 'Your question is saved; retrying does not create a duplicate card',
    'retryGradeHint': 'Your answer is kept; retry the evaluation directly',
    'unknownError': 'Unknown error',
    'questionN': 'Q',
    'feynmanIntro': 'Close the text and answer in your own words. Only a complete explanation passes.',
    'startFeynman': 'Create key questions',
    'yourAnswer': 'Explain it in your own words…',
    'submit': 'Submit',
    'evaluating': 'Evaluating…',
    'verdictPass': 'Pass',
    'verdictPartial': 'Needs more',
    'verdictFail': 'Try again',
    'missing': 'Missing key points',
    'feedback': 'Feedback',
    'hint': 'Hint',
    'next': 'Next',
    'prev': 'Previous',
    'retryAnswer': 'Answer again',
    'progress': 'Passed',
    'export': 'Export notes',
    'exportLocked': 'Pass every question to unlock export',
    'copy': 'Copy Markdown',
    'copied': 'Copied',
    'download': 'Download .md',
    'deleteTopic': 'Delete this session',
    'deleteConfirm': 'This removes the article, questions and test records. Continue?',
    'model': 'Model',
    'error': 'Something went wrong',
    'emptyQuestions': 'No questions yet. Select a phrase on the left and choose “Ask here”.',
    'emptyGraph': 'Links appear here once you have two answered cards.',
    'graphHint': 'Columns follow article sections; edges are knowledge links. Click a card to jump back.',
    'allPassed': 'Everything passed — time to turn it into notes.',
    'notesEmpty': 'Ask at least one question to generate a note preview.',
    'backToRead': 'Back to reading',
    'close': 'Close',
    'noModel': 'Model not ready',
    'loading': 'Loading…',
    'topicPlaceholder': 'e.g. opportunity cost, attention, compound interest',
    'materialPlaceholder': 'Paste a lecture note, book excerpt or paper paragraph…',
    'confirmDeleteQuestion': 'Delete this Q&A card? Its links are removed too.',
    'cancelGeneration': 'Stop waiting',
    'exportAnyway': 'Export anyway',
  },
};

const CSS = `
.ls-app{height:100%;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#1f2329);font-size:14px;line-height:1.6;overflow:hidden}
.ls-app *{box-sizing:border-box}
.ls-head{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e6eb);background:var(--dsw-alias-bg-layer-1,#fff);flex-wrap:wrap}
.ls-brand{display:flex;align-items:center;gap:8px;font-weight:600;font-size:15px;margin-right:4px}
.ls-brand-mark{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.ls-brand-sub{font-weight:400;color:var(--dsw-alias-label-secondary,#646a73);font-size:12px}
.ls-head-spacer{flex:1}
.ls-select,.ls-input,.ls-textarea{font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-2,#f5f6f7);border:1px solid var(--dsw-alias-border-l1,#e5e6eb);border-radius:8px;padding:6px 8px;outline:none}
.ls-select:focus,.ls-input:focus,.ls-textarea:focus{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.ls-select{max-width:240px}
.ls-textarea{width:100%;resize:vertical;min-height:64px;line-height:1.65}
.ls-btn{font:inherit;cursor:pointer;border-radius:8px;border:1px solid var(--dsw-alias-border-l1,#e5e6eb);background:var(--dsw-alias-bg-layer-2,#f5f6f7);color:inherit;padding:6px 12px;transition:background .15s,border-color .15s}
.ls-btn:hover{border-color:var(--dsw-alias-border-l2,#c9cdd4)}
.ls-btn:disabled{opacity:.5;cursor:not-allowed}
.ls-btn-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff;font-weight:500}
.ls-btn-primary:hover{filter:brightness(1.05)}
.ls-btn-ghost{background:transparent;border-color:transparent;color:var(--dsw-alias-label-secondary,#646a73);padding:4px 8px}
.ls-btn-ghost:hover{background:var(--dsw-alias-bg-layer-2,#f5f6f7);color:var(--dsw-alias-label-primary,#1f2329)}
.ls-btn-danger{color:var(--dsw-alias-state-error-primary,#d83931);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d83931) 35%,transparent);background:transparent}
.ls-tabs{display:flex;gap:2px;background:var(--dsw-alias-bg-layer-2,#f5f6f7);border-radius:10px;padding:3px}
.ls-tab{border:0;background:transparent;font:inherit;color:var(--dsw-alias-label-secondary,#646a73);padding:5px 12px;border-radius:7px;cursor:pointer;white-space:nowrap}
.ls-tab:hover{color:var(--dsw-alias-label-primary,#1f2329)}
.ls-tab[data-active="true"]{background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#1f2329);font-weight:500;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.ls-tab:disabled{opacity:.45;cursor:not-allowed}
.ls-model{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);background:var(--dsw-alias-bg-layer-2,#f5f6f7);border-radius:999px;padding:3px 9px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ls-body{flex:1;min-height:0;display:flex}
.ls-read{flex:1;min-width:0;overflow:auto;padding:28px 32px 80px}
.ls-article{max-width:760px;margin:0 auto}
.ls-article-title{font-size:26px;line-height:1.35;font-weight:650;margin:0 0 6px}
.ls-article-meta{color:var(--dsw-alias-label-secondary,#646a73);font-size:12px;margin-bottom:26px}
.ls-section{margin:0 0 30px}
.ls-section-title{font-size:18px;font-weight:600;margin:0 0 12px;display:flex;align-items:center;gap:8px}
.ls-section-title::before{content:"";width:4px;height:16px;border-radius:2px;background:var(--dsw-alias-brand-primary,#4d6bfe)}
.ls-para{position:relative;margin:0 0 14px;font-size:15.5px;line-height:1.95;letter-spacing:.01em;text-align:justify;border-radius:6px;padding:2px 4px;transition:background .2s}
.ls-para[data-hasq="true"]{cursor:pointer}
.ls-para[data-hasq="true"]:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 6%,transparent)}
.ls-para[data-focus="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 9%,transparent)}
.ls-mark{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 20%,transparent);border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 55%,transparent);border-radius:2px;cursor:pointer;padding:1px 0}
.ls-mark:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 30%,transparent)}
.ls-selbar{position:fixed;z-index:60;transform:translate(-50%,-100%);display:flex;gap:2px;padding:4px;border-radius:9px;background:var(--dsw-alias-bg-overlay,#fff);box-shadow:0 6px 24px rgba(0,0,0,.18);border:1px solid var(--dsw-alias-border-l1,#e5e6eb)}
.ls-selbar .ls-btn{padding:4px 10px;font-size:13px}
.ls-aside{width:390px;flex:0 0 390px;border-left:1px solid var(--dsw-alias-border-l1,#e5e6eb);background:var(--dsw-alias-bg-layer-1,#fff);display:flex;flex-direction:column;min-height:0}
.ls-aside-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e6eb);font-weight:600}
.ls-aside-count{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);font-weight:400}
.ls-aside-scroll{flex:1;overflow:auto;padding:12px}
.ls-compose{border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 35%,var(--dsw-alias-border-l1,#e5e6eb));background:var(--dsw-alias-bg-layer-2,#f5f6f7);border-radius:12px;padding:10px;margin-bottom:12px}
.ls-quote{font-size:12.5px;color:var(--dsw-alias-label-secondary,#646a73);border-left:3px solid var(--dsw-alias-brand-primary,#4d6bfe);padding:2px 0 2px 8px;margin-bottom:8px;max-height:96px;overflow:auto;white-space:pre-wrap}
.ls-compose-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}
.ls-card{border:1px solid var(--dsw-alias-border-l1,#e5e6eb);border-radius:12px;padding:12px;margin-bottom:12px;background:var(--dsw-alias-bg-base,#fff);transition:border-color .15s,box-shadow .15s}
.ls-card:hover{border-color:var(--dsw-alias-border-l2,#c9cdd4)}
.ls-card[data-focus="true"]{border-color:var(--dsw-alias-brand-primary,#4d6bfe);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 14%,transparent)}
.ls-card[data-flash="true"]{box-shadow:0 0 0 4px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 22%,transparent)}
.ls-card-head{display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#646a73)}
.ls-badge{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:6px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent);color:var(--dsw-alias-brand-primary,#4d6bfe);font-size:11.5px;font-weight:600}
.ls-card-quote{font-size:12.5px;color:var(--dsw-alias-label-secondary,#646a73);border-left:2px solid var(--dsw-alias-border-l2,#c9cdd4);padding-left:8px;margin-bottom:8px;max-height:72px;overflow:auto;white-space:pre-wrap}
.ls-q{font-weight:600;margin:0 0 8px;line-height:1.65}
.ls-a{white-space:pre-wrap;line-height:1.8;font-size:14px;overflow-wrap:anywhere}
.ls-a p{margin:0 0 8px}
.ls-card-actions{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-l1,#e5e6eb)}
.ls-links{margin-top:8px;display:flex;flex-direction:column;gap:4px}
.ls-linkchip{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);background:var(--dsw-alias-bg-layer-2,#f5f6f7);border-radius:6px;padding:4px 7px;cursor:pointer;text-align:left;border:0;font-family:inherit;line-height:1.5}
.ls-linkchip:hover{color:var(--dsw-alias-label-primary,#1f2329)}
.ls-linkchip b{color:var(--dsw-alias-brand-primary,#4d6bfe);font-weight:600}
.ls-skel{height:14px;border-radius:4px;background:linear-gradient(90deg,var(--dsw-alias-bg-layer-2,#f5f6f7) 25%,var(--dsw-alias-border-l1,#e5e6eb) 37%,var(--dsw-alias-bg-layer-2,#f5f6f7) 63%);background-size:400% 100%;animation:ls-shimmer 1.4s infinite;margin-bottom:8px}
@keyframes ls-shimmer{0%{background-position:100% 0}100%{background-position:0 0}}
.ls-empty{padding:40px 24px;text-align:center;color:var(--dsw-alias-label-secondary,#646a73);line-height:1.8;font-size:13px}
.ls-hero{height:100%;display:grid;place-items:center;padding:40px}
.ls-hero-inner{max-width:520px;text-align:center}
.ls-hero h1{font-size:26px;margin:0 0 12px}
.ls-hero p{color:var(--dsw-alias-label-secondary,#646a73);line-height:1.9;margin:0 0 22px}
.ls-generating{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:14px;padding:60px 20px;color:var(--dsw-alias-label-secondary,#646a73)}
.ls-spinner{width:26px;height:26px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2,#c9cdd4);border-top-color:var(--dsw-alias-brand-primary,#4d6bfe);animation:ls-spin .9s linear infinite}
@keyframes ls-spin{to{transform:rotate(360deg)}}
.ls-graph-wrap{flex:1;overflow:auto;padding:18px}
.ls-graph-note{color:var(--dsw-alias-label-secondary,#646a73);font-size:12px;margin:0 0 10px}
.ls-graph-node{cursor:pointer}
.ls-graph-node circle{fill:var(--dsw-alias-bg-layer-1,#fff);stroke:var(--dsw-alias-brand-primary,#4d6bfe);stroke-width:1.6}
.ls-graph-node:hover circle{fill:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 10%,var(--dsw-alias-bg-layer-1,#fff))}
.ls-graph-label{font-size:11px;fill:var(--dsw-alias-label-primary,#1f2329);pointer-events:none}
.ls-graph-sec{font-size:11.5px;fill:var(--dsw-alias-label-secondary,#646a73);text-anchor:middle}
.ls-legend{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);margin-top:10px}
.ls-legend i{display:inline-block;width:16px;height:2px;vertical-align:middle;margin-right:5px;border-radius:2px}
.ls-feynman{flex:1;min-height:0;display:flex}
.ls-feyn-list{width:300px;flex:0 0 300px;border-right:1px solid var(--dsw-alias-border-l1,#e5e6eb);overflow:auto;padding:14px}
.ls-feyn-item{display:flex;gap:8px;align-items:flex-start;padding:9px 10px;border-radius:9px;cursor:pointer;border:1px solid transparent;margin-bottom:4px;font-size:13px;line-height:1.6}
.ls-feyn-item:hover{background:var(--dsw-alias-bg-layer-2,#f5f6f7)}
.ls-feyn-item[data-active="true"]{background:var(--dsw-alias-bg-layer-2,#f5f6f7);border-color:var(--dsw-alias-border-l1,#e5e6eb)}
.ls-dot{width:16px;height:16px;border-radius:50%;flex:0 0 16px;margin-top:2px;display:grid;place-items:center;font-size:10px;border:1px solid var(--dsw-alias-border-l2,#c9cdd4);color:var(--dsw-alias-label-secondary,#646a73)}
.ls-dot[data-pass="true"]{background:var(--dsw-alias-state-success-primary,#2ea121);border-color:transparent;color:#fff}
.ls-feyn-main{flex:1;min-width:0;overflow:auto;padding:28px 32px 80px}
.ls-feyn-card{max-width:760px;margin:0 auto}
.ls-feyn-focus{display:inline-block;font-size:12px;color:var(--dsw-alias-brand-primary,#4d6bfe);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 10%,transparent);border-radius:999px;padding:2px 9px;margin-bottom:12px}
.ls-feyn-prompt{font-size:19px;line-height:1.7;font-weight:600;margin:0 0 18px}
.ls-attempt{border-radius:12px;border:1px solid var(--dsw-alias-border-l1,#e5e6eb);padding:12px 14px;margin-top:14px;background:var(--dsw-alias-bg-layer-1,#fff)}
.ls-attempt[data-verdict="pass"]{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2ea121) 40%,transparent)}
.ls-attempt[data-verdict="fail"]{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d83931) 35%,transparent)}
.ls-attempt-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-weight:600;font-size:13px}
.ls-verdict{font-size:12px;border-radius:999px;padding:2px 8px;font-weight:500}
.ls-verdict[data-v="pass"]{color:var(--dsw-alias-state-success-primary,#2ea121);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2ea121) 12%,transparent)}
.ls-verdict[data-v="partial"]{color:var(--dsw-alias-state-warn-primary,#d97706);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#d97706) 12%,transparent)}
.ls-verdict[data-v="fail"]{color:var(--dsw-alias-state-error-primary,#d83931);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d83931) 12%,transparent)}
.ls-attempt p{margin:6px 0}
.ls-attempt-body{display:block}
.ls-kv{margin:8px 0}
.ls-kv b{display:block;font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);margin-bottom:3px;font-weight:600}
.ls-kv ul{margin:0;padding-left:18px}
.ls-pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8;font-size:13.5px;background:var(--dsw-alias-bg-layer-2,#f5f6f7);border-radius:10px;padding:14px;border:1px solid var(--dsw-alias-border-l1,#e5e6eb);max-height:60vh;overflow:auto;margin:0}
.ls-notes-wrap{flex:1;min-height:0;display:flex;flex-direction:column;padding:18px 24px 24px;gap:12px}
.ls-notes-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ls-notes-bar .ls-spacer{flex:1}
.ls-lock{font-size:12px;color:var(--dsw-alias-state-warn-primary,#d97706);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#d97706) 10%,transparent);border-radius:8px;padding:6px 10px}
.ls-dialog-mask{position:fixed;inset:0;background:rgba(15,18,24,.38);z-index:80;display:grid;place-items:center;padding:20px}
.ls-dialog{width:min(620px,100%);max-height:90vh;overflow:auto;background:var(--dsw-alias-bg-overlay,#fff);border-radius:16px;border:1px solid var(--dsw-alias-border-l1,#e5e6eb);box-shadow:0 24px 60px rgba(0,0,0,.24);padding:22px}
.ls-dialog h2{margin:0 0 16px;font-size:19px}
.ls-field{margin-bottom:14px}
.ls-field label{display:block;font-size:12.5px;color:var(--dsw-alias-label-secondary,#646a73);margin-bottom:6px;font-weight:500}
.ls-field .ls-input{width:100%}
.ls-field-row{display:flex;gap:10px;flex-wrap:wrap}
.ls-field-row .ls-field{flex:1;min-width:160px}
.ls-dialog-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.ls-aspects{display:flex;flex-direction:column;gap:8px;max-height:min(48vh,380px);overflow:auto;margin:0 0 8px;padding:2px 3px 2px 0}
.ls-aspect{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--dsw-alias-border-l1,#e5e6eb);border-radius:10px;padding:10px 12px;cursor:pointer;background:var(--dsw-alias-bg-layer-1,#fff);transition:border-color .15s,background .15s}
.ls-aspect:hover{border-color:var(--dsw-alias-border-l2,#c9cdd4)}
.ls-aspect[data-checked="true"]{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 52%,var(--dsw-alias-border-l1,#e5e6eb));background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 5%,transparent)}
.ls-aspect input{margin:3px 0 0;accent-color:var(--dsw-alias-brand-primary,#4d6bfe);flex:0 0 auto}
.ls-aspect-body{min-width:0;flex:1}
.ls-aspect-title{font-weight:600;font-size:14px;line-height:1.5;color:var(--dsw-alias-label-primary,#1f2329)}
.ls-aspect-summary{font-size:12.5px;color:var(--dsw-alias-label-secondary,#646a73);line-height:1.6;margin-top:2px}
.ls-aspect-qs{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);opacity:.82;line-height:1.55;margin-top:4px}
.ls-outline-tools{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin:2px 0 0}
.ls-outline-count{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);margin-left:auto}
.ls-outline-add{display:flex;gap:8px;margin-top:8px}
.ls-outline-add .ls-input{flex:1;min-width:0}
.ls-err{color:var(--dsw-alias-state-error-primary,#d83931);font-size:13px;line-height:1.7;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d83931) 8%,transparent);border-radius:8px;padding:8px 10px;margin-bottom:10px}
.ls-hintline{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);line-height:1.7}
.ls-toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:var(--dsw-alias-bg-overlay,#fff);border:1px solid var(--dsw-alias-border-l1,#e5e6eb);box-shadow:0 10px 30px rgba(0,0,0,.18);border-radius:999px;padding:8px 16px;font-size:13px;z-index:90}
@media (max-width:960px){.ls-aside{width:330px;flex-basis:330px}.ls-read{padding:20px 18px 80px}.ls-feyn-list{width:230px;flex-basis:230px}}
@media (max-width:720px){.ls-body{flex-direction:column}.ls-aside{width:auto;flex:0 0 46%;border-left:0;border-top:1px solid var(--dsw-alias-border-l1,#e5e6eb)}.ls-read{padding:16px 14px 40px}.ls-feynman{flex-direction:column}.ls-feyn-list{width:auto;flex:0 0 34%;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e6eb)}}
`;

function uid() {
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function nowLabel(ts) {
  try {
    return new Date(ts).toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function normalizeTopic(topic) {
  const sections = !topic.article || !Array.isArray(topic.article.sections)
    ? []
    : topic.article.sections
      .filter((section) => section && Array.isArray(section.paras))
      .map((section) => ({
        ...section,
        id: section.id || uid(),
        title: section.title || '未命名小节',
        paras: section.paras
          .filter((para) => para && typeof para.text === 'string')
          .map((para) => ({ ...para, id: para.id || uid() })),
      }));
  return {
    ...topic,
    article: { title: (topic.article && topic.article.title) || topic.title || '未命名导读', sections },
    questions: Array.isArray(topic.questions)
      ? topic.questions
        .filter((question) => question && question.id)
        .map((question) => ({ ...question, links: Array.isArray(question.links) ? question.links : [] }))
      : [],
    feynman: {
      ...(topic.feynman && typeof topic.feynman === 'object' ? topic.feynman : {}),
      questions: topic.feynman && Array.isArray(topic.feynman.questions) ? topic.feynman.questions : [],
    },
  };
}

function loadDb() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, topics: [], activeId: null };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.topics)) return { version: 1, topics: [], activeId: null };
    const topics = parsed.topics
      .filter((topic) => topic && typeof topic === 'object' && topic.id && topic.article)
      .map(normalizeTopic);
    const activeId = topics.some((topic) => topic.id === parsed.activeId)
      ? parsed.activeId
      : (topics[0] && topics[0].id) || null;
    return { version: 1, topics, activeId };
  } catch {
    return { version: 1, topics: [], activeId: null };
  }
}

function saveDb(db) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    // 配额满或隐私模式：不能让保存失败打断阅读，下一次交互会再试。
    console.warn('[learning-studio] 保存失败', error);
  }
}

/** 把模型输出的 Markdown 导读切成可锚定的小节与自然段。 */
function parseArticle(markdown, fallbackTitle) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let current = null;
  let title = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') continue;
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading && heading[1].length === 1) {
      if (!title) title = heading[2].trim();
      continue;
    }
    if (heading) {
      current = { id: uid(), title: heading[2].trim() || '未命名小节', paras: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { id: uid(), title: '导读', paras: [] };
      sections.push(current);
    }
    const text = line
      .replace(/^[-*+]\s+/, '')
      .replace(/^>\s?/, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();
    if (text === '') continue;
    current.paras.push({ id: uid(), text });
  }
  const cleaned = sections.filter((section) => section.paras.length > 0);
  return { title: title || fallbackTitle || '未命名导读', sections: cleaned };
}

/** 粘贴材料：空行分段，全部放进一个小节。 */
function parseMaterial(text) {
  const blocks = String(text || '').replace(/\r\n/g, '\n').split(/\n\s*\n/).map((part) => part.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  const paras = blocks.map((block) => ({ id: uid(), text: block }));
  if (paras.length === 0) return null;
  return { title: '', sections: [{ id: uid(), title: '材料', paras }] };
}

function articleToMarkdown(article) {
  const parts = [];
  for (const section of article.sections) {
    parts.push('## ' + section.title);
    parts.push('');
    for (const para of section.paras) {
      parts.push(para.text);
      parts.push('');
    }
  }
  return parts.join('\n').trim();
}

function sectionOf(topic, question) {
  return topic.article.sections.find((section) => section.id === question.secId) || null;
}

function questionNumber(topic, id) {
  const sorted = sortedQuestions(topic);
  const index = sorted.findIndex((item) => item.id === id);
  return index < 0 ? 0 : index + 1;
}

// 侧栏疑问按「文章位置」排序：小节顺序 → 段落顺序 → 段内字符偏移 → 创建时间。
// 只按 start 排会把不同段落里的提问混在一起（start 是段内偏移），所以必须先比段落。
function sortedQuestions(topic) {
  const sectionOrder = new Map();
  const paraOrder = new Map();
  topic.article.sections.forEach((section, si) => {
    sectionOrder.set(section.id, si);
    section.paras.forEach((para, pi) => paraOrder.set(para.id, pi));
  });
  function key(question) {
    const si = sectionOrder.has(question.secId) ? sectionOrder.get(question.secId) : 999;
    const pi = paraOrder.has(question.paraId) ? paraOrder.get(question.paraId) : -1;
    return { si, pi, start: question.start || 0, createdAt: question.createdAt || 0 };
  }
  return topic.questions.slice().sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka.si !== kb.si) return ka.si - kb.si;
    if (ka.pi !== kb.pi) return ka.pi - kb.pi;
    if (ka.start !== kb.start) return ka.start - kb.start;
    return ka.createdAt - kb.createdAt;
  });
}

function linkTarget(topic, question, id) {
  return topic.questions.find((item) => item.id === id) || null;
}

function noteMarkdown(topic) {
  const sorted = sortedQuestions(topic);
  const lines = [];
  lines.push('# ' + topic.title);
  lines.push('');
  lines.push('> 学习笔记 · 学习台生成 · ' + nowLabel(Date.now()));
  lines.push('');
  const aspects = Array.isArray(topic.aspects) ? topic.aspects : [];
  if (aspects.length > 0) {
    lines.push('覆盖方面：' + aspects.map((item) => item.title).join(' · '));
    lines.push('');
  }
  lines.push('## 概念导读');
  lines.push('');
  for (const section of topic.article.sections) {
    lines.push('### ' + section.title);
    lines.push('');
    for (const para of section.paras) {
      lines.push(para.text);
      lines.push('');
    }
  }
  lines.push('## 问答记录');
  lines.push('');
  if (sorted.length === 0) {
    lines.push('（还没有提问）');
    lines.push('');
  }
  sorted.forEach((question, index) => {
    const section = sectionOf(topic, question);
    lines.push('### 问 ' + (index + 1) + (section ? ' · ' + section.title : ''));
    lines.push('');
    if (question.quote) {
      lines.push('> 划线：' + question.quote.replace(/\n/g, ' '));
      lines.push('');
    }
    lines.push('**问**：' + question.question);
    lines.push('');
    lines.push('**答**：' + (question.answer || '（未回答）'));
    lines.push('');
    const links = Array.isArray(question.links) ? question.links : [];
    for (const link of links) {
      const target = linkTarget(topic, question, link.id);
      if (!target) continue;
      lines.push('- 关联问 ' + questionNumber(topic, target.id) + '（' + link.kind + '）：' + link.reason);
    }
    if (links.length > 0) lines.push('');
  });
  lines.push('## 费曼检验');
  lines.push('');
  const feyn = topic.feynman && Array.isArray(topic.feynman.questions) ? topic.feynman.questions : [];
  if (feyn.length === 0) {
    lines.push('（还没有进行费曼检验）');
    lines.push('');
  }
  feyn.forEach((question, index) => {
    const attempts = Array.isArray(question.attempts) ? question.attempts : [];
    const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
    lines.push('### 问题 ' + (index + 1) + '：' + question.prompt);
    lines.push('');
    if (!latest) {
      lines.push('（未作答）');
      lines.push('');
      return;
    }
    lines.push('**我的复述**：' + latest.answer);
    lines.push('');
    lines.push('**评价**：' + latest.verdict + (latest.score ? '（' + latest.score + ' 分）' : '') + ' ' + (latest.feedback || ''));
    lines.push('');
    if (Array.isArray(latest.missing) && latest.missing.length > 0) {
      lines.push('**遗漏**：' + latest.missing.join('；'));
      lines.push('');
    }
  });
  return lines.join('\n').trim() + '\n';
}

function segmentsFor(topic, paragraph) {
  const text = paragraph.text;
  const anchors = topic.questions
    .filter((question) => question.paraId === paragraph.id && Number.isFinite(question.start) && Number.isFinite(question.end) && question.end > question.start)
    .sort((a, b) => a.start - b.start);
  if (anchors.length === 0) return [{ text: text }];
  const segments = [];
  let cursor = 0;
  for (const anchor of anchors) {
    const start = Math.max(cursor, Math.min(text.length, anchor.start));
    const end = Math.min(text.length, Math.max(start, anchor.end));
    if (end <= start) continue;
    if (start > cursor) segments.push({ text: text.slice(cursor, start) });
    segments.push({ text: text.slice(start, end), qid: anchor.id });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

function offsetWithin(root, node, offset) {
  try {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.setEnd(node, offset);
    return range.toString().length;
  } catch {
    return 0;
  }
}

function closestPara(node) {
  if (!node) return null;
  const element = node.nodeType === 3 ? node.parentElement : node;
  return element && typeof element.closest === 'function' ? element.closest('[data-para-id]') : null;
}

async function rpc(method, args, signal) {
  let response;
  try {
    response = await fetch('/_dsh/' + PACKAGE + '/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args || {}),
      signal: signal,
    });
  } catch (error) {
    throw new Error('无法连接学习台后端：' + String((error && error.message) || error));
  }
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('学习台返回了无法解析的内容（HTTP ' + response.status + '）');
  }
  if (!response.ok) {
    throw new Error((payload && payload.error) || ('HTTP ' + response.status));
  }
  if (payload && typeof payload === 'object' && typeof payload.error === 'string') {
    throw new Error(payload.error);
  }
  return payload;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Icon(props) {
  const size = props && typeof props.size === 'number' && props.size > 0 ? props.size : 20;
  return h('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
  },
    h('path', { d: 'M12 6.2C10.3 4.9 8.1 4.3 5 4.3v13.1c3 0 5.2.6 7 1.9 1.8-1.3 4-1.9 7-1.9V4.3c-3.1 0-5.3.6-7 1.9Z' }),
    h('path', { d: 'M12 6.2v13.1' }),
    h('circle', { cx: 16.2, cy: 8.4, r: 1.15 }),
    h('circle', { cx: 18.4, cy: 12.1, r: 1.15 }),
    h('circle', { cx: 14.6, cy: 15.3, r: 1.15 }),
    h('path', { d: 'M16.9 9.3l1 1.8M17.7 13l-1.6 1.5' }),
  );
}

function useText(props) {
  const bound = props && typeof props.t === 'function' ? props.t : null;
  return React.useCallback((key, fallback) => {
    if (!bound) return fallback;
    let value;
    try {
      value = bound(key);
    } catch {
      value = undefined;
    }
    return typeof value === 'string' && value !== '' && value !== key ? value : fallback;
  }, [bound]);
}

/** 主面板：数据、视图、异步动作都集中在这里，子组件保持无状态。 */
function StudioPanel(props) {
  const tr = useText(props);
  const [db, setDb] = React.useState(loadDb);
  const [view, setView] = React.useState('read');
  const [pending, setPending] = React.useState(null);
  const [creating, setCreating] = React.useState(false);
  const [focusQ, setFocusQ] = React.useState(null);
  const [focusPara, setFocusPara] = React.useState(null);
  const [toast, setToast] = React.useState('');
  const [genBusy, setGenBusy] = React.useState(false);
  const [genError, setGenError] = React.useState('');
  const [genHint, setGenHint] = React.useState('');
  const [feynBusy, setFeynBusy] = React.useState(false);
  const [feynError, setFeynError] = React.useState('');
  const [feynRetry, setFeynRetry] = React.useState(null);
  const [ping, setPing] = React.useState(null);
  const genAbort = React.useRef(null);
  const bodyRef = React.useRef(null);

  const topic = db.topics.find((item) => item.id === db.activeId) || null;
  const questions = topic ? sortedQuestions(topic) : [];

  React.useEffect(() => {
    saveDb(db);
  }, [db]);

  React.useEffect(() => {
    let alive = true;
    rpc('ping').then((result) => {
      if (alive) setPing(result);
    }).catch(() => {
      if (alive) setPing({ modelReady: false });
    });
    return () => { alive = false; };
  }, []);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  }

  function patchTopic(id, updater) {
    setDb((prev) => ({
      ...prev,
      topics: prev.topics.map((item) => (item.id === id ? updater(item) : item)),
    }));
  }

  function updateTopic(updater) {
    if (!topic) return;
    patchTopic(topic.id, updater);
  }

  function setActive(id) {
    setDb((prev) => ({ ...prev, activeId: id }));
    setView('read');
    setPending(null);
    setFocusQ(null);
    setFocusPara(null);
  }

  async function generate(form) {
    const material = typeof form.material === 'string' ? form.material.trim() : '';
    if (material) {
      const parsed = parseMaterial(material);
      if (!parsed) {
        setGenError('粘贴的材料里没有可读的段落');
        return;
      }
      const id = uid();
      const now = Date.now();
      const next = {
        id,
        title: form.topic,
        level: form.level,
        createdAt: now,
        updatedAt: now,
        article: { title: form.topic, sections: parsed.sections },
        questions: [],
        feynman: { questions: [] },
      };
      setDb((prev) => ({ ...prev, topics: [next, ...prev.topics], activeId: id }));
      setCreating(false);
      setView('read');
      return;
    }
    setGenBusy(true);
    setGenError('');
    const hints = [
      '正在按你选的方面搭框架…',
      '正在给每一节补上定义与前提…',
      '正在安排讲解顺序…',
      '正在补一个能落地的例子…',
      '正在收尾：边界、误解与相邻概念…',
    ];
    let hintIndex = 0;
    setGenHint(hints[0]);
    const hintTimer = setInterval(() => {
      hintIndex = Math.min(hintIndex + 1, hints.length - 1);
      setGenHint(hints[hintIndex]);
    }, 9000);
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    genAbort.current = controller;
    try {
      const aspects = Array.isArray(form.aspects) ? form.aspects : [];
      const result = await rpc('generate', { topic: form.topic, level: form.level, aspects }, controller ? controller.signal : undefined);
      const article = parseArticle(result.markdown, form.topic);
      if (!article || article.sections.length === 0) throw new Error('模型没有给出可读的正文，请重试');
      const id = uid();
      const now = Date.now();
      const next = {
        id,
        title: form.topic,
        level: form.level,
        createdAt: now,
        updatedAt: now,
        article: { title: form.topic, sections: article.sections },
        aspects: Array.isArray(form.aspects) ? form.aspects : [],
        questions: [],
        feynman: { questions: [] },
      };
      setDb((prev) => ({ ...prev, topics: [next, ...prev.topics], activeId: id }));
      setCreating(false);
      setView('read');
    } catch (error) {
      setGenError(String((error && error.message) || error));
    } finally {
      clearInterval(hintTimer);
      setGenBusy(false);
      genAbort.current = null;
    }
  }

  function cancelGeneration() {
    if (genAbort.current) genAbort.current.abort();
    setGenBusy(false);
    setGenHint('');
  }

  // 发一次提问请求并回填答案；初次提问和失败重试走同一条路径。
  async function sendAsk(question, parent) {
    if (!topic) return;
    const section = topic.article.sections.find((item) => item.id === question.secId) || null;
    const paragraph = section ? section.paras.find((item) => item.id === question.paraId) : null;
    try {
      const result = await rpc('ask', {
        topic: topic.title,
        section: section ? section.title : '',
        paragraph: paragraph ? paragraph.text : '',
        quote: question.quote,
        question: question.question,
        parentQuestion: parent ? parent.question : '',
        parentAnswer: parent ? parent.answer : '',
      });
      patchTopic(topic.id, (item) => ({
        ...item,
        updatedAt: Date.now(),
        questions: item.questions.map((q) => (q.id === question.id ? { ...q, answer: result.answer, status: 'done', error: '' } : q)),
      }));
    } catch (error) {
      patchTopic(topic.id, (item) => ({
        ...item,
        questions: item.questions.map((q) => (q.id === question.id ? { ...q, status: 'error', error: String((error && error.message) || error) } : q)),
      }));
    }
  }

  async function askQuestion(input) {
    if (!topic) return;
    const id = uid();
    const createdAt = Date.now();
    const question = {
      id,
      secId: input.secId,
      paraId: input.paraId,
      start: input.start,
      end: input.end,
      quote: input.quote,
      question: input.question,
      answer: '',
      status: 'loading',
      error: '',
      parentId: input.parent ? input.parent.id : null,
      links: [],
      linkAttempted: false,
      createdAt,
    };
    updateTopic((item) => ({ ...item, questions: item.questions.concat([question]), updatedAt: createdAt }));
    setPending(null);
    setView('read');
    await sendAsk(question, input.parent || null);
  }

  // 回答失败后重新请求：先回到 loading，避免用户连点造成重复卡片。
  async function retryQuestion(question) {
    if (!topic || !question || question.status === 'loading') return;
    patchTopic(topic.id, (item) => ({
      ...item,
      questions: item.questions.map((q) => (q.id === question.id ? { ...q, status: 'loading', error: '' } : q)),
    }));
    const parent = question.parentId
      ? topic.questions.find((item) => item.id === question.parentId) || null
      : null;
    await sendAsk(question, parent);
  }

  // 回答完成后自动找关联：每张卡只尝试一次，失败不阻塞后续。
  const readyIds = topic ? topic.questions.filter((q) => q.status === 'done' && q.answer && !q.linkAttempted).map((q) => q.id).join(',') : '';
  React.useEffect(() => {
    if (!topic || !readyIds) return;
    const target = topic.questions.find((q) => q.status === 'done' && q.answer && !q.linkAttempted);
    if (!target) return;
    patchTopic(topic.id, (item) => ({
      ...item,
      questions: item.questions.map((q) => (q.id === target.id ? { ...q, linkAttempted: true } : q)),
    }));
    const others = sortedQuestions(topic)
      .filter((q) => q.id !== target.id && q.status === 'done' && q.answer)
      .slice(0, 20)
      .map((q) => ({ id: q.id, question: q.question, answer: q.answer }));
    if (others.length === 0) return;
    rpc('link', {
      newCard: { id: target.id, quote: target.quote, question: target.question, answer: target.answer },
      cards: others,
    }).then((result) => {
      const links = result && Array.isArray(result.links) ? result.links : [];
      if (links.length === 0) return;
      patchTopic(topic.id, (item) => ({
        ...item,
        questions: item.questions.map((q) => {
          if (q.id === target.id) {
            const merged = (q.links || []).slice();
            for (const link of links) {
              if (!merged.some((existing) => existing.id === link.id)) merged.push(link);
            }
            return { ...q, links: merged };
          }
          if (links.some((link) => link.id === q.id)) {
            const reverse = (q.links || []).slice();
            const hit = links.find((link) => link.id === q.id);
            if (!reverse.some((existing) => existing.id === target.id)) {
              reverse.push({ id: target.id, kind: hit.kind, reason: hit.reason });
            }
            return { ...q, links: reverse };
          }
          return q;
        }),
      }));
    }).catch(() => {
      // 关联是锦上添花：模型不可用时只损失连线，不打扰阅读。
    });
  }, [readyIds]);

  function deleteQuestion(id) {
    if (!topic) return;
    if (!window.confirm(tr('confirmDeleteQuestion', '删除这张问答卡？与它相连的关联也会一起移除。'))) return;
    updateTopic((item) => ({
      ...item,
      questions: item.questions
        .filter((q) => q.id !== id)
        .map((q) => ({ ...q, links: (q.links || []).filter((link) => link.id !== id) })),
    }));
    if (focusQ === id) setFocusQ(null);
  }

  function addManualLink(fromId, toId) {
    if (!topic || !fromId || !toId || fromId === toId) return;
    const reason = '手动关联';
    updateTopic((item) => ({
      ...item,
      questions: item.questions.map((q) => {
        if (q.id === fromId) {
          const links = (q.links || []).slice();
          if (!links.some((link) => link.id === toId)) links.push({ id: toId, kind: '相关', reason });
          return { ...q, links };
        }
        if (q.id === toId) {
          const links = (q.links || []).slice();
          if (!links.some((link) => link.id === fromId)) links.push({ id: fromId, kind: '相关', reason });
          return { ...q, links };
        }
        return q;
      }),
    }));
  }

  function deleteTopic() {
    if (!topic) return;
    if (!window.confirm(tr('deleteConfirm', '删除后这篇导读、问答和检验记录都会消失，确定吗？'))) return;
    setDb((prev) => {
      const topics = prev.topics.filter((item) => item.id !== topic.id);
      return { ...prev, topics, activeId: topics.length > 0 ? topics[0].id : null };
    });
    setView('read');
  }

  async function startFeynman() {
    if (!topic) return;
    setFeynBusy(true);
    setFeynError('');
    try {
      const result = await rpc('feynman', { topic: topic.title, markdown: articleToMarkdown(topic.article) });
      const fresh = (result.questions || []).map((item) => ({ id: uid(), prompt: item.prompt, focus: item.focus, attempts: [] }));
      if (fresh.length === 0) throw new Error('没有拿到自测问题，请重试');
      updateTopic((item) => ({ ...item, feynman: { questions: fresh, createdAt: Date.now() } }));
    } catch (error) {
      setFeynError(String((error && error.message) || error));
    } finally {
      setFeynBusy(false);
    }
  }

  async function submitAttempt(questionId, answer) {
    if (!topic) return;
    const current = (topic.feynman && topic.feynman.questions || []).find((q) => q.id === questionId);
    if (!current) return;
    setFeynError('');
    setFeynRetry(null);
    const attempt = { answer, verdict: 'pending', score: 0, missing: [], feedback: '', hint: '', at: Date.now() };
    updateTopic((item) => ({
      ...item,
      feynman: {
        ...(item.feynman || {}),
        questions: (item.feynman.questions || []).map((q) => (q.id === questionId ? { ...q, attempts: (q.attempts || []).concat([attempt]) } : q)),
      },
    }));
    try {
      const result = await rpc('grade', {
        markdown: articleToMarkdown(topic.article),
        prompt: current.prompt,
        answer,
      });
      updateTopic((item) => ({
        ...item,
        feynman: {
          ...(item.feynman || {}),
          questions: (item.feynman.questions || []).map((q) => {
            if (q.id !== questionId) return q;
            const attempts = (q.attempts || []).slice();
            attempts[attempts.length - 1] = {
              ...attempt,
              verdict: result.verdict,
              score: result.score,
              missing: result.missing || [],
              feedback: result.feedback || '',
              hint: result.hint || '',
              parseError: Boolean(result.parseError),
              at: Date.now(),
            };
            return { ...q, attempts };
          }),
        },
      }));
    } catch (error) {
      // 评价没有返回时不要留下一条假的「需要重来」记录：撤掉 pending，把答案留在重试按钮里。
      const message = String((error && error.message) || error);
      updateTopic((item) => ({
        ...item,
        feynman: {
          ...(item.feynman || {}),
          questions: (item.feynman.questions || []).map((q) => {
            if (q.id !== questionId) return q;
            return { ...q, attempts: (q.attempts || []).filter((a) => a.at !== attempt.at) };
          }),
        },
      }));
      setFeynError(message);
      setFeynRetry({ questionId, answer });
    }
  }

  function focusQuestion(id) {
    setView('read');
    setFocusQ(id);
    const target = topic ? topic.questions.find((item) => item.id === id) : null;
    if (target) setFocusPara(target.paraId);
    // 刚从其它 tab 切回阅读视图时卡片还没挂载，用两帧 rAF 等它出现再滚动。
    const run = () => {
      const node = document.querySelector('[data-qid="' + id + '"]');
      if (!node) return;
      node.scrollIntoView({ block: 'center', behavior: 'smooth' });
      node.setAttribute('data-flash', 'true');
      setTimeout(() => node.removeAttribute('data-flash'), 1200);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(run));
    else setTimeout(run, 30);
  }

  const feynQuestions = topic && topic.feynman && Array.isArray(topic.feynman.questions) ? topic.feynman.questions : [];
  const passedCount = feynQuestions.filter((q) => {
    const attempts = q.attempts || [];
    const last = attempts[attempts.length - 1];
    return Boolean(last && last.verdict === 'pass');
  }).length;
  const allPassed = feynQuestions.length > 0 && passedCount === feynQuestions.length;
  const note = topic ? noteMarkdown(topic) : '';

  const modelLabel = ping && ping.model && ping.model.model
    ? String(ping.model.model)
    : (ping && ping.modelReady === false ? tr('noModel', '模型未就绪') : '');

  return h('div', { className: 'ls-app' },
    h('header', { className: 'ls-head' },
      h('div', { className: 'ls-brand' },
        h('span', { className: 'ls-brand-mark' }, h(Icon, { size: 18 })),
        h('span', null, tr('title', '学习台')),
        h('span', { className: 'ls-brand-sub' }, tr('subtitle', '把一段讲解读成自己的知识网络')),
      ),
      topic ? h('select', {
        className: 'ls-select',
        value: topic.id,
        onChange: (event) => setActive(event.target.value),
        title: tr('topic', '概念'),
      }, db.topics.map((item) => h('option', { key: item.id, value: item.id }, item.title))) : null,
      h('button', { className: 'ls-btn', type: 'button', onClick: () => { setCreating(true); setGenError(''); } },
        '+ ' + tr('newTopic', '新建学习')),
      h('div', { className: 'ls-head-spacer' }),
      h('div', { className: 'ls-tabs' },
        h('button', { className: 'ls-tab', type: 'button', disabled: !topic, 'data-active': String(view === 'read'), onClick: () => setView('read') }, tr('read', '阅读')),
        h('button', { className: 'ls-tab', type: 'button', disabled: !topic, 'data-active': String(view === 'graph'), onClick: () => setView('graph') }, tr('graph', '知识网络')),
        h('button', { className: 'ls-tab', type: 'button', disabled: !topic, 'data-active': String(view === 'feynman'), onClick: () => { setView('feynman'); } }, tr('feynman', '费曼检验') + (feynQuestions.length ? ' ' + passedCount + '/' + feynQuestions.length : '')),
        h('button', { className: 'ls-tab', type: 'button', disabled: !topic, 'data-active': String(view === 'notes'), onClick: () => setView('notes') }, tr('notes', '笔记')),
      ),
      modelLabel ? h('span', { className: 'ls-model', title: tr('model', '模型') }, modelLabel) : null,
      topic ? h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: deleteTopic, title: tr('deleteTopic', '删除这次学习') }, '🗑') : null,
    ),

    !topic
      ? h('div', { className: 'ls-hero' },
        h('div', { className: 'ls-hero-inner' },
          h('h1', null, tr('emptyTitle', '从一个概念开始')),
          h('p', null, tr('emptyBody', 'AI 会先写一份完整而简洁的导读。读到有疑问的地方，划词就能在侧边追问；问题之间会自动连线，最后用费曼复述检验自己是否真的讲得清。')),
          h('button', { className: 'ls-btn ls-btn-primary', type: 'button', onClick: () => setCreating(true) }, tr('emptyAction', '新建学习')),
        ),
      )
      : h('div', { className: 'ls-body', ref: bodyRef },
        view === 'read' ? h(ReadView, {
          topic, questions, pending, focusQ, focusPara, tr,
          onSelect: setPending,
          onCancelPending: () => setPending(null),
          onAsk: askQuestion,
          onFollowUp: askQuestion,
          onRetry: retryQuestion,
          onDelete: deleteQuestion,
          onManualLink: addManualLink,
          onFocusQuestion: focusQuestion,
          onFocusPara: setFocusPara,
          renderMarkdown: renderAnswer,
        }) : null,
        view === 'graph' ? h(GraphView, { topic, questions, tr, onOpen: focusQuestion }) : null,
        view === 'feynman' ? h(FeynmanView, {
          topic, tr, questions: feynQuestions, passedCount, allPassed, busy: feynBusy, error: feynError, retry: feynRetry,
          onStart: startFeynman, onSubmit: submitAttempt,
          onRetry: () => { if (feynRetry) submitAttempt(feynRetry.questionId, feynRetry.answer); },
          onGoNotes: () => setView('notes'),
        }) : null,
        view === 'notes' ? h(NotesView, {
          topic, tr, note, allPassed, passedCount, total: feynQuestions.length,
          onCopy: () => { navigator.clipboard.writeText(note).then(() => showToast(tr('copied', '已复制'))).catch(() => showToast('复制失败')); },
          onDownload: () => downloadText(topic.title.replace(/[\\/:*?"<>|]/g, '_') + '-学习笔记.md', note),
          onForceDownload: () => downloadText(topic.title.replace(/[\\/:*?"<>|]/g, '_') + '-学习笔记.md', note),
          onGoFeynman: () => setView('feynman'),
        }) : null,
      ),

    creating ? h(NewTopicDialog, {
      tr, busy: genBusy, error: genError, hint: genHint,
      onCancel: () => { if (genBusy) cancelGeneration(); setCreating(false); },
      onSubmit: generate,
    }) : null,
    toast ? h('div', { className: 'ls-toast' }, toast) : null,
  );
}

function ReadView(props) {
  const { topic, questions, pending, focusQ, focusPara, tr } = props;
  const articleRef = React.useRef(null);
  const [selection, setSelection] = React.useState(null);

  React.useEffect(() => {
    function onMouseUp(event) {
      const browserSelection = window.getSelection();
      if (!browserSelection || browserSelection.isCollapsed || browserSelection.rangeCount === 0) {
        // 在别处点了一下（例如输入框）：工具栏必须收起，否则会停在旧位置误导用户。
        const onToolbar = event && event.target && event.target.closest && event.target.closest('.ls-selbar');
        if (!onToolbar) setSelection(null);
        return;
      }
      const range = browserSelection.getRangeAt(0);
      if (!articleRef.current || !articleRef.current.contains(range.commonAncestorContainer)) return;
      const startPara = closestPara(range.startContainer);
      const endPara = closestPara(range.endContainer);
      if (!startPara || startPara !== endPara) return;
      const full = startPara.getAttribute('data-text') || '';
      const start = offsetWithin(startPara, range.startContainer, range.startOffset);
      const end = offsetWithin(startPara, range.endContainer, range.endOffset);
      if (!(end > start)) return;
      const raw = full.slice(start, end);
      const leading = raw.length - raw.replace(/^\s+/, '').length;
      const trailing = raw.length - raw.replace(/\s+$/, '').length;
      const quote = raw.trim();
      if (quote.length < 1) return;
      const rect = range.getBoundingClientRect();
      setSelection({
        secId: startPara.getAttribute('data-sec-id'),
        paraId: startPara.getAttribute('data-para-id'),
        start: start + leading,
        end: Math.max(start + leading + 1, end - trailing),
        quote,
        x: Math.min(Math.max(rect.left + rect.width / 2, 120), window.innerWidth - 120),
        y: rect.top - 8,
      });
    }
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, []);

  React.useEffect(() => {
    if (!focusPara || !articleRef.current) return;
    const target = articleRef.current.querySelector('[data-para-id="' + focusPara + '"]');
    if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusPara]);

  function beginAsk() {
    if (!selection) return;
    props.onSelect(selection);
    setSelection(null);
    const browserSelection = window.getSelection();
    if (browserSelection) browserSelection.removeAllRanges();
  }

  // 跳到某张回答卡片：先让侧栏聚焦，再把卡片滚进视口并闪一下。
  // 不能只依赖卡片自己的 focused effect —— 连续点同一段时 focused 不变，effect 不会重跑。
  function focusCard(id) {
    props.onFocusQuestion(id);
    setTimeout(() => {
      const node = document.querySelector('[data-qid="' + id + '"]');
      if (!node) return;
      node.scrollIntoView({ block: 'center', behavior: 'smooth' });
      node.setAttribute('data-flash', 'true');
      setTimeout(() => node.removeAttribute('data-flash'), 1200);
    }, 80);
  }

  // 点段落正文（不一定是划线的高亮处）：若这一段有提问，跳到该段最早的那张卡。
  function onClickPara(paraId, event) {
    const browserSelection = window.getSelection();
    if (browserSelection && !browserSelection.isCollapsed && browserSelection.toString().trim() !== '') return;
    if (event && event.target && event.target.closest && event.target.closest('mark[data-qid]')) return;
    const target = questions.find((item) => item.paraId === paraId);
    if (target) focusCard(target.id);
  }

  return h('div', { style: { display: 'contents' } },
    h('div', { className: 'ls-read' },
      h('div', { className: 'ls-article', ref: articleRef },
        h('h1', { className: 'ls-article-title' }, topic.title),
        h('div', { className: 'ls-article-meta' },
          tr('topic', '概念') + ' · ' + topic.article.sections.length + ' 节 · '
          + (questions.length > 0 ? questions.length + ' 个疑问' : '还没有提问')),
        topic.article.sections.map((section) => h('section', { className: 'ls-section', key: section.id },
          h('h2', { className: 'ls-section-title' }, section.title),
          section.paras.map((para) => {
            const paraQuestions = questions.filter((item) => item.paraId === para.id);
            return h('p', {
              className: 'ls-para',
              key: para.id,
              'data-para-id': para.id,
              'data-sec-id': section.id,
              'data-text': para.text,
              'data-focus': String(focusPara === para.id),
              'data-hasq': String(paraQuestions.length > 0),
              title: paraQuestions.length > 0 ? '点击跳到这一段的提问' : undefined,
              onClick: paraQuestions.length > 0 ? (event) => onClickPara(para.id, event) : undefined,
            }, segmentsFor(topic, para).map((segment, index) => segment.qid
              ? h('mark', {
                className: 'ls-mark',
                key: index,
                'data-qid': segment.qid,
                title: '查看对应的回答',
                onClick: (event) => {
                  event.stopPropagation();
                  focusCard(segment.qid);
                },
              }, segment.text)
              : h('span', { key: index }, segment.text)));
          }),
        )),
        h('div', { className: 'ls-hintline', style: { marginTop: 26 } },
          '提示：在任意段落里按住鼠标划出一句话，就能就它提问。'),
      ),
    ),

    h('aside', { className: 'ls-aside' },
      h('div', { className: 'ls-aside-head' },
        '我的疑问',
        h('span', { className: 'ls-aside-count' }, '（' + questions.length + '）'),
      ),
      h('div', { className: 'ls-aside-scroll' },
        pending ? h(Composer, {
          key: 'pending',
          tr,
          quote: pending.quote,
          hint: '划线段落',
          onSubmit: (text) => props.onAsk({ ...pending, question: text }),
          onCancel: props.onCancelPending,
        }) : null,
        questions.length === 0 && !pending
          ? h('div', { className: 'ls-empty' }, tr('emptyQuestions', '还没有提问。在左边选中一段文字，点「就这里提问」。'))
          : questions.map((question, index) => h(QuestionCard, {
            key: question.id,
            topic, question, index, tr,
            focused: focusQ === question.id,
            others: questions.filter((item) => item.id !== question.id),
            onFocus: () => props.onFocusQuestion(question.id),
            onFollowUp: (text) => props.onFollowUp({
              secId: question.secId,
              paraId: question.paraId,
              start: question.start,
              end: question.end,
              quote: question.quote,
              question: text,
              parent: question,
            }),
            onDelete: () => props.onDelete(question.id),
            onRetry: () => props.onRetry(question),
            onManualLink: (toId) => props.onManualLink(question.id, toId),
            renderMarkdown: props.renderMarkdown,
          })),
      ),
    ),

    selection ? h('div', {
      className: 'ls-selbar',
      style: { left: selection.x + 'px', top: selection.y + 'px' },
      onMouseDown: (event) => event.preventDefault(),
    },
      h('button', { className: 'ls-btn ls-btn-primary', type: 'button', onClick: beginAsk }, tr('ask', '就这里提问')),
      h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: () => setSelection(null) }, '×'),
    ) : null,
  );
}

function Composer(props) {
  const { tr } = props;
  const [text, setText] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);
  function submit() {
    const value = text.trim();
    if (value === '') return;
    props.onSubmit(value);
    setText('');
  }
  return h('div', { className: 'ls-compose' },
    h('div', { className: 'ls-quote' }, '「' + props.quote + '」'),
    h('textarea', {
      className: 'ls-textarea',
      ref,
      rows: 3,
      value: text,
      placeholder: tr('askPlaceholder', '写下你的疑问…'),
      onChange: (event) => setText(event.target.value),
      onKeyDown: (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit();
      },
    }),
    h('div', { className: 'ls-compose-foot' },
      h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: props.onCancel }, tr('cancel', '取消')),
      h('button', { className: 'ls-btn ls-btn-primary', type: 'button', disabled: text.trim() === '', onClick: submit }, tr('send', '提问')),
    ),
  );
}

function QuestionCard(props) {
  const { topic, question, index, tr, focused, others } = props;
  const [followOpen, setFollowOpen] = React.useState(false);
  const [followText, setFollowText] = React.useState('');
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkPick, setLinkPick] = React.useState('');
  const section = sectionOf(topic, question);
  const number = index + 1;
  const links = Array.isArray(question.links) ? question.links : [];

  // 从正文标记或关联 chip 跳到这张卡时，把它带进侧栏视口，否则用户只看到高亮却找不到卡片。
  React.useEffect(() => {
    if (!focused) return;
    const node = document.querySelector('[data-qid="' + question.id + '"]');
    if (node) node.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focused, question.id]);

  return h('div', {
    className: 'ls-card',
    'data-focus': String(Boolean(focused)),
    'data-qid': question.id,
  },
    h('div', { className: 'ls-card-head' },
      h('span', { className: 'ls-badge' }, tr('questionN', '问') + ' ' + number),
      section ? h('span', null, section.title) : null,
      question.parentId ? h('span', null, '· 追问') : null,
    ),
    h('div', { className: 'ls-card-quote' }, '「' + question.quote + '」'),
    h('p', { className: 'ls-q' }, question.question),
    question.status === 'loading'
      ? h('div', null,
        h('div', { className: 'ls-skel', style: { width: '92%' } }),
        h('div', { className: 'ls-skel', style: { width: '78%' } }),
        h('div', { className: 'ls-skel', style: { width: '60%' } }),
        h('div', { className: 'ls-hintline' }, tr('loadingAnswer', '正在回答…')),
      )
      : question.status === 'error'
        ? h('div', { className: 'ls-err' },
          h('div', null, tr('error', '出错了') + '：' + (question.error || tr('unknownError', '未知错误'))),
          h('div', { style: { marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
            h('button', { className: 'ls-btn ls-btn-primary', type: 'button', onClick: props.onRetry }, tr('retry', '重试')),
            h('span', { className: 'ls-hintline' }, tr('retryHint', '问题已经保存，重试不会重新创建卡片')),
          ),
        )
        : h('div', { className: 'ls-a' }, props.renderMarkdown(question.answer)),

    links.length > 0 ? h('div', { className: 'ls-links' }, links.map((link) => {
      const target = topic.questions.find((item) => item.id === link.id);
      if (!target) return null;
      return h('button', {
        key: link.id,
        className: 'ls-linkchip',
        type: 'button',
        title: '跳到对应的回答',
        onClick: () => {
          const node = document.querySelector('[data-qid="' + link.id + '"]');
          if (node) {
            node.scrollIntoView({ block: 'center', behavior: 'smooth' });
            node.setAttribute('data-flash', 'true');
            setTimeout(() => node.removeAttribute('data-flash'), 1200);
          }
        },
      }, h('b', null, '问 ' + questionNumber(topic, link.id)), ' · ' + link.kind + '：' + link.reason);
    })) : null,

    h('div', { className: 'ls-card-actions' },
      h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: () => setFollowOpen((value) => !value) }, tr('followUp', '追问')),
      h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: () => setLinkOpen((value) => !value), disabled: others.length === 0 }, tr('related', '关联')),
      h('div', { style: { flex: 1 } }),
      h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: props.onDelete }, tr('delete', '删除')),
    ),

    followOpen ? h('div', { style: { marginTop: 8 } },
      h('textarea', {
        className: 'ls-textarea',
        rows: 2,
        value: followText,
        placeholder: tr('askPlaceholder', '写下你的疑问…'),
        onChange: (event) => setFollowText(event.target.value),
        onKeyDown: (event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && followText.trim() !== '') {
            props.onFollowUp(followText.trim());
            setFollowText('');
            setFollowOpen(false);
          }
        },
      }),
      h('div', { className: 'ls-compose-foot' },
        h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: () => setFollowOpen(false) }, tr('cancel', '取消')),
        h('button', {
          className: 'ls-btn ls-btn-primary',
          type: 'button',
          disabled: followText.trim() === '',
          onClick: () => {
            const value = followText.trim();
            if (value === '') return;
            props.onFollowUp(value);
            setFollowText('');
            setFollowOpen(false);
          },
        }, tr('send', '提问')),
      ),
    ) : null,

    linkOpen ? h('div', { style: { marginTop: 8 } },
      h('div', { className: 'ls-hintline', style: { marginBottom: 6 } }, tr('linkTo', '手动关联到')),
      h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
        h('select', {
          className: 'ls-select',
          value: linkPick,
          onChange: (event) => setLinkPick(event.target.value),
        },
          h('option', { value: '' }, tr('linkPick', '选择一张卡片')),
          others.map((item) => h('option', { key: item.id, value: item.id }, '问 ' + questionNumber(topic, item.id) + '：' + item.question.slice(0, 40))),
        ),
        h('button', {
          className: 'ls-btn',
          type: 'button',
          disabled: linkPick === '',
          onClick: () => { props.onManualLink(linkPick); setLinkPick(''); setLinkOpen(false); },
        }, tr('related', '关联')),
      ),
    ) : null,
  );
}

function GraphView(props) {
  const { topic, questions, tr } = props;
  const width = 1000;
  const sectionIndex = new Map();
  topic.article.sections.forEach((section, index) => sectionIndex.set(section.id, index));
  const columns = topic.article.sections.map(() => []);
  for (const question of questions) {
    const index = sectionIndex.has(question.secId) ? sectionIndex.get(question.secId) : 0;
    if (columns[index]) columns[index].push(question);
  }
  const maxRows = Math.max(1, ...columns.map((column) => column.length));
  const height = Math.max(420, 110 + maxRows * 84);
  const columnWidth = width / Math.max(1, columns.length);
  const positions = new Map();
  columns.forEach((column, columnIndex) => {
    const usable = height - 110 - 30;
    const step = usable / Math.max(1, column.length);
    column.forEach((question, rowIndex) => {
      positions.set(question.id, {
        x: columnWidth * (columnIndex + 0.5),
        y: 78 + step * (rowIndex + 0.5),
      });
    });
  });
  const edges = [];
  const seen = new Set();
  for (const question of questions) {
    for (const link of question.links || []) {
      if (!positions.has(link.id)) continue;
      const key = [question.id, link.id].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: question.id, to: link.id, kind: link.kind, reason: link.reason });
    }
  }
  const colors = {
    '因果': 'var(--dsw-alias-brand-primary,#4d6bfe)',
    '前提': 'var(--dsw-alias-state-warn-primary,#d97706)',
    '对比': 'var(--dsw-alias-state-error-primary,#d83931)',
    '同一机制': 'var(--dsw-alias-state-success-primary,#2ea121)',
    '延伸': 'var(--dsw-alias-label-secondary,#646a73)',
    '相关': 'var(--dsw-alias-label-secondary,#646a73)',
  };

  if (questions.length === 0) {
    return h('div', { className: 'ls-graph-wrap' }, h('div', { className: 'ls-empty' }, tr('emptyGraph', '至少有两张回答卡后，这里会显示它们之间的关联。')));
  }

  return h('div', { className: 'ls-graph-wrap' },
    h('p', { className: 'ls-graph-note' }, tr('graphHint', '按原文小节分列；连线表示问答之间的知识关联。点击卡片可跳回原文。')),
    h('svg', { viewBox: '0 0 ' + width + ' ' + height, width: '100%', style: { maxHeight: '70vh', display: 'block' } },
      columns.map((column, columnIndex) => h('text', {
        key: 'sec' + columnIndex,
        x: columnWidth * (columnIndex + 0.5),
        y: 24,
        className: 'ls-graph-sec',
      }, (topic.article.sections[columnIndex] || {}).title || '')),
      edges.map((edge, index) => {
        const from = positions.get(edge.from);
        const to = positions.get(edge.to);
        if (!from || !to) return null;
        const midX = (from.x + to.x) / 2;
        return h('path', {
          key: 'edge' + index,
          d: 'M ' + from.x + ' ' + from.y + ' C ' + midX + ' ' + from.y + ', ' + midX + ' ' + to.y + ', ' + to.x + ' ' + to.y,
          fill: 'none',
          stroke: colors[edge.kind] || colors['延伸'],
          strokeWidth: 1.4,
          strokeOpacity: 0.65,
          strokeDasharray: edge.kind === '相关' ? '4 3' : 'none',
        });
      }),
      questions.map((question) => {
        const position = positions.get(question.id);
        if (!position) return null;
        const label = question.question.length > 18 ? question.question.slice(0, 18) + '…' : question.question;
        return h('g', {
          key: question.id,
          className: 'ls-graph-node',
          transform: 'translate(' + position.x + ',' + position.y + ')',
          onClick: () => props.onOpen(question.id),
        },
          h('title', null, '问 ' + questionNumber(topic, question.id) + '：' + question.question),
          h('circle', { r: 9 }),
          h('text', { className: 'ls-graph-label', x: 14, y: 4 }, label),
        );
      }),
    ),
    h('div', { className: 'ls-legend' },
      Object.keys(colors).filter((kind) => kind !== '相关').map((kind) => h('span', { key: kind },
        h('i', { style: { background: colors[kind] } }), kind,
      )),
    ),
  );
}

function FeynmanView(props) {
  const { topic, tr, questions, passedCount, allPassed, busy, error, retry } = props;
  const [activeId, setActiveId] = React.useState(questions.length > 0 ? questions[0].id : '');
  const [draft, setDraft] = React.useState('');
  const [draftFor, setDraftFor] = React.useState('');
  const active = questions.find((item) => item.id === activeId) || questions[0] || null;
  const attempts = active ? (active.attempts || []) : [];
  const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const activeIndex = active ? questions.findIndex((item) => item.id === active.id) : -1;

  React.useEffect(() => {
    if (!active && questions.length > 0) setActiveId(questions[0].id);
  }, [questions.length]);

  function submit() {
    const value = draft.trim();
    if (value === '' || !active) return;
    props.onSubmit(active.id, value);
    setDraftFor(active.id);
  }

  if (questions.length === 0) {
    return h('div', { className: 'ls-read' },
      h('div', { className: 'ls-feyn-card' },
        h('h1', { className: 'ls-article-title' }, tr('feynman', '费曼检验')),
        h('p', { className: 'ls-hintline', style: { fontSize: 14, lineHeight: 1.9 } }, tr('feynmanIntro', '合上原文，用自己的话回答下面这些问题。关键点没有遗漏，才算真正理解。')),
        error ? h('div', { className: 'ls-err', style: { marginTop: 14 } }, error) : null,
        h('div', { style: { marginTop: 18 } },
          h('button', { className: 'ls-btn ls-btn-primary', type: 'button', disabled: busy, onClick: props.onStart },
            busy ? tr('loading', '加载中…') : tr('startFeynman', '生成关键问题')),
        ),
      ),
    );
  }

  return h('div', { className: 'ls-feynman' },
    h('div', { className: 'ls-feyn-list' },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
        h('strong', null, tr('progress', '已通过') + ' ' + passedCount + '/' + questions.length),
        h('div', { style: { flex: 1 } }),
        h('button', { className: 'ls-btn ls-btn-ghost', type: 'button', onClick: props.onStart, disabled: busy, title: '重新生成问题' }, '↻'),
      ),
      questions.map((question, index) => {
        const list = question.attempts || [];
        const last = list[list.length - 1];
        const passed = Boolean(last && last.verdict === 'pass');
        return h('div', {
          key: question.id,
          className: 'ls-feyn-item',
          'data-active': String(active && active.id === question.id),
          onClick: () => { setActiveId(question.id); setDraft(''); },
        },
          h('span', { className: 'ls-dot', 'data-pass': String(passed) }, passed ? '✓' : String(index + 1)),
          h('span', { style: { flex: 1 } }, question.prompt),
        );
      }),
      allPassed ? h('div', { className: 'ls-hintline', style: { marginTop: 12, color: 'var(--dsw-alias-state-success-primary,#2ea121)' } },
        tr('allPassed', '全部通过，可以整理成笔记了。'),
        h('div', { style: { marginTop: 8 } },
          h('button', { className: 'ls-btn ls-btn-primary', type: 'button', onClick: props.onGoNotes }, tr('export', '导出笔记')),
        ),
      ) : null,
    ),
    h('div', { className: 'ls-feyn-main' },
      h('div', { className: 'ls-feyn-card' },
        active.focus ? h('div', { className: 'ls-feyn-focus' }, active.focus) : null,
        h('h1', { className: 'ls-feyn-prompt' }, active.prompt),
        h('textarea', {
          className: 'ls-textarea',
          rows: 6,
          value: draftFor === active.id ? draft : '',
          placeholder: tr('yourAnswer', '用你自己的话复述…'),
          onChange: (event) => { setDraftFor(active.id); setDraft(event.target.value); },
        }),
        h('div', { style: { display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' } },
          h('button', { className: 'ls-btn ls-btn-primary', type: 'button', onClick: submit, disabled: !(draftFor === active.id && draft.trim() !== '') || Boolean(latest && latest.verdict === 'pending') },
            latest && latest.verdict === 'pending' ? tr('evaluating', '正在评估…') : (latest ? tr('retryAnswer', '再答一次') : tr('submit', '提交复述'))),
          h('div', { style: { flex: 1 } }),
          h('button', {
            className: 'ls-btn', type: 'button', disabled: activeIndex <= 0,
            onClick: () => { const prev = questions[activeIndex - 1]; if (prev) { setActiveId(prev.id); setDraft(''); } },
          }, tr('prev', '上一题')),
          h('button', {
            className: 'ls-btn', type: 'button', disabled: activeIndex < 0 || activeIndex >= questions.length - 1,
            onClick: () => { const next = questions[activeIndex + 1]; if (next) { setActiveId(next.id); setDraft(''); } },
          }, tr('next', '下一题')),
        ),
        latest && latest.verdict !== 'pending' ? h('div', { className: 'ls-attempt', 'data-verdict': latest.verdict },
          h('div', { className: 'ls-attempt-head' },
            tr('feedback', '评价'),
            h('span', { className: 'ls-verdict', 'data-v': latest.verdict },
              latest.verdict === 'pass' ? tr('verdictPass', '通过') : latest.verdict === 'fail' ? tr('verdictFail', '需要重来') : tr('verdictPartial', '还需补充')),
            latest.score ? h('span', { className: 'ls-hintline' }, latest.score + ' 分') : null,
          ),
          h('div', { className: 'ls-a' }, latest.feedback || ''),
          latest.missing && latest.missing.length > 0 ? h('div', { className: 'ls-kv' },
            h('b', null, tr('missing', '还缺这些关键点')),
            h('ul', null, latest.missing.map((item, index) => h('li', { key: index }, item))),
          ) : null,
          latest.hint ? h('div', { className: 'ls-kv' }, h('b', null, tr('hint', '提示')), h('div', null, latest.hint)) : null,
        ) : null,
        latest && latest.verdict === 'pending' ? h('div', { className: 'ls-kv' }, h('div', { className: 'ls-hintline' }, tr('evaluating', '正在评估…'))) : null,
        error ? h('div', { className: 'ls-err', style: { marginTop: 12 } },
          h('div', null, error),
          retry ? h('div', { style: { marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
            h('button', {
              className: 'ls-btn ls-btn-primary', type: 'button', disabled: busy,
              onClick: props.onRetry,
            }, tr('retry', '重试')),
            h('span', { className: 'ls-hintline' }, tr('retryGradeHint', '你的复述还在，直接重试评价即可')),
          ) : null,
        ) : null,
      ),
    ),
  );
}

function NotesView(props) {
  const { topic, tr, note, allPassed, passedCount, total } = props;
  const locked = !allPassed;
  return h('div', { className: 'ls-notes-wrap' },
    h('div', { className: 'ls-notes-bar' },
      h('strong', null, tr('notes', '笔记')),
      h('span', { className: 'ls-hintline' }, total > 0 ? passedCount + '/' + total + ' 通过' : '尚未做费曼检验'),
      h('span', { className: 'ls-spacer' }),
      locked ? h('span', { className: 'ls-lock' }, tr('exportLocked', '所有问题通过后解锁导出')) : null,
      h('button', {
        className: 'ls-btn', type: 'button',
        onClick: props.onCopy, disabled: locked,
      }, tr('copy', '复制 Markdown')),
      h('button', {
        className: 'ls-btn ls-btn-primary', type: 'button',
        onClick: props.onDownload, disabled: locked,
      }, tr('download', '下载 .md')),
      locked ? h('button', {
        className: 'ls-btn ls-btn-ghost', type: 'button',
        title: '仅用于评价接口异常时自救',
        onClick: () => {
          if (window.confirm('费曼检验还没有全部通过。仍然导出这份尚未完成的笔记？')) props.onForceDownload();
        },
      }, tr('exportAnyway', '仍要导出')) : null,
    ),
    h('pre', { className: 'ls-pre' }, note || tr('notesEmpty', '完成至少一次提问后，这里会生成笔记预览。')),
    locked ? h('div', { className: 'ls-hintline' },
      tr('exportLocked', '所有问题通过后解锁导出')
      + '。先到「费曼检验」用自己的话回答关键问题；如果评价接口异常，可以用「仍要导出」自救。') : null,
  );
}

function NewTopicDialog(props) {
  const { tr, busy, error, hint } = props;
  const [step, setStep] = React.useState('topic');
  const [topic, setTopic] = React.useState('');
  const [level, setLevel] = React.useState('standard');
  const [showMaterial, setShowMaterial] = React.useState(false);
  const [material, setMaterial] = React.useState('');
  const [aspects, setAspects] = React.useState([]);
  const [outlineBusy, setOutlineBusy] = React.useState(false);
  const [outlineError, setOutlineError] = React.useState('');
  const [custom, setCustom] = React.useState('');
  const outlineAbort = React.useRef(null);

  React.useEffect(() => () => {
    if (outlineAbort.current) outlineAbort.current.abort();
  }, []);

  const selected = aspects.filter((item) => item.checked);
  const locked = busy || outlineBusy;
  const name = topic.trim();

  async function loadOutline() {
    if (locked || outlineAbort.current || name === '') return;
    setOutlineBusy(true);
    setOutlineError('');
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    outlineAbort.current = controller;
    try {
      const result = await rpc('outline', { topic: name, level }, controller ? controller.signal : undefined);
      const list = result && Array.isArray(result.aspects) ? result.aspects : [];
      if (list.length === 0) throw new Error(tr('outlineEmpty', '模型没有给出学习方面，请重试'));
      const stamp = Date.now();
      setAspects(list.map((item, index) => ({
        id: 'a' + index + '-' + stamp,
        title: String(item.title || ''),
        summary: String(item.summary || ''),
        keyQuestions: Array.isArray(item.keyQuestions) ? item.keyQuestions : [],
        checked: true,
      })));
      setStep('aspects');
    } catch (err) {
      if (controller && controller.signal.aborted) return;
      setOutlineError(String((err && err.message) || err));
    } finally {
      outlineAbort.current = null;
      setOutlineBusy(false);
    }
  }

  function close() {
    if (outlineAbort.current) outlineAbort.current.abort();
    props.onCancel();
  }

  function toggle(id) {
    setAspects((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }

  function setAll(checked) {
    setAspects((prev) => prev.map((item) => ({ ...item, checked })));
  }

  function addCustom() {
    const title = custom.trim();
    if (title === '' || aspects.length >= 12) return;
    setAspects((prev) => prev.concat([{
      id: 'c' + Date.now(),
      title: title.slice(0, 40),
      summary: '',
      keyQuestions: [],
      checked: true,
    }]));
    setCustom('');
  }

  function submit() {
    if (locked) return;
    if (step === 'topic') {
      loadOutline();
      return;
    }
    if (selected.length === 0) {
      setOutlineError(tr('pickAspect', '至少选择一个学习方面'));
      return;
    }
    setOutlineError('');
    props.onSubmit({
      topic: name,
      level,
      material: '',
      aspects: selected.map((item) => ({ title: item.title, summary: item.summary })),
    });
  }

  function startWithMaterial() {
    if (locked || name === '' || material.trim() === '') return;
    props.onSubmit({ topic: name, level, material: material.trim() });
  }

  const topicStep = h('div', null,
    h('div', { className: 'ls-field' },
      h('label', null, tr('topic', '概念')),
      h('input', {
        className: 'ls-input',
        autoFocus: true,
        value: topic,
        placeholder: tr('topicPlaceholder', '例如：机会成本、注意力机制、复利'),
        disabled: locked,
        onChange: (event) => setTopic(event.target.value),
        onKeyDown: (event) => { if (event.key === 'Enter' && !event.metaKey) submit(); },
      }),
    ),
    h('div', { className: 'ls-field' },
      h('label', null, tr('level', '讲解深度')),
      h('div', { className: 'ls-tabs', style: { display: 'inline-flex' } },
        ['intro', 'standard', 'deep'].map((item) => h('button', {
          key: item,
          type: 'button',
          className: 'ls-tab',
          'data-active': String(level === item),
          disabled: locked,
          onClick: () => setLevel(item),
        }, tr('level' + item.charAt(0).toUpperCase() + item.slice(1), item))),
      ),
    ),
    h('div', { className: 'ls-hintline', style: { margin: '-2px 0 14px' } },
      tr('outlineIntro', '只要输入概念名称。下一步 AI 会先列出这个概念的学习方面，你勾选想深入的部分，再生成系统的知识框架。')),
    h('button', {
      type: 'button',
      className: 'ls-btn ls-btn-ghost',
      style: { padding: '2px 6px', fontSize: 12.5 },
      disabled: locked,
      onClick: () => setShowMaterial((value) => !value),
    }, showMaterial ? tr('hideMaterial', '收起材料入口') : tr('useMaterial', '已有现成材料？直接粘贴')),
    showMaterial ? h('div', { className: 'ls-field', style: { marginTop: 10 } },
      h('textarea', {
        className: 'ls-textarea',
        rows: 4,
        value: material,
        placeholder: tr('materialPlaceholder', '把一段讲稿、书摘或论文段落粘贴到这里…'),
        onChange: (event) => setMaterial(event.target.value),
        disabled: locked,
      }),
      h('div', { className: 'ls-hintline', style: { marginTop: 4 } },
        tr('materialHint', '粘贴一段现成文字，就直接在你的材料上划线提问，不再让 AI 重写。')),
    ) : null,
    outlineBusy ? h('div', { className: 'ls-generating', style: { padding: '26px 20px' } },
      h('div', { className: 'ls-spinner' }),
      h('div', null, tr('outlineLoading', '正在生成学习方面…')),
      h('div', { className: 'ls-hintline' }, tr('outlineLoadingHint', '先看看这个概念可以拆成哪几个方面，再决定学哪些')),
    ) : null,
  );

  const aspectStep = h('div', null,
    h('div', { className: 'ls-hintline', style: { margin: '-6px 0 12px' } },
      tr('outlineConfirm', '概念「' + name + '」可以拆成这些方面。取消勾选你不需要的，也可以补充自己的问题。')),
    h('div', { className: 'ls-aspects' },
      aspects.map((item) => h('label', {
        key: item.id,
        className: 'ls-aspect',
        'data-checked': String(item.checked),
      },
        h('input', {
          type: 'checkbox',
          checked: item.checked,
          disabled: locked,
          onChange: () => toggle(item.id),
        }),
        h('div', { className: 'ls-aspect-body' },
          h('div', { className: 'ls-aspect-title' }, item.title),
          item.summary ? h('div', { className: 'ls-aspect-summary' }, item.summary) : null,
          item.keyQuestions.length > 0
            ? h('div', { className: 'ls-aspect-qs' }, '会回答：' + item.keyQuestions.join(' · '))
            : null,
        ),
      )),
    ),
    h('div', { className: 'ls-outline-tools' },
      h('button', { type: 'button', className: 'ls-btn ls-btn-ghost', disabled: locked, onClick: () => setAll(true) }, tr('selectAll', '全选')),
      h('button', { type: 'button', className: 'ls-btn ls-btn-ghost', disabled: locked, onClick: () => setAll(false) }, tr('selectNone', '全不选')),
      h('button', {
        type: 'button',
        className: 'ls-btn ls-btn-ghost',
        disabled: locked,
        onClick: () => { setStep('topic'); loadOutline(); },
      }, tr('regenerateOutline', '重新生成')),
      h('div', { className: 'ls-outline-count' }, tr('selectedCount', '已选 ' + selected.length + ' 项')),
    ),
    h('div', { className: 'ls-outline-add' },
      h('input', {
        className: 'ls-input',
        value: custom,
        placeholder: tr('addAspectPlaceholder', '还想了解别的？写一个方面，例如「和其他方案的成本对比」'),
        disabled: locked,
        onChange: (event) => setCustom(event.target.value),
        onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); addCustom(); } },
      }),
      h('button', { type: 'button', className: 'ls-btn ls-btn-ghost', disabled: locked || custom.trim() === '', onClick: addCustom }, tr('addAspect', '添加')),
    ),
    h('div', { className: 'ls-hintline', style: { marginTop: 8 } },
      tr('outlineAspectsHint', '生成时会按你勾选的方面逐节展开；选得越聚焦，框架越不会泛泛而谈。')),
  );

  return h('div', { className: 'ls-dialog-mask', onMouseDown: (event) => { if (event.target === event.currentTarget && !locked) close(); } },
    h('div', { className: 'ls-dialog' },
      h('h2', null, step === 'topic' ? tr('newTopic', '新建学习') : tr('outlineTitle', '确认学习范围')),
      step === 'topic' ? topicStep : aspectStep,
      error ? h('div', { className: 'ls-err' }, error) : null,
      outlineError ? h('div', { className: 'ls-err' }, outlineError) : null,
      busy ? h('div', { className: 'ls-generating' },
        h('div', { className: 'ls-spinner' }),
        h('div', null, tr('generating', '正在写导读')),
        h('div', { className: 'ls-hintline' }, hint || ''),
      ) : null,
      h('div', { className: 'ls-dialog-foot' },
        step === 'aspects' ? h('button', {
          className: 'ls-btn',
          type: 'button',
          disabled: busy,
          onClick: () => setStep('topic'),
        }, tr('back', '上一步')) : null,
        step === 'topic' && showMaterial && material.trim() !== '' ? h('button', {
          className: 'ls-btn',
          type: 'button',
          disabled: locked,
          onClick: startWithMaterial,
        }, tr('startWithMaterial', '用这份材料开始')) : null,
        h('button', { className: 'ls-btn', type: 'button', onClick: close }, busy ? tr('cancelGeneration', '停止等待') : tr('cancel', '取消')),
        h('button', {
          className: 'ls-btn ls-btn-primary',
          type: 'button',
          disabled: locked || name === '' || (step === 'aspects' && selected.length === 0),
          onClick: submit,
        }, step === 'topic'
          ? (outlineBusy ? tr('outlineLoadingShort', '正在生成模板…') : tr('nextStep', '下一步：选择范围'))
          : (busy ? tr('generating', '正在写导读') : tr('generateFramework', '生成系统框架（' + selected.length + ' 维）'))),
      ),
    ),
  );
}

/** 极简 Markdown 渲染：模型回答里常见的段落、行内代码与加粗足够用，避免引入依赖。 */
function renderAnswer(text) {
  if (!text) return null;
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const nodes = [];
  let list = null;
  function inline(line, key) {
    const parts = [];
    const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(line)) !== null) {
      if (match.index > last) parts.push(line.slice(last, match.index));
      const token = match[0];
      if (token.startsWith('**')) parts.push(h('strong', { key: 'b' + match.index }, token.slice(2, -2)));
      else parts.push(h('code', { key: 'c' + match.index, style: { background: 'var(--dsw-alias-bg-layer-2,#f5f6f7)', borderRadius: 4, padding: '1px 4px' } }, token.slice(1, -1)));
      last = match.index + token.length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return h('p', { key }, parts.length > 0 ? parts : line);
  }
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === '') return;
    const bullet = trimmed.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      if (!list) {
        list = h('ul', { key: 'ul' + index, style: { margin: '0 0 8px', paddingLeft: 18 } }, []);
        nodes.push(list);
      }
      list.props.children.push(h('li', { key: 'li' + index }, bullet[1]));
      return;
    }
    list = null;
    const heading = trimmed.match(/^#{1,4}\s+(.*)$/);
    if (heading) {
      nodes.push(h('div', { key: 'hd' + index, style: { fontWeight: 600, margin: '6px 0' } }, heading[1]));
      return;
    }
    nodes.push(inline(line, 'p' + index));
  });
  return nodes;
}

function safeSlot(ctx, slotName, register, label) {
  try {
    // 冷启动时 Slot 声明可能还没建立（ui-sidebar 尚未挂载），直接 register 会抛错并被吞掉，
    // 表现就是「重启后图标消失、重新开关插件才出现」。inject 会等声明出现后再执行注册。
    if (ctx.slots && typeof ctx.slots.inject === 'function') {
      ctx.effect(() => ctx.slots.inject(slotName, () => register()), PACKAGE + ': ' + label);
    } else {
      ctx.effect(() => register(), PACKAGE + ': ' + label);
    }
  } catch (error) {
    console.warn('[learning-studio] 注册 ' + label + ' 失败', error);
  }
}

/** 注入样式并返回清理函数：插件重载时旧样式必须先移除，否则会留下重复规则。 */
function installStyles() {
  if (typeof document === 'undefined') return function () {};
  const previous = document.querySelectorAll('style[data-dsh-learning-studio="1"]');
  for (const node of previous) node.remove();
  const style = document.createElement('style');
  style.setAttribute('data-dsh-learning-studio', '1');
  style.textContent = CSS;
  document.head.appendChild(style);
  return function () {
    style.remove();
  };
}

function apply(ctx) {
  try {
    ctx.effect(() => installStyles(), PACKAGE + ': styles');
  } catch (error) {
    console.warn('[learning-studio] 注入样式失败', error);
    try { installStyles(); } catch { /* 样式失败不影响功能 */ }
  }
  try {
    ctx.effect(() => ctx.locale.register(NS, DICT), PACKAGE + ': dictionaries');
  } catch (error) {
    console.warn('[learning-studio] 注册文案失败', error);
  }
  const t = (key) => {
    try {
      return ctx.locale.bind(NS)(key);
    } catch {
      return key;
    }
  };

  const injectApi = () => ({ t });

  safeSlot(ctx, 'sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 46,
    label: () => t('nav'),
    locale: NS,
    registrant: PACKAGE,
    inject: injectApi,
  }, function PanelIcon() {
    return h('span', { style: { display: 'inline-grid', placeItems: 'center' } }, h(Icon, { size: 20 }));
  }), 'sidebar icon');

  safeSlot(ctx, 'main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
    registrant: PACKAGE,
    inject: injectApi,
  }, StudioPanel), 'main panel');
}

// 仅测试用：Node 冒烟测试需要直接渲染新建向导，浏览器里不会走这个分支。
if (typeof process !== 'undefined' && process.env && process.env.DSH_LS_TEST === '1') {
  exports.__test = { NewTopicDialog };
}

exports.name = 'dsh-learning-studio-client';
exports.inject = ['slots', 'locale'];
exports.apply = apply;
return module.exports;
} });
