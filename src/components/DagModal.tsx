import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useApp } from '../lib/context';
import { addDays, dagInfo, formatDag, formatLang, parseYmd, ymd } from '../lib/kalender';
import { HEILIGEN } from '../lib/heiligen';
import { LEZINGEN_JAAR, lezingSoort, rangLabel, vertaalLeven, vertaalRef, vertaalTag } from '../lib/htc';
import { NIVEAUS } from '../lib/vasten';
import { FeestTag, VastenBadge } from './ui';

interface Props {
  ymd: string | null;
  onClose: () => void;
  onNavigate: (ymd: string) => void;
}

export default function DagModal({ ymd: geselecteerd, onClose, onNavigate }: Props) {
  const { mode, vandaagYmd, htc, openLezing } = useApp();
  const [origineel, setOrigineel] = useState(false);

  const dag = useMemo(() => (geselecteerd ? dagInfo(parseYmd(geselecteerd), mode, vandaagYmd) : null), [geselecteerd, mode, vandaagYmd]);

  useEffect(() => {
    if (!geselecteerd) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && dag) onNavigate(ymd(addDays(dag.civil, -1)));
      if (e.key === 'ArrowRight' && dag) onNavigate(ymd(addDays(dag.civil, 1)));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [geselecteerd, dag, onClose, onNavigate]);

  const curated = dag ? HEILIGEN[dag.kerkKey] ?? [] : [];
  const htcDag = dag ? htc?.[dag.kerkKey] : undefined;
  const lezingen = dag && dag.jaar === LEZINGEN_JAAR ? htc?.[dag.julianKey]?.r ?? [] : [];
  const niveau = dag ? NIVEAUS[dag.vasten.niveau] : null;

  return (
    <AnimatePresence>
      {dag && niveau && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-bark/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Dagdetail ${formatLang(dag.civil)}`}
            className="paper card-shadow thin-scroll max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kop */}
            <div className="relative overflow-hidden rounded-t-2xl bg-bark px-6 pt-6 pb-5 text-cream">
              <div className="orthodox-pattern absolute inset-0 opacity-70" />
              <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: niveau.kleur }} />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.28em] text-gold-light uppercase">
                    {formatLang(dag.civil)}
                    {mode === 'oud' && <span className="text-[#bfa982]"> · kerkelijk {formatDag(dag.kerk)}</span>}
                  </p>
                  <h2 className="font-display mt-2 text-2xl leading-tight font-semibold text-[#fbf3df] sm:text-3xl">
                    {dag.feesten[0]?.naam ?? (curated[0] ? `H. ${curated[0].naam}` : htcDag?.l[0] ? vertaalLeven(htcDag.l[0][1]).replace(/\.$/, '') : 'Dag door het jaar')}
                  </h2>
                  <p className="mt-2 text-sm text-[#d9cbb0]">
                    {dag.seizoen}
                    {dag.toon && <span> · Toon {dag.toon}</span>}
                    {dag.isVandaag && <span className="ml-2 rounded-sm bg-gold px-1.5 py-0.5 text-[10px] font-bold text-bark uppercase">Vandaag</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, -1)))} className="rounded-full p-2 text-gold-light hover:bg-white/10" aria-label="Vorige dag">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => onNavigate(ymd(addDays(dag.civil, 1)))} className="rounded-full p-2 text-gold-light hover:bg-white/10" aria-label="Volgende dag">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={onClose} className="ml-1 rounded-full p-2 text-cream hover:bg-white/10" aria-label="Sluiten">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-7 px-6 py-6">
              {/* Vasten */}
              <div className="rounded-xl p-4" style={{ background: niveau.zacht, border: `1px solid ${niveau.kleur}33` }}>
                <div className="flex flex-wrap items-center gap-3">
                  <VastenBadge regel={dag.vasten} size="lg" />
                  <span className="text-sm font-semibold" style={{ color: niveau.tekst }}>
                    {niveau.toegestaan}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: niveau.tekst }}>
                  {dag.vasten.detail}
                </p>
              </div>

              {/* Feesten */}
              {dag.feesten.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">Feesten & gedachtenissen</h3>
                  <ul className="mt-3 space-y-3">
                    {dag.feesten.map((f) => (
                      <li key={f.id} className="rounded-lg border border-parchment-3 bg-white/60 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-xl font-semibold">{f.naam}</span>
                          <FeestTag feest={f} />
                        </div>
                        {f.toelichting && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.toelichting}</p>}
                        {f.traditie && <p className="mt-2 text-sm leading-relaxed text-ink-soft"><span className="font-bold text-gold-deep">Gebruik: </span>{f.traditie}</p>}
                        {f.troparion && (
                          <blockquote className="font-display mt-3 border-l-2 border-gold pl-3 text-[17px] leading-relaxed text-ink italic">
                            {f.troparion}
                            <span className="mt-1 block text-xs font-bold tracking-wider text-gold-deep uppercase not-italic">Troparion</span>
                          </blockquote>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Heiligen */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">Heiligen van de dag</h3>
                  {htcDag && (
                    <button type="button" onClick={() => setOrigineel((v) => !v)} className="text-[11px] font-bold text-gold-deep underline-offset-2 hover:underline">
                      {origineel ? 'Nederlands' : 'Origineel (EN)'}
                    </button>
                  )}
                </div>
                {curated.length > 0 && (
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {curated.map((h) => (
                      <li key={h.naam} className="rounded-lg bg-parchment-2 p-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-lg font-semibold">{h.naam}</span>
                          {h.nl && <span className="rounded-sm bg-wine px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gold-light uppercase">Lage Landen</span>}
                        </div>
                        <div className="text-xs font-semibold text-gold-deep">{h.titel}</div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{h.kort}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {htcDag ? (
                  <ul className="mt-3 space-y-1.5 text-sm leading-snug">
                    {htcDag.l.map(([icon, tekst], i) => {
                      const r = rangLabel(icon);
                      return (
                        <li key={i} className="flex gap-2">
                          <span className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${r && r.rang >= 4 ? 'bg-gold' : 'bg-parchment-4'}`} />
                          <span className={r && r.rang >= 5 ? 'font-semibold' : ''}>
                            {origineel ? tekst : vertaalLeven(tekst)}
                            {r && <span className="ml-1.5 text-[10px] font-bold tracking-wider text-gold-deep uppercase">{r.label}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink-mute">{htc ? 'Geen gegevens voor deze dag.' : 'Heiligen worden geladen…'}</p>
                )}
                <p className="mt-2 text-[11px] text-ink-mute">Bron: holytrinityorthodox.com · kerkelijke datum {formatDag(dag.kerk)} · vertaling automatisch</p>
              </div>

              {/* Lezingen */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">
                  <BookOpenText className="h-3.5 w-3.5" /> Schriftlezingen
                </h3>
                {lezingen.length > 0 ? (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {lezingen.map((l, i) => {
                      const refNl = vertaalRef(l.ref);
                      const soort = lezingSoort(refNl);
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => openLezing({ ref: l.ref, tag: l.tag, julianKey: dag.julianKey, civil: dag.civil })}
                            className="flex w-full items-center justify-between gap-3 rounded-lg border border-parchment-3 bg-white/70 px-3 py-2 text-left transition hover:border-gold hover:bg-gold-pale"
                          >
                            <span>
                              <span className="block text-[10px] font-bold tracking-wider text-gold-deep uppercase">{vertaalTag(l.tag, refNl)}</span>
                              <span className="font-display text-lg font-semibold">{refNl}</span>
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
                    {dag.jaar === LEZINGEN_JAAR ? (htc ? 'Geen lezingen gevonden voor deze dag.' : 'Lezingen worden geladen…') : `Het leesrooster is beschikbaar voor het kerkjaar ${LEZINGEN_JAAR}.`}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
