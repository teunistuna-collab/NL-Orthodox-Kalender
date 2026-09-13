import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpenText, CalendarDays, ChevronDown, Flame, Sparkles, Utensils } from 'lucide-react';
import { useApp } from '../lib/context';
import { dagInfo, daysBetween, formatDag, formatDatum, formatLang, hoofdletter, volgendePascha } from '../lib/kalender';
import { HEILIGEN } from '../lib/heiligen';
import { LEZINGEN_JAAR, lezingSoort, rangLabel, vertaalLeven, vertaalRef, vertaalTag } from '../lib/htc';
import { komendeFeesten } from '../lib/overzicht';
import { NIVEAUS } from '../lib/vasten';

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as const } }),
};

function Kaars({ h = 'h-14' }: { h?: string }) {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <div className="flame h-4 w-2.5 rounded-full bg-gradient-to-t from-[#ff9a1f] via-[#ffd36b] to-white shadow-[0_0_18px_6px_rgba(255,190,80,0.45)]" />
      <div className="h-1 w-1 rounded-full bg-[#3a2410]" />
      <div className={`${h} w-2 rounded-b-sm bg-gradient-to-b from-[#f4e4b8] to-[#d9c48c]`} />
    </div>
  );
}

export default function Vandaag() {
  const { mode, vandaag, vandaagYmd, htc, htcFout, openDag, openLezing } = useApp();
  const [alleHeiligen, setAlleHeiligen] = useState(false);
  const [origineel, setOrigineel] = useState(false);

  const dag = useMemo(() => dagInfo(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);
  const pascha = useMemo(() => volgendePascha(vandaag), [vandaag]);
  const totPascha = daysBetween(vandaag, pascha);
  const komend = useMemo(() => komendeFeesten(vandaag, mode, 3), [vandaag, mode]);

  const curated = HEILIGEN[dag.kerkKey] ?? [];
  const htcDag = htc?.[dag.kerkKey];
  const lezingen = vandaag.getUTCFullYear() === LEZINGEN_JAAR ? htc?.[dag.julianKey]?.r ?? [] : [];

  const hoofdFeest = dag.feesten[0];
  const titel = hoofdFeest ? hoofdFeest.naam : curated[0] ? `H. ${curated[0].naam}` : htcDag?.l[0] ? vertaalLeven(htcDag.l[0][1]).replace(/\.$/, '') : `${hoofdletter(dag.weekdagNaam)} door het jaar`;
  const niveau = NIVEAUS[dag.vasten.niveau];

  const lijst = htcDag?.l ?? [];
  const getoond = alleHeiligen ? lijst : lijst.slice(0, 2);

  return (
    <section id="vandaag" className="relative overflow-hidden bg-bark text-cream">
      <div className="absolute inset-0">
        <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-bark/70 via-bark/80 to-bark" />
        <div className="absolute inset-0 bg-gradient-to-r from-bark/90 via-bark/40 to-transparent" />
        <div className="orthodox-pattern absolute inset-0 opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-1 lg:gap-8">
          {/* Links */}
          <div className="lg:contents">
            <motion.p variants={fade} initial="hidden" animate="show" custom={0} className="text-[11px] font-bold tracking-[0.3em] text-gold-light uppercase">
              Vandaag · {formatLang(vandaag)}
              {mode === 'oud' && <span className="text-[#bfa982]"> · kerkelijk {formatDag(dag.kerk)}</span>}
            </motion.p>

            <motion.h1 variants={fade} initial="hidden" animate="show" custom={1} className="font-display mt-4 text-4xl leading-[1.05] font-semibold text-[#fbf3df] sm:text-5xl lg:text-6xl">
              {titel}
            </motion.h1>

            <motion.div variants={fade} initial="hidden" animate="show" custom={2} className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#d9cbb0]">
              <span>{dag.seizoen}</span>
              {dag.toon && (
                <>
                  <span className="text-gold">·</span>
                  <span>Toon {dag.toon}</span>
                </>
              )}
              {dag.feesten.length > 1 && (
                <>
                  <span className="text-gold">·</span>
                  <span>{dag.feesten.slice(1, 3).map((f) => f.kort ?? f.naam).join(' · ')}</span>
                </>
              )}
            </motion.div>

            <motion.div variants={fade} initial="hidden" animate="show" custom={3} className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#d9cbb0]">
              <Utensils className="h-4 w-4 text-gold-light" />
              <span className="font-bold text-[#f0cf7b]">Wat mag er vandaag op tafel?</span>
              <span className="text-gold">·</span>
              <span>{niveau.toegestaan}</span>
              <span className="text-[#bfa982]">{dag.vasten.detail}</span>
            </motion.div>

            <motion.div variants={fade} initial="hidden" animate="show" custom={4} className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openDag(dag.ymd)}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-bark transition hover:bg-gold-light"
              >
                Open dagdetail <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#kalender"
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-sm font-bold text-gold-light transition hover:bg-gold/10"
              >
                <CalendarDays className="h-4 w-4" /> Naar de kalender
              </a>
            </motion.div>

            <motion.div variants={fade} initial="hidden" animate="show" custom={5} className="mt-10 grid gap-4 sm:grid-cols-3 lg:order-3">
              <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-wine/70 to-bark-2/80 p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-gold-light uppercase">
                  <Flame className="h-3.5 w-3.5" /> Aftellen tot Pascha
                </div>
                <div className="font-display mt-2 text-4xl font-semibold text-[#fbf3df]">
                  {totPascha === 0 ? 'Vandaag!' : totPascha}
                  {totPascha > 0 && <span className="ml-2 text-base font-normal text-[#d9cbb0]">{totPascha === 1 ? 'dag' : 'dagen'}</span>}
                </div>
                <div className="mt-1 text-xs text-[#d9cbb0]">{formatDatum(pascha)}</div>
              </div>
              {komend.slice(0, 2).map(({ feest, datum, dagen }) => (
                <div key={feest.id} className="rounded-xl border border-gold/20 bg-bark-2/70 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-gold-light uppercase">
                    <Sparkles className="h-3.5 w-3.5" /> {dagen === 0 ? 'Vandaag' : dagen === 1 ? 'Morgen' : `Over ${dagen} dagen`}
                  </div>
                  <div className="font-display mt-2 text-xl leading-tight font-semibold text-[#fbf3df]">{feest.kort ?? feest.naam}</div>
                  <div className="mt-1 text-xs text-[#d9cbb0]">{formatLang(datum)}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Rechts */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }} className="relative lg:order-2">
            <div className="absolute -top-6 right-8 flex items-end gap-3">
              <Kaars h="h-10" />
              <Kaars h="h-14" />
              <Kaars h="h-8" />
            </div>
            <div className="paper card-shadow gold-frame rounded-2xl p-5 pt-12 text-ink sm:p-6 sm:pt-12">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">Heiligen van de dag</h2>
                <span className="rounded-full bg-parchment-3 px-2.5 py-1 text-[10px] font-bold tracking-widest text-gold-deep uppercase">
                  {mode === 'oud' ? 'oude kalender' : 'nieuwe kalender'}
                </span>
              </div>
              <div className="gold-rule mt-2" />

              {curated.length > 0 && (
                <ul className="mt-2.5 space-y-1">
                  {curated.slice(0, 2).map((h) => (
                    <li key={h.naam} className="flex items-baseline gap-2 rounded-md bg-parchment-2 px-2.5 py-1.5">
                      <span className="font-display shrink-0 text-[15px] font-semibold">{h.naam}</span>
                      <span className="min-w-0 truncate text-[11px] text-gold-deep">{h.titel}</span>
                      {h.nl && <span className="shrink-0 rounded-sm bg-wine px-1 py-0.5 text-[8px] font-bold tracking-wider text-gold-light uppercase">NL</span>}
                    </li>
                  ))}
                </ul>
              )}

              {!htc && !htcFout && <p className="mt-2 text-xs text-ink-mute">Heiligen worden geladen…</p>}
              {htcFout && <p className="mt-2 text-xs text-ink-mute">Het menologion kon niet worden geladen.</p>}
              {lijst.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-[12px] leading-snug text-ink-soft">
                  {getoond.map(([icon, tekst], i) => {
                    const r = rangLabel(icon);
                    return (
                      <li key={i} className="flex gap-2">
                        <span className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${r && r.rang >= 4 ? 'bg-gold' : 'bg-parchment-4'}`} />
                        <span className={`${r && r.rang >= 5 ? 'font-semibold text-ink' : ''} ${alleHeiligen ? '' : 'line-clamp-1'}`}>{origineel ? tekst : vertaalLeven(tekst)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {lijst.length > 0 && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-bold text-gold-deep">
                  {lijst.length > 2 ? (
                    <button type="button" onClick={() => setAlleHeiligen((v) => !v)} className="inline-flex items-center gap-1">
                      {alleHeiligen ? 'Minder tonen' : `Alle ${lijst.length} gedachtenissen`} <ChevronDown className={`h-3.5 w-3.5 transition ${alleHeiligen ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="button" onClick={() => setOrigineel((v) => !v)} className="text-ink-mute underline-offset-2 hover:underline">
                    {origineel ? 'NL' : 'EN'}
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <BookOpenText className="h-4 w-4 text-gold-deep" />
                <h3 className="font-display text-lg font-semibold">Lezingen van de dag</h3>
              </div>
              {lezingen.length > 0 ? (
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {lezingen.map((l, i) => {
                    const refNl = vertaalRef(l.ref);
                    const soort = lezingSoort(refNl);
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: vandaag })}
                          className="flex w-full items-center justify-between gap-2 rounded-lg border border-parchment-3 bg-white/70 px-2.5 py-1.5 text-left transition hover:border-gold hover:bg-gold-pale"
                          title="Tik om de volledige lezing te lezen"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[9px] font-bold tracking-wider text-gold-deep uppercase">{vertaalTag(l.tag, refNl)}</span>
                            <span className="font-display block truncate text-base font-semibold">{refNl}</span>
                          </span>
                          <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${soort === 'evangelie' ? 'bg-wine text-gold-light' : soort === 'oud' ? 'bg-parchment-3 text-ink' : 'bg-gold-pale text-gold-deep'}`}>
                            {soort === 'evangelie' ? 'Evangelie' : soort === 'oud' ? 'OT' : 'Apostel'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-mute">
                  {vandaag.getUTCFullYear() === LEZINGEN_JAAR ? 'Lezingen worden geladen…' : `Het leesrooster is beschikbaar voor het kerkjaar ${LEZINGEN_JAAR}. Raadpleeg het rooster van uw parochie.`}
                </p>
              )}
              <p className="mt-2 text-[10px] leading-relaxed text-ink-mute">Leesrooster volgens de Juliaanse kalender (holytrinityorthodox.com); tekst in de NBV21 via debijbel.nl. In de kerkdienst geldt het rooster van uw parochie.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
