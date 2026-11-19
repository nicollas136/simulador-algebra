import React, { useState } from 'react';
import { SLIDES_DATA, PRESENTATION_AUTHORS } from '../../data/slidesContent';
import { ModuleId } from '../../types/simulator';
import { ChevronLeft, ChevronRight, Play, Presentation, Sparkles, Users } from 'lucide-react';

interface SlideDeckViewerProps {
  onNavigateToModule: (moduleId: ModuleId) => void;
}

export const SlideDeckViewer: React.FC<SlideDeckViewerProps> = ({ onNavigateToModule }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const slide = SLIDES_DATA[currentSlideIndex];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES_DATA.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES_DATA.length) % SLIDES_DATA.length);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar for Slide Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Apresentação Original em PDF</span>
            <span>·</span>
            <span>Inteligência Artificial & Visão Computacional</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Slides da Apresentação
          </h2>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-slate-400 px-2 tabular-nums">
            Slide {currentSlideIndex + 1} de {SLIDES_DATA.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Card mimicking the PDF design */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0c142b] via-[#090e1f] to-[#060914] border border-slate-800/80 p-8 sm:p-12 shadow-2xl min-h-[440px] flex flex-col justify-between overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Slide Header */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-indigo-400">
              {slide.category}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Slide 0{slide.number}
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {slide.title}
          </h3>

          {slide.subtitle && (
            <p className="text-sm sm:text-base text-slate-300 font-light max-w-3xl leading-relaxed">
              {slide.subtitle}
            </p>
          )}
        </div>

        {/* Slide Body Content */}
        <div className="my-8 space-y-4 relative z-10">
          <div className="space-y-3">
            {slide.bulletPoints.map((point: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 shrink-0"></span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          {slide.number === 1 && (
            <div className="pt-6 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Integrantes da Apresentação:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-200">
                {PRESENTATION_AUTHORS.map((auth, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60"
                  >
                    {auth.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer with Jump-to-Simulator Action */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Conceito Chave: </span>
            {slide.keyConcept}
          </div>

          <button
            onClick={() => onNavigateToModule(slide.targetModule)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Abrir Simulador Interativo Deste Slide
          </button>
        </div>
      </div>

      {/* Slide Thumbnails navigation strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {SLIDES_DATA.map((s, idx) => (
          <button
            key={s.number}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              currentSlideIndex === idx
                ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-mono text-indigo-400">Slide 0{s.number}</div>
            <div className="text-xs font-semibold truncate mt-0.5">{s.title.replace(/^\d+\.\s*/, '')}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
