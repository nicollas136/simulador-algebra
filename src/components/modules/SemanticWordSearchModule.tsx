import React, { useState, useRef, useEffect } from 'react';
import {
  WORD_DATABASE,
  searchWordsByEmbedding,
  getVectorForText
} from '../../data/wordEmbeddingsData';
import { WordVector } from '../../types/simulator';
import { Search, Play, Sparkles, Filter, Info, ArrowUpRight } from 'lucide-react';

interface SemanticWordSearchModuleProps {
  onRunInPython: (code: string) => void;
}

export const SemanticWordSearchModule: React.FC<SemanticWordSearchModuleProps> = ({
  onRunInPython,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('cansaço extremo');
  const [topK, setTopK] = useState<number>(5);
  const [selectedWord, setSelectedWord] = useState<WordVector | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute query vector and search results
  const queryData = getVectorForText(searchQuery);
  const results = searchWordsByEmbedding(queryData.vector, topK);

  // Preset search queries covering multiple categories
  const presets = [
    { label: 'cansaço extremo', category: 'Saúde Mental' },
    { label: 'descanso e paz', category: 'Bem-Estar' },
    { label: 'dor na coluna', category: 'Ergonomia' },
    { label: 'redes neurais e embeddings', category: 'IA' },
    { label: 'opencv e bissetriz', category: 'Visão Computacional' },
    { label: 'psicólogo e acolhimento', category: 'Psicologia' },
    { label: 'liderança e equipe', category: 'Gestão' },
    { label: 'cone e cavalo', category: 'Objetos' },
  ];

  // Draw 2D Semantic Word Map Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = width * 0.42;

    ctx.clearRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Query position on screen
    const qx = cx + (queryData.x / 100) * scale;
    const qy = cy - (queryData.y / 100) * scale;

    // Draw connection rays from query point to Top-K neighbors
    results.forEach((res, rank) => {
      const wx = cx + (res.word.x / 100) * scale;
      const wy = cy - (res.word.y / 100) * scale;

      ctx.beginPath();
      ctx.strokeStyle = rank === 0 ? 'rgba(99, 102, 241, 0.8)' : 'rgba(148, 163, 184, 0.3)';
      ctx.setLineDash(rank === 0 ? [] : [3, 3]);
      ctx.lineWidth = rank === 0 ? 2 : 1;
      ctx.moveTo(qx, qy);
      ctx.lineTo(wx, wy);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw all words in the database
    WORD_DATABASE.forEach((w) => {
      const wx = cx + (w.x / 100) * scale;
      const wy = cy - (w.y / 100) * scale;

      const isTopResult = results.some((r) => r.word.word === w.word);
      const isSelected = selectedWord?.word === w.word;

      // Glow ring for top search results
      if (isTopResult) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wx, wy, 11, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.arc(wx, wy, isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();

      // Word Label
      ctx.fillStyle = isTopResult ? '#ffffff' : '#94a3b8';
      ctx.font = isTopResult ? 'bold 11px Plus Jakarta Sans, sans-serif' : '10px Plus Jakarta Sans, sans-serif';
      ctx.fillText(w.word, wx + 8, wy + 3);
    });

    // Draw Query Point (Target Pulse)
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(qx, qy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(qx, qy, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(`Consulta: "${searchQuery}"`, qx + 16, qy - 8);
  }, [searchQuery, queryData, results, selectedWord]);

  // Click on canvas to inspect word
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = canvas.width * 0.42;

    const clicked = WORD_DATABASE.find((w) => {
      const wx = cx + (w.x / 100) * scale;
      const wy = cy - (w.y / 100) * scale;
      return Math.hypot(x - wx, y - wy) < 16;
    });

    if (clicked) {
      setSelectedWord(clicked);
    }
  };

  const pythonCode = `import numpy as np

# ==============================================================================
# Slide 2: Busca Semântica de Palavras via Similaridade de Cosseno
# Proximidade é Semelhança: o computador mede cos(θ) em R^n
# ==============================================================================

# Consulta do usuário
termo_busca = "${searchQuery}"
vetor_consulta = np.array([${queryData.vector.map((v) => v.toFixed(3)).join(', ')}])

# Amostra do banco vetorial de palavras
banco_palavras = {
${results.map((r) => `    "${r.word.word}": np.array([${r.word.vector.map((v) => v.toFixed(3)).join(', ')}]),`).join('\n')}
}

print(f"=== RESULTADOS DA BUSCA SEMÂNTICA PARA: '{termo_busca.upper()}' ===")
for palavra, vetor_palavra in banco_palavras.items():
    # Similaridade de Cosseno: (A . B) / (||A|| * ||B||)
    cos_sim = np.dot(vetor_consulta, vetor_palavra) / (np.linalg.norm(vetor_consulta) * np.linalg.norm(vetor_palavra))
    dist_euc = np.linalg.norm(vetor_consulta - vetor_palavra)
    print(f"Palavra: '{palavra:<12}' | Similaridade Cosseno: {cos_sim:.4f} | Distância Euclidiana: {dist_euc:.4f}")
`;

  return (
    <div className="space-y-6">
      {/* Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 2</span>
            <span>·</span>
            <span>Conceitos Básicos</span>
            <span>·</span>
            <span>Busca Semântica de Palavras</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            1. Busca de Palavras por Similaridade Semântica
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Embeddings traduzem palavras em sequências numéricas no espaço <span className="font-mono text-indigo-300">ℝⁿ</span>.
            A busca mede o ângulo <span className="font-mono text-indigo-300">cos(θ)</span> para encontrar sinônimos conceituais mesmo quando as palavras escritas são totalmente diferentes.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Busca em Python
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite qualquer palavra ou conceito (ex: exaustão, felicidade, postura)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Top Vizinhos:</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 py-2.5 px-3 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
              <option value={8}>Top 8</option>
            </select>
          </div>
        </div>

        {/* Preset Queries */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
          <span className="text-slate-500">Exemplos Prontos:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(p.label)}
              className="px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/60 transition-colors cursor-pointer text-slate-300"
            >
              &quot;{p.label}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Word Vector Space */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Mapa Vetorial 2D de Palavras (Proximidade = Semelhança)
            </span>
            <span className="font-mono text-indigo-400 text-[11px]">
              {WORD_DATABASE.length} Palavras Indexadas
            </span>
          </div>

          <div className="relative flex items-center justify-center bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              width={520}
              height={420}
              onClick={handleCanvasClick}
              className="cursor-pointer w-full max-w-[520px] aspect-[52/42]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80 gap-2">
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Saúde Mental
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Bem-Estar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Ergonomia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Gestão
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                IA & Embeddings
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Software
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Visão Computacional
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Psicologia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Objetos
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Clique para inspecionar</span>
          </div>
        </div>

        {/* Right: Ranking Table & Vector Inspector */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Top-K Semantic Ranking */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Palavras Mais Próximas no Espaço Vetorial</span>
              <span className="text-xs font-mono text-indigo-400">Top {topK}</span>
            </h3>

            <div className="space-y-2">
              {results.map((res, index) => (
                <div
                  key={res.word.word}
                  onClick={() => setSelectedWord(res.word)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedWord?.word === res.word.word
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                      : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-white capitalize">{res.word.word}</span>
                      <span className="text-[11px] text-slate-500">· {res.word.category}</span>
                    </div>

                    <span className="font-mono text-xs font-bold text-indigo-400 tabular-nums">
                      {(res.similarity * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div
                      className="bg-indigo-400 h-1.5 rounded-full"
                      style={{ width: `${Math.max(0, res.similarity * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px]">{res.word.description}</span>
                    <span className="font-mono text-slate-500">d = {res.distance.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspected Word Vector Details */}
          {selectedWord && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white capitalize">{selectedWord.word}</span>
                <span className="text-slate-500 font-mono">Vetor de 8 Dimensões (ℝ⁸)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300 break-all leading-relaxed">
                [{selectedWord.vector.map((v) => v.toFixed(3)).join(', ')}]
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
