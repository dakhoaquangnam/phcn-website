import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/revita";

export const metadata: Metadata = {
  title: "Bài viết sức khỏe",
  description: "Kiến thức phục hồi chức năng sau đột quỵ, sau phẫu thuật và chăm sóc sức khỏe.",
};

export const revalidate = 300;

export default async function BaiVietPage() {
  const posts = await getPosts(24).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Bài viết sức khỏe</h1>
      <p className="mt-2 text-slate-600">
        Kiến thức phục hồi chức năng do đội ngũ phòng khám biên soạn.
      </p>
      {posts.length === 0 ? (
        <p className="mt-8 text-slate-500">Chưa có bài viết nào.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/bai-viet/${p.slug}`}
              className="rounded-2xl border border-slate-200 p-5 hover:border-cyan-600"
            >
              <p className="font-semibold text-lg">{p.title}</p>
              {p.excerpt ? (
                <p className="mt-1 text-sm text-slate-600 line-clamp-3">{p.excerpt}</p>
              ) : null}
              {p.category?.name ? (
                <p className="mt-2 text-xs font-semibold text-cyan-700">{p.category.name}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
