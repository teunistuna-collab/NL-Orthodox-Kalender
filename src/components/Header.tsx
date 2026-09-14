import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, Clock3, Flame, HandHeart, Sparkles, Sun, Wheat } from 'lucide-react';
import Cross from './Cross';
import { useApp } from '../lib/context';
import { formatDag, kerkDatum, formatLang } from '../lib/kalender';

export const SECTIES = [
  { id: 'vandaag', label: 'Vandaag', icon: Sun },
  { id: 'kalender', label: 'Kalender', icon: CalendarDays },
  { id: 'cyclus', label: '24 uur', icon: Clock3 },
  { id: 'gebeden', label: 'Gebeden', icon: HandHeart },
  { id: 'vasten', label: 'Vasten', icon: Wheat },
  { id: 'heiligen', label: 'Heiligen', icon: BookOpen },
  { id: 'pascha', label: 'Pascha', icon: Flame },
  { id: 'feesten', label: 'Feesten', icon: Sparkles },
];

export default function Header() {
  const { mode, setMode, vandaag } = useApp();
  const [actief, setActief] = useState('vandaag');

  useEffect(() => {
    const els = SECTIES.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const zichtbaar = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (zichtbaar[0]) setActief(zichtbaar[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const kerk = kerkDatum(vandaag, mode);

  return (
    <header className="sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="bg-bark text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
          <a href="#vandaag" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-9 w-7 shrink-0 items-center justify-center text-gold sm:h-10 sm:w-8">
              <Cross className="h-8 w-5 sm:h-9 sm:w-6" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="font-display block truncate text-lg font-semibold tracking-wide text-gold-light sm:text-2xl">Orthodoxe Kalender</span>
              <span className="hidden text-[10px] font-semibold tracking-[0.22em] text-[#bfa982] uppercase sm:block">Nederland · feesten · vasten · heiligen</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold text-cream">{formatLang(vandaag)}</div>
              <div className="text-[11px] text-[#bfa982]">
                {mode === 'oud' ? `Kerkelijk: ${formatDag(kerk)} (juliaans)` : 'Nieuwe kalender (gereviseerd juliaans)'}
              </div>
            </div>
            <div className="flex shrink-0 rounded-full border border-gold/40 bg-bark-2 p-0.5 text-[10px] font-bold tracking-wider uppercase sm:text-[11px]" role="group" aria-label="Kalenderkeuze">
              <button
                type="button"
                onClick={() => setMode('nieuw')}
                className={`rounded-full px-3 py-1.5 transition ${mode === 'nieuw' ? 'bg-gold text-bark' : 'text-gold-light hover:text-white'}`}
              >
                  <span className="sm:hidden">N</span><span className="hidden sm:inline">Nieuw</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('oud')}
                className={`rounded-full px-3 py-1.5 transition ${mode === 'oud' ? 'bg-gold text-bark' : 'text-gold-light hover:text-white'}`}
              >
                  <span className="sm:hidden">O</span><span className="hidden sm:inline">Oud</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="border-t border-gold/20 bg-bark-2 text-cream">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 sm:px-4">
          {SECTIES.map(({ id, label, icon: Icon }) => {
            const on = actief === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setActief(id)}
                className={`relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold tracking-wider uppercase transition sm:px-4 ${
                  on ? 'text-gold-light' : 'text-[#bfa982] hover:text-cream'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
