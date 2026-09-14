import { useEffect, useState } from 'react';
import { ChevronDown, Clock3, X } from 'lucide-react';

interface Uur {
  nr: number;
  naam: string;
  taal: string;
  tijd: string;
  kleur: string;
  accent: string;
  ring: number;
  dot: string;
  kernvers: string;
  inhoud: string;
  bestand?: string;
  psalm?: { titel: string; tekst: string };
}

const psalmNegendeUur = `1 Naar het einde toe. Een psalm van de Korachieten.

2 U bent, Heer, uw land goedgezind;
U liet Jakob terugkeren uit gevangenschap.

3 U vergaf de wandaden van uw volk
en bedekte al hun zonden.

4 U hebt uw woede geheel laten varen
en u van uw brandende toorn afgewend.

5 Breng ons terug, God, onze redder,
en wend uw toorn van ons af.

6 U blijft toch niet voor eeuwig boos op ons?
U laat uw woede toch niet voortduren van generatie op generatie?

7 God, wanneer U zich naar ons omkeert, doet U ons opleven,
dan verheugt uw volk zich in U.

8 Toon ons, Heer, uw barmhartigheid
en schenk ons uw verlossing.

9 Ik zal luisteren naar wat God in mij zegt,
want Hij verkondigt vrede voor zijn volk,
voor zijn toegewijden
en voor wie hun hart naar Hem gekeerd hebben.

10 Voor wie Hem vrezen is zijn redding nabij,
zodat zijn glorie zal wonen in ons land.

11 Barmhartigheid en waarheid omhelzen elkaar,
rechtvaardigheid en vrede begroeten elkaar met een kus.

12 Waarheid schiet uit de aarde omhoog
en rechtvaardigheid kijkt vanuit de hemel neer.

13 De Heer schenkt zijn goedheid,
en ons land zal vruchten geven.

14 Rechtvaardigheid gaat voor Hem uit
en baant een weg voor zijn voeten.`;

