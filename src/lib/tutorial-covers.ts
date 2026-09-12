const TUTORIAL_COVERS: Record<string, string> = {
  excel: "/tutorial-covers/excel-course-cover.webp",
  "word-software-complete-guide": "/tutorial-covers/word-course-cover.webp",
};

export function getTutorialCover(slug: string, fallback = "") {
  return TUTORIAL_COVERS[slug] || fallback;
}
