import Link from "next/link";
import Image from "next/image";

import { TylerFooter, TylerHeader } from "@/components/TylerSiteChrome";
import {
  MICROSOFT_CATEGORY_SLUG,
  getSanityCategories,
  getSanityNavigation,
  getSanityPublishedPostCount,
  getSanityPublishedPosts,
  getSanitySiteSettings,
} from "@/lib/sanity-content";
import { getTutorialCover } from "@/lib/tutorial-covers";
import { EXCEL_TUTORIAL, FALLBACK_TUTORIAL } from "@/lib/featured-tutorials";

// Public homepage content is cached at the Vercel edge and refreshed by the
// Sanity revalidation webhook. Draft preview requests remain uncached.
export const revalidate = 60;

type HomePageProps = {
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

function CardArtwork({ index }: { index: number }) {
  const backgrounds = ["#e9eef8", "#efe9df", "#e5eee8", "#eee8f1"];
  return (
    <div
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: backgrounds[index % backgrounds.length] }}
    >
      <div className="absolute left-[14%] top-[18%] h-[64%] w-[72%] border border-[#182533]/15 bg-white/80 shadow-[0_12px_30px_rgba(24,37,51,0.08)]" />
      <div className="absolute left-[20%] top-[28%] h-2 w-[40%] bg-[#182533]/70" />
      <div className="absolute left-[20%] top-[39%] h-1.5 w-[54%] bg-[#182533]/20" />
      <div className="absolute left-[20%] top-[48%] h-1.5 w-[46%] bg-[#182533]/20" />
      <div className="absolute bottom-[18%] right-[18%] h-9 w-9 rounded-full bg-[#1f52ad]" />
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const requestedCategory = params.category?.trim() ?? "";
  const category = requestedCategory === "word-tutorials" ? MICROSOFT_CATEGORY_SLUG : requestedCategory;
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

  const posts = sanityPosts.length > 0 || query || category ? sanityPosts : [FALLBACK_TUTORIAL];
  const homepagePosts = !query && !category && page === 1 ? [EXCEL_TUTORIAL, ...posts] : posts;
  const effectiveTotal = total > 0 || query || category ? total : posts.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (category) search.set("category", category);
    if (target > 1) search.set("page", String(target));
    const suffix = search.toString();
    return suffix ? `/?${suffix}` : "/";
  };

  return (
    <div className="site-home min-h-screen text-[#16233f]">
      <TylerHeader query={query} navigation={navigation} settings={settings} />
      {settings.showHeaderSearch ? (
        <form action="/" method="get" className="mx-4 mt-4 sm:hidden">
          <input className="h-11 w-full rounded-full border border-[#e1e4ec] bg-white px-5 text-sm outline-none focus:border-[#16233f]" defaultValue={query} name="q" placeholder={settings.homepageSearchPlaceholder} type="search" />
        </form>
      ) : null}

      {!query ? (
        <section className="site-hero tyler-shell relative mt-10 flex min-h-[360px] items-center border border-[#e1e4ec] px-8 py-16 sm:mt-12 sm:px-12 lg:px-16">
          <span aria-hidden="true" className="site-hero-bracket site-hero-bracket-tl" />
          <span aria-hidden="true" className="site-hero-bracket site-hero-bracket-br" />
          <div className="site-hero-copy relative z-10 max-w-3xl">
            <span className="site-hero-tag mb-6">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#e8a33d]" />
              A1:Z99 · 办公技巧笔记
            </span>
            <h1 className="tyler-wordmark whitespace-pre-line text-[44px] font-semibold leading-[1.18] tracking-[-0.04em] text-[#16233f] sm:text-[56px] lg:text-[64px]">
              {settings.homepageHeroTitle || "记录技术，\n也记录生活。"}
            </h1>
          </div>
        </section>
      ) : null}

      <main id="latest-tutorials" className="tyler-shell py-14 sm:py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs tracking-[0.22em] text-[#6c7783]">
              {query ? "SEARCH" : "LATEST"}
            </p>
            <h2 className="tyler-wordmark text-3xl font-semibold tracking-[-0.03em]">
              {query ? `“${query}”的搜索结果` : settings.homepageSectionTitle}
            </h2>
          </div>
          {query ? (
            <Link className="text-sm text-[#16233f] hover:underline" href="/">
              清除搜索
            </Link>
          ) : null}
          {settings.showHeaderCta && settings.homepageCtaHref ? (
            <Link className="text-sm font-medium text-[#16233f] hover:underline" href={settings.homepageCtaHref}>
              {settings.homepageCtaLabel}
            </Link>
          ) : null}
        </div>

        {categories.length ? (
          <nav aria-label="教程分类" className="site-tab-row mb-8 flex flex-wrap gap-1">
            <Link className={`site-tab ${!category ? 'site-tab-active' : ''}`} href={query ? `/?q=${encodeURIComponent(query)}` : '/'}>全部</Link>
            {categories.map(item => <Link className={`site-tab ${category === item.slug ? 'site-tab-active' : ''}`} href={`/?category=${encodeURIComponent(item.slug)}${query ? `&q=${encodeURIComponent(query)}` : ''}`} key={item.id}>{item.name}</Link>)}
          </nav>
        ) : null}

        {homepagePosts.length > 0 ? (
          <div className="site-card-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homepagePosts.map((post, index) => {
              const coverImage = getTutorialCover(post.slug, post.cover_image || "");
              const href =
                post.id === EXCEL_TUTORIAL.id
                  ? EXCEL_TUTORIAL.href
                  : post.id === FALLBACK_TUTORIAL.id
                  ? FALLBACK_TUTORIAL.href
                  : `/tutorials/${post.slug}`;
              return (
                <Link
                  className="site-card tyler-tutorial-card group flex flex-col overflow-hidden border border-[#e3ddd3] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#cfc6b9] hover:shadow-[0_16px_34px_rgba(24,37,51,0.08)]"
                  href={href}
                  key={post.id}
                >
                  <div className="tyler-tutorial-card-media relative overflow-hidden border-b border-[#e8e2d8]">
                    {coverImage ? (
                      <Image
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        src={coverImage}
                      />
                    ) : (
                      <CardArtwork index={index} />
                    )}
                    {settings.showCardCategory && post.category_name ? (
                      <span className="absolute bottom-3 left-3 max-w-[85%] truncate rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#1f52ad] shadow-sm backdrop-blur-sm">
                        {post.category_name}
                      </span>
                    ) : null}
                  </div>
                  <div className="tyler-tutorial-card-body flex min-h-0 flex-1 flex-col px-4 py-3.5 sm:px-5 sm:py-4">
                    <h3 className="line-clamp-2 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-[#25313d] transition group-hover:text-[#1f52ad]" title={post.title}>
                      {post.title}
                    </h3>
                    {settings.showCardDate || settings.showCardReadingTime ? (
                      <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-[#8a9095]">
                        {settings.showCardDate ? <time>{formatDate(post.published_at)}</time> : <span />}
                        {settings.showCardReadingTime ? <span>{post.reading_time || 10} 分钟</span> : null}
                      </div>
                    ) : null}
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
              className={`border px-4 py-2 text-sm ${
                page <= 1
                  ? "pointer-events-none border-[#e1e4ec] text-[#a7acb8]"
                  : "border-[#e1e4ec] bg-white hover:border-[#16233f]"
              }`}
              href={pageHref(Math.max(1, page - 1))}
            >
              ← 上一页
            </Link>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <Link
                aria-current={number === page ? "page" : undefined}
                className={`min-w-10 border px-3 py-2 text-center text-sm ${
                  number === page
                    ? "border-[#e8a33d] bg-[#e8a33d] text-[#16233f]"
                    : "border-[#e1e4ec] bg-white hover:border-[#16233f]"
                }`}
                href={pageHref(number)}
                key={number}
              >
                {number}
              </Link>
            ))}
            <Link
              aria-disabled={page >= totalPages}
              className={`border px-4 py-2 text-sm ${
                page >= totalPages
                  ? "pointer-events-none border-[#e1e4ec] text-[#a7acb8]"
                  : "border-[#e1e4ec] bg-white hover:border-[#16233f]"
              }`}
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
