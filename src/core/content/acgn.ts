import { getCollection, type CollectionEntry } from "astro:content";

export type AcgnEntry = CollectionEntry<"acgn">;

export const ACGN_CATEGORIES = ["animation", "comic", "game", "novel"] as const;
export type AcgnCategory = (typeof ACGN_CATEGORIES)[number];

export const acgnCategoryLabel: Record<AcgnCategory, string> = {
  animation: "动画",
  comic: "漫画",
  game: "游戏",
  novel: "小说"
};

export const acgnCategoryEnLabel: Record<AcgnCategory, string> = {
  animation: "Animation",
  comic: "Comic",
  game: "Game",
  novel: "Novel"
};

export async function getPublishedAcgn() {
  const entries = await getCollection("acgn", ({ data }) => !data.draft);
  return entries.sort((a, b) => {
    const dateA = (a.data.updatedDate ?? a.data.pubDate).valueOf();
    const dateB = (b.data.updatedDate ?? b.data.pubDate).valueOf();
    return dateB - dateA;
  });
}

export async function getPublishedAcgnPaths() {
  const entries = await getPublishedAcgn();
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry }
  }));
}
