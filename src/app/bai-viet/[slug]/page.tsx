import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPosts } from "@/lib/revita";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Không tìm thấy bài viết" };
  return {
    title: post.title,
    description: post.excerpt ?? post.title,
    openGraph: { title: post.title, description: post.excerpt ?? undefined, type: "article" },
  };
}

export default async function BaiVietDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const others = (await getPosts(4).catch(() => [])).filter((p) => p.slug !== slug).slice(0, 3);
  const html = post.contentHtml ?? "";
  const looksHtml = /<[a-z][\s\S]*>/i.test(html);
  const body = looksHtml ? html : (post.content ?? "");

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/bai-viet" className="text-sm font-semibold text-cyan-700 hover:underline">
        ← Tất cả bài viết
      </Link>
      <h1 className="mt-4 text-3xl font-bold leading-snug">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {[post.category?.name, post.authorName, post.publishedAt ?? post.createdAt]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {looksHtml ? (
        <div
          className="mt-6 space-y-4 leading-relaxed text-slate-800 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-bold [&_a]:text-cyan-700 [&_img]:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <p className="mt-6 whitespace-pre-wrap leading-relaxed text-slate-800">{body}</p>
      )}
      {others.length > 0 ? (
        <section className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-xl font-bold">Bài viết khác</h2>
          <div className="mt-4 grid gap-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/bai-viet/${p.slug}`}
                className="rounded-xl border border-slate-200 p-4 hover:border-cyan-600"
              >
                <p className="font-semibold">{p.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
