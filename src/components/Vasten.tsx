import { useMemo, useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useApp } from '../lib/context';
import { WEEKDAGEN_KORT, addDays, dagInfo, formatDag, formatDatum, formatKort, utc, weekRond, ymd } from '../lib/kalender';
import { telVastendagen, vastenPeriodes } from '../lib/overzicht';
import { LADDER, NIVEAUS } from '../lib/vasten';
import { SectionTitle, VastenBadge } from './ui';

const FAQ = [
  {
    v: 'Wat als een feest in een vastenperiode valt?',
    a: 'Dan wordt het vasten verzacht. Bij een groot feest (zoals de Annunciatie of de Transfiguratie) mag er vis gegeten worden; bij een polyeleosfeest wijn en olie. Op woensdag en vrijdag buiten de vastenperiodes heft een groot feest het vasten op tot een visdag. Alleen de Kruisverheffing blijft een vastendag.',
  },
  {
    v: 'Waarom woensdag én vrijdag?',
    a: 'De woensdag herinnert aan het verraad van Judas, de vrijdag aan de kruisiging. Beide dagen worden al sinds de eerste eeuwen gevast — het staat al in de Didachè. Vastenvrij zijn alleen de Lichte Week, de week na Pinksteren, de Kersttijd en de week na Tollenaar en Farizeeër.',
  },
  {
    v: 'Hoe streng moet ik het nemen?',
    a: 'De regels hier volgen het kloostertypikon in de gangbare parochiële toepassing. Zieken, zwangeren, kinderen, ouderen en reizigers vasten altijd in overleg met hun priester — barmhartigheid gaat boven de letter. Vasten zonder gebed en aalmoes is, naar het woord van de Vaders, slechts een dieet.',
  },
  {
    v: 'Wat is xerofagie?',
    a: 'Letterlijk „droog eten”: brood, rauwe of gedroogde groenten en fruit, noten, olijven en water — zonder olie of wijn, en oorspronkelijk één maaltijd na de Vespers. Het is de strikte norm van de Grote Vasten op maandag, woensdag en vrijdag.',
  },
];

