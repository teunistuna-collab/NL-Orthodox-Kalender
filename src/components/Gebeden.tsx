import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Copy, Maximize2, X } from 'lucide-react';
import { GEBEDEN, type Gebed } from '../lib/gebeden';
import { SectionTitle } from './ui';

const CATS: { id: Gebed['categorie'] | 'alle'; label: string }[] = [
  { id: 'alle', label: 'Alle gebeden' },
  { id: 'ochtend', label: 'Morgengebeden' },
  { id: 'avond', label: 'Voor het slapengaan' },
  { id: 'dagelijks', label: 'Dagelijks' },
  { id: 'liturgisch', label: 'Liturgisch' },
  { id: 'akathisten', label: 'Akathisten' },
];

const CAT_LABEL: Record<Gebed['categorie'], string> = {
  ochtend: 'Morgengebeden',
  avond: 'Voor het slapengaan',
  dagelijks: 'Dagelijks',
  liturgisch: 'Liturgisch',
  vasten: 'Vasten',
  pascha: 'Pascha',
  akathisten: 'Akathisten',
};

function KopieerKnop({ g, donker }: { g: Gebed; donker?: boolean }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  const kopieer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${g.titel}\n\n${g.tekst}`);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 1600);
    } catch {
      /* geen klembord */
    }
  };
  return (
    <button
      type="button"
      onClick={kopieer}
      className={`shrink-0 rounded-full border p-2 transition ${donker ? 'border-gold/40 text-gold-light hover:bg-white/10' : 'border-parchment-4 text-gold-deep hover:border-gold hover:bg-gold-pale'}`}
      title="Kopieer gebed"
      aria-label="Kopieer gebed"
    >
      {gekopieerd ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

/** Compacte kaart: titel, rubriek en de eerste regels. */
function GebedKaart({ g, onOpen }: { g: Gebed; onOpen: () => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      className="paper card-shadow group flex cursor-pointer flex-col rounded-2xl border border-transparent p-5 text-ink transition hover:-translate-y-0.5 hover:border-gold"
      title="Tik om het gebed groot te lezen"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold tracking-[0.22em] text-gold-deep uppercase">{g.wanneer}</p>
          <h3 className="font-display mt-1 text-xl leading-tight font-semibold">{g.titel}</h3>
        </div>
        <KopieerKnop g={g} />
      </div>
      <div className="gold-rule my-3" />
      <div className="mt-4 flex items-center justify-end text-[11px] font-bold text-gold-deep">
        <span className="inline-flex items-center gap-1 group-hover:underline">
          <Maximize2 className="h-3.5 w-3.5" /> Groot lezen
        </span>
      </div>
    </article>
  );
}

/** Groot leesvenster met bladeren tussen gebeden. */
function GebedVenster({ lijst, index, onClose, onIndex }: { lijst: Gebed[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const g = index !== null ? lijst[index] : null;

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
      if (e.key === 'ArrowRight' && index < lijst.length - 1) onIndex(index + 1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, lijst.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {g && index !== null && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-end justify-center bg-bark/75 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={g.titel}
            className="paper card-shadow thin-scroll max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-t-2xl bg-bark px-6 pt-6 pb-5 text-cream">
              <div className="orthodox-pattern absolute inset-0 opacity-70" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.28em] text-gold-light uppercase">
                    {CAT_LABEL[g.categorie]} · {g.wanneer}
                  </p>
                  <h2 className="font-display mt-2 text-2xl leading-tight font-semibold text-[#fbf3df] sm:text-3xl">{g.titel}</h2>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <KopieerKnop g={g} donker />
                  <button type="button" onClick={onClose} className="ml-1 rounded-full p-2 text-cream hover:bg-white/10" aria-label="Sluiten">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-7 sm:px-10 sm:py-9">
              {g.rubriek && <p className="mb-5 text-[15px] leading-relaxed text-ink-soft italic">{g.rubriek}</p>}
              <p className="font-display text-[21px] leading-[1.7] whitespace-pre-line text-ink sm:text-[23px]">{g.tekst}</p>
              <div className="gold-rule mt-8" />
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onIndex(index - 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-parchment-4 px-3 py-1.5 font-bold text-gold-deep disabled:opacity-30 hover:border-gold"
                >
                  <ChevronLeft className="h-4 w-4" /> Vorige
                </button>
                <span className="text-xs text-ink-mute">
                  {index + 1} / {lijst.length}
                </span>
                <button
                  type="button"
                  disabled={index === lijst.length - 1}
                  onClick={() => onIndex(index + 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-parchment-4 px-3 py-1.5 font-bold text-gold-deep disabled:opacity-30 hover:border-gold"
                >
                  Volgende <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Gebeden() {
  const [cat, setCat] = useState<(typeof CATS)[number]['id']>('alle');
  const [open, setOpen] = useState<number | null>(null);
  const lijst = GEBEDEN.filter((g) => cat === 'alle' || g.categorie === cat);

  return (
    <section id="gebeden" className="parchment-pattern bg-parchment py-16 text-ink sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Gebedenboek"
          title="Gebeden in het Nederlands"
          intro="Morgengebeden, gebeden voor het slapengaan en gebeden door de dag, naar het Orthodox Gebedenboek volgens de Russische traditie. Tik een gebed aan om het groot te lezen; met de pijltjestoetsen bladert u verder."
        />
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCat(c.id);
                setOpen(null);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition ${cat === c.id ? 'bg-gold text-bark' : 'border border-gold/40 text-gold-deep hover:bg-gold/10'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lijst.map((g, i) => (
            <GebedKaart key={g.id} g={g} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>
      <GebedVenster lijst={lijst} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
