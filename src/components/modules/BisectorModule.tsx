import React, { useState, useRef, useEffect } from 'react';
import { calculateBisector } from '../../utils/mathGeometry';
import { Play, RotateCw, ZoomIn, Eye, Sparkles } from 'lucide-react';

interface BisectorModuleProps {
  onRunInPython: (code: string) => void;
}

export const BisectorModule: React.FC<BisectorModuleProps> = ({ onRunInPython }) => {
  const [headRoll, setHeadRoll] = useState<number>(0); // -40 to +40 degrees
  const [headYaw, setHeadYaw] = useState<number>(0); // -30 to +30 degrees (turning left/right)
  const [cameraDistance, setCameraDistance] = useState<number>(1.0); // 0.6x to 1.6x zoom

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Geometric calculations based on face rotation and zoom
  const rollRad = (headRoll * Math.PI) / 180;
  const yawFactor = headYaw / 50; // compresses one eye distance

  // Base keypoint coordinates centered around (0,0) before transform
  const eyeDistance = 65 * cameraDistance;
  const noseDrop = 35 * cameraDistance;
  const chinDrop = 95 * cameraDistance;

  // Nose tip as the origin of vectors
  const noseBase = { x: 0, y: 0 };
  const leftEyeBase = { x: -eyeDistance * (1 - yawFactor * 0.4), y: -noseDrop };
  const rightEyeBase = { x: eyeDistance * (1 + yawFactor * 0.4), y: -noseDrop };
  const chinBase = { x: 0, y: chinDrop };

  // Rotate keypoints by headRoll
  const rotatePoint = (pt: { x: number; y: number }, rad: number) => ({
    x: pt.x * Math.cos(rad) - pt.y * Math.sin(rad),
    y: pt.x * Math.sin(rad) + pt.y * Math.cos(rad),
  });

  const nose = rotatePoint(noseBase, rollRad);
  const leftEye = rotatePoint(leftEyeBase, rollRad);
  const rightEye = rotatePoint(rightEyeBase, rollRad);
  const chin = rotatePoint(chinBase, rollRad);

  // Calculate the Bisector between (Nose -> LeftEye) and (Nose -> RightEye)
  const bisectorData = calculateBisector(nose, leftEye, rightEye);

  // Python Code representing the bisector calculation
  const pythonCode = `import numpy as np

# ==============================================================================
# Slide 6: Bissetrizes e Alinhamento Facial (OpenCV & Geometria)
# Linha de Simetria = Direção Média dos Vetores
# ==============================================================================

# Coordenadas reais obtidas do rastreamento facial (MediaPipe / Haar Cascades):
p_nariz    = np.array([${nose.x.toFixed(2)}, ${nose.y.toFixed(2)}])
p_olho_esq = np.array([${leftEye.x.toFixed(2)}, ${leftEye.y.toFixed(2)}])
p_olho_dir = np.array([${rightEye.x.toFixed(2)}, ${rightEye.y.toFixed(2)}])

# Vetores direcionais a partir do nariz
u = p_olho_esq - p_nariz
v = p_olho_dir - p_nariz

# 1. Normalização dos vetores (remove interferência da distância da câmera)
u_hat = u / np.linalg.norm(u)
v_hat = v / np.linalg.norm(v)

# 2. Bissetriz é a soma vetorial das direções unitárias (Slide 6)
vetor_bissetriz = u_hat + v_hat
bissetriz_unit = vetor_bissetriz / np.linalg.norm(vetor_bissetriz)

# 3. Ângulo de inclinação facial (Roll)
inclinacao_graus = np.degrees(np.arctan2(bissetriz_unit[0], -bissetriz_unit[1]))

# 4. Índice de simetria facial
simetria = min(np.linalg.norm(u), np.linalg.norm(v)) / max(np.linalg.norm(u), np.linalg.norm(v)) * 100

print(f"Direção da Bissetriz Facial: [{bissetriz_unit[0]:.4f}, {bissetriz_unit[1]:.4f}]")
print(f"Inclinação da Cabeça (Roll): {inclinacao_graus:.1f}°")
print(f"Índice de Simetria Facial : {simetria:.1f}%")
print("-> Propriedade chave: A bissetriz é invariante à aproximação ou recuo do usuário.")
`;

  // Draw Facial Geometry Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2 + 15;

    ctx.clearRect(0, 0, width, height);

    // Subtle background mesh
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

    // World screen coordinates
    const sxN = cx + nose.x;
    const syN = cy + nose.y;
    const sxLE = cx + leftEye.x;
    const syLE = cy + leftEye.y;
    const sxRE = cx + rightEye.x;
    const syRE = cy + rightEye.y;
    const sxC = cx + chin.x;
    const syC = cy + chin.y;

    // Draw Face Outline Oval
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rollRad);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 10, 85 * cameraDistance, 115 * cameraDistance, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Eye-to-Eye Baseline
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sxLE, syLE);
    ctx.lineTo(sxRE, syRE);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector u: Nose -> Left Eye (Cyan)
    drawVector(ctx, sxN, syN, sxLE, syLE, '#38bdf8', 'u (Olho Esq)');

    // Vector v: Nose -> Right Eye (Rose)
    drawVector(ctx, sxN, syN, sxRE, syRE, '#f43f5e', 'v (Olho Dir)');

    // Draw Bisector Vector Ray (Emerald Beam)
    const bVec = bisectorData.bisectorVec;
    const bLength = 140 * cameraDistance;
    const sxB = sxN + bVec.x * bLength;
    const syB = syN + bVec.y * bLength;

    // Bisector ray extending both up and down
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sxN - bVec.x * 70, syN - bVec.y * 70);
    ctx.lineTo(sxB, syB);
    ctx.stroke();

    // Bisector label
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText('Bissetriz (Eixo de Simetria)', sxB + 10, syB);

    // Draw Keypoint nodes
    drawNode(ctx, sxN, syN, '#cbd5e1', 'Nariz (Origem)');
    drawNode(ctx, sxLE, syLE, '#38bdf8', 'Olho Esq');
    drawNode(ctx, sxRE, syRE, '#f43f5e', 'Olho Dir');
    drawNode(ctx, sxC, syC, '#94a3b8', 'Queixo');
  }, [nose, leftEye, rightEye, chin, bisectorData, rollRad, cameraDistance]);

  function drawVector(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label: string
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(label, toX + 8, toY - 4);
  }

  function drawNode(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return (
    <div className="space-y-6">
      {/* Title & Concept from Slide 6 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 6</span>
            <span>·</span>
            <span>Geometria & Vetores</span>
            <span>·</span>
            <span>Bissetrizes e Alinhamento Facial</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            5. Bissetrizes: A Linha Central de Equilíbrio
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            A bissetriz divide o ângulo ao meio. Em visão computacional, ela encontra a linha média que divide o rosto em duas partes iguais.
            <span className="text-indigo-300 font-medium"> Linha de Simetria = Direção Média dos Vetores</span>, mantendo-se exata de perto ou de longe.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Bissetriz em Python
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Canvas */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Malha Geométrica Facial com Vetores Bissetrizes
            </span>
            <span className="font-mono text-emerald-400">Linha Verde = Bissetriz Angular</span>
          </div>

          <div className="relative flex items-center justify-center bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              width={520}
              height={420}
              className="w-full max-w-[520px] aspect-[52/42]"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Posições do Rosto:</span>
            <button
              onClick={() => {
                setHeadRoll(0);
                setHeadYaw(0);
                setCameraDistance(1.0);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Centralizado (0°)
            </button>
            <button
              onClick={() => {
                setHeadRoll(18);
                setHeadYaw(0);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Inclinado / Cansado (+18°)
            </button>
            <button
              onClick={() => {
                setHeadRoll(0);
                setHeadYaw(-20);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Virando o Rosto (-20°)
            </button>
            <button
              onClick={() => setCameraDistance((prev) => (prev > 1.2 ? 0.7 : 1.4))}
              className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
            >
              Alterar Distância (Zoom)
            </button>
          </div>
        </div>

        {/* Controls & Math Details */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Controles de Pose e Geometria</h3>

            {/* Slider: Head Roll */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Inclinação Lateral da Cabeça (Roll)</span>
                <span className="font-mono text-indigo-300 font-semibold">{headRoll}°</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={headRoll}
                onChange={(e) => setHeadRoll(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Slider: Head Yaw */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Rotação Horizontal (Yaw / Virar Rosto)</span>
                <span className="font-mono text-indigo-300 font-semibold">{headYaw}°</span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                value={headYaw}
                onChange={(e) => setHeadYaw(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Slider: Camera Distance (Zoom) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Distância da Câmera (Invariância à Escala)</span>
                <span className="font-mono text-indigo-300 font-semibold">{cameraDistance.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.1"
                value={cameraDistance}
                onChange={(e) => setCameraDistance(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Simetria Facial</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                  {bisectorData.symmetryIndex}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Ângulo Total entre Olhos</div>
                <div className="text-base font-bold font-mono text-indigo-300 mt-1 tabular-nums">
                  {bisectorData.angleTotalDeg.toFixed(1)}°
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200">Por que isso é útil? (Slide 6):</div>
              <p className="text-[11px]">
                <strong className="text-slate-200">Independente da Distância:</strong> Se o colaborador se aproxima da câmera ou se afasta, a magnitude dos vetores muda, mas os
                <strong className="text-slate-200"> vetores unitários û e v̂</strong> preservam o ângulo exato da bissetriz!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
