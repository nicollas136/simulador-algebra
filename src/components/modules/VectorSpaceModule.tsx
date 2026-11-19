import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, RefreshCw, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DataPoint {
  id: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  label: 'Bem-Estar' | 'Fadiga / Risco';
  color: string;
}

const INITIAL_POINTS: DataPoint[] = [
  // Cluster Bem-Estar (Upper Right)
  { id: '1', x: 75, y: 82, label: 'Bem-Estar', color: '#10b981' },
  { id: '2', x: 82, y: 76, label: 'Bem-Estar', color: '#10b981' },
  { id: '3', x: 68, y: 88, label: 'Bem-Estar', color: '#10b981' },
  { id: '4', x: 88, y: 85, label: 'Bem-Estar', color: '#10b981' },
  { id: '5', x: 72, y: 70, label: 'Bem-Estar', color: '#10b981' },
  { id: '6', x: 80, y: 92, label: 'Bem-Estar', color: '#10b981' },

  // Cluster Fadiga / Risco (Lower Left)
  { id: '7', x: 22, y: 35, label: 'Fadiga / Risco', color: '#f43f5e' },
  { id: '8', x: 28, y: 22, label: 'Fadiga / Risco', color: '#f43f5e' },
  { id: '9', x: 18, y: 40, label: 'Fadiga / Risco', color: '#f43f5e' },
  { id: '10', x: 35, y: 28, label: 'Fadiga / Risco', color: '#f43f5e' },
  { id: '11', x: 25, y: 15, label: 'Fadiga / Risco', color: '#f43f5e' },
  { id: '12', x: 40, y: 38, label: 'Fadiga / Risco', color: '#f43f5e' },
];

interface VectorSpaceModuleProps {
  onRunInPython: (code: string) => void;
}

export const VectorSpaceModule: React.FC<VectorSpaceModuleProps> = ({ onRunInPython }) => {
  const [points, setPoints] = useState<DataPoint[]>(INITIAL_POINTS);
  const [hyperplaneAngle, setHyperplaneAngle] = useState(135); // degrees
  const [hyperplaneBias, setHyperplaneBias] = useState(50); // offset center
  const [dimensions, setDimensions] = useState<'2D' | '3D' | '4D'>('2D');
  const [lastTestedPoint, setLastTestedPoint] = useState<DataPoint | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Normal vector w of the hyperplane: w = [cos(angle), sin(angle)]
  const angleRad = (hyperplaneAngle * Math.PI) / 180;
  const w1 = Math.cos(angleRad);
  const w2 = Math.sin(angleRad);
  // Bias b such that at (hyperplaneBias, hyperplaneBias) w1*x + w2*y + b = 0
  const b = -(w1 * hyperplaneBias + w2 * hyperplaneBias);

  // Evaluate accuracy of current hyperplane
  const classifiedPoints = points.map((p) => {
    const score = w1 * p.x + w2 * p.y + b;
    const predictedLabel = score >= 0 ? 'Bem-Estar' : 'Fadiga / Risco';
    const isCorrect = predictedLabel === p.label;
    return { ...p, score, predictedLabel, isCorrect };
  });

  const correctCount = classifiedPoints.filter((p) => p.isCorrect).length;
  const accuracy = Math.round((correctCount / points.length) * 100);

  // Draw 2D Vector Space with Clusters and Hyperplane
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Canvas Background grid
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

    // Cluster Affinity convex hulls / translucent zones
    // Well-being zone (upper right)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.beginPath();
    ctx.arc((78 / 100) * width, height - (82 / 100) * height, 75, 0, Math.PI * 2);
    ctx.fill();

    // Fatigue zone (lower left)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.beginPath();
    ctx.arc((28 / 100) * width, height - (30 / 100) * height, 75, 0, Math.PI * 2);
    ctx.fill();

    // Draw Hyperplane Decision Boundary: w1*x + w2*y + b = 0 => y = (-w1*x - b)/w2
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let pStart = { x: 0, y: 0 };
    let pEnd = { x: width, y: height };

    if (Math.abs(w2) > 0.001) {
      const y0 = (-w1 * 0 - b) / w2;
      const y100 = (-w1 * 100 - b) / w2;
      pStart = { x: 0, y: height - (y0 / 100) * height };
      pEnd = { x: width, y: height - (y100 / 100) * height };
    } else {
      const x0 = -b / w1;
      pStart = { x: (x0 / 100) * width, y: 0 };
      pEnd = { x: (x0 / 100) * width, y: height };
    }

    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();

    // Draw decision margin (+1 and -1 dashed lines)
    const marginOffset = 18;
    ctx.strokeStyle = '#818cf8';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pStart.x + w1 * marginOffset, pStart.y - w2 * marginOffset);
    ctx.lineTo(pEnd.x + w1 * marginOffset, pEnd.y - w2 * marginOffset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pStart.x - w1 * marginOffset, pStart.y + w2 * marginOffset);
    ctx.lineTo(pEnd.x - w1 * marginOffset, pEnd.y + w2 * marginOffset);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Data Points
    classifiedPoints.forEach((p) => {
      const px = (p.x / 100) * width;
      const py = height - (p.y / 100) * height;

      // Glow ring if misclassified
      if (!p.isCorrect) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw User Added Test Point
    if (lastTestedPoint) {
      const tx = (lastTestedPoint.x / 100) * width;
      const ty = height - (lastTestedPoint.y / 100) * height;
      ctx.fillStyle = lastTestedPoint.color;
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, 13, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`Novo Vetor: ${lastTestedPoint.label}`, tx + 14, ty - 6);
    }
  }, [points, hyperplaneAngle, hyperplaneBias, classifiedPoints, lastTestedPoint, w1, w2, b]);

  // Click on canvas to add a new test point
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / canvas.width) * 100);
    const y = Math.round((1 - (e.clientY - rect.top) / canvas.height) * 100);

    const score = w1 * x + w2 * y + b;
    const predictedLabel: 'Bem-Estar' | 'Fadiga / Risco' = score >= 0 ? 'Bem-Estar' : 'Fadiga / Risco';
    const color = predictedLabel === 'Bem-Estar' ? '#10b981' : '#f43f5e';

    const newPoint: DataPoint = {
      id: Date.now().toString(),
      x,
      y,
      label: predictedLabel,
      color,
    };

    setLastTestedPoint(newPoint);
    setPoints((prev) => [...prev, newPoint]);
  };

  const resetPoints = () => {
    setPoints(INITIAL_POINTS);
    setLastTestedPoint(null);
  };

  const pythonCode = `import numpy as np
from sklearn.svm import LinearSVC

# Dimensão 1: Abertura Palpebral (EAR) normalizada [0, 100]
# Dimensão 2: Ângulo Cervical/Coluna normalizado [0, 100]
X = np.array([
${points.map((p) => `    [${p.x}, ${p.y}],  # ${p.label}`).join('\n')}
])

