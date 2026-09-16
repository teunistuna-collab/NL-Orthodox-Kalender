import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
  leadingActions?: ReactNode;
  maxWidth?: string;
  labelledBy?: string;
  centerTitle?: boolean;
};

export default function Modal({ open, onClose, title, eyebrow, children, actions, leadingActions, maxWidth = 'max-w-3xl', labelledBy, centerTitle = false }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#160b08]/75 p-2 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`paper card-shadow thin-scroll flex max-h-[94vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-[#c9a227]/55`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 shrink-0 overflow-hidden border-b border-[#c9a227]/45 bg-[#28170e] text-[#f8efdc]">
          <div className="orthodox-pattern absolute inset-0 opacity-25" />
          <div className={`relative px-5 py-4 sm:px-8 sm:py-5 ${centerTitle ? 'pb-5' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {eyebrow && <div className="text-[10px] font-bold tracking-[0.28em] text-[#f0cf7b] uppercase">{eyebrow}</div>}
                {!centerTitle && <h2 id={labelledBy} className="font-display mt-1 text-2xl font-semibold leading-tight text-[#fff8e9] sm:text-3xl">{title}</h2>}
              </div>
              {!centerTitle && <div className="flex shrink-0 items-center gap-1">{actions}<button type="button" onClick={onClose} className="rounded-full p-2 text-[#f8efdc] transition hover:bg-white/10" aria-label="Sluiten"><X className="h-6 w-6" /></button></div>}
              {centerTitle && <button type="button" onClick={onClose} className="absolute top-[-2px] right-[-4px] rounded-full p-2 text-[#f8efdc] transition hover:bg-white/10" aria-label="Sluiten"><X className="h-7 w-7" /></button>}
            </div>
            {centerTitle && (
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-5">
                <div className="justify-self-start">{leadingActions}</div>
                <div className="text-center">
                  <div className="mb-1 flex items-center justify-center gap-3 text-[#d9b45a]"><span className="h-px w-8 bg-[#d9b45a]" /><span className="text-lg leading-none">☦</span><span className="h-px w-8 bg-[#d9b45a]" /></div>
                  <h2 id={labelledBy} className="font-display text-2xl font-semibold leading-tight tracking-[0.08em] text-[#fff8e9] uppercase sm:text-3xl">{title}</h2>
                </div>
                <div className="justify-self-end">{actions}</div>
              </div>
            )}
          </div>
        </header>
        <div className="thin-scroll min-h-0 overflow-y-auto bg-[#fffaf0] px-5 py-6 text-ink sm:px-8">{children}</div>
      </div>
    </div>
  );
}
