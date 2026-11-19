import React, { useState } from 'react';
import { Play, Sliders, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface EvolutionTrainingModuleProps {
  onRunInPython: (code: string) => void;
}

export const EvolutionTrainingModule: React.FC<EvolutionTrainingModuleProps> = ({ onRunInPython }) => {
  const [dimensions, setDimensions] = useState<number>(2); // 2, 8, 32, 128, 512
  const [selectedPair, setSelectedPair] = useState<'cone-nariz' | 'cavalo-zebra'>('cone-nariz');

  // Compute collision and separation based on dimensionality
  // At d=2, distance is tiny (confusion), at d=128 distance is huge (high precision)
  const separationFactor = Math.min(1.0, (Math.log2(dimensions) - 1) / 8); // 0 at d=2, ~1 at d=512

  // Distances
  const distConeNariz = 0.04 + separationFactor * 1.82;
  const distCavaloZebra = 0.03 + separationFactor * 1.95;

  const currentDist = selectedPair === 'cone-nariz' ? distConeNariz : distCavaloZebra;
  const errorRate = Math.max(0.1, Math.round((1 - separationFactor) * 58));

  const pythonCode = `import numpy as np
from sklearn.decomposition import PCA

# ==============================================================================
# Slide 5: A Evolução do Treinamento
# Bancos Pequenos (2D/3D): Confusão Cone ↔ Nariz | Cavalo ↔ Zebra
# Grandes Bancos (128D/512D): Separação de alta precisão
# ==============================================================================

dimensao = ${dimensions}

# Gerando representações sintéticas com base na dimensionalidade escolhida:
np.random.seed(42)

# Em 2D, capturam apenas o contorno triangular geral
v_cone  = np.random.normal(loc=0.5, scale=0.05, size=dimensao)
v_nariz = np.random.normal(loc=0.5, scale=0.05, size=dimensao)

# Se temos mais dimensões, adicionamos características exclusivas (textura, orifícios)
if dimensao > 2:
    v_nariz[2:] += 0.8  # Detalhes anatômicos sutis (narinas, profundidade)

distancia = np.linalg.norm(v_cone - v_nariz)
cos_sim = np.dot(v_cone, v_nariz) / (np.linalg.norm(v_cone) * np.linalg.norm(v_nariz))

print(f"=== BANCO VETORIAL DE {dimensao} DIMENSÕES ===")
print(f"Distância Euclidiana: {distancia:.4f}")
print(f"Similaridade Cosseno: {cos_sim:.4f}")

if distancia < 0.20:
    print("❌ ALERTA DE COLISÃO NO ESPAÇO DE MEMÓRIA: Cone e Nariz confundidos!")
else:
    print("✅ RECONHECIMENTO EXATO: Objetos perfeitamente separados no hiper-espaço.")
`;

  return (
    <div className="space-y-6">
      {/* Title & Context from Slide 5 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 5</span>
            <span>·</span>
            <span>Visão Computacional</span>
            <span>·</span>
            <span>Evolução do Treinamento</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            4. Bancos Vetoriais Pequenos vs Grandes
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Como os mapas antigos tinham poucas dimensões, formatos parecidos se confundiam facilmente
            (<span className="text-rose-400 font-medium">Cone ↔ Nariz</span> e <span className="text-rose-400 font-medium">Cavalo ↔ Zebra</span>).
            Grandes bancos vetoriais modernos separam detalhes sutis com alta fidelidade.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Testar Dimensionalidade em Python
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Dimensionality Slider & Visual Comparison */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
          {/* Dimensionality Slider */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Dimensionalidade do Espaço de Memória:
              </span>
              <span className="font-mono text-sm font-bold text-indigo-400 tabular-nums">
                {dimensions} Dimensões (ℝ^{dimensions})
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={
                dimensions === 2 ? 1 : dimensions === 8 ? 2 : dimensions === 32 ? 3 : dimensions === 128 ? 4 : 5
              }
              onChange={(e) => {
                const val = Number(e.target.value);
                const mapping = [2, 8, 32, 128, 512];
                setDimensions(mapping[val - 1]);
              }}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span className={dimensions === 2 ? 'text-rose-400 font-bold' : ''}>2D (Modelos Antigos)</span>
              <span>8D</span>
              <span>32D</span>
              <span>128D</span>
              <span className={dimensions === 512 ? 'text-emerald-400 font-bold' : ''}>512D (Modelos Atuais)</span>
            </div>
          </div>

          {/* Pair Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Exemplo Clássico dos Slides:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPair('cone-nariz')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  selectedPair === 'cone-nariz'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Cone de Trânsito ↔ Nariz Humano
              </button>
              <button
                onClick={() => setSelectedPair('cavalo-zebra')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  selectedPair === 'cavalo-zebra'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Cavalo ↔ Zebra (Padrão de Listras)
              </button>
            </div>
          </div>

          {/* Visual Hyperspace Projection Stage */}
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/80 relative min-h-[220px] flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Projeção t-SNE / PCA no Plano 2D:</span>
              <span className="font-mono text-indigo-300">
                Distância Euclidiana = {currentDist.toFixed(3)}
              </span>
            </div>

            {/* Visual Vector Nodes moving apart */}
            <div className="relative w-full h-32 flex items-center justify-center">
              {/* Connecting distance line */}
              <div
                className="absolute h-0.5 bg-slate-700 transition-all duration-300"
                style={{
                  width: `${Math.max(20, separationFactor * 280)}px`,
                }}
              ></div>

              {/* Node 1 */}
              <div
                className="absolute flex flex-col items-center transition-all duration-300"
                style={{
                  transform: `translateX(-${Math.max(10, separationFactor * 140)}px)`,
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/60 flex items-center justify-center text-lg shadow-lg">
                  {selectedPair === 'cone-nariz' ? '🔺' : '🐎'}
                </div>
                <span className="text-[11px] font-semibold text-slate-200 mt-1">
                  {selectedPair === 'cone-nariz' ? 'Cone' : 'Cavalo'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">v₁</span>
              </div>

              {/* Node 2 */}
              <div
                className="absolute flex flex-col items-center transition-all duration-300"
                style={{
                  transform: `translateX(${Math.max(10, separationFactor * 140)}px)`,
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-lg shadow-lg">
                  {selectedPair === 'cone-nariz' ? '👃' : '🦓'}
                </div>
                <span className="text-[11px] font-semibold text-slate-200 mt-1">
                  {selectedPair === 'cone-nariz' ? 'Nariz' : 'Zebra'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">v₂</span>
              </div>
            </div>

            {/* Status Feedback */}
            <div className="mt-3 flex items-center justify-between text-xs">
              {dimensions <= 8 ? (
                <div className="flex items-center gap-1.5 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Colisão no Espaço: Formatos se confundem por falta de dimensões texturais.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Separação Exata: Detalhes finos isolados em eixos ortogonais adicionais.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Comparative Table & Technical Rationale */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Comparativo dos Slides</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Bancos Pequenos */}
              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-1.5">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  Primeiros Modelos
                </span>
                <div className="text-xs font-semibold text-slate-200">Bancos Vetoriais Pequenos</div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Poucas dimensões. Colapsos de projeção frequentes.
                </p>
                <div className="text-[10px] font-mono text-rose-300 mt-2">
                  Taxa de Erro: ~45%
                </div>
              </div>

              {/* Card 2: Modelos Atuais */}
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Modelos Atuais
                </span>
                <div className="text-xs font-semibold text-slate-200">Grandes Bancos Vetoriais</div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  128D - 512D. Separação de microexpressões faciais sutis.
                </p>
                <div className="text-[10px] font-mono text-emerald-300 mt-2">
                  Taxa de Erro: &lt; 0.5%
                </div>
              </div>
            </div>

            {/* Real-time Metric */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Probabilidade de Confusão do Modelo:</span>
                <span className="font-mono font-bold text-amber-400">{errorRate}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${errorRate}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200">Aplicação no Bem-Estar:</div>
              <p className="text-[11px]">
                Um banco de alta dimensionalidade é o que permite diferenciar com precisão um
                <strong className="text-slate-200"> sorriso verdadeiro</strong> de um
                <strong className="text-slate-200"> esgotamento disfarçado</strong> ou
                <strong className="text-slate-200"> cansaço ocular</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
