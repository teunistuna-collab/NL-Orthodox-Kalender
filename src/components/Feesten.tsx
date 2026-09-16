import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../lib/context';
import { DERTIEN, OVERIGE_VASTE } from '../lib/feesten';
import Modal from './Modal';
import { MAANDEN_KORT, daysBetween, formatDag, formatLang, formatMd, kerkDatum, ymd } from '../lib/kalender';
import { volgendeFeestDatum } from '../lib/overzicht';
import { FeestTag, SectionTitle } from './ui';

const ROMEINS = ['✱', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export default function Feesten() {
  const { mode, vandaag, openDag } = useApp();
  const [open, setOpen] = useState<string | null>(null);

  const lijst = useMemo(
    () =>
      DERTIEN.map((f, i) => {
        const datum = volgendeFeestDatum(f, vandaag, mode);
        return { f, i, datum, dagen: daysBetween(vandaag, datum) };
      }),
    [vandaag, mode],
  );

  const overige = useMemo(
    () =>
      OVERIGE_VASTE.filter((f) => (f.rang ?? 0) >= 3)
        .map((f) => {
          const datum = volgendeFeestDatum(f, vandaag, mode);
          return { f, datum, dagen: daysBetween(vandaag, datum) };
        })
        .sort((a, b) => a.dagen - b.dagen),
    [vandaag, mode],
  );

  return (
    <section id="feesten" className="parchment-pattern bg-parchment py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Twaalf grote feesten + Pascha"
          title="De grote feesten van het jaar"
          intro="Pascha staat boven alles — het Feest der feesten. Daaronder kent de Kerk twaalf grote feesten van de Heer en van de Moeder Gods: acht vóór Pascha en vier erna, samen het hele leven van Christus en Zijn Moeder. Tik een feest open voor uitleg, gebruiken en troparion."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lijst.map(({ f, i, datum, dagen }) => {
            const pascha = f.soort === 'pascha';
            return (
              <motion.article
                key={f.id}
                layout
                className={`card-shadow overflow-hidden rounded-2xl border ${pascha ? 'border-gold/60 bg-gradient-to-br from-wine to-wine-deep text-cream' : 'paper border-parchment-3 text-ink'}`}
              >
                <button type="button" onClick={() => setOpen(f.id)} className="flex w-full items-start gap-4 p-5 text-left">
                  <div className={`font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg font-bold ${pascha ? 'border-gold bg-gold text-bark' : 'border-gold/50 bg-gold-pale text-gold-deep'}`}>
                    {ROMEINS[i]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FeestTag feest={f} />
                      <span className={`text-[10px] font-bold tracking-wider uppercase ${pascha ? 'text-gold-light' : 'text-ink-mute'}`}>{f.offset !== undefined ? 'beweeglijk' : `vast · ${formatMd(f.md!)}`}</span>
                    </div>
                    <h3 className="font-display mt-1.5 text-xl leading-tight font-semibold">{f.naam}</h3>
                    <div className={`mt-2 text-sm ${pascha ? 'text-[#e6d9bd]' : 'text-ink-soft'}`}>
                      <span className="font-bold">{formatLang(datum)}</span>
                      {mode === 'oud' && f.md && <span className="text-ink-mute"> · kerkelijk {formatDag(kerkDatum(datum, mode))}</span>}
                      <span className={`ml-2 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${pascha ? 'bg-gold/20 text-gold-light' : 'bg-parchment-3 text-gold-deep'}`}>
                        {dagen === 0 ? 'vandaag' : dagen === 1 ? 'morgen' : `over ${dagen} dagen`}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`mt-1 h-5 w-5 shrink-0 ${pascha ? 'text-gold-light' : 'text-gold-deep'}`} />
                </button>
              </motion.article>
            );
          })}
        </div>

        <AnimatePresence>
          {open && (() => {
            const gekozen = lijst.find(({ f }) => f.id === open);
            if (!gekozen) return null;
            const { f, datum } = gekozen;
            return (
              <Modal open={Boolean(open)} onClose={() => setOpen(null)} eyebrow={formatLang(datum)} title={f.naam} maxWidth="max-w-2xl">
                  <div className="space-y-4 text-base leading-relaxed text-ink-soft">
                    <p>{f.toelichting}</p>
                    {f.traditie && <p><strong className="text-gold-deep">Gebruiken: </strong>{f.traditie}</p>}
                    {f.troparion && <blockquote className="font-display border-l-2 border-gold pl-3 text-xl italic text-ink">{f.troparion}<span className="mt-1 block text-xs font-bold tracking-wider text-gold-deep uppercase not-italic">Troparion</span></blockquote>}
                    <button type="button" onClick={() => openDag(ymd(datum))} className="text-sm font-bold text-gold-deep underline-offset-2 hover:underline">Open de dag in de kalender →</button>
                  </div>
              </Modal>
            );
          })()}
        </AnimatePresence>

        {/* Overige */}
        <div className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-gold-deep uppercase">Eerstvolgende gedachtenissen</p>
              <h3 className="font-display mt-1 text-2xl font-semibold">Overige feesten van heiligen en van de Moeder Gods</h3>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {overige.slice(0, 18).map(({ f, datum, dagen }) => (
              <button
                key={f.id}
                type="button"
                onClick={() => openDag(ymd(datum))}
                className="paper flex items-center gap-3 rounded-xl border border-parchment-3 px-4 py-3 text-left transition hover:border-gold"
              >
                <div className="font-display w-14 shrink-0 text-center leading-none">
                  <div className="text-2xl font-bold text-wine">{datum.getUTCDate()}</div>
                  <div className="text-[10px] font-bold tracking-wider text-gold-deep uppercase">{MAANDEN_KORT[datum.getUTCMonth()]}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink">{f.naam}</div>
                  <div className="text-[11px] text-ink-mute">
                    {dagen === 0 ? 'vandaag' : `over ${dagen} dagen`} · {f.soort === 'feest' ? 'feest' : 'gedachtenis'}
                    {f.md && mode === 'oud' && ` · kerkelijk ${formatMd(f.md)}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
