import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, Maximize2 } from 'lucide-react';
import { GEBEDEN, type Gebed } from '../lib/gebeden';
import { SectionTitle } from './ui';
import Modal from './Modal';

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

  if (!g || index === null) return null;

  return (
    <Modal open={Boolean(g && index !== null)} onClose={onClose} eyebrow={g ? `${CAT_LABEL[g.categorie]} · ${g.wanneer}` : undefined} title={g?.titel ?? ''} centerTitle maxWidth="max-w-3xl" actions={g ? <KopieerKnop g={g} donker /> : undefined}>
            <div className="px-0 py-1 sm:px-2 sm:py-2">
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
    </Modal>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lijst.map((g, i) => (
            <GebedKaart key={g.id} g={g} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>
      <GebedVenster lijst={lijst} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
