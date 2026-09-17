import { useEffect, useState } from 'react';
import { Bird, BookOpen, ChevronDown, Church, Clock3, Compass, HelpCircle, Heart, Moon, Star, Sun, Sunrise, Sunset } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Modal from './Modal';
import Cross from './Cross';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type PsalmMapping = {
  title: string;
  pdf: string;
};

type ServiceMapping = {
  title: string;
  time: string;
  ring: number;
  dot: string;
  pdf: string;
  psalms: PsalmMapping[];
  kernvers: {
    reference: string;
    verses: string[];
  };
  // Hoofdgedachtenis per dienst, bron: "De orthodoxe etmaalcyclus.docx".
  hoofdgedachtenis: string;
};

const serviceConfig: ServiceMapping[] = [
  {
    title: 'Vespers',
    time: '18:00',
    ring: 18,
    dot: '#d9a645',
    pdf: '/data/pdfs/Vespers.pdf',
    kernvers: { reference: 'Psalm Kernvers: 103(104):24', verses: ['Hoe groots zijn uw werken,', 'Heer, met wijsheid hebt U alles gemaakt.'] },
    psalms: [
      { title: 'Psalm 103', pdf: '/data/pdfs/Psalm 103.pdf' },
      { title: 'Psalm 140', pdf: '/data/pdfs/Psalm 140.pdf' },
    ],
    hoofdgedachtenis: 'Begin kerkelijke dag; avond en licht',
  },
  {
    title: 'Completen',
    time: '21:00',
    ring: 21,
    dot: '#b76b39',
    pdf: '/data/pdfs/Completen.pdf',
    kernvers: { reference: 'Psalm Kernvers: 50:12', verses: ['Schep een rein hart in mij, God,', 'en vernieuw in mijn binnenste een oprechte geest.'] },
    psalms: [{ title: 'Psalm 50', pdf: '/data/pdfs/Psalm 50.pdf' }],
    hoofdgedachtenis: 'Gebed vóór de nachtrust',
  },
  {
    title: 'Middernachtdienst',
    time: '00:00',
    ring: 0,
    dot: '#8c4a35',
    pdf: '/data/pdfs/Middernachtdienst.pdf',
    kernvers: { reference: 'Psalm Kernvers: 118:12', verses: ['Gezegend bent U, Heer,', 'leer mij uw voorschriften.'] },
    psalms: [{ title: 'Psalm 118', pdf: '/data/pdfs/Psalm 118.pdf' }],
    hoofdgedachtenis: 'Waakzaamheid en verwachting',
  },
  {
    title: 'Metten',
    time: '03:00',
    ring: 3,
    dot: '#d9c07a',
    pdf: '/data/pdfs/Metten.pdf',
    kernvers: { reference: 'Psalm Kernvers: 62(63):9', verses: ['Ik ben aan U gehecht, met heel mijn ziel,', 'uw rechterhand houdt mij vast.'] },
    psalms: [
      { title: 'Psalm 62', pdf: '/data/pdfs/Psalm 62.pdf' },
      { title: 'Psalm 102', pdf: '/data/pdfs/Psalm 102.pdf' },
    ],
    hoofdgedachtenis: 'Morgenlof en het komende licht',
  },
  {
    title: 'Eerste Uur',
    time: '06:00',
    ring: 6,
    dot: '#f0d589',
    pdf: '/data/pdfs/Eerste uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 89(90):17', verses: ['Laat de glans van de Heer, onze God, op ons rusten.', 'Bevestig het werk van onze handen,', 'ja, het werk van onze handen, bevestig dat.'] },
    psalms: [{ title: 'Psalm 89', pdf: '/data/pdfs/Psalm 89.pdf' }],
    hoofdgedachtenis: 'Begin van de dag',
  },
  {
    title: 'Derde Uur',
    time: '09:00',
    ring: 9,
    dot: '#5d8f62',
    pdf: '/data/pdfs/Derde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 24(25):4', verses: ['Heer, maak mij uw wegen bekend', 'en leer mij uw paden'] },
    psalms: [{ title: 'Psalm 24', pdf: '/data/pdfs/Psalm 24.pdf' }],
    hoofdgedachtenis: 'Neerdaling van de Heilige Geest',
  },
  {
    title: 'Zesde Uur',
    time: '12:00',
    ring: 12,
    dot: '#d3bb52',
    pdf: '/data/pdfs/Zesde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 90(91):9-10', verses: ['Als je de Allerhoogste tot je schuilplaats maakt,', 'zal het kwaad je niet bereiken,', 'geen plaag je tent ooit naderen.'] },
    psalms: [{ title: 'Psalm 90', pdf: '/data/pdfs/Psalm 90.pdf' }],
    hoofdgedachtenis: 'Christus aan het Kruis',
  },
  {
    title: 'Negende Uur',
    time: '15:00',
    ring: 15,
    dot: '#efe0c2',
    pdf: '/data/pdfs/Negende uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 84(85):11', verses: ['Barmhartigheid en waarheid omhelzen elkaar,', 'rechtvaardigheid en vrede begroeten elkaar met een kus.'] },
    psalms: [{ title: 'Psalm 84', pdf: '/data/pdfs/Psalm 84.pdf' }],
    hoofdgedachtenis: 'De dood van Christus aan het Kruis',
  },
];