export default function Vasten() {
  const { mode, vandaag, vandaagYmd, openDag } = useApp();
  const [jaar, setJaar] = useState(vandaag.getUTCFullYear());
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const periodes = useMemo(() => vastenPeriodes(jaar, mode), [jaar, mode]);
  const week = useMemo(() => weekRond(vandaag, mode, vandaagYmd), [vandaag, mode, vandaagYmd]);

  const aantalVastendagen = useMemo(() => {
    const dagen = [];
    let d = utc(jaar, 1, 1);
    while (d.getUTCFullYear() === jaar) {
      dagen.push(dagInfo(d, mode));
      d = addDays(d, 1);
    }
    return telVastendagen(dagen);
  }, [jaar, mode]);

  const vastenP = periodes.filter((p) => p.soort === 'vasten');
  const vrijP = periodes.filter((p) => p.soort === 'vrij');
  const dagP = periodes.filter((p) => p.soort === 'dag');

  return (
    <section id="vasten" className="parchment-pattern bg-parchment py-16 text-ink sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Vastenregels"
          title="Wat mag er op tafel?"
          intro={`De orthodoxe Kerk vast ongeveer de helft van het jaar: vier grote vastenperiodes, enkele strenge dagen en elke woensdag en vrijdag. In ${jaar} zijn dat op de ${mode === 'oud' ? 'oude' : 'nieuwe'} kalender ${aantalVastendagen} dagen met een voorschrift. Hieronder de ladder van het vasten, de periodes en het weekoverzicht.`}
        />

        {/* Deze week */}
        <div className="paper card-shadow mb-12 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-gold-deep uppercase">Deze week</p>
              <h3 className="font-display mt-1 text-2xl font-semibold text-ink">
                {formatKort(week[0].civil)} – {formatDatum(week[6].civil)}
              </h3>
            </div>
            <p className="text-xs text-ink-mute">Tik een dag voor het volledige dagdetail.</p>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
            {week.map((d) => {
              const n = NIVEAUS[d.vasten.niveau];
              return (
                <button
                  key={d.ymd}
                  type="button"
                  onClick={() => openDag(d.ymd)}
                  className={`rounded-xl border p-2 text-center transition hover:brightness-95 sm:p-3 ${d.isVandaag ? 'ring-2 ring-gold' : ''}`}
                  style={{ background: n.zacht, color: n.tekst, borderColor: `${n.kleur}55` }}
                >
                  <div className="text-[11px] font-bold tracking-wider uppercase">{WEEKDAGEN_KORT[d.weekdag]}</div>
                  <div className="font-display text-xl font-bold sm:text-2xl">{d.dag}</div>
                  <div className="mx-auto mt-1 h-1.5 w-8 rounded-full" style={{ background: n.kleur }} />
                  <div className="mt-1 hidden text-[11px] leading-tight font-bold sm:block">{n.kort}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ladder */}
        <div className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.28em] text-gold-deep uppercase">De ladder van het vasten</p>
          <h3 className="font-display mt-1 text-2xl font-semibold text-ink">Negen treden — van vrij tot volledige onthouding</h3>
          <p className="mt-2 max-w-3xl text-sm text-ink-soft">Niet elke vastendag is even streng. Hoe dichter bij Pascha, hoe scherper het vasten; hoe groter het feest, hoe meer ruimte.</p>
          <div className="thin-scroll mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-9">
            {LADDER.map((l, i) => (
              <div key={l.id} className="card-shadow rounded-xl border p-3" style={{ background: l.zacht, color: l.tekst, borderColor: `${l.kleur}55`, marginTop: `${i * 0.35}rem` }}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-bold">{i + 1}</span>
                  <span className="h-3 w-3 rounded-full" style={{ background: l.kleur }} />
                </div>
                <div className="mt-1 text-[13px] leading-snug font-bold">{l.label}</div>
                <div className="mt-1 text-xs leading-snug">{l.toegestaan}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Periodes */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.28em] text-gold-deep uppercase">De vier grote vasten</p>
            <h3 className="font-display mt-1 text-2xl font-semibold text-ink">Vastenperiodes in {jaar}</h3>
          </div>
          <div className="flex rounded-full border border-parchment-4 bg-white p-0.5 text-xs font-bold">
            {[vandaag.getUTCFullYear(), vandaag.getUTCFullYear() + 1].map((y) => (
              <button key={y} type="button" onClick={() => setJaar(y)} className={`rounded-full px-3 py-1.5 transition ${jaar === y ? 'bg-wine text-gold-light' : 'text-ink-soft hover:text-ink'}`}>
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {vastenP.map((p) => (
            <article key={p.id} className="paper card-shadow relative overflow-hidden rounded-2xl p-5 text-ink">
              <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: p.kleur }} />
              <div className="flex flex-wrap items-start justify-between gap-2 pl-2">
                <div>
                  <h4 className="font-display text-xl font-semibold">{p.naam}</h4>
                  <p className="mt-0.5 text-sm font-bold text-gold-deep">
                    {formatDag(p.start)} – {formatDatum(p.eind)} · {p.dagen} dagen
                  </p>
                </div>
                <button type="button" onClick={() => openDag(ymd(p.start))} className="rounded-full bg-parchment-3 px-3 py-1 text-[11px] font-bold text-gold-deep hover:bg-gold-pale">
                  Open begin
                </button>
              </div>
              <p className="mt-3 pl-2 text-sm leading-relaxed text-ink-soft">{p.omschrijving}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5 pl-2">
                {p.regels.map((r) => (
                  <li key={r} className="rounded-full bg-parchment-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                    {r}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card-shadow rounded-2xl border border-[#4a7c59]/40 bg-[#e3efe4] p-5">
            <h4 className="font-display text-xl font-semibold text-[#2c5138]">Vastenvrije weken</h4>
            <ul className="mt-3 space-y-2">
              {vrijP.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 text-sm">
                  <button type="button" onClick={() => openDag(ymd(p.start))} className="text-left font-semibold text-ink hover:text-wine">
                    {p.naam}
                  </button>
                  <span className="shrink-0 text-ink-soft">
                    {formatKort(p.start)} – {formatKort(p.eind)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-shadow rounded-2xl border border-[#7b1e1e]/40 bg-[#f1d6d6] p-5">
            <h4 className="font-display text-xl font-semibold text-[#4d1010]">Strenge losse vastendagen</h4>
            <ul className="mt-3 space-y-2">
              {dagP.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 text-sm">
                  <button type="button" onClick={() => openDag(ymd(p.start))} className="text-left font-semibold text-ink hover:text-wine">
                    {p.naam}
                  </button>
                  <span className="shrink-0 text-ink-soft">{formatDatum(p.start)}</span>
                </li>
              ))}
              <li className="flex items-start justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">Elke woensdag en vrijdag</span>
                <span className="shrink-0 text-ink-soft">buiten de vastenvrije weken</span>
              </li>
            </ul>
            <div className="mt-4">
              <VastenBadge regel={{ niveau: 'vastendag', label: 'Vastendag (wo/vr)', detail: '', periode: null }} />
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-[11px] font-bold tracking-[0.28em] text-gold-deep uppercase">Veelgestelde vragen</p>
            <h3 className="font-display mt-1 text-2xl font-semibold text-ink">Het vasten is een school, geen examen</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Het typikon is het kerkelijke boek van de orde: het zegt welke dienst wanneer wordt gehouden, welke heilige gevierd wordt en hoe streng er die dag gevast wordt. Wie de kalender leest, leest de tijd — niet in maanden, maar in het leven van Christus.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold-pale p-3 text-xs text-ink">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              De kalender is een leidsman, geen wetboek: volg voor het vasten het woord van uw geestelijke.
            </div>
          </div>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={item.v} className="paper card-shadow rounded-xl">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                  <span className="font-display text-lg font-semibold text-ink">{item.v}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-gold-deep transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-4 pb-4 text-sm leading-relaxed text-ink-soft">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
