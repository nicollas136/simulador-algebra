import React, { useState } from 'react';
import { Play, Eye, Grid, Sparkles, Filter } from 'lucide-react';

interface FeatureExtractionModuleProps {
  onRunInPython: (code: string) => void;
}

// 8x8 sample images (Grayscale 0-255)
const PATTERNS: Record<string, { name: string; description: string; data: number[][] }> = {
  face: {
    name: 'Feição Facial Simples (Olhos & Boca)',
    description: 'Padrão com dois olhos, ponte nasal e arco labial.',
    data: [
      [20, 20, 20, 20, 20, 20, 20, 20],
      [20, 240, 240, 30, 30, 240, 240, 20], // Eyes
      [20, 240, 240, 30, 30, 240, 240, 20],
      [20, 30, 30, 210, 210, 30, 30, 20],   // Nose bridge
      [20, 30, 30, 210, 210, 30, 30, 20],
      [20, 220, 30, 30, 30, 30, 220, 20],   // Smile edges
      [20, 30, 240, 240, 240, 240, 30, 20], // Smile curve
      [20, 20, 20, 20, 20, 20, 20, 20],
    ],
  },
  posture: {
    name: 'Linha Estrutural de Postura (Ombro & Coluna)',
    description: 'Linha reta horizontal e coluna vertical em ângulo.',
    data: [
      [30, 30, 30, 220, 30, 30, 30, 30],
      [30, 30, 30, 220, 30, 30, 30, 30],
      [230, 230, 230, 230, 230, 230, 230, 230], // Shoulder line
      [30, 30, 30, 220, 30, 30, 30, 30],
      [30, 30, 220, 30, 30, 30, 30, 30], // Slight spine curvature
      [30, 30, 220, 30, 30, 30, 30, 30],
      [30, 220, 30, 30, 30, 30, 30, 30],
      [30, 220, 30, 30, 30, 30, 30, 30],
    ],
  },
  corner: {
    name: 'Borda e Cantos Estruturais (Harris)',
    description: 'Bordas ortogonais ideais para detecção de cantos.',
    data: [
      [240, 240, 240, 240, 20, 20, 20, 20],
      [240, 240, 240, 240, 20, 20, 20, 20],
      [240, 240, 240, 240, 20, 20, 20, 20],
      [240, 240, 240, 240, 20, 20, 20, 20],
      [20, 20, 20, 20, 20, 20, 20, 20],
      [20, 20, 20, 20, 20, 20, 20, 20],
      [20, 20, 20, 20, 20, 20, 20, 20],
      [20, 20, 20, 20, 20, 20, 20, 20],
    ],
  },
};

type FilterType = 'raw' | 'sobel-h' | 'sobel-v' | 'laplacian';

