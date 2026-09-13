import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../lib/context';
import { ALLE_HEILIGEN } from '../lib/heiligen';
import { rangLabel, vertaalLeven } from '../lib/htc';
import { MAANDEN, MAANDEN_KORT, civilVanKerkdatum, formatMd, hoofdletter, ymd } from '../lib/kalender';
import { SectionTitle } from './ui';

interface Resultaat {
  md: string;
  naam: string;
  titel?: string;
  kort?: string;
  nl?: boolean;
  bron: 'nl' | 'htc';
  rang?: number;
}

function normaliseer(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sorteerMd(a: string, b: string) {
  const [am, ad] = a.split('-').map(Number);
  const [bm, bd] = b.split('-').map(Number);
  return am - bm || ad - bd;
}

export default function Heiligen() {
  const { mode, vandaag, htc, openDag } = useApp();
  const [zoek, setZoek] = useState('');
  const [maand, setMaand] = useState<number | null>(null);
  const [alleenNl, setAlleenNl] = useState(false);

  const resultaten = useMemo<Resultaat[]>(() => {
    const q = normaliseer(zoek.trim());
    const inMaand = (md: string) => maand === null || Number(md.split('-')[0]) === maand;

    const nl: Resultaat[] = ALLE_HEILIGEN.filter((h) => inMaand(h.md) && (!alleenNl || h.nl) && (!q || normaliseer(`${h.naam} ${h.titel} ${h.kort}`).includes(q))).map((h) => ({
      md: h.md,
      naam: h.naam,
      titel: h.titel,
      kort: h.kort,
      nl: h.nl,
      bron: 'nl',
    }));

    const out: Resultaat[] = [...nl];
    if (htc && !alleenNl && (q.length >= 3 || maand !== null)) {
      const gezien = new Set(nl.map((r) => `${r.md}|${normaliseer(r.naam).split(' ')[0]}`));
      for (const [md, dag] of Object.entries(htc)) {
        if (!inMaand(md)) continue;
        for (const [icon, tekst] of dag.l) {
          const vertaald = vertaalLeven(tekst);
          if (q && !normaliseer(`${tekst} ${vertaald}`).includes(q)) continue;
          if (!q && !(rangLabel(icon)?.rang ?? 0)) continue; // zonder zoekterm alleen feesten met rang
          const sleutel = `${md}|${normaliseer(vertaald).replace(/^(h\.|hh\.|eerbiedwaardige|martelaar|grootmartelaar|priestermartelaar|apostel|profeet)\s+/, '').split(' ')[0]}`;
          if (gezien.has(sleutel)) continue;
          out.push({ md, naam: vertaald.replace(/\.$/, ''), bron: 'htc', rang: rangLabel(icon)?.rang });
        }
      }
    }
    return out.sort((a, b) => sorteerMd(a.md, b.md) || (a.bron === 'nl' ? -1 : 1)).slice(0, 120);
  }, [zoek, maand, alleenNl, htc]);

  const jaar = vandaag.getUTCFullYear();

  return (
    <section id="heiligen" className="parchment-pattern bg-parchment py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Menologion · dagheiligen"
          title="Heiligen van elke dag"
          intro="Zoek op naam, titel of patroonschap — van Nicolaas van Myra tot Xenia van Petersburg, en de heiligen van de Lage Landen. Nederlandstalige levensbeschrijvingen aangevuld met het volledige menologion van holytrinityorthodox.com (vertaling automatisch)."
        />

        <div className="paper card-shadow rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <input
                type="search"
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                placeholder="Zoek een heilige, bijv. Nicolaas, wonderdoener, Athos, martelares…"
                className="w-full rounded-full border border-parchment-4 bg-white py-2.5 pr-4 pl-9 text-sm text-ink placeholder:text-ink-mute focus:border-gold focus:outline-none"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <input type="checkbox" checked={alleenNl} onChange={(e) => setAlleenNl(e.target.checked)} className="h-4 w-4 accent-[#5a2424]" />
              Alleen heiligen van de Lage Landen
            </label>
          </div>
          <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-1">
            <button type="button" onClick={() => setMaand(null)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${maand === null ? 'bg-wine text-gold-light' : 'bg-parchment-2 text-ink-soft hover:bg-parchment-3'}`}>
              Hele jaar
            </button>
            {MAANDEN_KORT.map((m, i) => (
              <button key={m} type="button" onClick={() => setMaand(i + 1)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${maand === i + 1 ? 'bg-wine text-gold-light' : 'bg-parchment-2 text-ink-soft hover:bg-parchment-3'}`}>
                {hoofdletter(m)}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-ink-mute">
            <span>
              {resultaten.length} {resultaten.length === 1 ? 'gedachtenis' : 'gedachtenissen'}
              {maand !== null && ` in ${MAANDEN[maand - 1]} (kerkelijke datum)`}
              {zoek.trim().length > 0 && zoek.trim().length < 3 && !maand && ' · typ minstens 3 letters om ook het volledige menologion te doorzoeken'}
            </span>
            <span>{mode === 'oud' ? 'burgerlijke datum = kerkelijke + 13' : 'nieuwe kalender'}</span>
          </div>

          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {resultaten.map((r, i) => {
              const civil = civilVanKerkdatum(r.md, jaar, mode);
              return (
                <li key={`${r.md}-${r.naam}-${i}`}>
                  <button
                    type="button"
                    onClick={() => openDag(ymd(civil))}
                    className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition hover:border-gold ${r.bron === 'nl' ? 'border-parchment-3 bg-white/70' : 'border-transparent bg-parchment-2/70'}`}
                  >
                    <div className="font-display w-12 shrink-0 text-center leading-none">
                      <div className="text-xl font-bold text-wine">{r.md.split('-')[1]}</div>
                      <div className="text-[10px] font-bold tracking-wider text-gold-deep uppercase">{MAANDEN_KORT[Number(r.md.split('-')[0]) - 1]}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-sm leading-snug ${r.bron === 'nl' ? 'font-display text-[17px] font-semibold text-ink' : 'text-ink'}`}>{r.naam}</span>
                        {r.nl && <span className="rounded-sm bg-wine px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gold-light uppercase">Lage Landen</span>}
                        {r.rang && r.rang >= 4 && <span className="rounded-sm bg-gold-pale px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gold-deep uppercase">{rangLabel(String(r.rang))?.label}</span>}
                      </div>
                      {r.titel && <div className="text-xs font-semibold text-gold-deep">{r.titel}</div>}
                      {r.kort && <p className="mt-0.5 text-sm leading-snug text-ink-soft">{r.kort}</p>}
                      <div className="mt-1 text-[11px] text-ink-mute">
                        {mode === 'oud' ? `kerkelijk ${formatMd(r.md)} · burgerlijk ${civil.getUTCDate()} ${MAANDEN[civil.getUTCMonth()]}` : formatMd(r.md)}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {resultaten.length === 0 && <p className="mt-6 text-center text-sm text-ink-mute">Geen heiligen gevonden. Probeer een andere spelling (bijv. „Johannes” in plaats van „Jan”).</p>}
        </div>
      </div>
    </section>
  );
}
