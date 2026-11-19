import React, { useState } from 'react';
import { ModuleId } from './types/simulator';
import { Header } from './components/Header';
import { SemanticWordSearchModule } from './components/modules/SemanticWordSearchModule';
import { WordAlgebraModule } from './components/modules/WordAlgebraModule';
import { LexicalVsSemanticModule } from './components/modules/LexicalVsSemanticModule';
import { WordSpaceClustersModule } from './components/modules/WordSpaceClustersModule';
import { BurnoutTextSearchModule } from './components/modules/BurnoutTextSearchModule';
import { PythonTerminalModule } from './components/modules/PythonTerminalModule';
import { SlideDeckViewer } from './components/modules/SlideDeckViewer';
import { PRESENTATION_AUTHORS } from './data/slidesContent';
import {
  Search,
  PlusCircle,
  Split,
  Layers,
  Heart,
  Terminal,
  Presentation,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('semantic-search');
  const [pythonCodeToRun, setPythonCodeToRun] = useState<string | undefined>(undefined);

  const handleRunInPython = (code: string) => {
    setPythonCodeToRun(code);
    setActiveModule('python-terminal');
  };

  const navItems = [
    { id: 'semantic-search' as ModuleId, label: '01. Busca Semântica de Palavras', icon: Search },
    { id: 'word-algebra' as ModuleId, label: '02. Álgebra Vetorial (Word2Vec)', icon: PlusCircle },
    { id: 'lexical-vs-semantic' as ModuleId, label: '03. Busca Léxica vs Semântica', icon: Split },
    { id: 'word-space-clusters' as ModuleId, label: '04. Espaço Vetorial & Clusters', icon: Layers },
    { id: 'burnout-text-search' as ModuleId, label: '05. Triagem de Textos & Burnout', icon: Heart },
    { id: 'python-terminal' as ModuleId, label: '06. Terminal Python Interativo', icon: Terminal },
    { id: 'slide-deck' as ModuleId, label: '07. Apresentação dos Slides', icon: Presentation },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar strictly adhering to Top Bar Contract */}
      <Header
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenTerminal={() => setActiveModule('python-terminal')}
        onOpenSlides={() => setActiveModule('slide-deck')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Module Segmented Controller Strip */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-1.5 overflow-x-auto scrollbar-none flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-500/15 border border-indigo-500/40 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Active Module View */}
        <div className="min-h-[560px]">
          {activeModule === 'semantic-search' && (
            <SemanticWordSearchModule onRunInPython={handleRunInPython} />
          )}
          {activeModule === 'word-algebra' && (
            <WordAlgebraModule onRunInPython={handleRunInPython} />
          )}
          {activeModule === 'lexical-vs-semantic' && (
            <LexicalVsSemanticModule onRunInPython={handleRunInPython} />
          )}
          {activeModule === 'word-space-clusters' && (
            <WordSpaceClustersModule onRunInPython={handleRunInPython} />
          )}
          {activeModule === 'burnout-text-search' && (
            <BurnoutTextSearchModule onRunInPython={handleRunInPython} />
          )}
          {activeModule === 'python-terminal' && (
            <PythonTerminalModule initialCode={pythonCodeToRun} />
          )}
          {activeModule === 'slide-deck' && (
            <SlideDeckViewer onNavigateToModule={setActiveModule} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Simulador de Embeddings e Busca de Palavras</span>
            <span>·</span>
            <span>Álgebra Vetorial & NLP em Python</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span>Apresentado por:</span>
            {PRESENTATION_AUTHORS.map((author, i) => (
              <span key={i} className="text-slate-300 font-medium">
                {author.name}
                {i < PRESENTATION_AUTHORS.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
