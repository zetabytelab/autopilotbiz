// Company/tool logo pulled from the site's favicon (Google's favicon service —
// free, no API key, transparent PNGs that keep the brand colours on dark).
export default function Logo({
  url,
  name,
  size = 20,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  if (!url) {
    return (
      <span
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-md bg-zinc-800 font-mono text-[10px] font-bold text-zinc-400"
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  const domain = new URL(url).hostname;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={`${name} logo`}
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-md"
    />
  );
}
