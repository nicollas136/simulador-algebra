import React, { useState, useRef, useEffect } from 'react';
import { WORD_DATABASE, WORD_ALGEBRA_PRESETS } from '../../data/wordEmbeddingsData';
import { WordVector } from '../../types/simulator';
import { normalize, cosineSimilarity, euclideanDistance } from '../../utils/mathGeometry';
import { Play, Plus, Minus, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface WordAlgebraModuleProps {
  onRunInPython: (code: string) => void;
}

export const WordAlgebraModule: React.FC<WordAlgebraModuleProps> = ({ onRunInPython }) => {
  const [wordA, setWordA] = useState<string>('trabalho');
  const [op1, setOp1] = useState<'+' | '-'>('+');
  const [wordB, setWordB] = useState<string>('exaustão');
  const [useThirdWord, setUseThirdWord] = useState<boolean>(false);
  const [op2, setOp2] = useState<'+' | '-'>('+');
  const [wordC, setWordC] = useState<string>('descanso');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Retrieve vectors
  const vecA = WORD_DATABASE.find((w) => w.word === wordA) || WORD_DATABASE[0];
  const vecB = WORD_DATABASE.find((w) => w.word === wordB) || WORD_DATABASE[1];
  const vecC = WORD_DATABASE.find((w) => w.word === wordC) || WORD_DATABASE[2];

  // Perform vector arithmetic
  const dim = vecA.vector.length;
  const resultVec: number[] = Array(dim).fill(0);
  let resX = vecA.x + (op1 === '+' ? vecB.x : -vecB.x);
  let resY = vecA.y + (op1 === '+' ? vecB.y : -vecB.y);

  for (let i = 0; i < dim; i++) {
    const valB = op1 === '+' ? vecB.vector[i] : -vecB.vector[i];
    resultVec[i] = vecA.vector[i] + valB;
  }

  if (useThirdWord) {
    resX += op2 === '+' ? vecC.x : -vecC.x;
    resY += op2 === '+' ? vecC.y : -vecC.y;
    for (let i = 0; i < dim; i++) {
      const valC = op2 === '+' ? vecC.vector[i] : -vecC.vector[i];
      resultVec[i] += valC;
    }
  }

  const normResult = normalize(resultVec);

  // Find nearest words in the database (excluding inputs)
  const excludedWords = [wordA, wordB, useThirdWord ? wordC : ''];
  const candidates = WORD_DATABASE.filter((w) => !excludedWords.includes(w.word));

  const rankedResults = candidates.map((w) => {
    const sim = cosineSimilarity(normResult, w.vector);
    const dist = euclideanDistance(normResult, w.vector);
    return { word: w, sim, dist };
  });

  rankedResults.sort((a, b) => b.sim - a.sim);
  const topResult = rankedResults[0];

  // Draw 2D Vector Arithmetic Canvas
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

    // Word A vector
    const ax = cx + (vecA.x / 100) * scale;
    const ay = cy - (vecA.y / 100) * scale;
    drawVectorArrow(ctx, cx, cy, ax, ay, '#38bdf8', vecA.word);

    // Tip-to-tail Vector B
    const bx = ax + ((op1 === '+' ? vecB.x : -vecB.x) / 100) * scale;
    const by = ay - ((op1 === '+' ? vecB.y : -vecB.y) / 100) * scale;
    drawVectorArrow(ctx, ax, ay, bx, by, '#f43f5e', `${op1} ${vecB.word}`);

    // If third word
    let finalX = bx;
    let finalY = by;
    if (useThirdWord) {
      finalX = bx + ((op2 === '+' ? vecC.x : -vecC.x) / 100) * scale;
      finalY = by - ((op2 === '+' ? vecC.y : -vecC.y) / 100) * scale;
      drawVectorArrow(ctx, bx, by, finalX, finalY, '#a855f7', `${op2} ${vecC.word}`);
    }

    // Resultant vector from origin to final point
    drawVectorArrow(ctx, cx, cy, finalX, finalY, '#10b981', `Vetor Resultado`, true);

    // Draw nearest target word
    if (topResult) {
      const tx = cx + (topResult.word.x / 100) * scale;
      const ty = cy - (topResult.word.y / 100) * scale;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(finalX, finalY);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`≈ "${topResult.word.word}"`, tx + 10, ty + 4);
    }
  }, [vecA, vecB, vecC, op1, op2, useThirdWord, topResult]);

  function drawVectorArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label: string,
    isBold: boolean = false
  ) {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.lineWidth = isBold ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.font = isBold ? 'bold 11px JetBrains Mono, monospace' : '10px JetBrains Mono, monospace';
    ctx.fillText(label, toX + 8, toY - 4);
  }

  const pythonCode = `import numpy as np

# ==============================================================================
# Álgebra Vetorial com Palavras (Word2Vec / Embeddings Semânticos)
# Operação: v('${wordA}') ${op1} v('${wordB}') ${useThirdWord ? `${op2} v('${wordC}')` : ''}
# ==============================================================================

v_a = np.array([${vecA.vector.map((v) => v.toFixed(3)).join(', ')}])
v_b = np.array([${vecB.vector.map((v) => v.toFixed(3)).join(', ')}])
${useThirdWord ? `v_c = np.array([${vecC.vector.map((v) => v.toFixed(3)).join(', ')}])` : ''}

# Operação vetorial no espaço latente
v_resultado = v_a ${op1} v_b ${useThirdWord ? `${op2} v_c` : ''}
v_resultado /= np.linalg.norm(v_resultado)

# Comparação com a palavra mais próxima
v_alvo = np.array([${topResult ? topResult.word.vector.map((v) => v.toFixed(3)).join(', ') : ''}])
cos_sim = np.dot(v_resultado, v_alvo)

print("=== OPERAÇÃO VETORIAL CONCLUÍDA ===")
print("Equação: [${wordA.toUpperCase()}] ${op1} [${wordB.toUpperCase()}] ${useThirdWord ? `${op2} [${wordC.toUpperCase()}]` : ''}")
print(f"Palavra mais próxima encontrada no vocabulário: '{topResult?.word.word.toUpperCase()}'")
print(f"Similaridade de Cosseno: {cos_sim:.4f}")
`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 3</span>
            <span>·</span>
            <span>Álgebra Linear</span>
            <span>·</span>
            <span>Aritmética Vetorial de Palavras</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            2. Álgebra com Embeddings: Somando e Subtraindo Palavras
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Assim como o clássico <span className="font-mono text-indigo-300">Rei - Homem + Mulher = Rainha</span>,
            a matemática de vetores permite somar conceitos de saúde e trabalho:
            <span className="font-mono text-emerald-400"> Trabalho + Exaustão = Burnout</span>.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Álgebra em Python
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {WORD_ALGEBRA_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setWordA(preset.wordA);
              setOp1(preset.op1);
              setWordB(preset.wordB);
              if (preset.wordC && preset.op2) {
                setUseThirdWord(true);
                setOp2(preset.op2);
                setWordC(preset.wordC);
              } else {
                setUseThirdWord(false);
              }
            }}
            className="p-3 text-left rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-all cursor-pointer group"
          >
            <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
              {preset.title}
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">
              {preset.explanation}
            </div>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Left */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-medium text-slate-300">
              Regra do Paralelogramo e Soma Vetorial (Ponta com Ponta)
            </span>
            <span className="font-mono text-emerald-400">Vetor Verde = Resultado</span>
          </div>

          <div className="relative flex items-center justify-center bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              width={520}
              height={420}
              className="w-full max-w-[520px] aspect-[52/42]"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Dimensões latentes preservam analogias semânticas contínuas.</span>
          </div>
        </div>

        {/* Controls Right */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Equation Builder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Montar Equação de Palavras</h3>

            <div className="space-y-3">
              {/* Word A */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Palavra A:</label>
                <select
                  value={wordA}
                  onChange={(e) => setWordA(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white capitalize cursor-pointer focus:outline-none"
                >
                  {WORD_DATABASE.map((w) => (
                    <option key={w.word} value={w.word}>
                      {w.word} ({w.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operator 1 */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setOp1('+')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    op1 === '+'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  + (Somar)
                </button>
                <button
                  onClick={() => setOp1('-')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    op1 === '-'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  - (Subtrair)
                </button>
              </div>

              {/* Word B */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Palavra B:</label>
                <select
                  value={wordB}
                  onChange={(e) => setWordB(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white capitalize cursor-pointer focus:outline-none"
                >
                  {WORD_DATABASE.map((w) => (
                    <option key={w.word} value={w.word}>
                      {w.word} ({w.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Third Word Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useThirdWord}
                    onChange={(e) => setUseThirdWord(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Adicionar 3ª palavra (ex: - Estresse + Descanso)</span>
                </label>
              </div>

              {useThirdWord && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setOp2('+')}
                      className={`px-3 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                        op2 === '+' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => setOp2('-')}
                      className={`px-3 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                        op2 === '-' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      -
                    </button>
                  </div>
                  <select
                    value={wordC}
                    onChange={(e) => setWordC(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white capitalize cursor-pointer focus:outline-none"
                  >
                    {WORD_DATABASE.map((w) => (
                      <option key={w.word} value={w.word}>
                        {w.word} ({w.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Target Convergence Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                Palavra Resultante Mais Próxima:
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-white capitalize">
                  {topResult?.word.word}
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {(topResult?.sim * 100).toFixed(1)}% similaridade
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                {topResult?.word.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
