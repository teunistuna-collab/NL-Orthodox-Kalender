import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenText, ChevronDown, ExternalLink, X } from 'lucide-react';
import type { LezingKeuze } from '../lib/context';
import { laadLezingen, lezingSoort, nbv21Url, vertaalRef, vertaalTag, type HtcLezing } from '../lib/htc';
import { formatLang } from '../lib/kalender';

interface Props {
  keuze: LezingKeuze | null;
  onClose: () => void;
}

export default function LezingModal({ keuze, onClose }: Props) {
  const [lezing, setLezing] = useState<HtcLezing | null>(null);
  const [status, setStatus] = useState<'laden' | 'ok' | 'fout'>('laden');
  const [toonEngels, setToonEngels] = useState(false);

  useEffect(() => {
    if (!keuze) return;
    setStatus('laden');
    setLezing(null);
    setToonEngels(false);
    const julMaand = Number(keuze.julianKey.split('-')[0]);
    let actief = true;
    laadLezingen(julMaand)
      .then((data) => {
        if (!actief) return;
        const lijst = data[keuze.julianKey] ?? [];
        const gevonden = lijst.find((l) => l.ref === keuze.ref && l.tag === keuze.tag) ?? lijst.find((l) => l.ref === keuze.ref) ?? null;
        setLezing(gevonden);
        setStatus(gevonden ? 'ok' : 'fout');
      })
      .catch(() => actief && setStatus('fout'));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      actief = false;
      window.removeEventListener('keydown', onKey);
    };
  }, [keuze, onClose]);

  const refNl = keuze ? vertaalRef(keuze.ref) : '';
  const soort = keuze ? lezingSoort(refNl) : 'apostel';
  const nbv = keuze ? nbv21Url(keuze.ref) : null;

  return (
    <AnimatePresence>
      {keuze && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-bark/75 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="paper card-shadow thin-scroll max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`relative rounded-t-2xl px-6 pt-6 pb-5 ${soort === 'evangelie' ? 'bg-wine text-cream' : 'bg-bark text-cream'}`}>
              <div className="orthodox-pattern absolute inset-0 opacity-60" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.28em] text-gold-light uppercase">
                    {vertaalTag(keuze.tag, refNl)} · {formatLang(keuze.civil)}
                  </p>
                  <h2 className="font-display mt-2 text-3xl font-semibold text-[#fbf3df]">{refNl}</h2>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2 text-cream hover:bg-white/10" aria-label="Sluiten">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-6">
              {/* NBV21 */}
              <div className="rounded-xl border border-gold/40 bg-gold-pale/60 p-5">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">
                  <BookOpenText className="h-4 w-4" /> Lezen in de NBV21
                </div>
                <p className="font-display mt-2 text-2xl font-semibold text-ink">{refNl}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  De Nederlandse tekst wordt geopend in de Nieuwe Bijbelvertaling 2021 op debijbel.nl (Nederlands-Vlaams Bijbelgenootschap).
                </p>
                {nbv ? (
                  <a
                    href={nbv}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-gold-light transition hover:bg-wine-deep"
                  >
                    Open {refNl} in de NBV21 <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-ink-mute">Voor dit bijbelboek is geen NBV21-verwijzing beschikbaar.</p>
                )}
              </div>

              {/* Engelse tekst als reserve */}
              <button
                type="button"
                onClick={() => setToonEngels((v) => !v)}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-ink-mute underline-offset-2 hover:text-gold-deep hover:underline"
              >
                {toonEngels ? 'Engelse tekst verbergen' : 'Engelse tekst tonen (NKJV)'} <ChevronDown className={`h-3.5 w-3.5 transition ${toonEngels ? 'rotate-180' : ''}`} />
              </button>
              {toonEngels && (
                <div className="mt-3">
                  {status === 'laden' && <p className="text-sm text-ink-mute">Lezing wordt geladen…</p>}
                  {status === 'fout' && <p className="text-sm text-ink-mute">De tekst van deze lezing kon niet worden geladen.</p>}
                  {lezing && (
                    <>
                      <div className="font-display text-[17px] leading-[1.7] text-ink">
                        {lezing.verses.map((v, i) => (
                          <span key={i}>
                            <sup className="mr-1 text-[11px] font-bold text-gold-deep">{v.num}</sup>
                            {v.text}{' '}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-[11px] leading-relaxed text-ink-mute">Engelse tekst (NKJV) naar het leesrooster van holytrinityorthodox.com, Juliaanse kalender.</p>
                      {lezing.url && (
                        <a href={lezing.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-gold-deep hover:underline">
                          Bron openen <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
