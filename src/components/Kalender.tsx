import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { useApp } from '../lib/context';
import { MAANDEN, MAANDEN_KORT, WEEKDAGEN_KORT, hoofdletter, maandRooster } from '../lib/kalender';
import { HEILIGEN } from '../lib/heiligen';
import { LADDER, NIVEAUS } from '../lib/vasten';
import { SectionTitle } from './ui';

export default function Kalender() {
  const { mode, setMode, vandaag, vandaagYmd, openDag } = useApp();
  const [cur, setCur] = useState({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });

  const cellen = useMemo(() => maandRooster(cur.y, cur.m, mode, vandaagYmd), [cur, mode, vandaagYmd]);
  const inMaand = cellen.filter((c) => c.maand === cur.m);
  const aantalFeesten = inMaand.filter((c) => c.feesten.some((f) => f.groot || f.soort === 'pascha' || f.soort === 'feest')).length;
  const vastendagen = inMaand.filter((c) => !['geen', 'vrij'].includes(c.vasten.niveau)).length;

  const vorige = () => setCur((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }));
  const volgende = () => setCur((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }));
  const naarVandaag = () => setCur({ y: vandaag.getUTCFullYear(), m: vandaag.getUTCMonth() + 1 });

  return (
    <section id="kalender" className="parchment-pattern bg-parchment py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Maandkalender"
          title={`${hoofdletter(MAANDEN[cur.m - 1])} ${cur.y}`}
          intro={
            <>
              {aantalFeesten} feestdagen en {vastendagen} dagen met een vastenvoorschrift deze maand · {mode === 'oud' ? 'oude kalender (juliaans)' : 'nieuwe kalender'} · Tik een dag aan
              voor feest, heiligen, lezingen en vastenregel.
            </>
          }
        />

        {/* Uitleg oude/nieuwe kalender */}
        <div className="mb-8 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <button
            type="button"
            onClick={() => setMode('oud')}
            className={`rounded-xl border p-4 text-left transition ${mode === 'oud' ? 'border-gold bg-gold-pale/70' : 'border-parchment-3 bg-white/50 hover:border-gold/60'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.22em] text-gold-deep uppercase">Oude kalender · juliaans</span>
              {mode === 'oud' && <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[9px] font-bold text-bark uppercase">actief</span>}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              De vaste feesten vallen dertien dagen later dan op de burgerlijke kalender: Kerstmis op 7 januari, Theofanie op 19 januari. Gevolgd door de Russische, Servische, Georgische parochies en de Athos.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode('nieuw')}
            className={`rounded-xl border p-4 text-left transition ${mode === 'nieuw' ? 'border-gold bg-gold-pale/70' : 'border-parchment-3 bg-white/50 hover:border-gold/60'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.22em] text-gold-deep uppercase">Nieuwe kalender · gereviseerd juliaans</span>
              {mode === 'nieuw' && <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[9px] font-bold text-bark uppercase">actief</span>}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              De vaste feesten vallen op de burgerlijke datum: Kerstmis op 25 december. Gevolgd door de Griekse, Roemeense, Bulgaarse en Antiocheense parochies. Pascha wordt in beide gevallen volgens de Juliaanse paasregel berekend.
            </p>
          </button>
          <div className="flex items-center justify-center rounded-xl bg-bark p-4 text-center text-cream lg:w-44">
            <div>
              <Repeat className="mx-auto h-5 w-5 text-gold" />
              <p className="mt-2 text-xs leading-snug text-[#d9cbb0]">Wissel bovenaan of hier tussen de twee kalenders. Pascha blijft gelijk.</p>
            </div>
          </div>
        </div>

        <div className="paper card-shadow overflow-hidden rounded-2xl">
          {/* Werkbalk */}
          <div className="flex items-center justify-between gap-3 border-b border-parchment-3 bg-cream px-3 py-3 sm:px-5">
            <button type="button" onClick={vorige} className="inline-flex items-center gap-1 rounded-full border border-parchment-4 bg-white px-3 py-1.5 text-sm font-bold text-ink hover:border-gold" aria-label="Vorige maand">
              <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">{MAANDEN_KORT[(cur.m + 10) % 12]}</span>
            </button>
            <div className="flex items-center gap-2">
              <select
                value={cur.m}
                onChange={(e) => setCur((c) => ({ ...c, m: Number(e.target.value) }))}
                className="font-display rounded-md border border-parchment-4 bg-white px-2 py-1 text-lg font-semibold text-ink"
                aria-label="Maand"
              >
                {MAANDEN.map((mn, i) => (
                  <option key={mn} value={i + 1}>
                    {hoofdletter(mn)}
                  </option>
                ))}
              </select>
              <select
                value={cur.y}
                onChange={(e) => setCur((c) => ({ ...c, y: Number(e.target.value) }))}
                className="font-display rounded-md border border-parchment-4 bg-white px-2 py-1 text-lg font-semibold text-ink"
                aria-label="Jaar"
              >
                {Array.from({ length: 12 }, (_, i) => vandaag.getUTCFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button type="button" onClick={naarVandaag} className="rounded-full bg-gold px-3 py-1.5 text-xs font-bold tracking-wider text-bark uppercase hover:bg-gold-light">
                Vandaag
              </button>
            </div>
            <button type="button" onClick={volgende} className="inline-flex items-center gap-1 rounded-full border border-parchment-4 bg-white px-3 py-1.5 text-sm font-bold text-ink hover:border-gold" aria-label="Volgende maand">
              <span className="hidden sm:inline">{MAANDEN_KORT[cur.m % 12]}</span> <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekdagen */}
          <div className="grid grid-cols-7 border-b border-parchment-3 bg-parchment-2 text-center text-[10px] font-bold tracking-widest text-gold-deep uppercase sm:text-[11px]">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <div key={d} className={`py-2 ${d === 0 ? 'text-wine' : ''}`}>
                {WEEKDAGEN_KORT[d]}
              </div>
            ))}
          </div>

          {/* Cellen */}
          <div className="grid grid-cols-7">
            {cellen.map((c) => {
              const buiten = c.maand !== cur.m;
              const n = NIVEAUS[c.vasten.niveau];
              const feest = c.feesten[0];
              const heilige = HEILIGEN[c.kerkKey]?.[0];
              const groot = feest && (feest.groot || feest.soort === 'pascha');
              return (
                <button
                  key={c.ymd}
                  type="button"
                  onClick={() => openDag(c.ymd)}
                  className={`relative min-h-[72px] border-r border-b border-parchment-3 p-1 text-left align-top transition [&:nth-child(7n)]:border-r-0 sm:min-h-[112px] sm:p-2 ${
                    buiten ? 'bg-parchment-2/60 text-ink-mute' : 'bg-white/60 hover:bg-gold-pale/60'
                  } ${c.isVandaag ? 'ring-2 ring-gold ring-inset' : ''}`}
                  title="Open dagdetail"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold sm:h-7 sm:w-7 ${
                        c.isVandaag ? 'today-glow bg-gold text-bark' : c.isZondag && !buiten ? 'text-wine' : ''
                      }`}
                    >
                      {c.dag}
                    </span>
                    {mode === 'oud' && <span className="hidden text-[10px] text-ink-mute sm:block">{c.kerk.getUTCDate()} {MAANDEN_KORT[c.kerk.getUTCMonth()]}</span>}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {feest ? (
                      <div className={`line-clamp-2 text-[10px] leading-tight font-bold sm:text-[11px] ${groot ? 'text-wine' : 'text-ink'}`}>
                        {groot && <span className="mr-0.5 text-gold">✠</span>}
                        {feest.kort ?? feest.naam}
                      </div>
                    ) : heilige ? (
                      <div className="line-clamp-2 text-[10px] leading-tight text-ink-soft sm:text-[11px]">{heilige.naam}</div>
                    ) : null}
                  </div>
                  <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1 sm:inset-x-2 sm:bottom-2">
                    <span className="h-1.5 flex-1 rounded-full" style={{ background: c.vasten.niveau === 'geen' ? 'transparent' : n.kleur, opacity: buiten ? 0.35 : 1 }} />
                    <span className="hidden text-[9px] font-bold tracking-wider uppercase sm:block" style={{ color: n.tekst, opacity: buiten ? 0.5 : 1 }}>
                      {c.vasten.niveau === 'geen' ? '' : n.kort}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-parchment-3 bg-cream px-4 py-3 text-[11px] font-semibold text-ink-soft sm:px-5">
            <span className="text-[10px] font-bold tracking-widest text-gold-deep uppercase">Legenda</span>
            {LADDER.filter((l) => l.id !== 'geen').map((l) => (
              <span key={l.id} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.kleur }} /> {l.kort}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gold">✠</span> groot feest
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