type ModalState = {
  serviceIndex: number;
  selectedPsalm?: PsalmMapping;
};

type PdfLine = {
  x: number;
  text: string;
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

const pdfTextCache = new Map<string, Array<Array<PdfLine>>>();

const CONTENT = 'mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-12';

type InfoKey = 'wat' | 'diensten' | 'betekenis' | 'praktisch';

type InfoContent = {
  title: string;
  subtitle: string;
  paragraphs: string[];
};

// Inhoud rechtstreeks gebaseerd op "De orthodoxe etmaalcyclus.docx".
const INFO_POPUPS: Record<InfoKey, InfoContent> = {
  wat: {
    title: 'Wat is het etmaal?',
    subtitle: 'De dag geheiligd door gebed',
    paragraphs: [
      'De Orthodoxe Kerk omringt het gehele etmaal met gebed. Van de avond tot de volgende avond worden de uren van duisternis en licht, rust en arbeid, waken en slapen opgenomen in de lofprijzing van God.',
      'Deze dagelijkse orde wordt gevormd door de Vespers, Completen, Middernachtdienst, Metten en de Eerste, Derde, Zesde en Negende Uren. Samen vormen zij de dagelijkse of etmaalcyclus van de goddelijke diensten.',
      "Liturgisch opent de nieuwe dag in de avond. Daarom staat de Vespers aan het begin van de etmaalcyclus. Dit weerspiegelt het bijbelse patroon: 'En het was avond geweest en het was morgen geweest: de eerste dag.'",
    ],
  },
  diensten: {
    title: 'De liturgische diensten',
    subtitle: 'De acht getijden van dag en nacht',
    paragraphs: [
      'De namen van de Uren verwijzen naar de oude wijze waarop de dag vanaf zonsopgang werd geteld. In een schematische moderne weergave worden zij vaak verbonden met ongeveer 06.00, 09.00, 12.00 en 15.00 uur.',
      'Ook Vespers, Completen, Middernachtdienst en Metten kunnen voor uitleg aan bepaalde momenten van het etmaal worden gekoppeld. Dit zijn echter oriëntatiepunten: de feitelijke tijden waarop een klooster of parochie de diensten viert, kunnen verschillen.',
    ],
  },
  betekenis: {
    title: 'De betekenis in ons leven',
    subtitle: 'Niet acht afzonderlijke momenten, maar één gebed',
    paragraphs: [
      'Hoewel de diensten verschillende namen en tijden hebben, vormen zij samen één doorgaande beweging van gebed. De avond opent de dag, de nacht roept tot waakzaamheid, de morgen tot lofprijzing en de uren van het daglicht brengen de gelovige telkens terug tot het heilswerk van Christus. Zo wordt het gehele etmaal opgenomen in de gedachtenis aan God.',
      'De etmaalcyclus leert de gelovige dat geen uur buiten het gebed hoeft te vallen. De Kerk bidt bij het dalen van de avond, in de stilte van de nacht, bij het eerste morgenlicht en midden in de arbeid van de dag. Zo wordt de tijd niet slechts doorgebracht, maar geheiligd: van Vespers tot Vespers, van avond tot avond, in de gedachtenis aan God.',
    ],
  },
  praktisch: {
    title: 'Praktisch',
    subtitle: 'In parochie, klooster en persoonlijk gebed',
    paragraphs: [
      'In de kloosterlijke traditie kan de dagelijkse cyclus veel vollediger worden gevierd dan in een gewone parochie. Diensten worden bovendien vaak samengevoegd: zo kunnen Vespers en Metten deel uitmaken van een nachtwake, en worden de Uren dikwijls in samenhang met andere diensten gelezen. De liturgische structuur blijft echter dezelfde, ook wanneer niet iedere dienst afzonderlijk op het schematische uur wordt gevierd.',
      'De Goddelijke Liturgie is het eucharistische middelpunt van het kerkelijke leven, maar zij is niet eenvoudig één van de acht getijdediensten. Zij wordt binnen het grotere liturgische ritme van de dag gevierd en wordt in de praktijk vaak voorafgegaan door bepaalde Uren.',
    ],
  },
};

const INFO_CARDS: Array<{ key: InfoKey; title: string; intro: string; Icon: typeof HelpCircle }> = [
  { key: 'wat', title: 'Wat is het etmaal?', intro: 'Het kerkelijk etmaal bestaat uit een vaste reeks gebedsdiensten die de dag heiligen en ons in Gods tegenwoordigheid plaatsen.', Icon: HelpCircle },
  { key: 'diensten', title: 'De liturgische diensten', intro: 'Van de Metten tot de Completen: elke dienst heeft een eigen karakter, psalmen en gebeden.', Icon: BookOpen },
  { key: 'betekenis', title: 'De betekenis in ons leven', intro: 'Het etmaal helpt ons om ons hart te richten op God en de dag in Zijn licht te leven.', Icon: Heart },
  { key: 'praktisch', title: 'Praktisch', intro: 'Hoe je als leek meeleeft met het kerkelijk etmaal, thuis of onderweg.', Icon: Compass },
];

const TIMELINE_ITEMS = [
  { id: 'adem', label: 'ADEM', title: 'Christus in iedere\nademhaling', href: '#adem' },
  { id: 'etmaal', label: 'ETMAAL', title: 'Gebed door\ndag en nacht', href: '#etmaal' },
  { id: 'week', label: 'WEEK', title: 'Iedere dag\nzijn gedachtenis', href: '#week' },
  { id: 'pascha', label: 'PASCHA', title: 'De weg van Kruis\nnaar Verrijzenis', href: '#pascha' },
  { id: 'jaar', label: 'JAAR', title: 'Het gehele\nkerkelijke jaar geheiligd', href: '#jaar' },
];

// Symbolische lijnicoon per dienst, gebaseerd op het schematische moment (bron: docx).
// 'Zesde Uur' gebruikt het orthodoxe kruis-component in plaats van een lucide-icoon.
const SERVICE_ICONS: Record<string, typeof Sun | null> = {
  Vespers: Sunset,
  Completen: Moon,
  Middernachtdienst: Star,
  Metten: Sunrise,
  'Eerste Uur': Sun,
  'Derde Uur': Bird,
  'Zesde Uur': null,
  'Negende Uur': Church,
};

// Zeer subtiel botanisch hoekornament ter decoratie van het perkamentpaneel.
function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4 C 20 6, 30 16, 32 32" strokeLinecap="round" />
      <path d="M4 4 C 6 20, 16 30, 32 32" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.4" />
      <circle cx="14" cy="6" r="1.8" />
      <circle cx="6" cy="14" r="1.8" />
    </svg>
  );
}

