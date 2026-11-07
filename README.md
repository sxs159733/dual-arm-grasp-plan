# 双臂抓取 · 24 周学习计划

从单臂视觉抓取闭环到双臂协同：24 周、168 天的每日任务、验收门与学习资料。纯静态站点，无构建步骤。

在线站点（GitHub Pages）：https://sxs159733.github.io/dual-arm-grasp-plan/

仓库为公开仓库，任何有写权限的协作者都可以直接 clone、修改、推送；推送 `main` 后由 GitHub Actions 自动发布。

## 目录结构

```
index.html              页面结构（周视图 / 日任务 / 验收门 / 进度）
app.js                  计划数据 + 渲染与交互（任务清单内嵌在此文件）
styles.css              全站样式与设计变量
```

## 本地预览

```bash
python -m http.server 8768
```

然后访问 http://127.0.0.1:8768 。

## 改内容

计划条目、每日任务、验收门与资料链接都在 `app.js` 的数据区；样式走 `styles.css` 顶部的 `:root` CSS 变量。学习进度保存在浏览器 `localStorage`，不随仓库同步，换设备或清缓存会丢失。

## 协作流程

1. 仓库持有者在 GitHub 的 **Settings → Collaborators** 里邀请成员（对方用自己的 GitHub 账号接受即可，不需要 Qoder 账号）。
2. 从 `main` 拉最新代码，改动按周或按模块分开提交，减少冲突。
3. 提 PR 或直接推 `main` 都可以，推上去会自动重新部署。

### 用 AI Agent 协作

仓库是纯静态 HTML/CSS/JS，没有构建步骤和私有依赖，Codex、WorkBuddy、Qoder、Copilot 等 Agent 直接 clone 就能改。多人同时调整计划时，先拉最新再提交。

## 部署

仓库根目录就是可直接部署的静态站点，由 `.github/workflows/pages.yml` 在每次推送 `main` 后自动发布到 GitHub Pages，约 1–2 分钟上线。
