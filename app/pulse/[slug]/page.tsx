import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { editions, getEdition } from "@/lib/editions";
import SubscribeForm from "@/components/SubscribeForm";

export function generateStaticParams() {
  return editions.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEdition(slug);
  if (!e) return {};
  return {
    title: `Autopilot Pulse #${e.number} — ${e.title}`,
    description: e.tldr[0],
    alternates: { canonical: `/pulse/${e.slug}` },
    openGraph: { images: [e.cover] },
  };
}

// Renders **bold** spans inside otherwise-plain paragraphs.
function Rich({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-zinc-100">
            {p}
          </strong>
        ) : (
          p
        ),
      )}
    </>
  );
}

export default async function EditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEdition(slug);
  if (!e) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <header className="py-12">
        <Link href="/pulse" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
          ← All editions
        </Link>
        <p className="mb-2 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
          Autopilot Pulse · #{String(e.number).padStart(2, "0")} · {e.date}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">{e.title}</h1>
      </header>

      <Image
        src={e.cover}
        alt={`Edition #${e.number} cover`}
        width={1080}
        height={1350}
        className="mb-10 w-full rounded-2xl border border-zinc-800"
        priority
      />

      <section className="mb-10 rounded-2xl border border-lime-400/30 bg-lime-400/5 p-5">
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-lime-400">TL;DR</h2>
        <ul className="space-y-2">
          {e.tldr.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
              <span className="text-lime-400">→</span>
              <span>
                <Rich text={t} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {e.sections.map((s, i) => (
        <section key={i} className="mb-8">
          {s.heading && <h2 className="mb-3 text-xl font-bold text-zinc-100">{s.heading}</h2>}
          {s.image && (
            <Image
              src={s.image}
              alt={s.imageAlt ?? ""}
              width={1200}
              height={675}
              className="mb-4 w-full rounded-xl border border-zinc-800"
            />
          )}
          {s.paras.map((p, j) => (
            <p key={j} className="mb-4 text-[15px] leading-relaxed text-zinc-300">
              <Rich text={p} />
            </p>
          ))}
        </section>
      ))}

      <footer className="mt-12 border-t border-zinc-800 pt-8">
        <p className="mb-1 font-mono text-sm text-zinc-400">
          Keep building — the agents have the night shift. 🛩
        </p>
        <p className="mb-6 font-mono text-xs text-zinc-600">— Antonio, the human in the loop</p>
        <p className="text-sm text-zinc-400">
          Everything above is sourced and labeled on{" "}
          <Link href="/" className="text-lime-400 underline hover:text-lime-300">
            the index
          </Link>
          . Also published on{" "}
          <a
            href={e.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-400 underline hover:text-lime-300"
          >
            LinkedIn
          </a>
          .
        </p>
        <SubscribeForm />
      </footer>
    </main>
  );
}
