import type { ReactNode } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

type CycleCard = {
  title: string;
  intro: string;
  body: string;
  meta?: string;
};

type CyclePageProps = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  quote: string;
  citation: string;
  body?: string;
};

export function GoldDivider() {
  return <div className="gold-rule my-8" />;
}

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <p className="text-[10px] font-bold tracking-[0.32em] text-gold-deep uppercase">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-ink-soft">{subtitle}</p>}
    </div>
  );
}

export function ParchmentSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`parchment-pattern bg-parchment py-16 text-ink sm:py-20 ${className}`}>{children}</section>;
}

export function DarkSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`bg-bark text-cream ${className}`}>{children}</section>;
}

export function QuoteSection({ quote, citation }: { quote: string; citation: string }) {
  return (
    <div className="rounded-2xl border border-[#d4aa3d]/50 bg-[#f7f0df] p-6 text-center shadow-[0_18px_40px_rgba(40,22,14,0.08)] sm:p-8">
      <blockquote className="font-display text-2xl italic leading-relaxed text-ink sm:text-3xl">“{quote}”</blockquote>
      <cite className="mt-3 block text-[10px] font-bold tracking-[0.24em] text-gold-deep uppercase not-italic">{citation}</cite>
    </div>
  );
}

export function ReadMoreButton({ onClick, label = 'Lees meer' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-bold text-gold-deep underline-offset-4 transition hover:text-gold hover:underline"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function CycleHero({ id, eyebrow, title, intro, quote, citation, body }: CyclePageProps) {
  return (
    <section id={id} className="relative overflow-hidden bg-bark text-cream">
      <div className="absolute inset-0 opacity-25 orthodox-pattern" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] font-bold tracking-[0.32em] text-gold-light uppercase">{eyebrow}</p>
            <h1 className="font-display mt-4 text-5xl font-semibold leading-none text-gold-light sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#e7d9bc]">{intro}</p>
            {body && <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#d9c6a3]">{body}</p>}
          </div>
          <div className="rounded-[26px] border border-[#c9a227]/50 bg-[#1b120d]/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="font-display text-4xl italic leading-tight text-gold-light">“{quote}”</div>
            <div className="mt-4 text-[10px] font-bold tracking-[0.28em] text-[#f0d78b] uppercase">{citation}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LiturgicalCard({ title, intro, body, meta, onReadMore }: CycleCard & { onReadMore?: () => void }) {
  return (
    <article className="group rounded-2xl border border-[#d4aa3d]/35 bg-[#f8f1e3] p-5 shadow-[0_14px_26px_rgba(39,24,15,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_18px_34px_rgba(39,24,15,0.12)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d4aa3d]/50 bg-[#f6ebc6] text-gold-deep">
          <Sparkles className="h-4 w-4" />
        </div>
        {meta && <span className="text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">{meta}</span>}
      </div>
      <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{intro}</p>
      {body && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>}
      {onReadMore && (
        <div className="mt-5">
          <ReadMoreButton onClick={onReadMore} />
        </div>
      )}
    </article>
  );
}

type PopupContent = {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  highlight?: string;
};

export function LiturgicalPopup({ open, onClose, content }: { open: boolean; onClose: () => void; content: PopupContent | null }) {
  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#160b08]/80 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#c9a227]/65 bg-[#f8f1e3] text-ink shadow-[0_30px_70px_rgba(0,0,0,0.45)]" onClick={(event) => event.stopPropagation()}>
        <header className="sticky top-0 z-10 border-b border-[#c9a227]/45 bg-[#200f09] px-5 py-4 text-[#f3e5c6] sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold tracking-[0.24em] text-gold-light uppercase">Lees meer</div>
              <h3 className="font-display mt-1 text-2xl font-semibold text-gold-light sm:text-3xl">{content.title}</h3>
            </div>
            <button type="button" onClick={onClose} aria-label="Sluiten" className="rounded-full p-2 text-gold-light transition hover:bg-white/10">✕</button>
          </div>
        </header>
        <div className="thin-scroll overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {content.subtitle && <p className="mb-4 text-[11px] font-bold tracking-[0.22em] text-gold-deep uppercase">{content.subtitle}</p>}
          {content.highlight && <div className="mb-5 rounded-xl border border-[#c9a227]/35 bg-[#f6ebc6] px-4 py-3 text-sm font-semibold text-gold-deep">{content.highlight}</div>}
          <div className="space-y-4 text-base leading-relaxed text-ink-soft">
            {content.paragraphs.map((paragraph, index) => (
              <p key={`${content.title}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CycleNavigation({ current, items }: { current: string; items: Array<{ id: string; label: string; title: string; href: string }> }) {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-3">
      {items.map((item) => {
        const active = item.id === current;
        return (
          <a
            key={item.id}
            href={item.href}
            className={`rounded-full border px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition ${
              active ? 'border-gold bg-gold text-bark' : 'border-[#d4aa3d]/50 bg-[#f8f1e3] text-gold-deep hover:border-gold hover:text-gold-deep'
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

const DEFAULT_TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere ademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door dag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag zijn gedachtenis', href: '#week' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele kerkelijke jaar geheiligd', href: '#jaar' },
];

export function BottomCycleTimeline({
  current,
  items = DEFAULT_TIMELINE_ITEMS,
}: {
  current: string;
  items?: Array<{ id: string; label: string; title: string; href: string }>;
}) {
  return (
    <section className="bg-bark px-4 py-10 text-cream sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-gold-light uppercase">De heiliging van de tijd</p>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 sm:justify-center">
          {items.map((item) => {
            const active = item.id === current;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex min-w-[150px] flex-1 flex-col items-center justify-center rounded-2xl border px-4 py-4 text-center transition ${
                  active
                    ? 'border-gold bg-[#2a1c15] shadow-[0_0_0_1px_rgba(201,162,39,0.55)]'
                    : 'border-[#d4aa3d]/35 bg-[#1f150f] hover:border-[#d4aa3d]/60'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4aa3d]/50 text-lg font-bold text-gold-light">
                  {item.label[0]}
                </div>
                <div className="mt-3 text-[10px] font-bold tracking-[0.24em] text-gold-light uppercase">{item.label}</div>
                <div className="mt-2 text-xs leading-relaxed text-[#e8dcc0]">{item.title}</div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CyclePageLayout({ id, eyebrow, title, intro, quote, citation, body, children }: CyclePageProps & { children: ReactNode }) {
  const navItems = [
    { id: 'adem', label: 'ADEM', title: 'Het Jezusgebed', href: '#adem' },
    { id: 'etmaal', label: 'ETMAAL', title: 'De gebeden van dag en nacht', href: '#etmaal' },
    { id: 'week', label: 'WEEK', title: 'Van zondag tot zaterdag', href: '#week' },
    { id: 'jaar', label: 'JAAR', title: 'Het ritme van het kerkelijk jaar', href: '#jaar' },
  ];

  return (
    <>
      <CycleHero id={id} eyebrow={eyebrow} title={title} intro={intro} quote={quote} citation={citation} body={body} />
      <div className="bg-[#f8f0df]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <CycleNavigation current={id} items={navItems} />
        </div>
      </div>
      {children}
      <BottomCycleTimeline current={id} />
    </>
  );
}
