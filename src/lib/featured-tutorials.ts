import { getTutorialCover } from "./tutorial-covers";

// These two tutorials are hand-authored static pages (not Sanity posts), so
// they are pinned into the homepage and the tutorials index as lightweight
// post-shaped records. Keeping them here avoids duplicating the same literals
// across every page that needs to list "all tutorials".
export type FeaturedTutorial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_name: string;
  published_at: string;
  reading_time: number;
  cover_image: string;
  href: string;
};

export const FALLBACK_TUTORIAL: FeaturedTutorial = {
  id: "legacy-word-tutorial",
  title: "Word 办公软件攻略解析",
  slug: "word-software-complete-guide",
  excerpt: "从基础操作到高效排版，系统掌握 Word 的核心功能与实用技巧。",
  category_name: "微软办公软件",
  published_at: "2026-08-06T00:00:00.000Z",
  reading_time: 90,
  cover_image: "",
  href: "/word-tutorial/",
};

export const EXCEL_TUTORIAL: FeaturedTutorial = {
  id: "excel-tutorial",
  title: "Excel 从入门到精通",
  slug: "excel",
  excerpt: "从基础操作、函数公式到数据透视表、Power Query 与 VBA 的完整实战教程。",
  category_name: "微软办公软件",
  published_at: "2026-09-11T00:00:00.000Z",
  reading_time: 120,
  cover_image: getTutorialCover("excel"),
  href: "/tutorials/excel",
};

export const FEATURED_TUTORIALS: FeaturedTutorial[] = [EXCEL_TUTORIAL, FALLBACK_TUTORIAL];
