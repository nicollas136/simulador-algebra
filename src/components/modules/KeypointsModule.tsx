import React, { useState, useRef, useEffect } from 'react';
import { angleBetweenPoints } from '../../utils/mathGeometry';
import { Play, Move, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Keypoint {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface KeypointsModuleProps {
  onRunInPython: (code: string) => void;
}

export const KeypointsModule: React.FC<KeypointsModuleProps> = ({ onRunInPython }) => {
  // Preset postures
  const [postureState, setPostureState] = useState<'ideal' | 'slouching' | 'text-neck'>('ideal');

  // Keypoints configuration for the 3 posture states
  const presets: Record<string, Keypoint[]> = {
    ideal: [
      { id: 'ear', name: 'Orelha', x: 220, y: 75 },
      { id: 'nose', name: 'Nariz', x: 250, y: 90 },
      { id: 'neck', name: 'Base do Pescoço', x: 215, y: 130 },
      { id: 'shoulder', name: 'Ombro', x: 210, y: 165 },
      { id: 'elbow', name: 'Cotovelo', x: 205, y: 240 },
      { id: 'wrist', name: 'Punho / Teclado', x: 290, y: 245 },
      { id: 'spine', name: 'Coluna Torácica', x: 205, y: 250 },
      { id: 'hip', name: 'Quadril', x: 200, y: 340 },
    ],
    slouching: [
      { id: 'ear', name: 'Orelha', x: 260, y: 110 },
      { id: 'nose', name: 'Nariz', x: 290, y: 125 },
      { id: 'neck', name: 'Base do Pescoço', x: 235, y: 155 },
      { id: 'shoulder', name: 'Ombro', x: 220, y: 195 },
      { id: 'elbow', name: 'Cotovelo', x: 225, y: 265 },
      { id: 'wrist', name: 'Punho / Teclado', x: 285, y: 255 },
      { id: 'spine', name: 'Coluna Torácica', x: 175, y: 275 }, // Curvada para trás
      { id: 'hip', name: 'Quadril', x: 200, y: 340 },
    ],
    'text-neck': [
      { id: 'ear', name: 'Orelha', x: 285, y: 95 }, // Projetada para frente
      { id: 'nose', name: 'Nariz', x: 315, y: 115 },
      { id: 'neck', name: 'Base do Pescoço', x: 240, y: 145 },
      { id: 'shoulder', name: 'Ombro', x: 210, y: 175 },
      { id: 'elbow', name: 'Cotovelo', x: 210, y: 245 },
      { id: 'wrist', name: 'Punho / Teclado', x: 290, y: 245 },
      { id: 'spine', name: 'Coluna Torácica', x: 200, y: 255 },
      { id: 'hip', name: 'Quadril', x: 200, y: 340 },
    ],
  };

  const [currentKeypoints, setCurrentKeypoints] = useState<Keypoint[]>(presets.ideal);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to get point by id
  const getPt = (id: string) => currentKeypoints.find((p) => p.id === id) || { x: 0, y: 0 };

  // Calculate ergonomic angles from keypoints
  const ear = getPt('ear');
  const neck = getPt('neck');
  const shoulder = getPt('shoulder');
  const spine = getPt('spine');
  const hip = getPt('hip');

  // Neck-Spine angle: Ear -> Neck -> Spine
  const neckAngle = Math.round(angleBetweenPoints(ear, neck, spine));
  // Trunk tilt: Shoulder -> Hip relative to vertical
  const trunkAngle = Math.round(angleBetweenPoints(shoulder, hip, { x: hip.x, y: hip.y - 100 }));

  // Posture Health score
  const isGoodNeck = neckAngle >= 165 && neckAngle <= 195;
  const isGoodTrunk = trunkAngle <= 12;
  const postureScore = isGoodNeck && isGoodTrunk ? 94 : isGoodNeck || isGoodTrunk ? 62 : 35;

  // Vector of coordinates (Feature Vector)
  const featureVector = currentKeypoints.flatMap((p) => [Math.round(p.x), Math.round(p.y)]);

  // Change preset
  const selectPreset = (key: 'ideal' | 'slouching' | 'text-neck') => {
    setPostureState(key);
    setCurrentKeypoints(presets[key]);
  };

  // Draw Skeleton on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Subtle ergonomic desk outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    // Desk surface
    ctx.strokeRect(270, 240, 180, 150);
    // Chair back line
    ctx.strokeRect(140, 180, 50, 180);

    // Draw skeletal bones (Vector connections from Slide 8)
    const bones: [string, string][] = [
      ['ear', 'nose'],
      ['ear', 'neck'],
      ['neck', 'shoulder'],
      ['shoulder', 'elbow'],
      ['elbow', 'wrist'],
      ['shoulder', 'spine'],
      ['spine', 'hip'],
    ];

    bones.forEach(([idA, idB]) => {
      const ptA = getPt(idA);
      const ptB = getPt(idB);

      ctx.strokeStyle = postureScore >= 80 ? '#38bdf8' : postureScore >= 50 ? '#fbbf24' : '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB.x, ptB.y);
      ctx.stroke();
    });

    // Draw angle arc at the neck
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(neck.x, neck.y, 24, 0, Math.PI);
    ctx.stroke();

    // Draw Keypoint Nodes
    currentKeypoints.forEach((pt) => {
      const isSelected = activeDragId === pt.id;

      ctx.fillStyle = isSelected ? '#ffffff' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(pt.name, pt.x + 10, pt.y + 4);
    });
  }, [currentKeypoints, activeDragId, postureScore]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = currentKeypoints.find((p) => Math.hypot(p.x - x, p.y - y) < 18);
    if (clicked) setActiveDragId(clicked.id);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeDragId || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(canvas.height - 20, e.clientY - rect.top));

    setCurrentKeypoints((prev) =>
      prev.map((pt) => (pt.id === activeDragId ? { ...pt, x: Math.round(x), y: Math.round(y) } : pt))
    );
  };

  const handleMouseUp = () => {
    setActiveDragId(null);
  };

  const pythonCode = `import numpy as np

# ==============================================================================
# Slide 8: Mapeamento de Pontos-Chave (MediaPipe Pose & Geometria)
# Conexões vetoriais e leitura de ângulos (postura curvada vs ereta)
# ==============================================================================

# Vetor de coordenadas extraído da câmera do colaborador
keypoints = {
${currentKeypoints.map((p) => `    "${p.id}": np.array([${p.x}, ${p.y}]),  # ${p.name}`).join('\n')}
}