export const FeatureExtractionModule: React.FC<FeatureExtractionModuleProps> = ({ onRunInPython }) => {
  const [activePattern, setActivePattern] = useState<string>('face');
  const [activeFilter, setActiveFilter] = useState<FilterType>('sobel-h');
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  const rawGrid = PATTERNS[activePattern].data;

  // Apply 3x3 convolution
  const applyConvolution = (grid: number[][], kernel: number[][]): number[][] => {
    const rows = grid.length;
    const cols = grid[0].length;
    const result: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));

    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        let sum = 0;
        for (let kr = -1; kr <= 1; kr++) {
          for (let kc = -1; kc <= 1; kc++) {
            sum += grid[r + kr][c + kc] * kernel[kr + 1][kc + 1];
          }
        }
        result[r][c] = Math.min(255, Math.max(0, Math.abs(sum)));
      }
    }
    return result;
  };

  // Kernels
  const kernels = {
    'sobel-h': [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
    'sobel-v': [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
    'laplacian': [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
    ],
  };

  const processedGrid = activeFilter === 'raw' ? rawGrid : applyConvolution(rawGrid, kernels[activeFilter]);

  // Generate 8-dimensional compact feature vector from the processed grid
  const compactEmbedding = [
    Math.round(processedGrid[1][1] * 0.8 + processedGrid[1][6] * 0.2), // Dim 1: Região Olho Esq
    Math.round(processedGrid[1][6] * 0.8 + processedGrid[1][1] * 0.2), // Dim 2: Região Olho Dir
    Math.round(processedGrid[3][3] + processedGrid[4][4]),             // Dim 3: Eixo Central
    Math.round(processedGrid[6][3] + processedGrid[6][4]),             // Dim 4: Curvatura Labial
    Math.round(processedGrid.flat().reduce((a, b) => a + b, 0) / 64),  // Dim 5: Densidade de Bordas
    Math.round(processedGrid[2].reduce((a, b) => a + b, 0) / 8),       // Dim 6: Gradiente Superior
    Math.round(processedGrid[6].reduce((a, b) => a + b, 0) / 8),       // Dim 7: Gradiente Inferior
    Math.round(Math.abs(processedGrid[1][2] - processedGrid[1][5])),    // Dim 8: Simetria Bilateral
  ];

  const pythonCode = `import cv2
import numpy as np

# Slide 4: Visão Computacional na Prática
# Convertendo pixels brutos em vetores descritivos via filtros de convolução

imagem_bruta = np.array(${JSON.stringify(rawGrid)}, dtype=np.uint8)

# 1. Filtro de Sobel Horizontal (Detecta bordas horizontais)
sobel_h = cv2.Sobel(imagem_bruta, cv2.CV_64F, 0, 1, ksize=3)

# 2. Filtro de Sobel Vertical (Detecta bordas verticais)
sobel_v = cv2.Sobel(imagem_bruta, cv2.CV_64F, 1, 0, ksize=3)

# 3. Laplaciano (Contornos omnidirecionais)
laplacian = cv2.Laplacian(imagem_bruta, cv2.CV_64F)

# 4. Vetorização de Características (Feature Vector)
feature_vector = np.array([
    np.mean(sobel_h[1:3, :]),
    np.mean(sobel_v[:, 3:5]),
    np.std(laplacian),
    np.sum(imagem_bruta > 128)
])

print("=== EXTRAÇÃO DE CARACTERÍSTICAS COM OPENCV ===")
print("Tamanho Imagem Bruta:", imagem_bruta.shape, "-> 64 pixels")
print("Vetor de Características Reduzido:", feature_vector)
print("-> O modelo agora processa a semântica da forma e não apenas cores soltas.")
`;

  return (
    <div className="space-y-6">
      {/* Title & Concept from Slide 4 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 4</span>
            <span>·</span>
            <span>Visão Computacional na Prática</span>
            <span>·</span>
            <span>Feature Extraction</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            3. Além dos Pixels: De Matriz Bruta para Vetor Estrutural
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Em vez de olhar apenas para pontos de cor, a IA identifica formatos, bordas e estruturas inteiras.
            A imagem bruta é uma grade de brilho que se torna um vetor compacto de características.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Convolução em Python
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pixel Matrix & Filter Toggle */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-300">Escolha o Padrão de Entrada:</span>
            <div className="flex items-center gap-1.5">
              {Object.keys(PATTERNS).map((key) => (
                <button
                  key={key}
                  onClick={() => setActivePattern(key)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    activePattern === key
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {PATTERNS[key].name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveFilter('raw')}
              className={`flex-1 py-1.5 px-2 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'raw' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Imagem Bruta (Pixels)
            </button>
            <button
              onClick={() => setActiveFilter('sobel-h')}
              className={`flex-1 py-1.5 px-2 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'sobel-h' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sobel Horizontal
            </button>
            <button
              onClick={() => setActiveFilter('sobel-v')}
              className={`flex-1 py-1.5 px-2 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'sobel-v' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sobel Vertical
            </button>
            <button
              onClick={() => setActiveFilter('laplacian')}
              className={`flex-1 py-1.5 px-2 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === 'laplacian' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Laplaciano
            </button>
          </div>

          {/* Interactive 8x8 Grid Canvas */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
            <div className="grid grid-cols-8 gap-1.5 w-full max-w-[380px]">
              {processedGrid.map((row, r) =>
                row.map((val, c) => {
                  const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
                  return (
                    <div
                      key={`${r}-${c}`}
                      onMouseEnter={() => setHoveredCell({ r, c })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        backgroundColor: `rgb(${val}, ${val}, ${Math.min(255, val + 25)})`,
                      }}
                      className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-all duration-150 ${
                        isHovered ? 'ring-2 ring-indigo-400 scale-110 z-10' : 'border border-slate-900/40'
                      }`}
                    >
                      <span
                        className={`text-[9px] font-mono font-bold ${
                          val > 120 ? 'text-slate-950' : 'text-slate-300'
                        }`}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 text-xs text-slate-500 font-mono text-center">
              {hoveredCell
                ? `Pixel [${hoveredCell.r}, ${hoveredCell.c}] = Intensidade ${processedGrid[hoveredCell.r][hoveredCell.c]}`
                : 'Passe o mouse sobre os pixels para inspecionar os valores numéricos'}
            </div>
          </div>
        </div>

        {/* Right: Feature Extraction & Vector Representation */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Vetor de Características Extraído (8 Dimensões)
            </h3>

            <p className="text-xs text-slate-400">
              A rede neural compacta a matriz bidimensional de 64 pixels em um vetor denso em ℝ⁸:
            </p>

            <div className="space-y-2 font-mono text-xs">
              {compactEmbedding.map((val, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Dimensão v_{idx + 1}:</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (val / 255) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-indigo-300 font-bold tabular-nums w-8 text-right">{val}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
              <strong>Resultado da Vetorização:</strong> Este vetor de 8 dimensões agora pode ser comparado contra o banco vetorial de expressões faciais via Cosseno e Distância Euclidiana!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
