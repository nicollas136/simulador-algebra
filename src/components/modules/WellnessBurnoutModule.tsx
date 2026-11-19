import React, { useState, useEffect } from 'react';
import {
  Play,
  Heart,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  UserCheck,
  Bell,
  MessageSquareHeart,
  Camera,
  Activity
} from 'lucide-react';

interface WellnessBurnoutModuleProps {
  onRunInPython: (code: string) => void;
}

export const WellnessBurnoutModule: React.FC<WellnessBurnoutModuleProps> = ({ onRunInPython }) => {
  // Scenario state
  const [scenario, setScenario] = useState<'disposto' | 'focado' | 'cansaco' | 'esgotamento'>('cansaco');
  const [currentStep, setCurrentStep] = useState<number>(2); // 1, 2, 3, 4 from Slide 11
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Scenario parameters
  const scenarioData = {
    disposto: {
      label: 'Manhã (09:00) · Disposto e Ativo',
      ear: 0.32,
      mar: 0.42,
      postureAngle: 89,
      fatigue: 12,
      stress: 15,
      wellbeingScore: 92,
      emotion: 'Alegre / Disposto',
      consecutiveLowMoodMins: 0,
      burnoutRisk: 'Baixo',
      riskColor: 'text-emerald-400',
    },
    focado: {
      label: 'Manhã (11:30) · Foco Profundo',
      ear: 0.28,
      mar: 0.24,
      postureAngle: 85,
      fatigue: 28,
      stress: 32,
      wellbeingScore: 84,
      emotion: 'Neutro / Concentrado',
      consecutiveLowMoodMins: 15,
      burnoutRisk: 'Baixo',
      riskColor: 'text-emerald-400',
    },
    cansaco: {
      label: 'Tarde (15:00) · Fadiga Ocular Acumulada',
      ear: 0.20,
      mar: 0.16,
      postureAngle: 74,
      fatigue: 68,
      stress: 60,
      wellbeingScore: 54,
      emotion: 'Cansaço / Tensão',
      consecutiveLowMoodMins: 110,
      burnoutRisk: 'Moderado',
      riskColor: 'text-amber-400',
    },
    esgotamento: {
      label: 'Fim do Dia (17:45) · Desânimo & Risco de Burnout',
      ear: 0.14,
      mar: 0.11,
      postureAngle: 65,
      fatigue: 89,
      stress: 84,
      wellbeingScore: 28,
      emotion: 'Tristeza / Exaustão',
      consecutiveLowMoodMins: 210, // > 180 min threshold!
      burnoutRisk: 'Crítico (Alerta Preventivo)',
      riskColor: 'text-rose-400',
    },
  };

  const active = scenarioData[scenario];

  // Auto trigger alert step if exhaustion scenario is chosen
  useEffect(() => {
    if (scenario === 'esgotamento') {
      setCurrentStep(3);
    } else if (scenario === 'cansaco') {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [scenario]);

  const pythonCode = `import numpy as np

# ==============================================================================
# Slide 10 & 11: Análise de Bem-Estar e Prevenção de Burnout
# Pipeline Ético: Leitura -> Sinal -> Alerta Discreto -> Apoio Emocional
# ==============================================================================

# Métricas atuais obtidas do processamento do sensor visual:
ear_olhos = ${active.ear}       # Eye Aspect Ratio (Abertura Palpebral)
mar_boca  = ${active.mar}       # Mouth Aspect Ratio
angulo_postura = ${active.postureAngle}  # Graus da coluna vertebral
minutos_desanimo = ${active.consecutiveLowMoodMins}

# 1. Vetor de Estado do Colaborador (ℝ⁴)
vetor_estado = np.array([ear_olhos, mar_boca, angulo_postura / 90.0, minutos_desanimo / 180.0])

# 2. Avaliação de Risco Preventivo
score_bem_estar = max(0, min(100, int((ear_olhos / 0.32) * 40 + (angulo_postura / 90) * 40 - (minutos_desanimo / 240) * 30)))

print("=== PROTOCOLO DE CUIDADO EMOCIONAL E BEM-ESTAR ===")
print(f"Estado Detectado: '${active.emotion}'")
print(f"Índice de Bem-Estar: {score_bem_estar}/100")
print(f"Minutos Consecutivos em Baixa Energia: {minutos_desanimo} min")

if minutos_desanimo >= 180:
    print("\\n[ETAPA 3]: Acionando ALERTA DISCRETO E CONFIDENCIAL:")
    print("   -> Notificação enviada exclusivamente ao colaborador:")
    print("   -> 'Detectamos alta intensidade nas últimas horas. Gostaria de uma pausa de bem-estar?'")
    print("[ETAPA 4]: Disponibilizando canal de acolhimento com RH / Psicologia parceira.")
else:
    print("\\n[ETAPA 1 & 2]: Monitoramento passivo dentro dos padrões ergonômicos normais.")
`;

  return (
    <div className="space-y-6">
      {/* Title & Context from Slide 10 & 11 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 10 & 11</span>
            <span>·</span>
            <span>Aplicação Prática</span>
            <span>·</span>
            <span>Monitoramento Passivo e Fluxo de Cuidado</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            8. Análise de Bem-Estar e Prevenção de Burnout
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Captação de microexpressões e postura através de sensores visuais. Conversão contínua em vetores comparativos com
            <span className="text-rose-400 font-medium"> objetivo preventivo de identificar cansaço antes que evolua para o Burnout</span>.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Pipeline em Python
        </button>
      </div>

      {/* Scenario Selector Strip */}
      <div className="p-1.5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap gap-2">
        {(['disposto', 'focado', 'cansaco', 'esgotamento'] as const).map((sc) => (
          <button
            key={sc}
            onClick={() => setScenario(sc)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${
              scenario === sc
                ? 'bg-indigo-500/15 border border-indigo-500/40 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {scenarioData[sc].label}
          </button>
        ))}
      </div>

      {/* Two-Zone Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Facial & Posture Sensor Simulation Viewport */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <Camera className="w-4 h-4 text-indigo-400" />
              Sensor Visual Passivo (Malha Facial + Postura)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <Activity className="w-3.5 h-3.5" />
              Processando 30 FPS
            </span>
          </div>

          {/* Camera Frame Visualization with Vector Wireframe Overlay */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 aspect-[16/10] flex items-center justify-center">
            {/* SVG Wireframe overlay mimicking Slide 10 */}
            <svg className="w-full h-full max-w-sm max-h-72" viewBox="0 0 320 240">
              {/* Head Outline */}
              <ellipse
                cx="160"
                cy="110"
                rx={scenario === 'esgotamento' ? '68' : '72'}
                ry={scenario === 'esgotamento' ? '88' : '92'}
                fill="none"
                stroke={scenario === 'esgotamento' ? '#f43f5e' : scenario === 'cansaco' ? '#fbbf24' : '#38bdf8'}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Eyebrows */}
              <path
                d={
                  scenario === 'esgotamento'
                    ? 'M 115 85 Q 130 92 145 90 M 175 90 Q 190 92 205 85'
                    : 'M 115 85 Q 130 80 145 85 M 175 85 Q 190 80 205 85'
                }
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* Eyes with EAR mesh */}
              <ellipse
                cx="130"
                cy="98"
                rx="14"
                ry={active.ear * 35}
                fill="none"
                stroke={active.ear < 0.2 ? '#f43f5e' : '#38bdf8'}
                strokeWidth="2"
              />
              <circle cx="130" cy="98" r="4" fill="#38bdf8" />

              <ellipse
                cx="190"
                cy="98"
                rx="14"
                ry={active.ear * 35}
                fill="none"
                stroke={active.ear < 0.2 ? '#f43f5e' : '#38bdf8'}
                strokeWidth="2"
              />
              <circle cx="190" cy="98" r="4" fill="#38bdf8" />

              {/* Nose Bridge Vector */}
              <path d="M 160 92 L 160 128 L 155 135 L 165 135" fill="none" stroke="#64748b" strokeWidth="1.5" />

              {/* Mouth with MAR */}
              <path
                d={
                  scenario === 'disposto'
                    ? 'M 135 155 Q 160 175 185 155'
                    : scenario === 'esgotamento'
                    ? 'M 135 165 Q 160 155 185 165'
                    : 'M 135 160 L 185 160'
                }
                fill="none"
                stroke={scenario === 'esgotamento' ? '#f43f5e' : '#10b981'}
                strokeWidth="2.5"
              />

              {/* Vector connection mesh lines */}
              <line x1="130" y1="98" x2="160" y2="128" stroke="#334155" strokeWidth="1" />
              <line x1="190" y1="98" x2="160" y2="128" stroke="#334155" strokeWidth="1" />
              <line x1="160" y1="128" x2="160" y2="160" stroke="#334155" strokeWidth="1" />
            </svg>

            {/* Overlaid Telemetry HUD Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/80 text-slate-300">
                EAR: {active.ear.toFixed(2)} {active.ear < 0.2 ? '· Fadiga Severa' : '· Normal'}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/80 text-slate-300">
                Postura: {active.postureAngle}° {active.postureAngle < 75 ? '· Curvada' : '· Ereta'}
              </span>
            </div>

            <div className="absolute bottom-3 right-3">
              <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-xs font-semibold text-white">
                Humor: <span className={active.riskColor}>{active.emotion}</span>
              </div>
            </div>
          </div>

          {/* Privacy Note from Slide 10 */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Privacidade Garantida: Nenhuma imagem é gravada ou transmitida.
            </span>
            <span className="text-[11px] text-slate-500">Apenas vetores numéricos processados localmente</span>
          </div>
        </div>

        {/* Right: Metrics & Interactive Care Flow */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Indicadores de Risco de Burnout
            </h3>

            {/* Overall Score */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Índice Geral de Bem-Estar:</span>
                <span className={`font-mono font-bold text-lg ${active.riskColor}`}>
                  {active.wellbeingScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active.wellbeingScore >= 75
                      ? 'bg-emerald-400'
                      : active.wellbeingScore >= 50
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${active.wellbeingScore}%` }}
                ></div>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Nível de Estresse</div>
                <div className="text-base font-bold font-mono text-slate-100 mt-1">{active.stress}%</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Tempo de Baixa Energia</div>
                <div className={`text-base font-bold font-mono mt-1 ${active.consecutiveLowMoodMins > 180 ? 'text-rose-400' : 'text-slate-100'}`}>
                  {active.consecutiveLowMoodMins} min
                </div>
              </div>
            </div>

            {/* Risk Status */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400">Classificação de Risco:</span>
              <span className={`font-semibold ${active.riskColor}`}>{active.burnoutRisk}</span>
            </div>
          </div>

          {/* Interactive Slide 11 Flow Preview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Fluxo de Cuidado Emocional (Slide 11)
              </h4>
              <span className="text-[11px] text-indigo-400 font-mono">Etapa {currentStep} de 4</span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[11px] text-center font-medium">
              <div
                className={`p-2 rounded-lg border transition-all ${
                  currentStep >= 1
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                1. Leitura
              </div>
              <div
                className={`p-2 rounded-lg border transition-all ${
                  currentStep >= 2
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                2. Sinal Tristeza
              </div>
              <div
                className={`p-2 rounded-lg border transition-all ${
                  currentStep >= 3
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                3. Alerta Discreto
              </div>
              <div
                className={`p-2 rounded-lg border transition-all ${
                  currentStep >= 4
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                4. Apoio Emocional
              </div>
            </div>

            {/* Action Trigger Buttons for Slide 11 Protocol */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setCurrentStep(3);
                  setShowAlertModal(true);
                }}
                className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                Simular Alerta Discreto
              </button>

              <button
                onClick={() => {
                  setCurrentStep(4);
                  setShowSupportModal(true);
                }}
                className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-400" />
                Simular Apoio Emocional
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Alerta Discreto (Etapa 3) */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>

            <div>
              <div className="text-xs font-mono text-amber-400">Etapa 3 do Fluxo de Cuidado · Slide 11</div>
              <h3 className="text-lg font-bold text-white mt-1">Alerta Interno e Confidencial</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              &quot;Olá! Nosso sensor de ergonomia notou alta intensidade de trabalho e fadiga acumulada nas últimas 3 horas. Que tal fazer uma pausa de 15 minutos para um café, água ou alongamento?&quot;
            </p>

            <div className="p-3 rounded-lg bg-slate-950 text-xs text-slate-400 border border-slate-800">
              🔒 <strong className="text-slate-200">Garantia Ética:</strong> Esta notificação é enviada exclusivamente à sua tela privada. Nenhuma métrica foi repassada a gestores.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
              >
                Entendido, vou pausar
              </button>
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setShowSupportModal(true);
                  setCurrentStep(4);
                }}
                className="flex-1 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg cursor-pointer"
              >
                Solicitar Apoio RH/Psicologia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Apoio Emocional (Etapa 4) */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquareHeart className="w-5 h-5" />
            </div>

            <div>
              <div className="text-xs font-mono text-emerald-400">Etapa 4 do Fluxo de Cuidado · Slide 11</div>
              <h3 className="text-lg font-bold text-white mt-1">Acolhimento com Psicólogo ou RH Parceiro</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              O objetivo preventivo é cuidar da saúde mental e física antes do esgotamento (Burnout).
              O canal de apoio emocional oferece escuta qualificada com total sigilo médico e profissional.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-200">
                <span>Consulta com Psicólogo Corporativo</span>
                <span className="text-emerald-400 font-medium">Disponível Hoje</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-200">
                <span>Avaliação Ergonômica de Postura</span>
                <span className="text-emerald-400 font-medium">Agendada</span>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
            >
              Fechar Demonstração do Fluxo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
