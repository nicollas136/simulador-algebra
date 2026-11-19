import React, { useState, useRef, useEffect } from 'react';
import {
  euclideanDistance,
  cosineSimilarity,
  manhattanDistance,
  dotProduct,
  vectorMagnitude
} from '../../utils/mathGeometry';
import { Play, Copy, Check, Info, Move, RotateCw, BookOpen } from 'lucide-react';

interface EmbeddingsBasicsModuleProps {
  onRunInPython: (code: string) => void;
}

export const EmbeddingsBasicsModule: React.FC<EmbeddingsBasicsModuleProps> = ({ onRunInPython }) => {
  // Vector A coordinates (-100 to 100 on canvas space, scaled)
  const [vecA, setVecA] = useState({ x: 80, y: 70, label: 'Expressão A (Alegria)' });
  const [vecB, setVecB] = useState({ x: 70, y: 85, label: 'Expressão B (Sorriso)' });
  const [activeDrag, setActiveDrag] = useState<'A' | 'B' | null>(null);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Math calculations
  const a = [vecA.x / 100, vecA.y / 100];
  const b = [vecB.x / 100, vecB.y / 100];

  const distEuc = euclideanDistance(a, b);
  const cosSim = cosineSimilarity(a, b);
  const distMan = manhattanDistance(a, b);
  const dotProd = dotProduct(a, b);
  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);

  const angleRad = Math.acos(Math.max(-1, Math.min(1, cosSim)));
  const angleDeg = (angleRad * 180) / Math.PI;

  // Preset scenarios matching Slide 2 & 10
  const presets = [
    {
      name: 'Alegria ↔ Sorriso (Alta Afinidade)',
      a: { x: 80, y: 75, label: 'Alegria' },
      b: { x: 75, y: 82, label: 'Sorriso' },
      note: 'Ângulo pequeno (~5°), cosseno próximo de 1.0. O modelo reconhece como semelhança facial imediata.',
    },
    {
      name: 'Cansaço ↔ Tristeza (Cluster de Fadiga)',
      a: { x: -65, y: -50, label: 'Cansaço' },
      b: { x: -70, y: -40, label: 'Tristeza' },
      note: 'Ambos se agrupam no quadrante de esgotamento e desânimo, acionando o alerta do fluxo de cuidado.',
    },
    {
      name: 'Alegria ↔ Esgotamento (Estados Opostos)',
      a: { x: 85, y: 65, label: 'Alegria' },
      b: { x: -80, y: -60, label: 'Esgotamento' },
      note: 'Vetores em direções quase opostas (cos ≈ -0.98). O sistema mede essa distância para quantificar mudança de humor.',
    },
    {
      name: 'Ortogonais (Independentes)',
      a: { x: 90, y: 0, label: 'Cor dos Olhos' },
      b: { x: 0, y: 90, label: 'Postura Cervical' },
      note: 'Produto escalar zero (cos = 0). Atributos ortogonais não interferem na medição de fadiga.',
    },
  ];

  // Draw 2D Vector Space on Canvas
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

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Coordinate Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Concentric similarity circles
    ctx.strokeStyle = '#1e293b';
    ctx.setLineDash([4, 4]);
    [0.33, 0.66, 1.0].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Vector coordinates on screen
    const screenAx = cx + (vecA.x / 100) * scale;
    const screenAy = cy - (vecA.y / 100) * scale;
    const screenBx = cx + (vecB.x / 100) * scale;
    const screenBy = cy - (vecB.y / 100) * scale;

    // Angle Arc between Vector A and B
    const angleA = Math.atan2(-(vecA.y / 100), vecA.x / 100);
    const angleB = Math.atan2(-(vecB.y / 100), vecB.x / 100);
    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    const arcRadius = 45;
    ctx.arc(cx, cy, arcRadius, Math.min(angleA, angleB), Math.max(angleA, angleB));
    ctx.stroke();

    // Distance line between heads
    ctx.beginPath();
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.5;
    ctx.moveTo(screenAx, screenAy);
    ctx.lineTo(screenBx, screenBy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance label mid-point
    const midX = (screenAx + screenBx) / 2;
    const midY = (screenAy + screenBy) / 2;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(`d = ${distEuc.toFixed(2)}`, midX + 6, midY - 6);

    // Draw Vector A (Indigo / Cyan)
    drawVectorArrow(ctx, cx, cy, screenAx, screenAy, '#38bdf8', `Vetor A: [${a[0].toFixed(2)}, ${a[1].toFixed(2)}]`);

    // Draw Vector B (Rose / Emerald)
    drawVectorArrow(ctx, cx, cy, screenBx, screenBy, '#f43f5e', `Vetor B: [${b[0].toFixed(2)}, ${b[1].toFixed(2)}]`);

    // Origin dot
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [vecA, vecB, distEuc, a, b]);

  function drawVectorArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label: string
  ) {
    const headLength = 12;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
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

    // Draggable handle ring
    ctx.beginPath();
    ctx.arc(toX, toY, 9, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vector Label
    ctx.fillStyle = color;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillText(label, toX + 12, toY - 8);
  }

  // Handle canvas mouse dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = canvas.width * 0.42;

    const screenAx = cx + (vecA.x / 100) * scale;
    const screenAy = cy - (vecA.y / 100) * scale;
    const screenBx = cx + (vecB.x / 100) * scale;
    const screenBy = cy - (vecB.y / 100) * scale;

    const distA = Math.hypot(x - screenAx, y - screenAy);
    const distB = Math.hypot(x - screenBx, y - screenBy);

    if (distA < 22) setActiveDrag('A');
    else if (distB < 22) setActiveDrag('B');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeDrag || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = canvas.width * 0.42;

    const normalizedX = Math.max(-100, Math.min(100, Math.round(((x - cx) / scale) * 100)));
    const normalizedY = Math.max(-100, Math.min(100, Math.round(((cy - y) / scale) * 100)));

    if (activeDrag === 'A') {
      setVecA((prev) => ({ ...prev, x: normalizedX, y: normalizedY }));
    } else {
      setVecB((prev) => ({ ...prev, x: normalizedX, y: normalizedY }));
    }
  };

  const handleMouseUp = () => {
    setActiveDrag(null);
  };

  // Generate python code for this exact vector configuration
  const generatedPythonCode = `import numpy as np

# Coordenadas interativas do simulador
v_a = np.array([${a[0].toFixed(3)}, ${a[1].toFixed(3)}])
v_b = np.array([${b[0].toFixed(3)}, ${b[1].toFixed(3)}])

# 1. Distância Euclidiana (Slide 2: Proximidade é Semelhança)
dist_euclidiana = np.linalg.norm(v_a - v_b)

# 2. Similaridade de Cosseno (cos θ = A.B / (||A|| * ||B||))
dot_prod = np.dot(v_a, v_b)
norm_a = np.linalg.norm(v_a)
norm_b = np.linalg.norm(v_b)
cos_sim = dot_prod / (norm_a * norm_b)
theta_deg = np.degrees(np.arccos(np.clip(cos_sim, -1.0, 1.0)))

print(f"Distância Euclidiana: {dist_euclidiana:.4f}")
print(f"Similaridade Cosseno: {cos_sim:.4f}")
print(f"Ângulo entre Vetores: {theta_deg:.2f}°")
`;

  const copyCode = () => {
    navigator.clipboard.writeText(generatedPythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Context from Slide 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 2</span>
            <span>·</span>
            <span>Conceitos Básicos</span>
            <span>·</span>
            <span>Álgebra Linear</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            1. O que são Embeddings? Espaço & Distâncias
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Embeddings transformam dados complexos (feições, posturas e imagens) em sequências numéricas organizadas em um mapa <span className="font-mono text-indigo-300">f: X → ℝⁿ</span>.
            O computador calcula distâncias e ângulos para saber o quão similares são.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRunInPython(generatedPythonCode)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Executar Vetores em Python
          </button>
        </div>
      </div>

      {/* Main Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Interactive Vector Canvas */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              Clique e arraste as pontas dos vetores
            </span>
            <span className="font-mono text-slate-500">Espaço Cartesiano ℝ² [-1.0, +1.0]</span>
          </div>

          <div className="relative flex items-center justify-center bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              width={520}
              height={420}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-crosshair w-full max-w-[520px] aspect-[52/42]"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 mb-2">Cenários dos Slides:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setVecA(preset.a);
                    setVecB(preset.b);
                  }}
                  className="text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.note}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Zone: Live Math Metrics & Python Output */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Real-time Math Scorecard */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Métricas Matemáticas de Similaridade
            </h3>

            {/* Metric 1: Cosine Similarity */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Similaridade de Cosseno (cos θ)</span>
                <span className="font-mono text-indigo-300 font-semibold text-sm tabular-nums">
                  {cosSim.toFixed(4)}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-400 h-1.5 rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(0, (cosSim + 1) * 50)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>-1.0 (Opostos)</span>
                <span>0.0 (Ortogonal)</span>
                <span>+1.0 (Idênticos)</span>
              </div>
            </div>

            {/* Metric 2: Euclidean Distance */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Distância Euclidiana (L₂)</span>
                <span className="font-mono text-cyan-300 font-semibold text-sm tabular-nums">
                  d = {distEuc.toFixed(4)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mede a separação física no mapa vetorial. Quanto menor, mais parecidos são os atributos.
              </p>
            </div>

            {/* Metric 3: Angle & Dot Product */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Ângulo entre Vetores</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-1 tabular-nums">
                  {angleDeg.toFixed(1)}°
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Produto Escalar (A · B)</div>
                <div className="text-base font-bold font-mono text-slate-200 mt-1 tabular-nums">
                  {dotProd.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Vectors Numeric State */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1">
              <div className="text-sky-400 flex justify-between">
                <span>Vetor A:</span>
                <span>[{a[0].toFixed(2)}, {a[1].toFixed(2)}] · ||A||={magA.toFixed(2)}</span>
              </div>
              <div className="text-rose-400 flex justify-between">
                <span>Vetor B:</span>
                <span>[{b[0].toFixed(2)}, {b[1].toFixed(2)}] · ||B||={magB.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Python Code Snippet Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">Python (NumPy / SciPy)</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80 leading-relaxed max-h-44">
              {generatedPythonCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