def calcular_angulo(a, b, c):
    ba = a - b
    bc = c - b
    cos_ang = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    return np.degrees(np.arccos(np.clip(cos_ang, -1.0, 1.0)))

# Ângulo Cervical: Orelha -> Pescoço -> Coluna
ang_cervical = calcular_angulo(keypoints["ear"], keypoints["neck"], keypoints["spine"])

# Vetor de Características Completo (16 dimensões: 8 keypoints x 2 coordenadas)
vetor_caracteristicas = np.array(${JSON.stringify(featureVector)})

print("=== LEITURA DE KEYPOINTS E POSTURA (SLIDE 8) ===")
print(f"Ângulo Cervical Calculado: {ang_cervical:.1f}°")
if ang_cervical < 160:
    print("⚠️ ALERTA DE POSTURA: Cabeça excessivamente projetada à frente (Sobrecarga cervical)!")
else:
    print("✅ POSTURA ADEQUADA: Alinhamento ergonômico preservado.")
print("\\nVetor de Características (R^16):", vetor_caracteristicas[:8], "...")
`;

  return (
    <div className="space-y-6">
      {/* Title & Concept from Slide 8 & 9 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 8 & 9</span>
            <span>·</span>
            <span>Geometria & Vetores</span>
            <span>·</span>
            <span>Keypoints & Conexões Vetoriais</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            7. Mapeamento de Pontos-Chave e Postura
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Cada keypoint anatômico possui coordenadas <span className="font-mono text-indigo-300">(x, y, z)</span>.
            As conexões vetoriais ligam os pontos no corpo e medem ângulos para identificar postura curvada vs ereta e variações de fadiga.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Keypoints em Python
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skeletal Canvas */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              Arraste os pontos do esqueleto anatômico
            </span>
            <span className="font-mono text-indigo-300">8 Keypoints Ativos</span>
          </div>

          <div className="relative flex items-center justify-center bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              width={480}
              height={380}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-pointer w-full max-w-[480px] aspect-[48/38]"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Posturas Típicas de Escritório:</span>
            <button
              onClick={() => selectPreset('ideal')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                postureState === 'ideal'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Postura Ergonômica Ideal
            </button>
            <button
              onClick={() => selectPreset('slouching')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                postureState === 'slouching'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Postura Curvada (Cifose)
            </button>
            <button
              onClick={() => selectPreset('text-neck')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                postureState === 'text-neck'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pescoço Projetado (Text Neck)
            </button>
          </div>
        </div>

        {/* Real-time Posture Metrics & Vector Representation */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Leitura Angular em Tempo Real</h3>

            {/* Scorecard */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Score Ergonômico de Postura:</span>
                <span
                  className={`font-mono font-bold text-base ${
                    postureScore >= 80 ? 'text-emerald-400' : postureScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {postureScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    postureScore >= 80 ? 'bg-emerald-400' : postureScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${postureScore}%` }}
                ></div>
              </div>
            </div>

            {/* Angles Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Ângulo Cervical-Coluna</div>
                <div className="text-base font-bold font-mono text-indigo-300 mt-1 tabular-nums">
                  {neckAngle}°
                </div>
                <span className="text-[10px] text-slate-500">Ideal: 170° a 180°</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Desvio do Tronco</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-1 tabular-nums">
                  {trunkAngle}°
                </div>
                <span className="text-[10px] text-slate-500">Ideal: &lt; 10°</span>
              </div>
            </div>

            {/* Vector Array Visualization */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1">
              <div className="text-slate-400 text-[10px] flex justify-between">
                <span>Vetor de Características da Postura (ℝ¹⁶):</span>
                <span>8 keypoints × 2D</span>
              </div>
              <div className="text-indigo-300 text-[11px] truncate">
                [{featureVector.join(', ')}]
              </div>
            </div>

            {/* Slide 8 Note */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200">Dinâmica Temporal (Slide 8):</div>
              <p className="text-[11px] leading-relaxed">
                Os pontos se movimentam no espaço vetorial e o algoritmo calcula a velocidade de relaxamento muscular para diagnosticar fadiga acumulada antes da dor física.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
