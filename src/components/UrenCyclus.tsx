import { useEffect, useState } from 'react';
import { ChevronDown, Church, Clock3 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Modal from './Modal';

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
  },
  {
    title: 'Completen',
    time: '21:00',
    ring: 21,
    dot: '#b76b39',
    pdf: '/data/pdfs/Completen.pdf',
    kernvers: { reference: 'Psalm Kernvers: 50:12', verses: ['Schep een rein hart in mij, God,', 'en vernieuw in mijn binnenste een oprechte geest.'] },
    psalms: [{ title: 'Psalm 50', pdf: '/data/pdfs/Psalm 50.pdf' }],
  },
  {
    title: 'Middernachtdienst',
    time: '00:00',
    ring: 0,
    dot: '#8c4a35',
    pdf: '/data/pdfs/Middernachtdienst.pdf',
    kernvers: { reference: 'Psalm Kernvers: 118:12', verses: ['Gezegend bent U, Heer,', 'leer mij uw voorschriften.'] },
    psalms: [{ title: 'Psalm 118', pdf: '/data/pdfs/Psalm 118.pdf' }],
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
  },
  {
    title: 'Eerste Uur',
    time: '06:00',
    ring: 6,
    dot: '#f0d589',
    pdf: '/data/pdfs/Eerste uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 89(90):17', verses: ['Laat de glans van de Heer, onze God, op ons rusten.', 'Bevestig het werk van onze handen,', 'ja, het werk van onze handen, bevestig dat.'] },
    psalms: [{ title: 'Psalm 89', pdf: '/data/pdfs/Psalm 89.pdf' }],
  },
  {
    title: 'Derde Uur',
    time: '09:00',
    ring: 9,
    dot: '#5d8f62',
    pdf: '/data/pdfs/Derde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 24(25):4', verses: ['Heer, maak mij uw wegen bekend', 'en leer mij uw paden'] },
    psalms: [{ title: 'Psalm 24', pdf: '/data/pdfs/Psalm 24.pdf' }],
  },
  {
    title: 'Zesde Uur',
    time: '12:00',
    ring: 12,
    dot: '#d3bb52',
    pdf: '/data/pdfs/Zesde uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 90(91):9-10', verses: ['Als je de Allerhoogste tot je schuilplaats maakt,', 'zal het kwaad je niet bereiken,', 'geen plaag je tent ooit naderen.'] },
    psalms: [{ title: 'Psalm 90', pdf: '/data/pdfs/Psalm 90.pdf' }],
  },
  {
    title: 'Negende Uur',
    time: '15:00',
    ring: 15,
    dot: '#efe0c2',
    pdf: '/data/pdfs/Negende uur.pdf',
    kernvers: { reference: 'Psalm Kernvers: 84(85):11', verses: ['Barmhartigheid en waarheid omhelzen elkaar,', 'rechtvaardigheid en vrede begroeten elkaar met een kus.'] },
    psalms: [{ title: 'Psalm 84', pdf: '/data/pdfs/Psalm 84.pdf' }],
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

type ModalState = {
  serviceIndex: number;
  selectedPsalm?: PsalmMapping;
};

type PdfLine = {
  x: number;
  text: string;
};

const pdfTextCache = new Map<string, Array<Array<PdfLine>>>();

export default function UrenCyclus() {
  const [open, setOpen] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pdfPages, setPdfPages] = useState<Array<Array<PdfLine>>>([]);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');

  const activeIndex = hovered ?? open ?? 0;
  const activeHour = serviceConfig[activeIndex]?.ring ?? 18;
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
    <section id="cyclus" className="parchment-pattern bg-parchment py-16 text-ink sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <article className="paper card-shadow mb-8 border border-[#a48764] px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-[#765b42]">De 24 uur</div>
            <h2 className="font-display text-3xl font-medium text-[#35251b] sm:text-4xl">Het gebruik van de Psalmen in Oosters-Orthodoxe kerkdiensten</h2>
            <div className="mx-auto my-5 h-px w-20 bg-[#b29269]" />
          </div>
          <div className="mx-auto max-w-3xl space-y-4 text-[15px] leading-[1.9] text-[#4b3628] sm:text-base">
            <p>
              Psalmen vormen in de Oosters-Orthodoxe traditie een zeer belangrijk bestanddeel van de kerkdiensten. In liturgische poëzie komen veel psalmcitaten en verwijzingen naar psalmen voor. Gedurende een eeuwenlang proces hebben zich twee liturgische cycli uitgekristalliseerd waarin hele psalmen een belangrijke en zelfs exclusieve plaats innemen: de dagcyclus en de weekcyclus. In de monastieke praktijk worden deze doorgaans volledig gelezen of gezongen; in parochiekerken en persoonlijk gebed wordt een selectie gebruikt. In het laatste geval is er een grote mate van vrijheid.
            </p>
            <div className="border-l border-[#b29269] pl-4 sm:pl-6">
              <h3 className="font-display text-2xl font-medium text-[#35251b]">Dagcyclus (het getijdengebed)</h3>
              <p className="mt-2">
                Deze cyclus heeft overeenkomsten met het Rooms-Katholieke getijdengebed en de dagcyclus in de Oriëntaals-Orthodoxe tradities, wegens de gemeenschappelijke wortels. De betreffende psalmen staan in het liturgische boek dat het Horologion wordt genoemd.
              </p>
            </div>
          </div>
        </article>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
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
                const matching = serviceConfig.find((service) => service.ring === hourValue) ?? serviceConfig[0];
                const dotRadius = isActive ? 11.6 : 7.6;
                const dotIndex = serviceConfig.findIndex((service) => service.ring === hourValue || (hourValue === 0 && service.ring === 0));
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
                      onClick={() => openService(dotIndex >= 0 ? dotIndex : 0)}
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
                <div className="text-[10px] uppercase tracking-[0.26em] text-[#d8c39a]">{serviceConfig[activeIndex].time}</div>
            </div>
                <div className="font-display mt-2 text-2xl leading-none font-semibold text-[#f3e7c8]">{serviceConfig[activeIndex].title}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-parchment-3 bg-parchment-2 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            Beweeg over of tik op een stip om de bijbehorende dienst te lezen. De ring toont de traditionele tijdstippen van het volledige (monastieke) Horologion.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:pt-2">
          {serviceConfig.map((service, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={`${service.title}-${index}`}
                className={`overflow-hidden rounded-2xl border transition-all ${isActive ? 'border-gold/70 bg-gold-pale shadow-[0_0_0_1px_rgba(201,162,39,0.2)]' : 'border-parchment-3 bg-paper hover:border-gold'}`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  type="button"
                  onClick={() => openService(index)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d4aa3d]/70 text-sm font-bold text-[#1a100c] transition-all ${isActive ? 'scale-110' : ''}`} style={{ background: service.dot }}>
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-2xl font-semibold text-ink">{service.title}</span>
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                      <Clock3 className="h-3.5 w-3.5" />
                      {service.time}
                    </span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#d4aa3d]" />
                </button>
              </div>
            );
          })}
        </div>

        {open !== null && modalState && (
          <Modal
            open={Boolean(open !== null && modalState)}
            onClose={closeModal}
            eyebrow="24-uurs cyclus"
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
      </div>
    </section>
  );
}
