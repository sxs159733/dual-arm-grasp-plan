# AGENTS.md

本仓库是纯静态站点（HTML/CSS/JS），**没有构建步骤**，仓库根目录就是发布目录，入口为 `index.html`。

## 改动约定

- 计划数据（周次、每日任务、验收门、资料链接）在 `app.js` 的数据区；渲染与交互也在 `app.js`，样式在 `styles.css`。
- 不要删除或重排已有任务编号，新增内容按周追加。
- 不要修改 `.github/workflows/pages.yml` 和 README 里的在线地址。
- 学习进度存在浏览器 `localStorage`，不随仓库同步；不要试图把进度写入仓库。
- 一次提交只做一件事，保持现有中文文案风格。

## 本地验证

```bash
python -m http.server 8080
# 打开 http://127.0.0.1:8080 ，确认周视图、日任务与验收门正常
```

## 发布

推送到 `main` 后，GitHub Actions 自动发布到 GitHub Pages，约 1–2 分钟生效。
