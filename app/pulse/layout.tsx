import Link from "next/link";
import Image from "next/image";
import "./pulse-theme.css";

const links = [["Companies", "companies"], ["Builder Stack", "stack"], ["Experiments & Workflows", "workflows"], ["Capital", "capital"], ["Pulse News", "pulse"], ["$1B Solo Founder 🚀", "frontier"]];

export default function PulseLayout({ children }: { children: React.ReactNode }) {
  return <div className="pulse-shell">
    <header className="pulse-masthead">
      <div className="pulse-brand-row">
        <Link href="/" className="pulse-wordmark" aria-label="Autopilot Index">autopilot<span>index</span></Link>
        <span className="pulse-strap">Self-driving products &amp; companies</span>
        <a className="pulse-curator" href="https://www.linkedin.com/in/antonioserranopabon/" target="_blank" rel="noopener noreferrer"><Image src="/registry/assets/antonio-serrano.png" alt="Antonio Serrano" width={26} height={26} /> Curated by <strong>AS</strong></a>
        <Link href="/pulse#subscribe" className="pulse-subscribe-link">Subscribe free ↗</Link>
      </div>
      <nav aria-label="Directory" className="pulse-nav">{links.map(([label, hash]) => <Link key={hash} href={`/#${hash}`}>{label}</Link>)}</nav>
    </header>
    {children}
    <footer className="pulse-footer"><span>Autopilot Index · People, tools &amp; evidence.</span><Link href="/pulse">All editions</Link><Link href="/pulse/feed.xml">RSS</Link><Link href="/privacy">Privacy</Link></footer>
  </div>;
}
