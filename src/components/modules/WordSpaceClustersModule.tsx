import React, { useState, useRef, useEffect } from 'react';
import { WORD_DATABASE } from '../../data/wordEmbeddingsData';
import { WordVector } from '../../types/simulator';
import { Play, Layers, Sparkles, Filter, ShieldCheck } from 'lucide-react';

interface WordSpaceClustersModuleProps {
  onRunInPython: (code: string) => void;
}

export const WordSpaceClustersModule: React.FC<WordSpaceClustersModuleProps> = ({ onRunInPython }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCentroids, setShowCentroids] = useState<boolean>(true);
  const [showHyperplane, setShowHyperplane] = useState<boolean>(true);
  const [hyperplaneAngle, setHyperplaneAngle] = useState<number>(125);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = [
    { id: 'all', name: 'Todos os 9 Grupos' },
    { id: 'Saúde Mental & Risco', name: 'Saúde Mental & Risco', color: '#f43f5e' },
    { id: 'Bem-Estar & Positividade', name: 'Bem-Estar & Positividade', color: '#10b981' },
    { id: 'Ergonomia & Fisiologia', name: 'Ergonomia & Fisiologia', color: '#f59e0b' },
    { id: 'Trabalho & Gestão', name: 'Trabalho & Gestão', color: '#eab308' },
    { id: 'Inteligência Artificial', name: 'Inteligência Artificial', color: '#38bdf8' },
    { id: 'Tecnologia & Software', name: 'Tecnologia & Software', color: '#6366f1' },
    { id: 'Visão Computacional', name: 'Visão Computacional', color: '#a855f7' },
    { id: 'Psicologia & Cuidado', name: 'Psicologia & Cuidado', color: '#ec4899' },
    { id: 'Objetos & Geometria', name: 'Objetos & Geometria', color: '#14b8a6' },
  ];

  const filteredWords =
    selectedCategory === 'all'
      ? WORD_DATABASE
      : WORD_DATABASE.filter((w) => w.category === selectedCategory);

  // Calculate centroids
  const uniqueCategories = Array.from(new Set(WORD_DATABASE.map((w) => w.category)));
  const centroids = uniqueCategories.map((cat) => {
    const words = WORD_DATABASE.filter((w) => w.category === cat);
    const avgX = words.reduce((acc, w) => acc + w.x, 0) / words.length;
    const avgY = words.reduce((acc, w) => acc + w.y, 0) / words.length;
    const color = words[0]?.color || '#ffffff';
    return { category: cat, x: avgX, y: avgY, count: words.length, color };
  });

  // Draw Word Space Canvas
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

    // Grid
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
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Translucent cluster affinity zones (Slide 3)
    centroids.forEach((c) => {
      const centX = cx + (c.x / 100) * scale;
      const centY = cy - (c.y / 100) * scale;

      ctx.fillStyle = c.color + '15'; // 10% opacity
      ctx.beginPath();
      ctx.arc(centX, centY, 70, 0, Math.PI * 2);
      ctx.fill();

      // Cluster boundary circle
      ctx.strokeStyle = c.color + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centX, centY, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (showCentroids) {
        // Centroid crosshair
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(centX, centY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText(`Centróide [${c.category.split(' ')[0]}]`, centX + 10, centY - 8);
      }
    });

    // Draw Hyperplane separating Risk vs Well-Being
    if (showHyperplane) {
      const angleRad = (hyperplaneAngle * Math.PI) / 180;
      const slope = Math.tan(angleRad);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, cy - (0 - cx) * slope);
      ctx.lineTo(width, cy - (width - cx) * slope);
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText('Hiperplano de Separação (Slide 3)', 20, 30);
    }

    // Draw Words
    filteredWords.forEach((w) => {
      const wx = cx + (w.x / 100) * scale;
      const wy = cy - (w.y / 100) * scale;

      ctx.fillStyle = w.color;
      ctx.beginPath();
      ctx.arc(wx, wy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.fillText(w.word, wx + 7, wy + 3);
    });
  }, [filteredWords, centroids, showCentroids, showHyperplane, hyperplaneAngle]);

  const pythonCode = `import numpy as np
from sklearn.cluster import KMeans
from sklearn.svm import LinearSVC

# ==============================================================================
# Slide 3: Espaço Vetorial de Palavras - Grupos de Afinidade e Hiperplanos
# ==============================================================================

# Amostra de palavras vetorizadas em R^8
palavras = [${filteredWords.map((w) => `"${w.word}"`).join(', ')}]
X = np.array([
${filteredWords.map((w) => `    [${w.vector.map((v) => v.toFixed(3)).join(', ')}],  # ${w.word}`).join('\n')}
])

# 1. Agrupamento em Grupos de Afinidade (K-Means)
kmeans = KMeans(n_clusters=4, random_state=42)
kmeans.fit(X)

print("=== GRUPOS DE AFINIDADE DETECTADOS (K-MEANS) ===")
for i, centroide in enumerate(kmeans.cluster_centers_):
    print(f"Centróide do Grupo {i+1}:", np.round(centroide[:4], 3), "...")

print("\\n-> O algoritmo agrupa palavras de mesma temática por proximidade geométrica.")
`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 3</span>
            <span>·</span>
            <span>Conceitos Básicos</span>
            <span>·</span>
            <span>Espaço Vetorial & Clusters</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            4. Espaço Vetorial: Grupos de Afinidade e Centróides
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Palavras da mesma categoria se agrupam naturalmente na mesma região do mapa (clustering).
            Centróides representam o núcleo semântico de cada tema e linhas de divisão separam conceitos.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar K-Means em Python
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCentroids}
              onChange={(e) => setShowCentroids(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Mostrar Centróides</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHyperplane}
              onChange={(e) => setShowHyperplane(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Hiperplano de Separação</span>
          </label>
        </div>
      </div>

      {/* Canvas & Centroids Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-medium text-slate-300">
              Distribuição Global de Palavras no Espaço Vetorial
            </span>
            <span className="font-mono text-indigo-400">{filteredWords.length} palavras visíveis</span>
          </div>

          <div className="relative flex items-center justify-center bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              width={540}
              height={420}
              className="w-full max-w-[540px] aspect-[54/42]"
            />
          </div>

          {showHyperplane && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-4 text-xs">
              <span className="text-slate-400 shrink-0">Inclinação do Hiperplano (θ):</span>
              <input
                type="range"
                min="0"
                max="180"
                value={hyperplaneAngle}
                onChange={(e) => setHyperplaneAngle(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="font-mono text-purple-300 w-12 text-right">{hyperplaneAngle}°</span>
            </div>
          )}
        </div>

        {/* Centroids Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Centróides Semânticos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O ponto médio de cada grupo serve de referência rápida para classificar novas palavras ou frases que entram no sistema.
            </p>

            <div className="space-y-2.5 pt-2">
              {centroids.map((c) => (
                <div key={c.category} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                      {c.category}
                    </span>
                    <span className="font-mono text-slate-500">{c.count} palavras</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 flex justify-between">
                    <span>Coordenada: ({c.x.toFixed(1)}, {c.y.toFixed(1)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
