import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { TylerFooter, TylerHeader } from "@/components/TylerSiteChrome";
import {
  getSanityCategories,
  getSanityNavigation,
  getSanityPublishedPostCount,
  getSanityPublishedPosts,
  getSanitySiteSettings,
} from "@/lib/sanity-content";
import { getTutorialCover } from "@/lib/tutorial-covers";
import { FEATURED_TUTORIALS } from "@/lib/featured-tutorials";

// Cached like the homepage and refreshed by the Sanity revalidation webhook.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSanitySiteSettings();
  return {
    title: `全部教程 | ${settings.siteName}`,
    description: "浏览全部教程，按分类筛选，快速找到你需要的办公软件与技能指南。",
    alternates: { canonical: "/tutorials" },
  };
}

type TutorialsIndexPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    category?: string;
  }>;
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function TutorialsIndexPage({ searchParams }: TutorialsIndexPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [settings, navigation, categories] = await Promise.all([
    getSanitySiteSettings(),
    getSanityNavigation(),
    getSanityCategories(),
  ]);
  const pageSize = settings.postsPerPage || 16;

  const [sanityPosts, total] = await Promise.all([
    getSanityPublishedPosts({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      search: query,
      category,
    }),
    getSanityPublishedPostCount({ search: query, category }),
  ]);

  const showFeatured = !query && !category && page === 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (category) search.set("category", category);
    if (target > 1) search.set("page", String(target));
    const suffix = search.toString();
    return suffix ? `/tutorials?${suffix}` : "/tutorials";
  };

  return (
    <div className="site-home min-h-screen text-[#16233f]">
      <TylerHeader query={query} navigation={navigation} settings={settings} />

      <section className="tyler-shell mt-10 sm:mt-12">
        <span className="site-hero-tag mb-4">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#e8a33d]" />
          TUTORIALS
        </span>
        <h1 className="tyler-wordmark text-3xl font-semibold tracking-[-0.03em] text-[#16233f] sm:text-4xl">
          全部教程
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66717b]">
          浏览全部教程内容，按分类筛选，或使用搜索快速定位你需要的操作指南。
        </p>

        <form action="/tutorials" method="get" className="mt-6 max-w-md">
          <input
            className="h-11 w-full rounded-full border border-[#e1e4ec] bg-white px-5 text-sm outline-none focus:border-[#16233f]"
            defaultValue={query}
            name="q"
            placeholder="搜索教程..."
            type="search"
          />
        </form>

        {categories.length ? (
          <nav aria-label="教程分类" className="site-tab-row mt-6 flex flex-wrap gap-1">
            <Link
              className={`site-tab ${!category ? "site-tab-active" : ""}`}
              href={query ? `/tutorials?q=${encodeURIComponent(query)}` : "/tutorials"}
            >
              全部
            </Link>
            {categories.map((item) => (
              <Link
                className={`site-tab ${category === item.slug ? "site-tab-active" : ""}`}
                href={`/tutorials?category=${encodeURIComponent(item.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                key={item.id}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>

      <main className="tyler-shell py-10 sm:py-12">
        {showFeatured ? (
          <div className="mb-10">
            <p className="mb-4 text-xs tracking-[0.22em] text-[#6c7783]">精选教程</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {FEATURED_TUTORIALS.map((tutorial) => (
                <Link
                  className="tyler-tutorial-card group flex overflow-hidden border border-[#e3ddd3] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#cfc6b9] hover:shadow-[0_16px_34px_rgba(24,37,51,0.08)]"
                  href={tutorial.href}
                  key={tutorial.id}
                >
                  <div className="relative w-36 flex-shrink-0 overflow-hidden border-r border-[#e8e2d8] sm:w-44">
                    {tutorial.cover_image ? (
                      <Image
                        alt={tutorial.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
                        fill
                        sizes="180px"
                        src={tutorial.cover_image}
                      />
                    ) : (
                      <div className="h-full w-full bg-[#efe9df]" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
                    <span className="mb-1 text-[11px] font-medium text-[#1f52ad]">{tutorial.category_name}</span>
                    <h3 className="line-clamp-1 text-[16px] font-semibold leading-6 text-[#25313d] transition group-hover:text-[#1f52ad]">
                      {tutorial.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#66717b]">{tutorial.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mb-4 text-xs tracking-[0.22em] text-[#6c7783]">
          {query ? `“${query}”的搜索结果` : "全部内容"}
        </p>

        {sanityPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sanityPosts.map((post) => {
              const coverImage = getTutorialCover(post.slug, post.cover_image || "");
              return (
                <Link
                  className="tyler-tutorial-card group flex flex-col overflow-hidden border border-[#e3ddd3] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#cfc6b9] hover:shadow-[0_16px_34px_rgba(24,37,51,0.08)]"
                  href={`/tutorials/${post.slug}`}
                  key={post.id}
                >
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-[#e8e2d8] bg-[#efe9df]">
                    {coverImage ? (
                      <Image
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        src={coverImage}
                      />
                    ) : null}
                    {post.category_name ? (
                      <span className="absolute bottom-3 left-3 max-w-[85%] truncate rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#1f52ad] shadow-sm backdrop-blur-sm">
                        {post.category_name}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col px-4 py-3.5 sm:px-5 sm:py-4">
                    <h3 className="line-clamp-2 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-[#25313d] transition group-hover:text-[#1f52ad]" title={post.title}>
                      {post.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-[#8a9095]">
                      <time>{formatDate(post.published_at)}</time>
                      <span>{post.reading_time || 10} 分钟</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="border border-[#e3ddd3] bg-white px-6 py-16 text-center text-[#66717b]">
            没有找到匹配的教程。
          </div>
        )}

        {totalPages > 1 ? (
          <nav aria-label="教程分页" className="mt-12 flex justify-center gap-2">
            <Link
              aria-disabled={page <= 1}
              className={`border px-4 py-2 text-sm ${page <= 1 ? "pointer-events-none border-[#e1e4ec] text-[#a7acb8]" : "border-[#e1e4ec] bg-white hover:border-[#16233f]"}`}
              href={pageHref(Math.max(1, page - 1))}
            >
              ← 上一页
            </Link>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <Link
                aria-current={number === page ? "page" : undefined}
                className={`min-w-10 border px-3 py-2 text-center text-sm ${number === page ? "border-[#e8a33d] bg-[#e8a33d] text-[#16233f]" : "border-[#e1e4ec] bg-white hover:border-[#16233f]"}`}
                href={pageHref(number)}
                key={number}
              >
                {number}
              </Link>
            ))}
            <Link
              aria-disabled={page >= totalPages}
              className={`border px-4 py-2 text-sm ${page >= totalPages ? "pointer-events-none border-[#e1e4ec] text-[#a7acb8]" : "border-[#e1e4ec] bg-white hover:border-[#16233f]"}`}
              href={pageHref(Math.min(totalPages, page + 1))}
            >
              下一页 →
            </Link>
          </nav>
        ) : null}
      </main>

      {settings.showFooter ? <TylerFooter settings={settings} /> : null}
    </div>
  );
}
