import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Vandaag from './components/Vandaag';
import Kalender from './components/Kalender';
import UrenCyclus from './components/UrenCyclus';
import Feesten from './components/Feesten';
import Vasten from './components/Vasten';
import Pascha from './components/Pascha';
import Heiligen from './components/Heiligen';
import Gebeden from './components/Gebeden';
import DagModal from './components/DagModal';
import LezingModal from './components/LezingModal';
import Ademcyclus from './components/Ademcyclus';
import Weekcyclus from './components/Weekcyclus';
import { CyclePageLayout, GoldDivider, LiturgicalCard, ParchmentSection, QuoteSection, SectionHeader } from './components/CycleSections';
import { AppContext, type LezingKeuze } from './lib/context';
import { vandaag as bepaalVandaag, ymd, type Mode } from './lib/kalender';
import { laadDagen, type HtcData } from './lib/htc';

const MODE_KEY = 'orthodoxe-kalender-mode';

function leesMode(): Mode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return v === 'oud' || v === 'nieuw' ? v : 'oud';
  } catch {
    return 'oud';
  }
}

export default function App() {
  const [mode, setModeState] = useState<Mode>(leesMode);
  const [vandaag, setVandaag] = useState(bepaalVandaag);
  const [htc, setHtc] = useState<HtcData | null>(null);
  const [htcFout, setHtcFout] = useState(false);
  const [dagOpen, setDagOpen] = useState<string | null>(null);
  const [lezing, setLezing] = useState<LezingKeuze | null>(null);

  useEffect(() => {
    laadDagen()
      .then(setHtc)
      .catch(() => setHtcFout(true));
  }, []);

  // Datum verversen als de pagina lang open staat.
  useEffect(() => {
    const t = setInterval(() => {
      const n = bepaalVandaag();
      if (ymd(n) !== ymd(vandaag)) setVandaag(n);
    }, 60_000);
    return () => clearInterval(t);
  }, [vandaag]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* geen opslag */
    }
  }, []);

  const openDag = useCallback((y: string) => setDagOpen(y), []);
  const openLezing = useCallback((l: LezingKeuze) => setLezing(l), []);
  const sluitDag = useCallback(() => setDagOpen(null), []);
  const sluitLezing = useCallback(() => setLezing(null), []);

  const ctx = useMemo(
    () => ({ mode, setMode, vandaag, vandaagYmd: ymd(vandaag), htc, htcFout, openDag, openLezing }),
    [mode, setMode, vandaag, htc, htcFout, openDag, openLezing],
  );

  return (
    <AppContext.Provider value={ctx}>
      <div id="top" className="min-h-screen bg-parchment text-ink">
        <Header />
        <main>
          <Vandaag />
          <Kalender />

          <Ademcyclus />

          <UrenCyclus />

          <Weekcyclus />

          <CyclePageLayout
            id="jaar"
            eyebrow="JAAR"
            title="Het jaarcyclus"
            intro="Het kerkelijk jaar is een voortdurende voorbereiding op de grote mysteries van het christelijk leven: geboorte, lijden, opstanding, lijden van de Heiligen en de door de Geest gedragen loop van de gemeente."
            quote="Het hele jaar stroomt door de grote heilige feesten, en elke maand draagt de herinnering van de Heilige Geest in zich."
            citation="Liturgisch jaar"
            body="De jaarcyclus verbindt de dagen van de gelovige met de geschiedenis van de Verlosser en met de schatkamer van de Heiligen. Het maakt de tijd van de kerk zichtbaar."
          >
            <ParchmentSection>
              <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeader
                  eyebrow="Een jaar van mysteriën"
                  title="Vaste feesten en heilige tijden"
                  subtitle="Het kerkelijk jaar geeft de tijd een sacramentele vorm: advent, vasten, pasen, pinksteren en de herdenking van de heiligen."
                />
                <div className="grid gap-5 md:grid-cols-3">
                  <LiturgicalCard
                    title="Advent en winter"
                    intro="Een tijd van voorbereiding, wachting en innerlijk ontwaken."
                    body="De gelovige wordt opnieuw geleid naar de komst van Christus in het hart en in de geschiedenis."
                    meta="WACHTEN"
                  />
                  <LiturgicalCard
                    title="Vasten en lijden"
                    intro="Het vasten is een vorm van reiniging, bevrijding en toewijding."
                    body="Door de vasten wordt de ziel geschoold in matigheid, gebed en oprechtheid."
                    meta="VASTEN"
                  />
                  <LiturgicalCard
                    title="Pasen en pinksteren"
                    intro="De grote feesten tonen het verlossingswerk en de volheid van de Geest."
                    body="Zij vormen het midden van het jaar en geven het ritme van de kerk zijn luister en kracht."
                    meta="VERRIJSENIS"
                  />
                </div>
                <GoldDivider />
                <QuoteSection
                  quote="Het jaar van de kerk draagt het leven van Christus in zijn telpunten, eenheid en pas."
                  citation="Jaarritme"
                />
              </div>
            </ParchmentSection>
          </CyclePageLayout>

          <Pascha />

          <Gebeden />
          <Vasten />
          <Heiligen />
          <Feesten />
        </main>
        <Footer />
        <DagModal ymd={dagOpen} onClose={sluitDag} onNavigate={openDag} />
        <LezingModal keuze={lezing} onClose={sluitLezing} />
      </div>
    </AppContext.Provider>
  );
}
