import Link from 'next/link';
import { ArrowDownRight, ArrowRight, MapPin } from 'lucide-react';

const workspaces = [
  { number: '01', title: 'Residents', description: 'Tell us where you are, book a pickup and follow its progress.', action: 'Resident access', href: '/login?role=resident' },
  { number: '02', title: 'Collectors', description: 'See assigned pickups, find each stop and record collection.', action: 'Collector access', href: '/login?role=collector' },
  { number: '03', title: 'Estate managers', description: 'Follow collection reliability and address reports across your estate.', action: 'Estate access', href: '/login?role=estate' },
  { number: '04', title: 'Municipal teams', description: 'See overdue pickups and sanitation reports by service district.', action: 'Municipal access', href: '/login?role=municipal' },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <section className="grid items-center gap-10 border-b border-[var(--line)] py-12 md:grid-cols-[1fr_0.85fr] md:gap-14 lg:py-20">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Abuja · Waste collection and sanitation</p>
          <h1 className="max-w-[12ch] text-[clamp(3.25rem,7vw,6.75rem)] font-semibold leading-[0.93] tracking-[-0.055em]">
            Waste pickup at your door.
          </h1>
          <p className="mt-6 max-w-[37ch] text-lg leading-relaxed text-[var(--muted)]">
            Book a collection by building postcode or landmark. Track the pickup and report waste problems where you live.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/book" className="inline-flex min-h-12 items-center gap-5 rounded-sm bg-[#41357e] px-5 font-semibold text-white hover:bg-[#322761]">
              Book a pickup <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/demo" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold underline underline-offset-4">
              Try the demo <ArrowDownRight size={16} aria-hidden />
            </Link>
          </div>
        </div>

        <figure className="overflow-hidden rounded-sm bg-[#29233e] text-[#f6f4ea]">
          <figcaption className="flex items-center justify-between gap-3 border-b border-white/20 px-5 py-4 text-xs font-medium sm:px-7">
            <span>COLLECTION AREA</span><span className="text-[#e3d9f1]">ABUJA, FCT</span>
          </figcaption>
          <svg className="block w-full" viewBox="0 0 480 285" aria-hidden="true">
            <defs>
              <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="#4b4064" />
              </pattern>
            </defs>
            <path fill="url(#map-grid)" d="M0 0H480V285H0z" />
            <g fill="#352c52" stroke="#65577f" strokeWidth="1.4">
              <path d="m13 30 117-8 43 60-34 52-112-18z" />
              <path d="m151 22 161 2 33 54-48 38-105-30z" />
              <path d="m322 25 133-8 6 102-96-40z" />
              <path d="m25 135 112 17 51 53-32 57-135-13z" />
              <path d="m187 103 112 33 23 57-115 9-49-53z" />
              <path d="m314 130 54-37 95 47-14 75-102-22z" />
              <path d="m208 220 125-11 93 30-7 26-240-1z" />
            </g>
            <path d="M-10 122 145 144 190 93 303 125 362 86 490 145M139 284l61-72 138-11 152 52M120-10l65 98M305 127l34 73" fill="none" stroke="#9888b5" strokeWidth="3" />
            <path d="m73 133 72 11 45-51 65 18 18 40" fill="none" stroke="#ffb996" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="73" cy="133" r="7" fill="#ffb996" />
            <circle cx="273" cy="151" r="15" fill="#ffb996" stroke="#29233e" strokeWidth="4" />
            <circle cx="273" cy="151" r="4" fill="#29233e" />
            <text x="291" y="175" fill="#f6f4ea" fontSize="14" fontFamily="system-ui">Wuse 2</text>
          </svg>
          <div className="flex items-center gap-3 border-t border-white/20 px-5 py-4 text-sm sm:px-7">
            <MapPin size={18} className="shrink-0 text-[#ffb996]" aria-hidden />
            <span>Illustration · Wuse 2 collection route</span>
          </div>
        </figure>
      </section>

      <section className="py-10 md:py-14" aria-labelledby="workspaces">
        <h2 id="workspaces" className="mb-6 text-2xl font-semibold tracking-tight">How will you use Trashify?</h2>
        <div className="grid border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {workspaces.map(({ number, title, description, action, href }) => (
            <Link key={href} href={href} className="group border-b border-[var(--line)] py-6 hover:bg-[var(--surface-2)] sm:px-5 sm:odd:border-r lg:border-r lg:last:border-r-0">
              <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">{number}</span>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-[var(--muted)]">{description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] group-hover:underline">
                {action} <ArrowRight size={16} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-5 border-t border-[var(--line)] py-9 md:grid-cols-[1fr_1.2fr]">
        <div><h2 className="text-2xl font-semibold tracking-tight">A public-health approach to waste collection</h2><Link href="/public-health" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] underline underline-offset-4">Explore our public-health pilot</Link></div>
        <p className="text-[var(--muted)]">Developed from a public-health PhD student’s original idea, Trashify connects collection service with sanitation follow-up. See which pickups are overdue, how long collection takes, and where residents report waste accumulation. Estate and municipal teams can use that information to follow up and compare service reliability across areas.</p>
      </section>
      <footer className="flex flex-wrap justify-between gap-2 border-t border-[var(--line)] py-6 text-sm text-[var(--muted)]">
        <span>Trashify · Abuja</span><Link href="/privacy" className="hover:underline">Data and privacy</Link>
      </footer>
    </div>
  );
}