const uren: Uur[] = [
  {
    nr: 1,
    naam: 'Vespers',
    taal: 'Vespers · Εσπερινός',
    tijd: '18:00',
    kleur: 'bg-[#b96d29]',
    accent: 'text-[#f0cf7b]',
    ring: 18,
    dot: '#d9a645',
    kernvers: 'Psalm 103:1',
    bestand: 'Vespers.txt',
    inhoud: 'Psalmen: 103; 140, 141, 129, 116\n\nSchepping en terugkeer tot God. Psalm 103 bezingt God als Schepper en opent de nieuwe kerkelijke dag. Bij "Heer, ik roep tot U" wordt het avondgebed als wierook tot God verheven. De mens brengt de voorbije dag bij God en vraagt om vergeving en bewaring in de nacht.\n\nSymboliek: schepping en avondoffer.',
  },
  {
    nr: 2,
    naam: 'Completen',
    taal: 'Apo-deipnon · Ἀποδειπνικόν',
    tijd: '21:00',
    kleur: 'bg-[#8b5d2d]',
    accent: 'text-[#ead8a6]',
    ring: 21,
    dot: '#b76b39',
    kernvers: 'Psalm 50:12',
    bestand: 'Completen.txt',
    inhoud: 'Psalmen: 50, 69, 142\n\nBerouw en overgave voor de nacht. Psalm 50 is de grote boetepsalm: "Ontferm U over mij, o God." De andere psalmen drukken nood, vertrouwen en het verlangen naar Gods leiding uit. De dag wordt afgesloten door zichzelf aan Gods bescherming toe te vertrouwen.\n\nSymboliek: berouw en overgave.',
  },
  {
    nr: 3,
    naam: 'Middernachtdienst',
    taal: 'Mesonyktikon · Μεσονυκτικόν',
    tijd: '00:00',
    kleur: 'bg-[#734b36]',
    accent: 'text-[#ebd7a9]',
    ring: 0,
    dot: '#8c4a35',
    kernvers: 'Psalm 50:4',
    bestand: 'Middernachtdienst.txt',
    inhoud: 'Psalmen: onder andere 50, 118, 120-133\n\nWaakzaamheid en verwachting van Christus. De nacht herinnert aan de gelijkenis van de Bruidegom die onverwacht komt. Psalm 118 benadrukt trouw aan Gods geboden; de opgangspsalmen richten het hart omhoog. Het centrale thema is: wees wakker en bereid de Heer te ontmoeten.\n\nSymboliek: waakzaamheid en verwachting.',
  },
  {
    nr: 4,
    naam: 'Metten',
    taal: 'Orthros · Ὄρθρος',
    tijd: '03:00',
    kleur: 'bg-[#c8a06f]',
    accent: 'text-[#2e1b13]',
    ring: 3,
    dot: '#d9c07a',
    kernvers: 'Psalm 3:6',
    bestand: 'Metten.txt',
    inhoud: 'Psalmen: 3, 37, 62, 87, 102, 142\n\nVan duisternis naar licht. De zes psalmen, de Hexapsalmos, bewegen tussen nood, berouw, verlangen naar God en vertrouwen op Zijn barmhartigheid. Terwijl de nieuwe dag nadert, wacht de Kerk op het licht. Metten krijgt daardoor ook een sterke opstandingsbetekenis.\n\nSymboliek: van duisternis naar licht.',
  },
  {
    nr: 5,
    naam: 'Eerste Uur',
    taal: 'Hora Prima · ὥρα πρώτη',
    tijd: '06:00',
    kleur: 'bg-[#d5b661]',
    accent: 'text-[#2a1b11]',
    ring: 6,
    dot: '#f0d589',
    kernvers: 'Psalm 5:4',
    bestand: 'Eerste uur.txt',
    inhoud: 'Psalmen: 5, 89, 100\n\nHeiliging van het begin van de dag. Psalm 5 spreekt expliciet over het ochtendgebed. Psalm 89 confronteert ons met de kortheid van het menselijke leven. Psalm 100 vraagt om een zuiver leven. De nieuwe dag wordt aan God opgedragen.\n\nSymboliek: heiliging van de nieuwe dag.',
  },
  {
    nr: 6,
    naam: 'Derde Uur',
    taal: 'Hora Tertia · ὥρα τρίτη',
    tijd: '09:00',
    kleur: 'bg-[#6f8f6d]',
    accent: 'text-[#f5ebd7]',
    ring: 9,
    dot: '#5d8f62',
    kernvers: 'Psalm 16:8',
    bestand: 'Derde uur.txt',
    inhoud: 'Psalmen: 16, 24, 50\n\nDe komst van de Heilige Geest. Het Derde Uur wordt in het bijzonder verbonden met Pinksteren: op het derde uur daalde de Heilige Geest neer over de apostelen. De psalmen vragen om bescherming, leiding, reiniging en een vernieuwde geest.\n\nSymboliek: de Heilige Geest vernieuwt de mens en leidt hem door de dag.',
  },
  {
    nr: 7,
    naam: 'Zesde Uur',
    taal: 'Hora Sexta · ὥρα ἕκτη',
    tijd: '12:00',
    kleur: 'bg-[#d9bb52]',
    accent: 'text-[#2a1b11]',
    ring: 12,
    dot: '#d3bb52',
    kernvers: 'Psalm 53:4',
    bestand: 'Zesde uur.txt',
    inhoud: 'Psalmen: 53, 54, 90\n\nDe Kruisiging van Christus. Rond het zesde uur werd Christus gekruisigd. De psalmen spreken over vijanden, beproeving en Gods bescherming. Midden op de dag richt de Kerk haar blik daarom op het Kruis en Christus\' lijden.\n\nSymboliek: de Kruisiging van Christus.',
  },
  {
    nr: 8,
    naam: 'Negende Uur',
    taal: 'Hora Nona · ὥρα ἔνατη',
    tijd: '15:00',
    kleur: 'bg-[#d6c4a5]',
    accent: 'text-[#2c2016]',
    ring: 15,
    dot: '#efe0c2',
    kernvers: 'Psalm 84 (85):11',
    bestand: 'Negende uur.txt',
    inhoud: 'Het negende uur, rond 15 uur wereldse tijd, verbindt de dood van Christus aan het kruis met de voltooiing van de heilsgeschiedenis: de terugkeer uit de ballingschap, de vergeving van zonden en Gods goedheid. Juist doorleefd berouw en verdriet kunnen vreugde dieper maken.\n\nHet is ook een gelegenheid om midden op de middag dank te zeggen voor Gods zegeningen. Hij heeft je tot dit uur geleid; er is altijd iets om dankjewel voor te zeggen. Dank is een solide fundament onder het geestelijk leven.\n\nPsalm 84 (85) richt zich tot God en verhaalt hoe Hij ons goedgezind is wanneer wij ons tot Hem wenden. Vanaf vers 9 klinkt: "Ik zal luisteren naar wat God in mij zegt." God spreekt in ons hart. Kunnen wij Zijn stem horen te midden van ons drukke bestaan?\n\nPsalm 84 (85) is passend voor het negende uur.',
    psalm: { titel: 'Psalm 84 (85)', tekst: psalmNegendeUur },
  },
];

