import Link from 'next/link';

export const metadata = { title: 'Public health and the Trashify pilot', description: 'How Trashify measures collection reliability and sanitation follow-up.' };

export default function Page() {
  return (
    <article className="mx-auto max-w-4xl space-y-10 px-5 py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Public-health pilot</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Make collection reliable. Make follow-up visible.</h1>
        <p className="mt-4 text-lg text-[var(--muted)]">Trashify began with an idea from Fatima Zahra Abubakar, a PhD student in public health. The pilot brings residents, collectors, estates and municipal teams into one collection and sanitation workflow.</p>
      </header>
      <section className="space-y-3 border-t border-[var(--line)] pt-6">
        <h2 className="text-2xl font-semibold">The team behind the pilot</h2>
        <p className="text-[var(--muted)]">ZAYM Tech brings together Fatima Zahra Abubakar, originator and public-health lead, and Yusuf Abubakar Saka, builder. The team also develops ResolveGrid, the postcode layer used by Trashify.</p>
      </section>
      <section className="space-y-3 border-t border-[var(--line)] pt-6">
        <h2 className="text-2xl font-semibold">Why waste collection matters</h2>
        <p className="text-[var(--muted)]">Uncollected and poorly managed waste can pollute the environment and provide breeding grounds for insects and rodents. Reliable collection and follow-up on reported waste problems are practical service priorities.</p>
        <a href="https://www.who.int/news/item/16-12-2025-who-highlights-health-risks-and-opportunities-in-the-global-waste-crisis" target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-[var(--accent)] underline underline-offset-4">WHO overview of solid waste and health</a>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What the pilot measures</h2>
        <dl className="grid gap-px overflow-hidden rounded-md border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
          {[
            ['Collection reliability', 'The number of pickups due and the proportion collected within their scheduled window.'],
            ['Time to collection', 'Median hours from booking to completion, alongside pickups still overdue.'],
            ['Sanitation observations', 'Resident reports of overflowing waste, dumping, blocked drains, pests and missed collections.'],
            ['Service follow-up', 'Which reports remain open and when estate or municipal teams record that an issue was addressed.'],
          ].map(([title, text]) => <div key={title} className="bg-[var(--surface)] p-5"><dt className="font-semibold">{title}</dt><dd className="mt-2 text-sm text-[var(--muted)]">{text}</dd></div>)}
        </dl>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">How we will evaluate it</h2>
        <p className="text-[var(--muted)]">Our public-health lead will help define the pilot sites, baseline period, reporting categories and follow-up checks. We will compare service reliability over time, report participation and missing data, and validate observations with service teams. District comparisons include the number of bookings behind each figure.</p>
        <p className="text-[var(--muted)]">These operational measures help evaluate service delivery. Any study of illness outcomes would require a separate protocol, appropriate permissions and a defined evaluation design.</p>
      </section>
      <section className="space-y-3 border-t border-[var(--line)] pt-6">
        <h2 className="text-2xl font-semibold">Data handled with care</h2>
        <p className="text-[var(--muted)]">Residents see their own pickups. Estates and municipal teams have scoped access. Aggregate exports omit districts with fewer than five due pickups. AI features receive sanitation categories or district totals. Report categories can always be chosen manually.</p>
        <div className="flex flex-wrap gap-5 text-sm font-semibold text-[var(--accent)]"><Link href="/demo" className="underline underline-offset-4">Explore the pilot demo</Link><Link href="/privacy" className="underline underline-offset-4">Read the data notice</Link></div>
      </section>
    </article>
  );
}
