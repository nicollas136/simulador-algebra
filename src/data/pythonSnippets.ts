import { PythonCodeSnippet } from '../types/simulator';

export const PYTHON_SNIPPETS: PythonCodeSnippet[] = [
  {
    id: 'busca-semantica-cosseno',
    title: '1. Busca Semântica de Palavras (NumPy)',
    description: 'Implementação em Python de busca vetorial por similaridade de cosseno entre palavras e consultas.',
    filename: '01_busca_palavras_cosseno.py',
    tags: ['NumPy', 'Busca Semântica', 'Cosseno', 'Embeddings'],
    code: `import numpy as np

# ==============================================================================
# Slide 2: O que são Embeddings aplicado à Busca de Palavras
# Traduzindo palavras em sequências numéricas (R^n). Proximidade é Semelhança!
# ==============================================================================

# Dicionário de Embeddings normalizados de palavras (8 Dimensões Semânticas)
# Dimensões: [Trabalho, Fadiga, Positividade, Tecnologia, Fisiologia, Tensão, Descanso, Visão]
vocabulario = {
    "burnout":    np.array([0.48, 0.54, 0.03, 0.06, 0.34, 0.51, 0.03, 0.09]),
    "exaustão":   np.array([0.42, 0.59, 0.01, 0.03, 0.45, 0.51, 0.03, 0.06]),
    "cansaço":    np.array([0.38, 0.54, 0.06, 0.03, 0.51, 0.41, 0.10, 0.13]),
    "estresse":   np.array([0.48, 0.48, 0.05, 0.06, 0.33, 0.57, 0.03, 0.06]),
    "bem-estar":  np.array([0.25, 0.03, 0.57, 0.06, 0.44, 0.03, 0.60, 0.13]),
    "descanso":   np.array([0.19, 0.06, 0.55, 0.03, 0.55, 0.03, 0.63, 0.06]),
    "trabalho":   np.array([0.65, 0.33, 0.27, 0.27, 0.33, 0.37, 0.13, 0.13]),
    "postura":    np.array([0.41, 0.28, 0.31, 0.13, 0.61, 0.25, 0.31, 0.38]),
    "python":     np.array([0.44, 0.13, 0.40, 0.66, 0.07, 0.20, 0.20, 0.27]),
}

def buscar_palavras_similares(termo_busca, top_k=4):
    """Realiza busca semântica calculando Similaridade de Cosseno."""
    if termo_busca not in vocabulario:
        print(f"Termo '{termo_busca}' não encontrado no vocabulário.")
        return
        
    v_query = vocabulario[termo_busca]
    scores = []
    
    for palavra, v_doc in vocabulario.items():
        if palavra == termo_busca:
            continue
        # cos(θ) = (A . B) / (||A|| * ||B||)
        cos_sim = np.dot(v_query, v_doc) / (np.linalg.norm(v_query) * np.linalg.norm(v_doc))
        dist_euc = np.linalg.norm(v_query - v_doc)
        scores.append((palavra, cos_sim, dist_euc))
        
    # Ordena pelo maior cosseno (mais próximo semanticamente)
    scores.sort(key=lambda x: x[1], reverse=True)
    
    print(f"=== RESULTADOS DA BUSCA SEMÂNTICA PARA: '{termo_busca.upper()}' ===")
    for rank, (palavra, sim, dist) in enumerate(scores[:top_k], 1):
        print(f"{rank}º lugar: '{palavra:<12}' | Similaridade Cosseno: {sim:.4f} | Dist. Euclidiana: {dist:.4f}")

# Executa buscas de exemplo
buscar_palavras_similares("burnout")
print("\\n" + "-"*60 + "\\n")
buscar_palavras_similares("descanso")
`
  },
  {
    id: 'algebra-palavras-word2vec',
    title: '2. Álgebra Vetorial com Palavras (Word2Vec)',
    description: 'Aritmética vetorial de palavras: Trabalho + Exaustão ≈ Burnout no espaço latente.',
    filename: '02_algebra_vetorial_word2vec.py',
    tags: ['Word2Vec', 'Álgebra Vetorial', 'NumPy', 'Semântica'],
    code: `import numpy as np

# ==============================================================================
# Slide 3: Como Funciona o Espaço Vetorial
# O espaço vetorial captura relações conceituais onde vetores podem ser somados
# e subtraídos para revelar novas palavras!
# Exemplo famoso: Rei - Homem + Mulher = Rainha
# Nosso domínio: Trabalho + Exaustão = Burnout
# ==============================================================================

embeddings = {
    "trabalho":   np.array([0.98, 0.40, 0.20, 0.30, 0.40, 0.50, 0.10, 0.20]),
    "exaustão":   np.array([0.30, 0.95, 0.05, 0.05, 0.60, 0.85, 0.05, 0.10]),
    "descanso":   np.array([0.20, 0.05, 0.90, 0.05, 0.70, 0.05, 0.98, 0.10]),
    "burnout":    np.array([0.85, 0.95, 0.05, 0.10, 0.60, 0.90, 0.05, 0.15]),
    "bem-estar":  np.array([0.35, 0.05, 0.92, 0.10, 0.75, 0.05, 0.95, 0.15]),
    "estresse":   np.array([0.75, 0.75, 0.08, 0.10, 0.50, 0.95, 0.05, 0.10]),
}

def encontrar_palavra_mais_proxima(vetor_alvo, excluir=[]):
    """Encontra a palavra do vocabulário cujo vetor tem o maior cosseno com o alvo."""
    melhor_palavra = None
    maior_sim = -1.0
    
    for palavra, v in embeddings.items():
        if palavra in excluir:
            continue
        sim = np.dot(vetor_alvo, v) / (np.linalg.norm(vetor_alvo) * np.linalg.norm(v))
        if sim > maior_sim:
            maior_sim = sim
            melhor_palavra = palavra
            
    return melhor_palavra, maior_sim

print("=== 1. OPERAÇÃO: [TRABALHO] + [EXAUSTÃO] ===")
v_resultado1 = embeddings["trabalho"] + embeddings["exaustão"]
palavra_mais_proxima1, sim1 = encontrar_palavra_mais_proxima(v_resultado1, excluir=["trabalho", "exaustão"])
print(f"Resultado vetorial converge para: '{palavra_mais_proxima1.upper()}' (Similaridade: {sim1:.4f})")

print("\\n=== 2. OPERAÇÃO: [BURNOUT] - [ESTRESSE] + [DESCANSO] ===")
v_resultado2 = embeddings["burnout"] - embeddings["estresse"] + embeddings["descanso"]
palavra_mais_proxima2, sim2 = encontrar_palavra_mais_proxima(v_resultado2, excluir=["burnout", "estresse", "descanso"])
print(f"Resultado vetorial converge para: '{palavra_mais_proxima2.upper()}' (Similaridade: {sim2:.4f})")
`
  },
  {
    id: 'busca-lexica-vs-semantica',
    title: '3. Busca Léxica (Palavra-Chave) vs Semântica',
    description: 'Demonstração de por que a busca por palavras-chave exatas falha e como embeddings encontram sinônimos.',
    filename: '03_busca_lexica_vs_semantica.py',
    tags: ['Busca Léxica', 'Busca Semântica', 'Sinônimos', 'NLP'],
    code: `import numpy as np

# ==============================================================================
# Slide 2 & 5: Por que usar Embeddings para Busca de Palavras?
# Busca Léxica: Procura correspondência exata de caracteres (String matching).
#               Falha se o usuário digitar um sinônimo!
# Busca Semântica: Procura proximidade de significado no espaço vetorial.
# ==============================================================================

documentos = [
    {"id": 1, "texto": "Colaborador apresenta sinais crônicos de esgotamento e fadiga extrema."},
    {"id": 2, "texto": "Reunião de alinhamento com a diretoria sobre metas de vendas."},
    {"id": 3, "texto": "Orientações sobre postura correta na cadeira para evitar dor na coluna."},
    {"id": 4, "texto": "Pausa para café e momentos de descanso reduzem a sobrecarga."},
]

# Simulação de Embeddings densos dos documentos
doc_vectors = np.array([
    [0.70, 0.95, 0.05, 0.10],  # Doc 1: Fadiga/Esgotamento
    [0.90, 0.20, 0.40, 0.30],  # Doc 2: Trabalho/Metas
    [0.40, 0.30, 0.50, 0.95],  # Doc 3: Ergonomia/Coluna
    [0.30, 0.10, 0.90, 0.20],  # Doc 4: Descanso/Pausa
])

# Usuário busca pela palavra: "BURNOUT"
query = "burnout"
v_query = np.array([0.80, 0.92, 0.05, 0.12]) # Vetor de Burnout

print("=== 1. BUSCA LÉXICA TRADICIONAL (Palavra Exata: 'burnout') ===")
encontrados_lexica = [d for d in documentos if query in d["texto"].lower()]
print(f"Documentos contendo a palavra '{query}': {len(encontrados_lexica)}")
print("-> FALHA: O documento 1 fala sobre 'esgotamento e fadiga extrema', mas não tem a palavra 'burnout'!")

print("\\n=== 2. BUSCA SEMÂNTICA POR EMBEDDINGS (VETORIAL) ===")
# Calcula cosseno entre query e cada documento
similaridades = [
    np.dot(v_query, v_doc) / (np.linalg.norm(v_query) * np.linalg.norm(v_doc))
    for v_doc in doc_vectors
]

ranking = sorted(zip(documentos, similaridades), key=lambda x: x[1], reverse=True)
for doc, sim in ranking:
    print(f"[Score: {sim:.4f}] Doc {doc['id']}: {doc['texto']}")

print("\\n-> SUCESSO: A busca semântica ranqueou o Doc 1 no topo mesmo sem correspondência exata de palavras!")
`
  },
  {
    id: 'knn-banco-vetorial',
    title: '4. Banco Vetorial e K-Vizinhos Mais Próximos (k-NN)',
    description: 'Indexação de palavras em banco vetorial de alta dimensionalidade e consulta k-NN rápida.',
    filename: '04_banco_vetorial_knn.py',
    tags: ['Scikit-Learn', 'k-NN', 'Banco Vetorial', 'Indexação'],
    code: `import numpy as np
from sklearn.neighbors import NearestNeighbors

# ==============================================================================
# Slide 3 & 5: Bancos Vetoriais e Agrupamento por Afinidade
# Como sistemas de busca vetorial (como Pinecone, ChromaDB, FAISS) indexam palavras.
# ==============================================================================

palavras = ["burnout", "exaustão", "cansaço", "alegria", "felicidade", "descanso", "python", "algoritmo", "postura", "coluna"]

# Matriz de embeddings normalizados (10 palavras x 8 dimensões)
np.random.seed(42)
X = np.array([
    [0.9, 0.9, 0.1, 0.1, 0.4, 0.8, 0.1, 0.1], # burnout
    [0.8, 0.9, 0.1, 0.1, 0.5, 0.8, 0.1, 0.1], # exaustão
    [0.7, 0.8, 0.2, 0.1, 0.6, 0.6, 0.2, 0.2], # cansaço
    [0.3, 0.1, 0.9, 0.2, 0.3, 0.1, 0.8, 0.2], # alegria
    [0.2, 0.1, 0.9, 0.1, 0.3, 0.1, 0.8, 0.2], # felicidade
    [0.3, 0.1, 0.8, 0.1, 0.5, 0.1, 0.9, 0.1], # descanso
    [0.5, 0.2, 0.4, 0.9, 0.1, 0.2, 0.2, 0.4], # python
    [0.5, 0.1, 0.4, 0.9, 0.1, 0.2, 0.2, 0.4], # algoritmo
    [0.5, 0.4, 0.3, 0.2, 0.9, 0.3, 0.4, 0.5], # postura
    [0.4, 0.4, 0.3, 0.1, 0.9, 0.4, 0.4, 0.4], # coluna
])

# Inicializa o índice de vizinhos mais próximos com métrica de cosseno
knn = NearestNeighbors(n_neighbors=3, metric="cosine")
knn.fit(X)

# Consulta: Buscar os 3 termos mais próximos de "exaustão" (índice 1)
distancias, indices = knn.kneighbors([X[1]])

print("=== BUSCA VETORIAL DOS K VIZINHOS MAIS PRÓXIMOS (k-NN) ===")
print("Consulta: Palavra 'exaustão'\\n")
for rank, (dist, idx) in enumerate(zip(distancias[0], indices[0]), 1):
    sim_cosseno = 1.0 - dist
    print(f"Vizinho {rank}: '{palavras[idx]:<10}' | Cosseno: {sim_cosseno:.4f} | Distância Angular: {dist:.4f}")
`
  },
  {
    id: 'classificador-mensagens-bem-estar',
    title: '5. Busca de Sinais de Burnout em Textos (Slide 11)',
    description: 'Pipeline ético que analisa frases de colaboradores e busca similaridade semântica com o cluster de risco.',
    filename: '05_busca_sinais_burnout_texto.py',
    tags: ['Burnout', 'Ética', 'Busca Semântica', 'RH'],
    code: `import numpy as np

# ==============================================================================
# Slide 10 & 11: Fluxo de Cuidado Emocional com Busca Semântica
# Leitura de Frase -> Detecção Semântica de Tristeza -> Alerta Discreto -> Apoio
# ==============================================================================

# Vetor Centróide do Estado de Esgotamento/Burnout
v_centroide_burnout = np.array([0.85, 0.95, 0.05, 0.10, 0.60, 0.90, 0.05, 0.15])
v_centroide_burnout /= np.linalg.norm(v_centroide_burnout)

mensagens_colaboradores = [
    "Hoje o dia rendeu muito, entregamos a sprint antes do prazo!",
    "Não aguento mais o volume de trabalho, estou completamente drenado.",
    "Preciso ajustar a cadeira, estou com um pouco de dor nas costas.",
    "Sinto um peso constante na cabeça e uma exaustão que não passa no fim de semana.",
]

# Simulação de Embeddings gerados por modelo de linguagem
embeddings_mensagens = [
    np.array([0.30, 0.10, 0.95, 0.50, 0.30, 0.10, 0.80, 0.20]), # Feliz/Produtivo
    np.array([0.82, 0.94, 0.08, 0.15, 0.65, 0.88, 0.05, 0.12]), # Esgotado!
    np.array([0.50, 0.40, 0.40, 0.20, 0.95, 0.45, 0.35, 0.30]), # Postura
    np.array([0.78, 0.98, 0.02, 0.10, 0.70, 0.92, 0.03, 0.10]), # Burnout Crítico!
]

print("=== TRIAGEM ÉTICA E PREVENTIVA VIA BUSCA SEMÂNTICA ===")

for i, (msg, v_msg) in enumerate(zip(mensagens_colaboradores, embeddings_mensagens), 1):
    v_norm = v_msg / np.linalg.norm(v_msg)
    sim_com_burnout = np.dot(v_centroide_burnout, v_norm)
    
    print(f"\\nMensagem {i}: \\"{msg}\\"")
    print(f" -> Similaridade com Burnout: {sim_com_burnout:.4f}")
    
    if sim_com_burnout >= 0.85:
        print(" -> [ETAPA 3 - ALERTA DISCRETO]: Sinal de tristeza e sobrecarga detectado!")
        print("    -> Enviando notificação pessoal e confidencial de pausa ativa.")
        print(" -> [ETAPA 4 - APOIO EMOCIONAL]: Canal com Psicólogo/RH disponibilizado.")
    else:
        print(" -> [STATUS]: Faixa saudável de bem-estar.")
`
  }
];
