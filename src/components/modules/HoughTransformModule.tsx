import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Trash2, Sliders, Sparkles, CheckCircle2 } from 'lucide-react';
import { houghRho } from '../../utils/mathGeometry';

interface Point {
  x: number;
  y: number;
  id: number;
}

interface HoughTransformModuleProps {
  onRunInPython: (code: string) => void;
}

export const HoughTransformModule: React.FC<HoughTransformModuleProps> = ({ onRunInPython }) => {
  // Preset points in image space
  const [points, setPoints] = useState<Point[]>([
    { id: 1, x: 60, y: 140 },
    { id: 2, x: 120, y: 140 },
    { id: 3, x: 180, y: 140 },
    { id: 4, x: 240, y: 140 },
  ]);

  const [threshold, setThreshold] = useState<number>(3); // minimum votes to detect line
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const paramCanvasRef = useRef<HTMLCanvasElement>(null);

  // Discrete theta range from -90° to +90° in steps of 2°
  const thetaSteps: number[] = [];
  for (let t = -90; t <= 90; t += 2) {
    thetaSteps.push((t * Math.PI) / 180);
  }

  // Calculate vote accumulator
  const accumulator: Record<string, { votes: number; points: Point[]; rho: number; theta: number }> = {};

  points.forEach((pt) => {
    thetaSteps.forEach((thetaRad) => {
      // Scale coordinates relative to canvas center
      const nx = pt.x - 150;
      const ny = pt.y - 150;
      const rho = Math.round(houghRho(nx, ny, thetaRad) / 4) * 4; // bin into 4px buckets
      const key = `${thetaRad.toFixed(2)}_${rho}`;
      if (!accumulator[key]) {
        accumulator[key] = { votes: 0, points: [], rho, theta: thetaRad };
      }
      accumulator[key].votes += 1;
      accumulator[key].points.push(pt);
    });
  });

  // Find peak voted lines
  const detectedLines = Object.values(accumulator).filter((item) => item.votes >= threshold);
  detectedLines.sort((a, b) => b.votes - a.votes);
  const peakLine = detectedLines.length > 0 ? detectedLines[0] : null;

  // Presets from Slide 7
  const setPreset = (type: 'ombros' | 'coluna' | 'mesa') => {
    if (type === 'ombros') {
      setPoints([
        { id: 1, x: 60, y: 140 },
        { id: 2, x: 110, y: 140 },
        { id: 3, x: 160, y: 140 },
        { id: 4, x: 210, y: 140 },
        { id: 5, x: 260, y: 140 },
      ]);
    } else if (type === 'coluna') {
      setPoints([
        { id: 1, x: 150, y: 50 },
        { id: 2, x: 145, y: 100 },
        { id: 3, x: 140, y: 150 },
        { id: 4, x: 135, y: 200 },
        { id: 5, x: 130, y: 250 },
      ]);
    } else {
      setPoints([
        { id: 1, x: 40, y: 220 },
        { id: 2, x: 100, y: 220 },
        { id: 3, x: 160, y: 220 },
        { id: 4, x: 220, y: 220 },
        { id: 5, x: 280, y: 220 },
      ]);
    }
  };

  // Draw Image Space Canvas
  useEffect(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center axes
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw detected line from Hough Space
    if (peakLine) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;

      const cos = Math.cos(peakLine.theta);
      const sin = Math.sin(peakLine.theta);
      const x0 = cos * peakLine.rho + width / 2;
      const y0 = sin * peakLine.rho + height / 2;

      ctx.beginPath();
      ctx.moveTo(x0 + 1000 * -sin, y0 + 1000 * cos);
      ctx.lineTo(x0 - 1000 * -sin, y0 - 1000 * cos);
      ctx.stroke();
    }

    // Draw points in Image Space
    points.forEach((pt, i) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`P${i + 1}`, pt.x + 8, pt.y - 4);
    });
  }, [points, peakLine]);

  // Draw Parameter Space Canvas (Hough Space Curves)
  useEffect(() => {
    const canvas = paramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid in parameter space
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Zero axes
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('-90° (θ)', 10, height / 2 - 6);
    ctx.fillText('+90° (θ)', width - 55, height / 2 - 6);
    ctx.fillText('+ρ', width / 2 + 6, 15);
    ctx.fillText('-ρ', width / 2 + 6, height - 10);

    // Draw a sinusoid curve for each point in image space: ρ = x*cos(θ) + y*sin(θ)
    const colors = ['#38bdf8', '#f43f5e', '#a855f7', '#fbbf24', '#34d399', '#f97316'];

    points.forEach((pt, pIdx) => {
      ctx.strokeStyle = colors[pIdx % colors.length];
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const nx = pt.x - 150;
      const ny = pt.y - 150;

      for (let px = 0; px < width; px += 2) {
        // Map pixel x to theta: -PI/2 to +PI/2
        const theta = -Math.PI / 2 + (px / width) * Math.PI;
        const rho = houghRho(nx, ny, theta);
        // Map rho to canvas y
        const py = height / 2 - (rho / 160) * (height / 2);

        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // Highlight intersection point (Peak of Votes)
    if (peakLine) {
      const peakX = ((peakLine.theta + Math.PI / 2) / Math.PI) * width;
      const peakY = height / 2 - (peakLine.rho / 160) * (height / 2);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(peakX, peakY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(peakX, peakY, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(
        `Votação: ${peakLine.votes} votos!`,
        Math.min(width - 120, Math.max(10, peakX + 12)),
        peakY - 10
      );
    }
  }, [points, peakLine]);

  // Click on image canvas to add point
  const handleImageCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    setPoints((prev) => [...prev, { id: Date.now(), x, y }]);
  };

  const clearPoints = () => {
    setPoints([]);
  };

  const pythonCode = `import cv2
import numpy as np

# ==============================================================================
# Slide 7: Transformada de Hough com OpenCV (cv2.HoughLines)
# Mapeia pontos de borda no espaço polar: ρ = x*cos(θ) + y*sin(θ)
# ==============================================================================

# 1. Cria imagem sintética e desenha os pontos marcados no simulador
imagem = np.zeros((300, 300), dtype=np.uint8)
pontos = ${JSON.stringify(points.map((p) => [p.x, p.y]))}

for x, y in pontos:
    imagem[int(y), int(x)] = 255

# 2. Executa a Transformada de Hough padrão
# rho_res = 1 px, theta_res = 1 grau (np.pi/180), threshold = mínimo de votos
linhas = cv2.HoughLines(imagem, rho=1, theta=np.pi/180, threshold=${threshold})

print("=== TRANSFORMADA DE HOUGH EXECUTADA VIA OPENCV ===")
if linhas is not None:
    print(f"Total de retas colineares detectadas: {len(linhas)}")
    for i, linha in enumerate(linhas[:3]):
        rho, theta = linha[0]
        theta_deg = np.degrees(theta)
        print(f"Reta {i+1}: ρ = {rho:.1f} px | θ = {theta_deg:.1f}°")
else:
    print("Nenhuma reta atingiu o limite de votos (threshold). Adicione mais pontos colineares.")
`;

  return (
    <div className="space-y-6">
      {/* Title & Concept from Slide 7 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 7</span>
            <span>·</span>
            <span>Geometria & Vetores</span>
            <span>·</span>
            <span>Transformada de Hough (OpenCV)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            6. Encontrando Formas: O Espaço de Parâmetros de Hough
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Mapeia pontos da imagem <span className="font-mono text-indigo-300">(x, y)</span> para o espaço polar
            <span className="font-mono text-indigo-300"> ρ = x·cos(θ) + y·sin(θ)</span>. Quando múltiplos pontos votam na mesma interseção, o sistema identifica uma borda estrutural ou alinhamento postural.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Hough em Python
        </button>
      </div>

      {/* Dual Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image Space Canvas */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">1. Espaço da Imagem (x, y)</span>
            <span className="font-mono text-slate-500">Clique para adicionar pontos</span>
          </div>

          <div className="bg-slate-950 rounded-lg p-2 border border-slate-800/80 flex items-center justify-center">
            <canvas
              ref={imageCanvasRef}
              width={300}
              height={300}
              onClick={handleImageCanvasClick}
              className="cursor-crosshair w-full max-w-[300px] aspect-square"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setPreset('ombros')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Linha dos Ombros
              </button>
              <button
                onClick={() => setPreset('coluna')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Coluna Postural
              </button>
              <button
                onClick={() => setPreset('mesa')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Borda da Mesa
              </button>
            </div>

            <button
              onClick={clearPoints}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Limpar
            </button>
          </div>
        </div>

        {/* Right: Parameter Space Canvas */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">2. Espaço Polar de Hough (θ, ρ)</span>
            <span className="font-mono text-emerald-400">Ponto brilhante = Pico de Votos</span>
          </div>

          <div className="bg-slate-950 rounded-lg p-2 border border-slate-800/80 flex items-center justify-center">
            <canvas
              ref={paramCanvasRef}
              width={300}
              height={300}
              className="w-full max-w-[300px] aspect-square"
            />
          </div>

          {/* Voting Threshold Slider */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Limiar de Votação (Threshold):</span>
              <span className="font-mono text-indigo-400 font-semibold">{threshold} votos</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Concept Summary Card from Slide 7 */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Como funciona o Acumulador (Slide 7):</span>
          <p className="text-[11px] leading-relaxed">
            Cada ponto <span className="font-mono text-sky-300">(x, y)</span> na imagem se desdobra em uma curva senoidal inteira de infinitas retas possíveis. Onde as curvas se cruzam, todos os pontos concordam na mesma reta física!
          </p>
        </div>
        {peakLine && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 font-mono text-emerald-300 shrink-0 text-[11px]">
            Reta Detectada: ρ = {peakLine.rho}px | θ = {((peakLine.theta * 180) / Math.PI).toFixed(1)}°
          </div>
        )}
      </div>
    </div>
  );
};
