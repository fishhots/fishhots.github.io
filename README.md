# Fish_Hot Space

---

## 文章的 md 格式

文章放在 `src/content/` 下，分两个分区，各自有不同的 `category` 取值：

| 分区 | 目录 | category 取值 |
| --- | --- | --- |
| BLOG | `src/content/blog/` | `tech` / `anime` / `life`（默认 `tech`） |
| ACGN | `src/content/acgn/<分类>/` | `animation` / `comic` / `game` / `novel`（**必填**） |

### BLOG 文章模板

```md
---
title: "文章标题"
description: "一句话摘要"
pubDate: 2026-10-16
cover: "/blog/tech/cover-xxx.webp"   # 可选
tags: ["Astro", "Dev"]              # 可选，缺省为空数组
category: "tech"                    # tech / anime / life
draft: false                        # true 时不进入正式列表
---

正文内容（支持 Markdown / GFM / 代码高亮 / 中文检索）。
```

### ACGN 文章模板

```md
---
title: "作品名"
description: "一句话简介"
pubDate: 2026-10-16
cover: "/acgn/animation/cover-xxx.webp"   # 可选
tags: ["番剧", "推荐"]                    # 可选
category: "animation"                     # animation / comic / game / novel（必填）
draft: false
---

正文内容（支持 Markdown / GFM / 代码高亮 / 中文检索）。
```

### 字段说明

- `title` / `description`：必填，字符串。
- `pubDate`：必填，日期（如 `2026-10-16`）。
- `category`：BLOG 默认 `tech`；ACGN **必填**。
- `cover`：可选，封面图片路径，写成站点绝对路径 `/<分区>/<分类>/xxx.webp`。
- `tags`：可选，字符串数组。
- `draft`：可选，默认 `false`；`true` 不进入正式列表。
- 可选 SEO 字段：`seoTitle`、`seoDescription`、`seoKeywords`（数组）、`updatedDate`。

文件命名建议：`YYYY-MM-DD-<英文 slug>.md`（ACGN 放在对应分类子目录下）。

---

## 目录说明

```text
blog/
├─ src/
│  ├─ content/
│  │  ├─ blog/                  BLOG 文章 Markdown / MDX
│  │  └─ acgn/                  ACGN 文章，按分类分子目录
│  ├─ core/                     主题注册、路由与共享内容能力
│  ├─ themes/
│  │  ├─ kisara/                Kisara 主题实现
│  │  ├─ fuyukawa-kagari/       Fuyukawa Kagari 主题（默认主题）
│  │  └─ blank/                 极简主题
│  ├─ lib/site.ts               站点名称、导航与通用配置
│  └─ content.config.ts         文章数据 schema（zod）
├─ public/
│  ├─ blog/<分类>/               BLOG 文章的封面与插图
│  └─ acgn/<分类>/              ACGN 文章的封面与插图
├─ scripts/                     本地脚本（含 new-post.mjs 上传脚本）
├─ tests/                       静态回归测试
└─ .github/workflows/deploy.yml GitHub Pages 部署流程

auto/                           博客写作器（原生桌面弹窗，独立代码，不修改博客本体）
├─ blog_writer.py               主程序（Tkinter 桌面弹窗）
├─ launch.bat                   Windows 双击启动器（带错误提示，排错用）
├─ launch.vbs                   双击无黑框启动器（推荐日常使用）
└─ README.md                    auto 使用说明
```

构建与本地预览：

```bash
npm install
npm run dev      # 本地开发服务器
npm run build    # 生成 dist/
npm run preview  # 预览构建产物
```

GitHub Pages 工作流位于 `.github/workflows/deploy.yml`：推送到 `main` 或手动触发后，工作流会用 Node.js 执行 `npm ci`、`npm run build`，并部署 `dist/`。

---

## auto 写作器使用说明

`auto/` 是一个**原生桌面弹窗**（Tkinter 实现，**不是网页**），用来写博客并一键上传到 GitHub。
**本工具完全独立于原博客代码，不会修改博客本身。**

### 怎么用

1. **推荐双击 `auto/launch.vbs`**（完全不弹终端黑框，直接弹窗）。
   - 启动器优先用 `pythonw.exe`（窗口态 Python，本身不产生控制台），并以隐藏方式运行，所以**不会**出现黑框。
   - 若你的 Anaconda 装在别的路径，请用记事本打开 `launch.vbs`，把里面的 python 路径（如 `E:\anaconda\pythonw.exe`）改成你机器上的实际路径。
   - **不推荐** `launch.bat`：`.bat` 双击时 Windows 必定开一个可见的 cmd 终端窗口（批处理固有行为，无法关掉），只适合排错。
   - 若 vbs 双击后没反应，在 `auto/` 目录里按住 Shift 右键「在此处打开终端」，运行 `python blog_writer.py` 看具体报错。
2. 在弹窗里填写：
   - **标题**（必填）
   - **分区**：`BLOG` 或 `ACGN`
   - **分类**：BLOG → `tech / anime / life`；ACGN → `animation / comic / game / novel`（ACGN 必选）
   - **封面**：点「选择封面图」，图片复制到 `public/<分区>/<分类>/` 下
   - **标签**：中英文逗号 / 分号 / 顿号分隔均可，如 `番剧，推荐` 或 `番剧, 推荐`
   - **日期**：默认今天
   - **草稿**：勾选后 `draft: true`，不进入列表
   - **正文**：Markdown 自由书写；工具栏可「插入图片 / 加粗 / 斜体 / 链接 / 标题」
3. 点 **保存草稿（本地）** → 只生成 `.md`，不碰 git。
4. 点 **生成并上传 GitHub** → 把 `.md` 与图片放到正确目录，`git add / commit`，确认后再 `git push`。

### 文件会落到哪里

| 分区 | .md 位置 | 图片位置 |
|------|----------|----------|
| BLOG | `src/content/blog/YYYY-MM-DD-<slug>.md` | `public/blog/<分类>/` |
| ACGN | `src/content/acgn/<分类>/YYYY-MM-DD-<slug>.md` | `public/acgn/<分类>/` |

生成的 `.md` 严格匹配 `src/content.config.ts` 里的 zod schema，例如：

```markdown
---
title: "我的新文章"
description: "一句话简介"
pubDate: 2026-10-16
cover: "/acgn/animation/cover-xxx.webp"
category: animation
tags: ["番剧", "推荐"]
draft: false
---
# 正文标题
正文用 Markdown 写……
![配图](/acgn/animation/pic-xxx.webp)
```

### 前置条件

- **Python 3**（Anaconda / Miniconda 自带 tkinter；官方 Python 也行，只要装了 `tk`）。
- **git** 已安装并在 PATH 中；且已配置好能推送到 `fishhots/fishhots.github.io` 的远程。
- 想看封面缩略图预览，装个 Pillow：`pip install pillow`（不装也能用，只是不显示缩略图）。

### 关于「自动上传到 GitHub」

- 推送**只在你点击「生成并上传 GitHub」并二次确认后**发生——不是偷偷上传。
- 若访问 `github.com` 需要代理 / SSH，请先在自己环境里配好；脚本调用的是你本机的 git。
- 推送失败会在弹窗里显示 git 报错（常见原因：需代理、或远程有更新需先 `git pull`）。
