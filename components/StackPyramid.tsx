import Logo from "@/components/Logo";
import { stackLayers, stackTools } from "@/lib/data";

// Architecture pyramid: apex = the autopilot business, foundation = the rails
// that reach the real world. Layer widths widen toward the base.
export default function StackPyramid() {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Apex */}
      <div className="flex flex-col items-center">
        <div className="h-0 w-0 border-x-[28px] border-b-[22px] border-x-transparent border-b-lime-400/80" />
        <div className="rounded-xl border border-lime-400/40 bg-lime-400/10 px-6 py-3 text-center">
          <p className="font-semibold text-lime-400">Your business on autopilot</p>
          <p className="text-xs text-zinc-400">everything below is what it runs on</p>
        </div>
      </div>

      {stackLayers.map((layer, i) => {
        const tools = stackTools.filter((t) => t.category === layer.key);
        const width = 46 + i * ((100 - 46) / (stackLayers.length - 1));
        return (
          <div
            key={layer.key}
            style={{ width: `${width}%`, minWidth: "min(100%, 360px)" }}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-4 transition hover:border-zinc-700 sm:px-6"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-0.5 text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">{layer.label}</h3>
              <p className="text-xs text-zinc-500">{layer.blurb}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {tools.map((t) => (
                <a
                  key={t.name}
                  href={t.referralUrl ?? t.url}
                  target="_blank"
                  rel={t.referralUrl ? "noopener noreferrer sponsored" : "noopener noreferrer"}
                  title={t.role}
                  className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    t.referral
                      ? "border-lime-400/40 bg-lime-400/5 hover:border-lime-400 hover:bg-lime-400/10"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
                  }`}
                >
                  <Logo url={t.url} name={t.name} size={16} />
                  <span className="font-medium text-zinc-200 group-hover:text-zinc-50">{t.name}</span>
                  {t.referral && (
                    <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-400">
                      pilot&nbsp;perk
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      })}

      <p className="mt-4 max-w-xl text-center text-xs text-zinc-500">
        <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-400">
          pilot&nbsp;perk
        </span>{" "}
        = a deal, credits or discount for you — some are referral links that also support the index (never
        pay-for-inclusion). Hover a tool for its role, click to check current terms. Building your own autopilot
        company? Start at the base and work up.
      </p>
    </div>
  );
}
