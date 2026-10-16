import React, { useState } from 'react';
import { Cpu, Phone } from 'lucide-react';
import { ButtonAuditModal } from './ButtonAuditModal';

export const Footer: React.FC = () => {
  const [showAudit, setShowAudit] = useState(false);

  return (
    <>
      <footer className="h-8 border-t border-white/10 bg-[#000008] flex items-center px-4 sm:px-6 fixed bottom-0 w-full z-50">
        <div className="flex-1 flex items-center gap-4 sm:gap-6 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/30">AXIS:</span>
            <span className="text-[9px] font-mono text-[#fbbf24] font-bold">33.34567°N</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/30">PLATFORM:</span>
            <span className="text-[9px] font-mono text-white/70">SHAAR_V8.0_STABLE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/30">IP_DIRECTOR:</span>
            <span className="text-[9px] font-mono text-white/80 font-bold">DAMONE_WARD_100%_OWNER</span>
          </div>

          <button
            onClick={() => setShowAudit(true)}
            className="flex items-center gap-1 text-[9px] font-mono text-[#10b981] hover:underline bg-[#10b981]/10 px-2 py-0.5 rounded cursor-pointer"
          >
            <Cpu size={10} />
            <span>AUDIT: 100% PASS</span>
          </button>

          <a
            href="tel:4432106995"
            className="hidden lg:flex items-center gap-1 text-[9px] font-mono text-white/50 hover:text-[#fbbf24] transition-colors"
          >
            <Phone size={10} />
            <span>443-210-6995</span>
          </a>

          <div className="flex-1 flex justify-end">
            <span className="text-[9px] font-hebrew text-white/30 tracking-[0.25em] uppercase italic whitespace-nowrap overflow-hidden text-ellipsis">
              רוּחַ · נֶשֶׁר · חַיִּים · דַּעַת · קוֹל · נְשִׁימָה · עַיִן · שַׁעַר · גַּן · רָפָא
            </span>
          </div>
        </div>
      </footer>

      <ButtonAuditModal isOpen={showAudit} onClose={() => setShowAudit(false)} />
    </>
  );
};
