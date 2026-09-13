import { useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '../lib/context';
import { PAASCYCLUS } from '../lib/feesten';
import { addDays, daysBetween, formatDatum, formatKort, formatLang, orthodoxPascha, volgendePascha, westersPasen, ymd } from '../lib/kalender';
import { FeestTag, SectionTitle } from './ui';

export default function Pascha() {
  const { vandaag, openDag } = useApp();
  const startJaar = vandaag.getUTCFullYear();
  const [gekozen, setGekozen] = useState(volgendePascha(vandaag).getUTCFullYear());

  const rijen = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const y = startJaar + i;
        const p = orthodoxPascha(y);
        const w = westersPasen(y);
        return { y, p, w, verschil: daysBetween(w, p), schoneMaandag: addDays(p, -48), hemelvaart: addDays(p, 39), pinksteren: addDays(p, 49) };
      }),
    [startJaar],
  );

  const volgende = volgendePascha(vandaag);
  const tot = daysBetween(vandaag, volgende);
  const pGekozen = orthodoxPascha(gekozen);

  return (
    <section id="pascha" className="parchment-pattern bg-parchment py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Het Feest der feesten"
          title={`Pascha-data ${startJaar} – ${startJaar + 9}`}
          intro="Berekend met de orthodoxe paasregel van Nicea (325): de eerste zondag na de eerste volle maan na de lente-evening, gerekend op de Juliaanse kalender en hier weergegeven in burgerlijke data. Pascha valt voor oude en nieuwe kalender op dezelfde dag. Tik een jaar aan voor de volledige Paascyclus."
        />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          {/* Tabel */}
          <div className="paper card-shadow overflow-hidden rounded-2xl">
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bark text-[10px] font-bold tracking-widest text-gold-light uppercase">
                  <tr>
                    <th className="px-4 py-3">Jaar</th>
                    <th className="px-4 py-3">Orthodox Pascha</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Westers Pasen</th>
                    <th className="hidden px-4 py-3 md:table-cell">Schone Maandag</th>
                    <th className="hidden px-4 py-3 md:table-cell">Pinksteren</th>
                  </tr>
                </thead>
                <tbody>
                  {rijen.map((r) => {
                    const actief = r.y === gekozen;
                    const voorbij = r.p.getTime() < vandaag.getTime();
                    return (
                      <tr
                        key={r.y}
                        onClick={() => setGekozen(r.y)}
                        className={`cursor-pointer border-b border-parchment-3 transition ${actief ? 'bg-gold-pale' : 'hover:bg-parchment-2'} ${voorbij ? 'text-ink-mute' : ''}`}
                      >
                        <td className="font-display px-4 py-3 text-xl font-bold text-wine">{r.y}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={(e) => { e.stopPropagation(); openDag(ymd(r.p)); }} className="font-bold text-ink underline-offset-2 hover:underline">
                            {formatDatum(r.p)}
                          </button>
                          {r.y === volgende.getUTCFullYear() && <span className="ml-2 rounded-sm bg-wine px-1.5 py-0.5 text-[10px] font-bold text-gold-light uppercase">volgende</span>}
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          {formatKort(r.w)}
                          <span className="ml-1.5 text-[11px] text-ink-mute">{r.verschil === 0 ? '(zelfde dag)' : `(+${r.verschil / 7} wk)`}</span>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">{formatKort(r.schoneMaandag)}</td>
                        <td className="hidden px-4 py-3 md:table-cell">{formatKort(r.pinksteren)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 border-t border-parchment-3 bg-cream p-5 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
              <div>
                <h4 className="font-display text-lg font-semibold text-ink">Waarom valt Pascha elk jaar anders?</h4>
                <p className="mt-1">
                  Pascha wordt gevierd op de eerste zondag na de eerste volle maan na de lente-evening. De Orthodoxe Kerk rekent daarbij met de Juliaanse kalender en de kerkelijke maancyclus van het oude Alexandrië — en altijd ná het Joodse Pesach. Daardoor valt het orthodoxe Pascha meestal één tot vijf weken later dan het westerse Pasen, en soms op dezelfde dag.
                </p>
              </div>
              <div>
                <h4 className="font-display text-lg font-semibold text-ink">Alles hangt aan één zondag</h4>
                <p className="mt-1">
                  Pascha bepaalt het Triodion, de Grote Vasten, de Heilige Week, Hemelvaart, Pinksteren en de Apostelvasten — en zelfs de toon van de week en de zondagsevangeliën van het hele jaar. Wie de Paasdatum kent, kent het jaar.
                </p>
              </div>
            </div>
          </div>

          {/* Cyclus */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-wine via-wine-deep to-bark p-6 text-cream">
              <div className="orthodox-pattern absolute inset-0 opacity-60" />
              <div className="relative">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-gold-light uppercase">
                  <Flame className="h-4 w-4 flame" /> Aftellen tot Pascha {volgende.getUTCFullYear()}
                </div>
                <div className="font-display mt-2 text-6xl font-semibold text-[#fbf3df]">{tot === 0 ? '✠' : tot}</div>
                <div className="text-sm text-[#e6d9bd]">{tot === 0 ? 'Christus is opgestaan!' : `${tot === 1 ? 'dag' : 'dagen'} · ${formatLang(volgende)}`}</div>
                <p className="font-display mt-4 text-lg leading-snug text-[#fbf3df] italic">
                  „Christus is opgestaan uit de doden, door Zijn dood heeft Hij de dood vertreden, en aan hen in de graven heeft Hij het leven geschonken.”
                </p>
              </div>
            </div>

            <div className="paper card-shadow rounded-2xl p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl font-semibold">Paascyclus {gekozen}</h3>
                <span className="text-xs font-bold text-gold-deep">Pascha {formatDatum(pGekozen)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-mute">Alles wat van de Paasdatum afhangt, in volgorde. Tik een regel aan om de dag te openen.</p>
              <ol className="thin-scroll mt-4 max-h-[520px] space-y-1 overflow-y-auto pr-1">
                {PAASCYCLUS.map((f) => {
                  const d = addDays(pGekozen, f.offset ?? 0);
                  const isPascha = f.soort === 'pascha';
                  const voorbij = d.getTime() < vandaag.getTime();
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => openDag(ymd(d))}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-gold-pale ${isPascha ? 'bg-wine text-gold-light hover:bg-wine' : ''} ${voorbij && !isPascha ? 'text-ink-mute' : ''}`}
                      >
                        <span className={`w-14 shrink-0 text-xs font-bold ${isPascha ? 'text-gold-light' : 'text-gold-deep'}`}>{formatKort(d)}</span>
                        <span className={`flex-1 text-sm ${isPascha || f.groot ? 'font-bold' : ''}`}>{f.kort ?? f.naam}</span>
                        {(f.groot || isPascha) && <FeestTag feest={f} />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
