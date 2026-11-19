import React, { useState } from 'react';
import { getVectorForText } from '../../data/wordEmbeddingsData';
import { cosineSimilarity } from '../../utils/mathGeometry';
import { Play, Heart, Bell, MessageSquareHeart, ShieldCheck, Sparkles, Send } from 'lucide-react';

interface BurnoutTextSearchModuleProps {
  onRunInPython: (code: string) => void;
}

export const BurnoutTextSearchModule: React.FC<BurnoutTextSearchModuleProps> = ({ onRunInPython }) => {
  const [customText, setCustomText] = useState<string>(
    'Estou me sentindo completamente exausto e sobrecarregado com as entregas desta semana.'
  );
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Burnout Risk Centroid Vector (8 Dimensions)
  const burnoutCentroid = [0.85, 0.95, 0.05, 0.1, 0.6, 0.9, 0.05, 0.15];
  const queryVector = getVectorForText(customText).vector;

  const riskScore = Math.round(cosineSimilarity(queryVector, burnoutCentroid) * 100);
  const isHighRisk = riskScore >= 75;

  const presetTexts = [
    {
      label: 'Exaustão Severa',
      text: 'Não aguento mais o volume de trabalho, estou completamente drenado e sem motivação.',
    },
    {
      label: 'Tensão & Prazos',
      text: 'O estresse com os prazos está me dando dor na cervical e não consigo dormir bem.',
    },
    {
      label: 'Equilíbrio & Foco',
      text: 'Consegui organizar minhas tarefas e fiz pausas ativas regulares ao longo do dia.',
    },
    {
      label: 'Motivação Positiva',
      text: 'Sprint concluída com sucesso! Time integrado e satisfeito com o resultado.',
    },
  ];

  const pythonCode = `import numpy as np

# ==============================================================================
# Slide 10 & 11: Análise Semântica de Textos para Prevenção de Burnout
# ==============================================================================

texto_colaborador = """${customText}"""

# Centróide semântico do perfil de Burnout / Esgotamento
v_centroide_burnout = np.array([${burnoutCentroid.map((v) => v.toFixed(3)).join(', ')}])
v_centroide_burnout /= np.linalg.norm(v_centroide_burnout)

# Embedding gerado a partir do texto
v_texto = np.array([${queryVector.map((v) => v.toFixed(3)).join(', ')}])
v_texto /= np.linalg.norm(v_texto)

# Similaridade de Cosseno com o cluster de risco
similaridade_risco = np.dot(v_centroide_burnout, v_texto)
score_risco = int(similaridade_risco * 100)

print(f"Texto Analisado: '{texto_colaborador}'")
print(f"Similaridade Semântica com Burnout: {similaridade_risco:.4f} ({score_risco}%)")

if score_risco >= 75:
    print("\\n[ETAPA 2]: Sinal de Tristeza / Esgotamento Identificado via Busca de Palavras!")
    print("[ETAPA 3]: Disparando ALERTA DISCRETO confidencial ao colaborador...")
    print("[ETAPA 4]: Disponibilizando canal de acolhimento ético com Psicologia ou RH.")
else:
    print("\\n[STATUS]: Nenhuma sobrecarga crítica identificada no texto.")
`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 10 & 11</span>
            <span>·</span>
            <span>Aplicação Prática</span>
            <span>·</span>
            <span>Busca Semântica & Prevenção de Burnout</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            5. Busca Semântica em Textos para Cuidado Emocional
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Ao analisar mensagens voluntárias ou feedbacks de equipe, o sistema busca proximidade vetorial com o centróide de esgotamento
            para acionar o <span className="text-emerald-400 font-medium">Fluxo de Cuidado de 4 Etapas</span> do Slide 11.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Executar Triagem em Python
        </button>
      </div>

      {/* Preset Phrases Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Exemplos de Relatos:</span>
        {presetTexts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setCustomText(p.text)}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Texto ou Feedback a ser Analisado:</span>
            <span className="text-slate-500 font-mono">Busca Semântica Contínua</span>
          </label>

          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={4}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors resize-none leading-relaxed"
            placeholder="Digite ou cole qualquer frase..."
          />

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Processamento anônimo e ético
            </span>
            <span className="font-mono text-slate-500">Vetor ℝ⁸ Normalizado</span>
          </div>
        </div>

        {/* Risk & 4-Step Flow */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Similaridade com Perfil de Esgotamento
            </h3>

            {/* Scorecard */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Score de Proximidade Semântica:</span>
                <span
                  className={`font-mono font-bold text-lg ${
                    isHighRisk ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {riskScore}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isHighRisk ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${riskScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Saudável)</span>
                <span>75% (Limiar de Alerta)</span>
                <span>100% (Crítico)</span>
              </div>
            </div>

            {/* 4-Step Care Pipeline from Slide 11 */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-300">Fluxo do Slide 11:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  <div className="font-bold text-indigo-400">1. Leitura de Palavras</div>
                  <div className="text-[10px] text-slate-500">Mapeamento em vetores</div>
                </div>
                <div className={`p-2 rounded border ${isHighRisk ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="font-bold">2. Sinal de Tristeza</div>
                  <div className="text-[10px]">{isHighRisk ? 'Detectado!' : 'Abaixo do limiar'}</div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setShowAlertModal(true)}
                  disabled={!isHighRisk}
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-rose-400" />
                  3. Alerta Discreto
                </button>
                <button
                  onClick={() => setShowSupportModal(true)}
                  disabled={!isHighRisk}
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 disabled:opacity-40 text-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-400" />
                  4. Apoio Emocional
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 3: Alerta Discreto */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-amber-400">Slide 11 · Etapa 3</div>
              <h3 className="text-lg font-bold text-white mt-1">Alerta Interno e Confidencial</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              &quot;Notamos termos ligados a exaustão acumulada em suas anotações recentes. Lembramos que pausas ativas e suporte profissional estão à sua disposição.&quot;
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setShowSupportModal(true);
                }}
                className="flex-1 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg cursor-pointer"
              >
                Acessar Apoio Emocional
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Apoio Emocional */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400">Slide 11 · Etapa 4</div>
              <h3 className="text-lg font-bold text-white mt-1">Acolhimento com Psicólogo ou RH</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              O objetivo preventivo de identificar cansaço antes do Burnout culmina no acolhimento humano seguro, com sigilo ético absoluto.
            </p>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
            >
              Concluir Demonstração
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