const ringHours = ['18:00', '21:00', '00:00', '03:00', '06:00', '09:00', '12:00', '15:00'];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function parseUurBestand(raw: string) {
  const regels = raw.replace(/\r/g, '').split('\n');
  const nietLeeg = regels.findIndex((regel) => regel.trim());
  const kernversRegel = regels.find((regel) => /^Kernvers\s*:?/i.test(regel.trim()));
  const koppen = [...raw.matchAll(/^(Psalm|Ode)\s+[^\n]+$/gim)];
  const psalmen = koppen.map((match, index) => {
    const start = match.index ?? 0;
    const einde = koppen[index + 1]?.index ?? raw.length;
    return { titel: match[0].trim(), tekst: raw.slice(start, einde).trim() };
  });
  return {
    inhoud: raw.trim(),
    kernvers: kernversRegel?.replace(/^Kernvers\s*:?\s*/i, '').trim(),
    psalmen,
    titel: nietLeeg >= 0 ? regels[nietLeeg].trim() : undefined,
  };
}

export default function UrenCyclus() {
  const [open, setOpen] = useState<number | null>(null);
  const [psalmOpen, setPsalmOpen] = useState<{ titel: string; tekst: string } | null>(null);
  const [details, setDetails] = useState<Record<number, ReturnType<typeof parseUurBestand>>>({});
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = hovered ?? open ?? 0;
  const activeHour = uren[activeIndex]?.ring ?? 18;

  useEffect(() => {
    let actief = true;
    Promise.allSettled(
      uren.map(async (uur, index) => {
        if (!uur.bestand) return [index, null] as const;
        const response = await fetch(`/data/uren/${encodeURIComponent(uur.bestand)}`);
        if (!response.ok) return [index, null] as const;
        return [index, parseUurBestand(await response.text())] as const;
      }),
    )
      .then((resultaten) => {
        if (!actief) return;
        const geladen: Array<readonly [number, ReturnType<typeof parseUurBestand>]> = resultaten
          .filter((resultaat): resultaat is PromiseFulfilledResult<readonly [number, ReturnType<typeof parseUurBestand> | null]> => resultaat.status === 'fulfilled')
          .map((resultaat) => resultaat.value)
          .filter(([, detail]): detail is ReturnType<typeof parseUurBestand> => detail !== null);
        setDetails(Object.fromEntries(geladen));
      })
      .catch(() => undefined);
    return () => {
      actief = false;
    };
  }, []);

  useEffect(() => {
    if (open === null) return;
    const sluitMetEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', sluitMetEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', sluitMetEscape);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <section id="cyclus" className="parchment-pattern bg-parchment py-16 text-ink sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-[320px_minmax(0,1fr)] md:items-start">
        <div className="paper card-shadow rounded-[28px] border border-parchment-3 p-3">
          <div className="relative mx-auto aspect-square w-full max-w-[270px] overflow-hidden rounded-full bg-[#0e0705]">
            <svg viewBox="0 0 320 320" className="absolute inset-0 z-20 h-full w-full">
              <circle cx="160" cy="160" r="118" fill="none" stroke="#d4aa3d" strokeWidth="1.5" opacity="0.9" />
              <circle cx="160" cy="160" r="94" fill="none" stroke="#d4aa3d" strokeWidth="1.2" opacity="0.75" />
              <circle cx="160" cy="160" r="132" fill="none" stroke="#5d2d1b" strokeWidth="1" opacity="0.7" />

              {ringHours.map((label, index) => {
                const angle = (360 / ringHours.length) * index;
                const outer = polar(160, 160, 132, angle);
                const inner = polar(160, 160, 118, angle);
                const dot = polar(160, 160, 124, angle);
                const labelPos = polar(160, 160, 148, angle);
                const hourValue = Number.parseInt(label.slice(0, 2), 10);
                const isActive = activeHour === hourValue;
                const matching = uren.find((uur) => uur.ring === hourValue) ?? uren[0];
                const dotRadius = isActive ? 11.6 : 7.6;
                const dotIndex = uren.findIndex((uur) => uur.ring === hourValue || (hourValue === 0 && uur.ring === 0));
                return (
                  <g key={`${label}-${index}`}>
                    <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#d4aa3d" strokeWidth={isActive ? 2.2 : 1.2} opacity={isActive ? 1 : 0.8} />
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={dotRadius}
                      fill={matching.dot}
                      stroke="#6b4222"
                      strokeWidth="1"
                      onMouseEnter={() => setHovered(dotIndex >= 0 ? dotIndex : 0)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setOpen(dotIndex >= 0 ? dotIndex : 0)}
                      className="cursor-pointer transition-all"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fill={isActive ? '#f5ebd7' : '#d6b76e'}
                      fontFamily="Alegreya Sans, sans-serif"
                      fontWeight={isActive ? 700 : 650}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="pointer-events-none absolute inset-[30px] z-10 rounded-full border border-[#c4a26f]/80 bg-[#140c09] shadow-[inset_0_0_0_1px_rgba(212,170,61,0.2)]" />
            <div className="absolute inset-[45px] z-40 flex items-center justify-center rounded-full bg-[#1c100b] px-3 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.26em] text-[#d8c39a]">{uren[activeIndex].tijd}</div>
                <div className="font-display mt-2 text-2xl leading-none font-semibold text-[#f3e7c8]">{uren[activeIndex].naam}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-parchment-3 bg-parchment-2 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            Beweeg over of tik op een stip om de bijbehorende dienst te lezen. De ring toont de traditionele tijdstippen van het volledige (monastieke) Horologion.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:pt-2">
          {uren.map((uur, index) => {
            const isActive = activeIndex === index;
            const detail = details[index];
            return (
              <div
                key={`${uur.naam}-${index}`}
                className={`overflow-hidden rounded-2xl border transition-all ${isActive ? 'border-gold/70 bg-gold-pale shadow-[0_0_0_1px_rgba(201,162,39,0.2)]' : 'border-parchment-3 bg-paper hover:border-gold'}`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpen(index)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d4aa3d]/70 text-sm font-bold text-[#1a100c] transition-all ${isActive ? 'scale-110' : ''}`} style={{ background: uur.dot }}>
                    {uur.nr}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-2xl font-semibold text-ink">{uur.naam}</span>
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                      <Clock3 className="h-3.5 w-3.5" />
                      {uur.tijd}
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-gold-deep">Kernvers: {detail?.kernvers ?? uur.kernvers}</span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#d4aa3d]" />
                </button>
              </div>
            );
          })}
        </div>

        {open !== null && (
          <div className="fixed inset-0 z-[85] flex items-end justify-center bg-bark/75 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setOpen(null)}>
            <div role="dialog" aria-modal="true" aria-label={uren[open].naam} className="paper card-shadow max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl text-ink sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
              {(() => {
                const detail = details[open];
                const inhoud = detail?.inhoud ?? (details[open] === undefined ? 'De volledige diensttekst wordt geladen…' : uren[open].inhoud);
                const psalmen = detail?.psalmen?.length ? detail.psalmen : uren[open].psalm ? [uren[open].psalm] : [];
                return (
                  <>
              <div className="flex items-start justify-between gap-4 rounded-t-2xl bg-bark px-6 py-5 text-cream">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.28em] text-[#f0cf7b] uppercase">{uren[open].tijd}</p>
                  <h2 className="font-display mt-1 text-3xl font-semibold text-[#f5ebd7]">{uren[open].naam}</h2>
                  <p className="mt-1 text-xs text-[#d2ba8d]">Kernvers: {detail?.kernvers ?? uren[open].kernvers}</p>
                </div>
                <button type="button" onClick={() => setOpen(null)} className="rounded-full p-2 text-[#f4ecda] hover:bg-white/10" aria-label="Sluiten"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-6 py-6 text-base leading-relaxed text-ink-soft">
                <p className="whitespace-pre-line">{inhoud}</p>
                {psalmen.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{psalmen.map((psalm) => (
                  <button key={psalm.titel} type="button" onClick={() => setPsalmOpen(psalm)} className="rounded-full border border-gold/50 bg-gold-pale px-4 py-2 text-sm font-bold text-gold-deep hover:bg-gold-light">Lees {psalm.titel}</button>
                ))}</div>}
              </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {psalmOpen && (
          <div className="fixed inset-0 z-[95] flex items-end justify-center bg-bark/80 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setPsalmOpen(null)}>
            <div role="dialog" aria-modal="true" aria-label={psalmOpen.titel} className="paper card-shadow max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl text-ink sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between gap-4 rounded-t-2xl bg-bark px-6 py-5 text-cream">
                <h2 className="font-display text-3xl font-semibold">{psalmOpen.titel}</h2>
                <button type="button" onClick={() => setPsalmOpen(null)} className="rounded-full p-2 hover:bg-white/10" aria-label="Sluiten"><X className="h-5 w-5" /></button>
              </div>
              <div className="px-6 py-6 text-base leading-relaxed text-ink-soft">
                <p className="whitespace-pre-line">{psalmOpen.tekst}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