# Rótulos binários: 1 para Bem-Estar, -1 para Fadiga/Risco
y = np.array([
${points.map((p) => `    ${p.label === 'Bem-Estar' ? 1 : -1},`).join('\n')}
])

# Treinando o Hiperplano de Separação (SVM Linear)
clf = LinearSVC(C=1.0)
clf.fit(X, y)

w = clf.coef_[0]
bias = clf.intercept_[0]

print("=== HIPERPLANO CALCULADO VIA SCIKIT-LEARN ===")
print(f"w1={w[0]:.4f}, w2={w[1]:.4f}, b={bias:.4f}")
print("Acurácia de Classificação:", f"{clf.score(X, y)*100:.1f}%")
`;

  return (
    <div className="space-y-6">
      {/* Title & Concept from Slide 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 3</span>
            <span>·</span>
            <span>Conceitos Básicos</span>
            <span>·</span>
            <span>Espaço Vetorial & Hiperplanos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            2. Espaço Vetorial: Afinidade e Linhas de Divisão
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Múltiplas dimensões são analisadas juntas. Elementos da mesma categoria formam
            <span className="text-slate-200 font-medium"> Grupos de Afinidade</span> e o sistema traça
            <span className="text-indigo-300 font-medium"> Linhas de Divisão (hiperplanos lineares)</span> para classificar o estado do trabalhador.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRunInPython(pythonCode)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Executar SVM em Python
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Canvas */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Clique no mapa para adicionar um vetor de teste
            </span>
            <button
              onClick={resetPoints}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Resetar Pontos
            </button>
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

          <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Bem-Estar / Produtivo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Fadiga / Risco
              </span>
            </div>
            <span className="font-mono text-[11px] text-indigo-400">Linha roxa = Hiperplano w·x + b = 0</span>
          </div>
        </div>

        {/* Controls & Math Info */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Hyperplane Controls */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Controles do Hiperplano de Decisão
            </h3>

            {/* Slider 1: Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Ângulo do Hiperplano (θ)</span>
                <span className="font-mono text-indigo-300 font-semibold">{hyperplaneAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={hyperplaneAngle}
                onChange={(e) => setHyperplaneAngle(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Slider 2: Bias */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Deslocamento (Bias b)</span>
                <span className="font-mono text-indigo-300 font-semibold">{hyperplaneBias}</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={hyperplaneBias}
                onChange={(e) => setHyperplaneBias(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Classification Scorecard */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Precisão da Linha de Divisão:</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    accuracy >= 90 ? 'text-emerald-400' : accuracy >= 70 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {accuracy}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    accuracy >= 90 ? 'bg-emerald-400' : accuracy >= 70 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">
                {accuracy >= 90
                  ? 'Separação ótima: os grupos de afinidade estão perfeitamente particionados.'
                  : 'Ajuste o ângulo e o bias para criar uma fronteira de decisão sem erros.'}
              </p>
            </div>

            {/* Hyperplane Equation */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-400 text-[10px]">Equação do Limite:</div>
              <div className="text-indigo-300">
                ({w1.toFixed(3)})·x₁ + ({w2.toFixed(3)})·x₂ + ({b.toFixed(2)}) = 0
              </div>
            </div>
          </div>

          {/* Dimension Selector Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2">Dimensões Analisadas Simultaneamente:</div>
            <div className="grid grid-cols-3 gap-2">
              {(['2D', '3D', '4D'] as const).map((dim) => (
                <button
                  key={dim}
                  onClick={() => setDimensions(dim)}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    dimensions === dim
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dim === '2D' && '2D (Cor & Postura)'}
                  {dim === '3D' && '3D (+ Textura)'}
                  {dim === '4D' && '4D (+ Expressão)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
