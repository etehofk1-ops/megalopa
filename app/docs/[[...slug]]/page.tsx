import Link from "next/link";
import { notFound } from "next/navigation";
import { CrabMark } from "@/components/icons";
import { GuideActions } from "@/components/GuideActions";
import { GuideBlock, getGuidePage, guideGroups, guidePages } from "@/lib/guide";

type DocsPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export function generateStaticParams() {
  return Object.keys(guidePages).map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: DocsPageProps) {
  const { slug } = await params;
  const page = getGuidePage(slug?.[0]);
  return {
    title: page ? `${page.title} · Megalopa 가이드` : "Megalopa 가이드",
    description: page?.summary ?? "Megalopa 사용 가이드",
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const page = getGuidePage(slug?.[0]);
  if (!page) notFound();

  return (
    <main className="guide-root">
      <aside className="guide-sidebar">
        <Link href="/" className="guide-brand">
          <span className="guide-brand-mark">
            <CrabMark className="h-4 w-4" />
          </span>
          <span>Megalopa 가이드</span>
        </Link>

        <Link href="/upload" className="guide-open-link">
          분석 화면 열기
        </Link>

        <nav className="guide-nav" aria-label="Megalopa guide navigation">
          {guideGroups.map((group) => (
            <section key={group.title}>
              <p>{group.title}</p>
              {group.pages.map((item) => {
                const active = item.slug === page.slug;
                return (
                  <Link key={item.slug} href={`/docs/${item.slug}`} className={active ? "active" : ""}>
                    {item.title}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>
      </aside>

      <section className="guide-main">
        <div className="guide-progress">
          <span />
          <button type="button">{page.progressLabel}</button>
        </div>

        <article className="guide-article">
          <div className="guide-category">{page.category}</div>
          <h1>{page.title}</h1>
          <p className="guide-summary">{page.summary}</p>
          <GuideActions markdown={page.markdown} />

          <div className="guide-rule" />

          {page.blocks.map((block, index) => (
            <GuideBlockView key={`${block.type}-${index}`} block={block} />
          ))}
        </article>
      </section>
    </main>
  );
}

function GuideBlockView({ block }: { block: GuideBlock }) {
  if (block.type === "paragraph") {
    return <p className="guide-copy">{block.text}</p>;
  }

  if (block.type === "heading") {
    return (
      <h2 id={toAnchor(block.text)}>
        <a href={`#${toAnchor(block.text)}`}>{block.text}</a>
      </h2>
    );
  }

  if (block.type === "steps") {
    return (
      <ol className="guide-steps">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="guide-list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "note") {
    return (
      <aside className="guide-note">
        <strong>{block.title}</strong>
        <p>{block.body}</p>
      </aside>
    );
  }

  if (block.type === "example") {
    return (
      <figure className="guide-example">
        <figcaption>{block.title}</figcaption>
        {block.items.map((item) => (
          <code key={item}>{item}</code>
        ))}
      </figure>
    );
  }

  return (
    <div className="guide-next">
      {block.items.map((item) => (
        <Link key={item.title} href={item.href ?? "/docs/quick-start"}>
          <strong>{item.title}</strong>
          <span>{item.body}</span>
        </Link>
      ))}
    </div>
  );
}

function toAnchor(value: string) {
  return value.replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "").toLowerCase();
}
