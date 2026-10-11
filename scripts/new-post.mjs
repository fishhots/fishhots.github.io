#!/usr/bin/env node
// scripts/new-post.mjs
// ---------------------------------------------------------------------------
// 自动写文档 + 上传 的「初步实现」。
// 设计成两种用法，方便以后接进其他软件：
//   1) 作为模块被 import：
//        import { createPost, publish } from "./scripts/new-post.mjs";
//        const p = await createPost({ type: "acgn", category: "animation", title: "..." });
//        await publish({ message: "add", push: true });
//   2) 作为命令行 CLI 直接跑：
//        node scripts/new-post.mjs --type acgn --category animation --title "我的动画" --push
//
// 注意：本脚本只是脚手架，不会偷偷上传。--push 需要你显式传才会 git push。
// 仓库根目录通过脚本位置自动推算（scripts/ 的上一级）。
// ---------------------------------------------------------------------------

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const BLOG_CATEGORIES = ["tech", "anime", "life"];
const ACGN_CATEGORIES = ["animation", "comic", "game", "novel"];

function slugify(title) {
  const base = String(title)
    .toLowerCase()
    .trim()
    .replace(/[^\w一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `post-${Date.now()}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function esc(value) {
  return String(value).replace(/"/g, '\\"');
}

/**
 * 创建一篇新文档（markdown），返回写入的文件路径。
 * @param {object} options
 * @param {"blog"|"acgn"} [options.type="blog"]
 * @param {string} options.title
 * @param {string} [options.description]
 * @param {string} [options.category] blog: tech/anime/life；acgn: animation/comic/game/novel
 * @param {string[]} [options.tags]
 * @param {string} [options.cover] 封面图路径，如 /acgn/animation/foo.webp
 * @param {boolean} [options.draft]
 * @param {string} [options.date] YYYY-MM-DD
 * @param {string} [options.body] 正文（markdown）
 * @param {boolean} [options.overwrite] 同名文件是否覆盖
 */
export async function createPost(options = {}) {
  const {
    type = "blog",
    title = "未命名文章",
    description = "",
    category,
    tags = [],
    cover = "",
    draft = false,
    date,
    body = "# 在这里写正文\n\n",
    overwrite = false
  } = options;

  if (type !== "blog" && type !== "acgn") {
    throw new Error(`type 必须是 blog 或 acgn，收到: ${type}`);
  }

  let cat = category;
  if (type === "blog") {
    if (!cat || !BLOG_CATEGORIES.includes(cat)) cat = "tech";
  } else {
    if (!cat || !ACGN_CATEGORIES.includes(cat)) {
      throw new Error(`acgn 的 category 必须是 ${ACGN_CATEGORIES.join(" / ")}`);
    }
  }

  const pubDate = date || todayISO();
  const slug = slugify(title);
  const fileName = `${pubDate}-${slug}.md`;
  const dir =
    type === "blog"
      ? resolve(REPO_ROOT, "src/content/blog")
      : resolve(REPO_ROOT, "src/content/acgn", cat);
  const filePath = resolve(dir, fileName);

  if (existsSync(filePath) && !overwrite) {
    throw new Error(`文件已存在：${filePath}（可用 overwrite: true 覆盖）`);
  }

  const tagLine =
    Array.isArray(tags) && tags.length
      ? `\ntags: [${tags.map((t) => `"${esc(t)}"`).join(", ")}]`
      : "\ntags: []";

  const lines = [
    "---",
    `title: "${esc(title)}"`,
    `description: "${esc(description)}"`,
    `pubDate: ${pubDate}`,
    cover ? `cover: "${esc(cover)}"` : "",
    `category: ${cat}`,
    tagLine,
    `draft: ${draft}`,
    "---",
    ""
  ].filter((l) => l !== "");

  const content = `${lines.join("\n")}\n${body}\n`;
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content, "utf8");
  return filePath;
}

/**
 * 提交（并可选择推送）到 git。
 * @param {object} options
 * @param {string} [options.message]
 * @param {boolean} [options.push] 是否 git push（默认 false）
 * @param {string[]} [options.files] 要 add 的文件列表；缺省为 ["-A"]
 */
export async function publish({ message, push = false, files } = {}) {
  const targets = files && files.length ? files : ["-A"];
  const commitMsg =
    message || `docs: add new post via script (${new Date().toISOString().slice(0, 19)})`;
  await execFileP("git", ["add", ...targets], { cwd: REPO_ROOT });
  await execFileP("git", ["commit", "-m", commitMsg], { cwd: REPO_ROOT });
  if (push) {
    await execFileP("git", ["push"], { cwd: REPO_ROOT });
  }
  return { committed: true, pushed: Boolean(push) };
}

// ----------------------------- CLI 入口 -----------------------------
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`用法:
  node scripts/new-post.mjs --type acgn --category animation --title "我的动画" [--desc "简介"] [--tags "番剧,推荐"] [--cover "/acgn/animation/x.webp"] [--push]
  node scripts/new-post.mjs --type blog --category tech --title "Hello"

选项:
  --type        blog | acgn（默认 blog）
  --category    blog: tech/anime/life；acgn: animation/comic/game/novel
  --title       标题（必填）
  --desc        简介
  --tags        逗号分隔的标签
  --cover       封面图路径，例如 /acgn/animation/foo.webp
  --date        YYYY-MM-DD（默认今天）
  --draft       置为草稿（不会进入列表）
  --body-file   从文件读取正文（否则用占位正文）
  --push        创建并提交后自动 git push
  --no-commit   只创建文件，不 git add/commit
  --overwrite   覆盖已存在的同名文件`);
    return;
  }

  const get = (k, d) => {
    const i = args.indexOf(k);
    return i >= 0 ? args[i + 1] : d;
  };
  const has = (k) => args.includes(k);

  const type = get("--type", "blog");
  const category = get("--category", type === "acgn" ? undefined : "tech");
  const title = get("--title", "未命名文章");
  const description = get("--desc", "");
  const tags = (get("--tags", "") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const cover = get("--cover", "");
  const date = get("--date");
  const draft = has("--draft");
  const overwrite = has("--overwrite");
  const push = has("--push");
  const noCommit = has("--no-commit");

  let body = "# 在这里写正文\n\n";
  const bodyFile = get("--body-file");
  if (bodyFile) body = await readFile(resolve(REPO_ROOT, bodyFile), "utf8");

  const filePath = await createPost({
    type,
    title,
    description,
    category,
    tags,
    cover,
    date,
    draft,
    body,
    overwrite
  });
  console.log(`已创建: ${filePath}`);

  if (!noCommit) {
    const res = await publish({
      message: `docs: add ${type}/${title}`,
      push,
      files: [filePath]
    });
    console.log(res.pushed ? "已提交并推送。" : "已提交（未推送，需要时加 --push）。");
  }
}

// 仅在「直接运行此文件」时执行 CLI；被 import 时不自动跑。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
