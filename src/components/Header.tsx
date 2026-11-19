import React from 'react';
import { ModuleId } from '../types/simulator';
import { Play, Terminal, Presentation, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  onOpenTerminal: () => void;
  onOpenSlides: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onSelectModule,
  onOpenTerminal,
  onOpenSlides,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectModule('semantic-search');
        }}
        className="flex items-center gap-2.5 text-slate-100 hover:text-white transition-colors whitespace-nowrap shrink-0 group"
      >
        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400 transition-colors">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </span>
        <span className="font-bold tracking-tight text-base sm:text-lg text-slate-100">
          VectorVision <span className="text-indigo-400 font-mono text-sm font-normal">· Python & Embeddings</span>
        </span>
      </a>

      {/* Zone 2: 4-5 single-line clean text links with active state */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectModule('semantic-search')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeModule === 'semantic-search' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          01. Busca Semântica
        </button>
        <button
          onClick={() => onSelectModule('word-algebra')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeModule === 'word-algebra' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          02. Álgebra de Palavras
        </button>
        <button
          onClick={() => onSelectModule('lexical-vs-semantic')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeModule === 'lexical-vs-semantic' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          03. Léxico vs Semântico
        </button>
        <button
          onClick={() => onSelectModule('word-space-clusters')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeModule === 'word-space-clusters' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          04. Espaço Vetorial
        </button>
        <button
          onClick={() => onSelectModule('burnout-text-search')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeModule === 'burnout-text-search' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          05. Cuidado & Burnout
        </button>
      </nav>

      {/* Zone 3: 1 primary action area */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSlides}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Presentation className="w-3.5 h-3.5 text-amber-400" />
          Ver Slides Originais
        </button>

        <button
          onClick={onOpenTerminal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5" />
          Executar em Python
        </button>
      </div>
    </header>
  );
};