export default function UrenCyclus() {
  const [open, setOpen] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [pdfPages, setPdfPages] = useState<Array<Array<PdfLine>>>([]);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');

  const activeIndex = hovered ?? open ?? 0;
  const currentService = modalState !== null ? serviceConfig[modalState.serviceIndex] : serviceConfig[activeIndex];
  const currentPdfUrl = modalState?.selectedPsalm ? modalState.selectedPsalm.pdf : currentService?.pdf ?? '';
  const currentTitle = modalState?.selectedPsalm ? `${currentService.title} · ${modalState.selectedPsalm.title}` : currentService.title;

  useEffect(() => {
    if (open === null || !currentPdfUrl) {
      setPdfPages([]);
      setPdfStatus('idle');
      return;
    }

    let active = true;
    const cachedPages = pdfTextCache.get(currentPdfUrl);
    if (cachedPages) {
      setPdfPages(cachedPages);
      setPdfStatus('done');
      return () => {
        active = false;
      };
    }

    setPdfStatus('loading');
    setPdfPages([]);

    const parsePdf = async () => {
      try {
        const response = await fetch(currentPdfUrl);
        if (!response.ok) throw new Error(`PDF is niet beschikbaar (${response.status})`);

        const buffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const pages: Array<Array<PdfLine>> = [];

        for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
          const page = await pdf.getPage(pageIndex);
          const textContent = await page.getTextContent();
          const rows = new Map<number, Array<PdfLine>>();

          for (const item of textContent.items) {
            if ('str' in item && typeof item.str === 'string') {
              const text = item.str.trim();
              if (!text) continue;
              const yKey = Math.round(Number(item.transform?.[5] ?? 0));
              const row = rows.get(yKey) ?? [];
              row.push({ x: Number(item.transform?.[4] ?? 0), text });
              rows.set(yKey, row);
            }
          }

          const pageLines = Array.from(rows.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([, items]) => ({
              x: Math.min(...items.map((entry) => entry.x)),
              text: items
                .sort((a, b) => a.x - b.x)
                .map((entry) => entry.text)
                .join(' '),
            }))
            .filter((line) => line.text.length > 0);

          pages.push(pageLines);
        }

        if (!active) return;
        pdfTextCache.set(currentPdfUrl, pages);
        setPdfPages(pages);
        setPdfStatus('done');
      } catch (error) {
        if (!active) return;
        console.error('PDF parsing failed', error);
        setPdfStatus('error');
      }
    };

    void parsePdf();

    return () => {
      active = false;
    };
  }, [currentPdfUrl, open]);

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

  const openService = (serviceIndex: number) => {
    setOpen(serviceIndex);
    setModalState({ serviceIndex });
  };

  const openPsalm = (serviceIndex: number, psalm: PsalmMapping) => {
    setOpen(serviceIndex);
    setModalState({ serviceIndex, selectedPsalm: psalm });
  };

  const goToService = (serviceIndex: number) => {
    setOpen(serviceIndex);
    setModalState({ serviceIndex });
  };

  const previousService = () => {
    if (open === null) return;
    const nextIndex = (open - 1 + serviceConfig.length) % serviceConfig.length;
    goToService(nextIndex);
  };

  const nextService = () => {
    if (open === null) return;
    const nextIndex = (open + 1) % serviceConfig.length;
    goToService(nextIndex);
  };

  const closeModal = () => {
    setOpen(null);
    setModalState(null);
  };

  return (
    <>
      <section id="etmaal" className="bg-bark">
        <img src="/images/heroes/hero-etmaal.png" alt="Etmaal — een dag in Gods tegenwoordigheid" className="block h-auto w-full" />
      </section>

      {/* Informatiekaarten */}
      <section className="orthodox-pattern parchment-pattern bg-parchment py-16 text-ink sm:py-20">
        <div className={CONTENT}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFO_CARDS.map(({ key, title, intro, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setInfoOpen(key)}
                className="orthodox-pattern group flex min-h-[260px] flex-col rounded-2xl border border-gold/35 bg-bark px-7 py-8 text-left text-cream shadow-[0_20px_50px_rgba(20,10,5,0.35)] transition duration-300 hover:border-gold/70 hover:shadow-[0_0_0_1px_rgba(201,162,39,0.35),0_28px_60px_rgba(20,10,5,0.45)] lg:min-h-[280px]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  <Icon className="h-8 w-8" strokeWidth={1.2} />
                </div>
                <h3 className="font-display mt-6 text-[20px] font-semibold text-gold-light">{title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#d9c6a3] sm:text-base">{intro}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-gold-light uppercase underline-offset-4 group-hover:text-gold group-hover:underline">
                  Lees meer →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* De diensten van het etmaal */}
      <section className="bg-parchment pb-16 sm:pb-20">
        <div className={CONTENT}>
          <div className="parchment-pattern relative overflow-hidden rounded-2xl border border-gold/40 bg-[#f8f1e3] px-6 py-14 shadow-[0_30px_70px_rgba(40,22,14,0.16)] sm:px-10 lg:px-16">
            <CornerOrnament className="absolute top-6 left-6 h-14 w-14 text-gold-deep/30" />
            <CornerOrnament className="absolute top-6 right-6 h-14 w-14 -scale-x-100 text-gold-deep/30" />
            <CornerOrnament className="absolute bottom-6 left-6 h-14 w-14 -scale-y-100 text-gold-deep/30" />
            <CornerOrnament className="absolute right-6 bottom-6 h-14 w-14 -scale-x-100 -scale-y-100 text-gold-deep/30" />

            <div className="text-center">
              <p className="font-display text-[26px] font-semibold tracking-[0.06em] text-ink uppercase sm:text-[30px]">De diensten van het etmaal</p>
              <p className="mt-2 text-[12px] font-bold tracking-[0.32em] text-gold-deep uppercase sm:text-sm">Een dag van gebed</p>
            </div>

            {/* Desktop: cirkeldiagram */}
            <div className="relative mx-auto mt-12 hidden aspect-square w-full max-w-[820px] lg:block">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <circle cx="50" cy="50" r="34" fill="none" stroke="#c9a227" strokeWidth="0.35" opacity="0.75" />
                {/* Kompasaccenten op de vier kardinale punten van de ring */}
                {[0, 90, 180, 270].map((deg) => {
                  const p = polar(50, 50, 34, deg);
                  return <circle key={deg} cx={p.x} cy={p.y} r="0.9" fill="#c9a227" opacity="0.8" />;
                })}
                {serviceConfig.map((service, index) => {
                  const angle = 22.5 + (360 / serviceConfig.length) * index;
                  const p = polar(50, 50, 34, angle);
                  const c = polar(50, 50, 15, angle);
                  return (
                    <line
                      key={`spoke-${service.title}`}
                      x1={c.x}
                      y1={c.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#c9a227"
                      strokeWidth="0.25"
                      opacity={activeIndex === index ? 0.65 : 0.3}
                    />
                  );
                })}
              </svg>

              <div className="absolute top-1/2 left-1/2 flex h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_14px_36px_rgba(120,80,30,0.22)]">
                <img src="/images/Christus-afbeelding.png" alt="Christus" className="h-full w-full object-cover" />
              </div>

              {serviceConfig.map((service, index) => {
                const angle = 22.5 + (360 / serviceConfig.length) * index;
                const pos = polar(50, 50, 34, angle);
                const isActive = activeIndex === index;
                const leftSide = pos.x < 50;
                const Icon = SERVICE_ICONS[service.title];

                const badge = (
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-[#1c130d] text-gold-light transition-all ${
                      isActive ? 'scale-110 border-gold shadow-[0_0_0_5px_rgba(201,162,39,0.22),0_0_20px_rgba(201,162,39,0.35)]' : 'border-gold/50'
                    }`}
                  >
                    {Icon ? <Icon className="h-6 w-6" strokeWidth={1.4} /> : <Cross className="h-6 w-6" />}
                  </span>
                );

                const text = (
                  <span className={`min-w-0 ${leftSide ? 'text-right' : 'text-left'}`}>
                    <span className="flex flex-wrap items-baseline gap-x-2" style={{ justifyContent: leftSide ? 'flex-end' : 'flex-start' }}>
                      <span className="font-display text-base font-semibold text-ink">{service.title}</span>
                      <span className="text-[10px] font-bold tracking-[0.14em] text-gold-deep uppercase">{service.time}</span>
                    </span>
                    <span className="mt-1 block text-[12px] leading-snug text-ink-soft">{service.hoofdgedachtenis}</span>
                  </span>
                );

                return (
                  <button
                    key={`${service.title}-node-${index}`}
                    type="button"
                    onClick={() => openService(index)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className={`absolute flex w-[240px] -translate-y-1/2 items-center gap-3 ${leftSide ? '-translate-x-full flex-row-reverse' : ''}`}
                  >
                    {badge}
                    {text}
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-10 hidden max-w-lg text-center lg:block">
              <p className="font-display text-lg leading-snug text-ink-soft italic">“Zevenmaal daags prijs ik U, omwille van Uw rechtvaardige oordelen.”</p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.18em] text-gold-deep uppercase">Psalm 119:164</p>
            </div>

            {/* Tablet/mobiel: verticale cyclus */}
            <div className="mt-10 space-y-3 lg:hidden">
              {serviceConfig.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={`${service.title}-mobile-${index}`}
                    type="button"
                    onClick={() => openService(index)}
                    className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${isActive ? 'border-gold/70 bg-gold-pale shadow-[0_0_0_1px_rgba(201,162,39,0.2)]' : 'border-parchment-3 bg-paper hover:border-gold'}`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 text-sm font-bold text-[#1a100c]" style={{ background: service.dot }}>
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-display block text-xl font-semibold text-ink">{service.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                        <Clock3 className="h-3.5 w-3.5" />
                        {service.time} · {service.hoofdgedachtenis}
                      </span>
                    </span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#d4aa3d]" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Meer dan een dagindeling */}
      <section className="orthodox-pattern bg-bark py-20 text-cream sm:py-24">
        <div className={CONTENT}>
          <div className="grid gap-12 lg:grid-cols-[35%_65%] lg:items-center lg:gap-16">
            <div className="border-l border-gold/50 pl-8">
              <blockquote className="font-display text-[26px] leading-relaxed text-gold-light italic sm:text-[28px]">
                “Zevenmaal daags prijs ik U, omwille van Uw rechtvaardige oordelen.”
              </blockquote>
              <cite className="mt-4 block text-[12px] font-bold tracking-[0.24em] text-[#e8dcc0] not-italic uppercase">Psalm 119:164</cite>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-[13px] font-bold tracking-[0.32em] text-gold-light uppercase sm:text-sm">Meer dan een dagindeling</p>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#d9c6a3] sm:text-lg lg:ml-auto lg:mr-0">
                Het etmaal is geen strak schema, maar een levensritme. Het herinnert er ons aan dat heel onze tijd in Gods handen
                ligt en dat elk moment een ontmoeting met Hem kan zijn.
              </p>
              <a
                href="#week"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold/60 px-7 py-3 text-[11px] font-bold tracking-[0.22em] text-gold-light uppercase transition hover:bg-gold hover:text-bark"
              >
                Ontdek de weekcyclus →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* De heiliging van de tijd */}
      <section className="orthodox-pattern bg-bark px-4 py-16 text-cream sm:px-6 sm:py-20">
        <div className={`${CONTENT} text-center`}>
          <p className="text-[13px] font-bold tracking-[0.32em] text-gold-light uppercase sm:text-sm">De heiliging van de tijd</p>

          <div className="mt-12 flex items-start justify-between gap-1 sm:gap-2">
            {TIMELINE_ITEMS.map((item, index) => {
              const active = item.id === 'etmaal';
              return (
                <div key={item.id} className="flex flex-1 items-start">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <a
                      href={item.href}
                      className={`flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 font-display text-lg font-semibold transition sm:h-[85px] sm:w-[85px] sm:text-2xl ${
                        active
                          ? 'border-gold bg-[#2a1c15] text-gold-light shadow-[0_0_0_6px_rgba(201,162,39,0.18),0_0_28px_rgba(201,162,39,0.35)]'
                          : 'border-gold/40 bg-[#1f150f] text-gold-light/80 hover:border-gold/70'
                      }`}
                    >
                      {item.label[0]}
                    </a>
                    <div className={`mt-4 text-[11px] font-bold tracking-[0.24em] uppercase sm:text-xs ${active ? 'text-gold-light' : 'text-[#d8c39a]'}`}>
                      {item.label}
                    </div>
                    <div className="mt-2 hidden text-xs leading-relaxed whitespace-pre-line text-[#e8dcc0] sm:block">{item.title}</div>
                  </div>
                  {index < TIMELINE_ITEMS.length - 1 && <div className="mt-[35px] h-px flex-1 bg-gradient-to-r from-gold/60 via-gold/40 to-gold/60 sm:mt-[42px]" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Modal
        open={infoOpen !== null}
        onClose={() => setInfoOpen(null)}
        eyebrow="ETMAAL"
        title={infoOpen ? INFO_POPUPS[infoOpen].title : ''}
        centerTitle
        maxWidth="max-w-3xl"
      >
        {infoOpen && (
          <div className="space-y-4">
            <p className="text-center text-[11px] font-bold tracking-[0.22em] text-gold-deep uppercase">{INFO_POPUPS[infoOpen].subtitle}</p>
            <div className="space-y-4 text-base leading-relaxed text-ink-soft">
              {INFO_POPUPS[infoOpen].paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {open !== null && modalState && (
        <Modal
            open={Boolean(open !== null && modalState)}
            onClose={closeModal}
            eyebrow="ETMAAL"
            title={currentService.title}
            centerTitle
            maxWidth="max-w-5xl"
            leadingActions={<button type="button" onClick={previousService} className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.16em] text-[#f0cf7b] uppercase hover:text-[#fff8e9]" aria-label="Vorige dienst">← <span className="hidden sm:inline">Vorige uur</span></button>}
            actions={<button type="button" onClick={nextService} className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.16em] text-[#f0cf7b] uppercase hover:text-[#fff8e9]" aria-label="Volgende dienst"><span className="hidden sm:inline">Volgende</span> →</button>}
          >
            <div className="space-y-6">
              <div className="grid gap-6 border-b border-[#b29269] pb-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1e8d8] text-[#765b42]">
                      <Clock3 className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold tracking-[0.24em] text-gold-deep uppercase">Tijd</div>
                      <div className="font-display text-xl text-ink">± {currentService.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1e8d8] text-[#765b42]">
                      <Church className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold tracking-[0.24em] text-gold-deep uppercase">Categorie</div>
                      <div className="font-display text-xl text-ink">Dagelijkse dienst</div>
                    </div>
                  </div>
                </div>
                <blockquote className="border-l border-gold/70 pl-6 font-display text-xl leading-relaxed text-ink-soft italic sm:text-2xl">
                  “{currentService.kernvers.verses.join(' ')}”
                  <cite className="mt-2 block text-[10px] font-bold tracking-[0.24em] text-gold-deep uppercase not-italic">{currentService.kernvers.reference.replace('Psalm Kernvers: ', 'Psalm ')}</cite>
                </blockquote>
              </div>

              <div className="gold-rule" />

              <div className="border-b border-[#d4aa3d]/30 px-4 py-3">
                {modalState.selectedPsalm ? (
                  <button type="button" onClick={() => setModalState({ serviceIndex: modalState.serviceIndex })} className="rounded-full border border-[#8a5a2b] bg-[#f0dca6] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#2a1b11] hover:bg-[#f6e6b8]">
                    ← Terug naar dienst
                  </button>
                ) : currentService.psalms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentService.psalms.map((psalm) => (
                      <button
                        key={psalm.title}
                        type="button"
                        onClick={() => openPsalm(modalState.serviceIndex, psalm)}
                        className="rounded-full border border-[#8a5a2b] bg-[#f0dca6] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#2a1b11] hover:bg-[#f6e6b8]"
                      >
                        {psalm.title}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-3 sm:p-5">
                {pdfStatus === 'loading' && (
                  <div className="flex min-h-[30vh] items-center justify-center text-sm font-medium uppercase tracking-[0.18em] text-[#4a2b1c]">
                    Tekst wordt geladen…
                  </div>
                )}

                {pdfStatus === 'error' && (
                  <div className="flex min-h-[30vh] items-center justify-center text-center text-base font-medium text-[#4a2b1c]">
                    De tekst van {currentTitle} kon niet worden geladen.
                  </div>
                )}

                {pdfStatus === 'done' && pdfPages.length > 0 && (
                  <div className="mx-auto max-w-4xl space-y-5">
                    {pdfPages.map((page, pageIndex) => (
                      <article
                        key={`${currentTitle}-page-${pageIndex + 1}`}
                        className="border-b border-[#d4aa3d]/35 pb-7 pt-2 last:border-b-0 sm:pb-9"
                        style={{
                          fontFamily: 'Cormorant Garamond, Georgia, "Times New Roman", serif',
                        }}
                      >
                        <div className="space-y-1 text-[17px] leading-[1.85] tracking-[0.005em] text-[#35251b] sm:text-[18px] sm:leading-[1.9]">
                          {(() => {
                            const rendered: Array<React.ReactNode> = [];
                            for (let lineIndex = 0; lineIndex < page.length; lineIndex += 1) {
                              const line = page[lineIndex];
                              rendered.push(
                                <div
                                  key={`${currentTitle}-line-${pageIndex + 1}-${lineIndex}`}
                                  className="whitespace-pre-wrap font-normal"
                                  style={{
                                    marginLeft: `${Math.max(line.x * 0.04, 0)}px`,
                                    textIndent: lineIndex === 0 ? '0' : '0.5rem',
                                  }}
                                >
                                  {line.text}
                                </div>,
                              );
                            }

                            return rendered;
                          })()}
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {pdfStatus === 'done' && pdfPages.length === 0 && (
                  <div className="flex min-h-[30vh] items-center justify-center text-center text-base font-medium text-[#4a2b1c]">
                    Er is geen tekst gevonden in {currentTitle}.
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
    </>
  );
}
