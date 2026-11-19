import React, { useState } from 'react';
import { getVectorForText } from '../../data/wordEmbeddingsData';
import { cosineSimilarity } from '../../utils/mathGeometry';
import { Play, Search, AlertCircle, CheckCircle2, Split } from 'lucide-react';

interface DocumentItem {
  id: number;
  text: string;
  category: string;
  theme: string;
  vector: number[];
}

const SAMPLE_DOCS: DocumentItem[] = [
  {
    id: 1,
    text: 'Colaborador relata exaustão crônica, desânimo diário e fadiga mental após longas jornadas.',
    category: 'Saúde Mental & Risco',
    theme: 'Burnout / Esgotamento',
    vector: [0.75, 0.96, 0.04, 0.08, 0.65, 0.88, 0.05, 0.12],
  },
  {
    id: 2,
    text: 'Reunião semanal com o time para alinhamento de prazos da sprint e metas trimestrais.',
    category: 'Trabalho & Rotina',
    theme: 'Gestão de Tarefas',
    vector: [0.92, 0.35, 0.40, 0.30, 0.35, 0.50, 0.15, 0.20],
  },
  {
    id: 3,
    text: 'Ajuste da altura do monitor e encosto da cadeira para manter a coluna ereta e sem dor.',
    category: 'Ergonomia',
    theme: 'Postura & Coluna',
    vector: [0.45, 0.30, 0.55, 0.20, 0.98, 0.25, 0.60, 0.45],
  },
  {
    id: 4,
    text: 'Pausa de 15 minutos para café e alongamento reduzem a tensão e revitalizam o ânimo.',
    category: 'Bem-Estar',
    theme: 'Descanso Ativo',
    vector: [0.35, 0.08, 0.92, 0.05, 0.70, 0.05, 0.98, 0.15],
  },
  {
    id: 5,
    text: 'Desenvolvimento do pipeline de visão computacional em Python utilizando OpenCV e transformadas.',
    category: 'Tecnologia & IA',
    theme: 'Código & Algoritmos',
    vector: [0.65, 0.15, 0.60, 0.98, 0.15, 0.20, 0.20, 0.95],
  },
];

interface LexicalVsSemanticModuleProps {
  onRunInPython: (code: string) => void;
}

export const LexicalVsSemanticModule: React.FC<LexicalVsSemanticModuleProps> = ({ onRunInPython }) => {
  const [searchTerm, setSearchTerm] = useState<string>('burnout');

  const queryVector = getVectorForText(searchTerm).vector;

  // 1. Lexical Search (String Matching)
  const lexicalResults = SAMPLE_DOCS.map((doc) => {
    const isMatch = doc.text.toLowerCase().includes(searchTerm.toLowerCase().trim());
    return { ...doc, isMatch };
  });

  // 2. Semantic Search (Cosine Similarity)
  const semanticResults = SAMPLE_DOCS.map((doc) => {
    const sim = cosineSimilarity(queryVector, doc.vector);
    return { ...doc, similarity: sim };
  }).sort((a, b) => b.similarity - a.similarity);

  const pythonCode = `import numpy as np

# ==============================================================================
# Slide 2 & 5: Busca Léxica (Palavra Exata) vs Busca Semântica (Embeddings)
# ==============================================================================

consulta = "${searchTerm}"
documentos = [
${SAMPLE_DOCS.map((d) => `    {"id": ${d.id}, "texto": "${d.text}"},`).join('\n')}
]

print(f"=== TERMO DE BUSCA: '{consulta.upper()}' ===")

print("\\n1. RESULTADO DA BUSCA LÉXICA (String Match):")
achados = [d for d in documentos if consulta.lower() in d["texto"].lower()]
if achados:
    for d in achados:
        print(f" -> Encontrado no Doc {d['id']}: {d['texto']}")
else:
    print(" -> NENHUM DOCUMENTO ENCONTRADO! (A palavra exata não existe no texto)")

print("\\n2. RESULTADO DA BUSCA SEMÂNTICA POR EMBEDDINGS (Cosseno):")
v_query = np.array([${queryVector.map((v) => v.toFixed(3)).join(', ')}])
doc_vectors = [
${SAMPLE_DOCS.map((d) => `    np.array([${d.vector.map((v) => v.toFixed(3)).join(', ')}]),`).join('\n')}
]

scores = []
for i, v_doc in enumerate(doc_vectors):
    cos = np.dot(v_query, v_doc) / (np.linalg.norm(v_query) * np.linalg.norm(v_doc))
    scores.append((documentos[i], cos))

scores.sort(key=lambda x: x[1], reverse=True)
for doc, sim in scores:
    print(f" -> [Similaridade: {sim:.4f}] Doc {doc['id']}: {doc['texto']}")
`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 2 & 5</span>
            <span>·</span>
            <span>Conceitos Básicos</span>
            <span>·</span>
            <span>Léxico vs Semântico</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            3. Busca Léxica vs Busca Semântica
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            A busca léxica depende da correspondência literal de letras. Se o usuário busca &quot;burnout&quot;, ela ignora documentos sobre &quot;exaustão e fadiga mental&quot;.
            A busca por embeddings resolve o significado.
          </p>
        </div>

        <button
          onClick={() => onRunInPython(pythonCode)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Testar Comparativo em Python
        </button>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite um termo para comparar (ex: burnout, postura, café, algoritmo)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <span>Testar:</span>
          {['burnout', 'cansaço', 'ergonomia', 'descanso'].map((t) => (
            <button
              key={t}
              onClick={() => setSearchTerm(t)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Traditional Lexical Search */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-semibold text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Busca Léxica (Palavra Exata)
            </span>
            <span className="text-xs font-mono text-slate-500">
              {lexicalResults.filter((d) => d.isMatch).length} de {SAMPLE_DOCS.length} encontrados
            </span>
          </div>

          <div className="space-y-3">
            {lexicalResults.map((doc) => (
              <div
                key={doc.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  doc.isMatch
                    ? 'bg-rose-500/10 border-rose-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Doc {doc.id} · {doc.theme}</span>
                  {doc.isMatch ? (
                    <span className="font-mono text-rose-400 font-bold">MATCH EXATO</span>
                  ) : (
                    <span className="font-mono text-slate-600">SEM CORRESPONDÊNCIA</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{doc.text}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/30 text-xs text-rose-300">
            <strong>Limitação Crítica:</strong> Se o colaborador escreve &quot;estou com exaustão diária&quot; e você busca por &quot;burnout&quot;, a busca por palavras-chave tradicionais ignora completamente o documento!
          </div>
        </div>

        {/* Right: Semantic Embedding Search */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Busca Semântica (Espaço de Embeddings)
            </span>
            <span className="text-xs font-mono text-indigo-400">Ordenado por cos(θ)</span>
          </div>

          <div className="space-y-3">
            {semanticResults.map((doc, rank) => (
              <div
                key={doc.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  rank === 0
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">
                    {rank + 1}º Lugar · Doc {doc.id} ({doc.theme})
                  </span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {(doc.similarity * 100).toFixed(1)}% similar
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{doc.text}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300">
            <strong>Vantagem do Embedding:</strong> Mesmo sem a palavra literal, o vetor capta a proximidade matemática entre &quot;burnout&quot; e &quot;exaustão crônica&quot;, colocando-o no topo do ranking!
          </div>
        </div>
      </div>
    </div>
  );
};
