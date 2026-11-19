import { WordVector } from '../types/simulator';
import { normalize } from '../utils/mathGeometry';

// 10 Semantic Latent Dimensions:
// [0: Trabalho/Metas, 1: Esgotamento/Estresse, 2: Positividade/Alegria, 3: Tecnologia/Software,
//  4: Fisiologia/Corpo, 5: IA/Matemática/Embeddings, 6: Descanso/Cuidado, 7: Visão/Imagem,
//  8: Social/Relações/Apoio, 9: Geometria/Formas]

const RAW_WORDS: Array<{
  word: string;
  category: string;
  x: number;
  y: number;
  rawVector: number[];
  description: string;
  color: string;
}> = [
  // =========================================================================
  // GRUPO 1: Saúde Mental & Risco (Vermelho / Rosa #f43f5e)
  // =========================================================================
  {
    word: 'burnout',
    category: 'Saúde Mental & Risco',
    x: -80,
    y: 70,
    rawVector: [0.85, 0.98, 0.02, 0.10, 0.65, 0.10, 0.05, 0.10, 0.15, 0.05],
    description: 'Esgotamento crônico físico e psicológico associado a estresse laboral severo.',
    color: '#f43f5e',
  },
  {
    word: 'exaustão',
    category: 'Saúde Mental & Risco',
    x: -88,
    y: 62,
    rawVector: [0.70, 0.99, 0.01, 0.05, 0.80, 0.05, 0.05, 0.10, 0.10, 0.05],
    description: 'Sensação profunda de perda total de energia vital.',
    color: '#f43f5e',
  },
  {
    word: 'cansaço',
    category: 'Saúde Mental & Risco',
    x: -72,
    y: 55,
    rawVector: [0.60, 0.88, 0.10, 0.05, 0.85, 0.05, 0.15, 0.20, 0.15, 0.05],
    description: 'Fadiga física e mental após esforço prolongado.',
    color: '#f43f5e',
  },
  {
    word: 'estresse',
    category: 'Saúde Mental & Risco',
    x: -75,
    y: 82,
    rawVector: [0.80, 0.92, 0.05, 0.10, 0.60, 0.10, 0.05, 0.10, 0.20, 0.05],
    description: 'Tensão provocada por excesso de estímulos, cobranças e pressões.',
    color: '#f43f5e',
  },
  {
    word: 'ansiedade',
    category: 'Saúde Mental & Risco',
    x: -68,
    y: 90,
    rawVector: [0.70, 0.88, 0.05, 0.05, 0.65, 0.05, 0.05, 0.10, 0.25, 0.05],
    description: 'Estado de alerta contínuo, inquietação e apreensão sobre o futuro.',
    color: '#f43f5e',
  },
  {
    word: 'tristeza',
    category: 'Saúde Mental & Risco',
    x: -85,
    y: 45,
    rawVector: [0.40, 0.85, 0.02, 0.05, 0.50, 0.05, 0.10, 0.15, 0.15, 0.05],
    description: 'Sentimento de desânimo, melancolia e perda de prazer nas atividades.',
    color: '#f43f5e',
  },
  {
    word: 'desânimo',
    category: 'Saúde Mental & Risco',
    x: -78,
    y: 35,
    rawVector: [0.50, 0.86, 0.03, 0.05, 0.60, 0.05, 0.10, 0.10, 0.15, 0.05],
    description: 'Falta de disposição ou ânimo para iniciar ou concluir tarefas (Slide 11).',
    color: '#f43f5e',
  },
  {
    word: 'sobrecarga',
    category: 'Saúde Mental & Risco',
    x: -60,
    y: 75,
    rawVector: [0.95, 0.90, 0.05, 0.10, 0.70, 0.10, 0.05, 0.10, 0.20, 0.05],
    description: 'Acúmulo insustentável de demandas simultâneas.',
    color: '#f43f5e',
  },
  {
    word: 'insônia',
    category: 'Saúde Mental & Risco',
    x: -92,
    y: 50,
    rawVector: [0.50, 0.85, 0.02, 0.05, 0.90, 0.05, 0.02, 0.10, 0.05, 0.05],
    description: 'Dificuldade para dormir decorrente de estresse e fadiga acumulada.',
    color: '#f43f5e',
  },
  {
    word: 'frustração',
    category: 'Saúde Mental & Risco',
    x: -65,
    y: 62,
    rawVector: [0.75, 0.80, 0.05, 0.10, 0.50, 0.05, 0.10, 0.05, 0.20, 0.05],
    description: 'Sensação de impotência diante de expectativas não atendidas.',
    color: '#f43f5e',
  },

  // =========================================================================
  // GRUPO 2: Bem-Estar & Saúde Emocional (Verde Esmeralda #10b981)
  // =========================================================================
  {
    word: 'bem-estar',
    category: 'Bem-Estar & Positividade',
    x: 70,
    y: 68,
    rawVector: [0.35, 0.05, 0.92, 0.10, 0.70, 0.10, 0.95, 0.20, 0.75, 0.05],
    description: 'Harmonia plena física, psíquica e social.',
    color: '#10b981',
  },
  {
    word: 'descanso',
    category: 'Bem-Estar & Positividade',
    x: 60,
    y: 52,
    rawVector: [0.25, 0.08, 0.88, 0.05, 0.85, 0.05, 0.99, 0.10, 0.60, 0.05],
    description: 'Pausa regenerativa indispensável para restauração cerebral.',
    color: '#10b981',
  },
  {
    word: 'pausa',
    category: 'Bem-Estar & Positividade',
    x: 52,
    y: 60,
    rawVector: [0.45, 0.12, 0.80, 0.05, 0.75, 0.05, 0.92, 0.10, 0.55, 0.05],
    description: 'Intervalo consciente durante o expediente para descompressão.',
    color: '#10b981',
  },
  {
    word: 'alegria',
    category: 'Bem-Estar & Positividade',
    x: 82,
    y: 78,
    rawVector: [0.30, 0.03, 0.98, 0.10, 0.45, 0.05, 0.80, 0.25, 0.85, 0.05],
    description: 'Sentimento de vivacidade, contentamento e riso.',
    color: '#10b981',
  },
  {
    word: 'felicidade',
    category: 'Bem-Estar & Positividade',
    x: 88,
    y: 72,
    rawVector: [0.30, 0.02, 0.99, 0.05, 0.40, 0.05, 0.85, 0.20, 0.88, 0.05],
    description: 'Estado duradouro de plenitude e propósito de vida.',
    color: '#10b981',
  },
  {
    word: 'calma',
    category: 'Bem-Estar & Positividade',
    x: 65,
    y: 42,
    rawVector: [0.20, 0.05, 0.85, 0.05, 0.65, 0.05, 0.95, 0.10, 0.70, 0.05],
    description: 'Tranquilidade e serenidade na tomada de decisões.',
    color: '#10b981',
  },
  {
    word: 'equilíbrio',
    category: 'Bem-Estar & Positividade',
    x: 75,
    y: 58,
    rawVector: [0.50, 0.05, 0.90, 0.10, 0.70, 0.10, 0.90, 0.15, 0.80, 0.10],
    description: 'Estabilidade harmônica entre demandas profissionais e vida pessoal.',
    color: '#10b981',
  },
  {
    word: 'motivação',
    category: 'Bem-Estar & Positividade',
    x: 80,
    y: 88,
    rawVector: [0.70, 0.10, 0.95, 0.20, 0.50, 0.10, 0.65, 0.15, 0.85, 0.05],
    description: 'Impulso interno que direciona a energia em prol de realizações.',
    color: '#10b981',
  },
  {
    word: 'resiliência',
    category: 'Bem-Estar & Positividade',
    x: 70,
    y: 82,
    rawVector: [0.65, 0.15, 0.88, 0.10, 0.60, 0.10, 0.80, 0.10, 0.80, 0.05],
    description: 'Capacidade de superar adversidades e se reerguer com firmeza.',
    color: '#10b981',
  },
  {
    word: 'saúde',
    category: 'Bem-Estar & Positividade',
    x: 62,
    y: 76,
    rawVector: [0.35, 0.05, 0.92, 0.10, 0.90, 0.05, 0.96, 0.15, 0.70, 0.05],
    description: 'Vitalidade corporal e higidez mental completa.',
    color: '#10b981',
  },

  // =========================================================================
  // GRUPO 3: Ergonomia & Fisiologia Corporal (Âmbar / Laranja #f59e0b)
  // =========================================================================
  {
    word: 'postura',
    category: 'Ergonomia & Fisiologia',
    x: 12,
    y: 38,
    rawVector: [0.65, 0.40, 0.45, 0.20, 0.99, 0.15, 0.50, 0.60, 0.30, 0.35],
    description: 'Disposição espacial do corpo durante a execução de atividades (Slide 8).',
    color: '#f59e0b',
  },
  {
    word: 'coluna',
    category: 'Ergonomia & Fisiologia',
    x: 18,
    y: 22,
    rawVector: [0.40, 0.45, 0.30, 0.10, 0.99, 0.10, 0.40, 0.40, 0.20, 0.40],
    description: 'Eixo vertebral que suporta a carga do tronco e cabeça.',
    color: '#f59e0b',
  },
  {
    word: 'ergonomia',
    category: 'Ergonomia & Fisiologia',
    x: 25,
    y: 48,
    rawVector: [0.80, 0.30, 0.70, 0.30, 0.96, 0.20, 0.75, 0.50, 0.50, 0.30],
    description: 'Ciência que ajusta o ambiente laboral às capacidades humanas.',
    color: '#f59e0b',
  },
  {
    word: 'cervical',
    category: 'Ergonomia & Fisiologia',
    x: 22,
    y: 30,
    rawVector: [0.45, 0.55, 0.25, 0.10, 0.98, 0.10, 0.35, 0.45, 0.20, 0.35],
    description: 'Região do pescoço sujeita a tensão ao projetar a cabeça para a tela.',
    color: '#f59e0b',
  },
  {
    word: 'olhos',
    category: 'Ergonomia & Fisiologia',
    x: 0,
    y: 18,
    rawVector: [0.45, 0.60, 0.40, 0.30, 0.92, 0.15, 0.35, 0.98, 0.30, 0.20],
    description: 'Órgãos visuais analisados via EAR para detectar sonolência e piscadas.',
    color: '#f59e0b',
  },
  {
    word: 'ombros',
    category: 'Ergonomia & Fisiologia',
    x: 15,
    y: 45,
    rawVector: [0.50, 0.50, 0.30, 0.15, 0.96, 0.10, 0.40, 0.50, 0.20, 0.40],
    description: 'Articulações superiores cuja linha indica assimetria postural (Slide 7).',
    color: '#f59e0b',
  },
  {
    word: 'cifose',
    category: 'Ergonomia & Fisiologia',
    x: 28,
    y: 15,
    rawVector: [0.45, 0.60, 0.15, 0.10, 0.99, 0.10, 0.25, 0.35, 0.15, 0.45],
    description: 'Curvatura excessiva das costas provocada por má postura (slouching).',
    color: '#f59e0b',
  },
  {
    word: 'alongamento',
    category: 'Ergonomia & Fisiologia',
    x: 35,
    y: 55,
    rawVector: [0.40, 0.20, 0.80, 0.10, 0.95, 0.10, 0.85, 0.30, 0.40, 0.25],
    description: 'Exercícios físicos curtos de extensão muscular preventiva.',
    color: '#f59e0b',
  },
  {
    word: 'fadiga ocular',
    category: 'Ergonomia & Fisiologia',
    x: -5,
    y: 28,
    rawVector: [0.55, 0.75, 0.20, 0.25, 0.92, 0.10, 0.30, 0.95, 0.20, 0.20],
    description: 'Secura e cansaço visual gerados por tempo excessivo frente a monitores.',
    color: '#f59e0b',
  },
  {
    word: 'respiração',
    category: 'Ergonomia & Fisiologia',
    x: 40,
    y: 40,
    rawVector: [0.30, 0.20, 0.85, 0.05, 0.95, 0.05, 0.90, 0.20, 0.45, 0.10],
    description: 'Ritmo ventilatório oxigenador que regula o estresse autônomo.',
    color: '#f59e0b',
  },

  // =========================================================================
  // GRUPO 4: Trabalho & Gestão Corporativa (Amarelo Ouro #eab308)
  // =========================================================================
  {
    word: 'trabalho',
    category: 'Trabalho & Gestão',
    x: -18,
    y: 42,
    rawVector: [0.99, 0.50, 0.35, 0.40, 0.50, 0.20, 0.20, 0.20, 0.60, 0.10],
    description: 'Atividade laboral diária e compromisso profissional produtivo.',
    color: '#eab308',
  },
  {
    word: 'reunião',
    category: 'Trabalho & Gestão',
    x: -32,
    y: 52,
    rawVector: [0.95, 0.60, 0.30, 0.30, 0.40, 0.15, 0.15, 0.25, 0.80, 0.10],
    description: 'Encontro presencial ou remoto para alinhamento de diretrizes.',
    color: '#eab308',
  },
  {
    word: 'prazo',
    category: 'Trabalho & Gestão',
    x: -45,
    y: 65,
    rawVector: [0.96, 0.75, 0.20, 0.35, 0.45, 0.15, 0.10, 0.15, 0.50, 0.10],
    description: 'Data limite estipulada para entregas de demandas e projetos.',
    color: '#eab308',
  },
  {
    word: 'produtividade',
    category: 'Trabalho & Gestão',
    x: -0.5,
    y: 60,
    rawVector: [0.95, 0.30, 0.80, 0.40, 0.50, 0.25, 0.50, 0.20, 0.70, 0.10],
    description: 'Eficiência de entrega mantendo qualidade e ritmo sustentável.',
    color: '#eab308',
  },
  {
    word: 'liderança',
    category: 'Trabalho & Gestão',
    x: -10,
    y: 72,
    rawVector: [0.92, 0.35, 0.75, 0.30, 0.40, 0.20, 0.45, 0.15, 0.90, 0.10],
    description: 'Capacidade de guiar, inspirar e cuidar do bem-estar dos liderados.',
    color: '#eab308',
  },
  {
    word: 'carreira',
    category: 'Trabalho & Gestão',
    x: -5,
    y: 50,
    rawVector: [0.98, 0.35, 0.65, 0.35, 0.40, 0.20, 0.30, 0.15, 0.65, 0.10],
    description: 'Trajetória e crescimento de realizações profissionais contínuas.',
    color: '#eab308',
  },
  {
    word: 'escritório',
    category: 'Trabalho & Gestão',
    x: -28,
    y: 32,
    rawVector: [0.92, 0.45, 0.40, 0.40, 0.55, 0.20, 0.25, 0.30, 0.60, 0.20],
    description: 'Ambiente físico compartilhado de execução de tarefas corporativas.',
    color: '#eab308',
  },
  {
    word: 'home office',
    category: 'Trabalho & Gestão',
    x: -20,
    y: 25,
    rawVector: [0.90, 0.45, 0.55, 0.70, 0.60, 0.25, 0.40, 0.30, 0.40, 0.15],
    description: 'Regime de trabalho remoto que exige autogestão ergonômica.',
    color: '#eab308',
  },
  {
    word: 'feedback',
    category: 'Trabalho & Gestão',
    x: 0,
    y: 70,
    rawVector: [0.90, 0.30, 0.70, 0.25, 0.35, 0.15, 0.50, 0.15, 0.92, 0.05],
    description: 'Retorno construtivo sobre o desempenho e clima de trabalho.',
    color: '#eab308',
  },
  {
    word: 'equipe',
    category: 'Trabalho & Gestão',
    x: 5,
    y: 60,
    rawVector: [0.90, 0.30, 0.75, 0.30, 0.40, 0.15, 0.45, 0.15, 0.95, 0.05],
    description: 'Grupo de pessoas trabalhando de forma coesa por um objetivo comum.',
    color: '#eab308',
  },

  // =========================================================================
  // GRUPO 5: Inteligência Artificial & Embeddings (Ciano / Azul Claro #38bdf8)
  // =========================================================================
  {
    word: 'embeddings',
    category: 'Inteligência Artificial',
    x: -42,
    y: -72,
    rawVector: [0.65, 0.15, 0.65, 0.95, 0.15, 0.99, 0.25, 0.75, 0.20, 0.60],
    description: 'Vetores densos que transformam dados complexos em representações contínuas em Rn.',
    color: '#38bdf8',
  },
  {
    word: 'vetor',
    category: 'Inteligência Artificial',
    x: -58,
    y: -48,
    rawVector: [0.55, 0.10, 0.50, 0.90, 0.15, 0.98, 0.20, 0.60, 0.15, 0.75],
    description: 'Estrutura matemática de coordenadas com direção, sentido e módulo.',
    color: '#38bdf8',
  },
  {
    word: 'inteligência artificial',
    category: 'Inteligência Artificial',
    x: -28,
    y: -78,
    rawVector: [0.75, 0.20, 0.70, 0.99, 0.20, 0.99, 0.30, 0.85, 0.30, 0.40],
    description: 'Sistemas computacionais que simulam raciocínio e aprendem com dados.',
    color: '#38bdf8',
  },
  {
    word: 'similaridade',
    category: 'Inteligência Artificial',
    x: -48,
    y: -62,
    rawVector: [0.50, 0.10, 0.60, 0.90, 0.15, 0.99, 0.25, 0.70, 0.20, 0.70],
    description: 'Métrica que quantifica a proximidade entre dois vetores (Slide 2).',
    color: '#38bdf8',
  },
  {
    word: 'cosseno',
    category: 'Inteligência Artificial',
    x: -52,
    y: -58,
    rawVector: [0.45, 0.05, 0.55, 0.88, 0.10, 0.99, 0.20, 0.60, 0.10, 0.80],
    description: 'Medida angular da orientação entre vetores: cos(θ) = (A·B) / (||A||*||B||).',
    color: '#38bdf8',
  },
  {
    word: 'hiperplano',
    category: 'Inteligência Artificial',
    x: -62,
    y: -38,
    rawVector: [0.50, 0.10, 0.50, 0.85, 0.15, 0.98, 0.15, 0.55, 0.10, 0.90],
    description: 'Fronteira linear (w·x + b = 0) que separa classes no espaço vetorial (Slide 3).',
    color: '#38bdf8',
  },
  {
    word: 'cluster',
    category: 'Inteligência Artificial',
    x: -38,
    y: -55,
    rawVector: [0.60, 0.15, 0.60, 0.90, 0.15, 0.98, 0.20, 0.60, 0.25, 0.70],
    description: 'Agrupamento natural de pontos por afinidade de características.',
    color: '#38bdf8',
  },
  {
    word: 'k-nn',
    category: 'Inteligência Artificial',
    x: -45,
    y: -45,
    rawVector: [0.55, 0.10, 0.50, 0.90, 0.15, 0.98, 0.20, 0.55, 0.15, 0.65],
    description: 'Algoritmo dos K vizinhos mais próximos para busca e classificação.',
    color: '#38bdf8',
  },
  {
    word: 'espaço latente',
    category: 'Inteligência Artificial',
    x: -35,
    y: -65,
    rawVector: [0.60, 0.10, 0.65, 0.95, 0.15, 0.99, 0.25, 0.70, 0.15, 0.75],
    description: 'Espaço multidimensional onde conceitos semânticos são posicionados.',
    color: '#38bdf8',
  },
  {
    word: 'redes neurais',
    category: 'Inteligência Artificial',
    x: -25,
    y: -70,
    rawVector: [0.70, 0.15, 0.65, 0.99, 0.20, 0.99, 0.25, 0.85, 0.20, 0.50],
    description: 'Modelos computacionais inspirados no cérebro para aprender representações.',
    color: '#38bdf8',
  },

  // =========================================================================
  // GRUPO 6: Tecnologia & Programação (Índigo / Azul Escuro #6366f1)
  // =========================================================================
  {
    word: 'python',
    category: 'Tecnologia & Software',
    x: -35,
    y: -85,
    rawVector: [0.65, 0.15, 0.60, 0.99, 0.10, 0.90, 0.25, 0.40, 0.30, 0.30],
    description: 'Linguagem base de ciência de dados, NumPy, OpenCV e inteligência artificial.',
    color: '#6366f1',
  },
  {
    word: 'algoritmo',
    category: 'Tecnologia & Software',
    x: -45,
    y: -78,
    rawVector: [0.70, 0.15, 0.55, 0.99, 0.10, 0.95, 0.20, 0.45, 0.20, 0.50],
    description: 'Conjunto finito de regras e passos lógicos bem definidos.',
    color: '#6366f1',
  },
  {
    word: 'código',
    category: 'Tecnologia & Software',
    x: -50,
    y: -82,
    rawVector: [0.65, 0.20, 0.50, 0.99, 0.10, 0.88, 0.20, 0.35, 0.25, 0.30],
    description: 'Texto estruturado legível por humanos e compilável por máquinas.',
    color: '#6366f1',
  },
  {
    word: 'banco de dados',
    category: 'Tecnologia & Software',
    x: -60,
    y: -70,
    rawVector: [0.75, 0.15, 0.45, 0.98, 0.10, 0.85, 0.20, 0.25, 0.20, 0.30],
    description: 'Repositório estruturado de armazenamento e consulta de informações.',
    color: '#6366f1',
  },
  {
    word: 'servidor',
    category: 'Tecnologia & Software',
    x: -55,
    y: -88,
    rawVector: [0.70, 0.20, 0.40, 0.98, 0.10, 0.80, 0.15, 0.20, 0.20, 0.20],
    description: 'Infraestrutura computacional que processa requisições de rede.',
    color: '#6366f1',
  },
  {
    word: 'api',
    category: 'Tecnologia & Software',
    x: -40,
    y: -92,
    rawVector: [0.70, 0.15, 0.50, 0.99, 0.10, 0.85, 0.20, 0.25, 0.30, 0.25],
    description: 'Interface de comunicação padronizada entre diferentes sistemas.',
    color: '#6366f1',
  },
  {
    word: 'software',
    category: 'Tecnologia & Software',
    x: -30,
    y: -90,
    rawVector: [0.75, 0.20, 0.55, 0.99, 0.10, 0.85, 0.20, 0.30, 0.30, 0.25],
    description: 'Conjunto de programas, procedimentos e rotinas computacionais.',
    color: '#6366f1',
  },

  // =========================================================================
  // GRUPO 7: Visão Computacional & Imagens (Púrpura / Violeta #a855f7)
  // =========================================================================
  {
    word: 'opencv',
    category: 'Visão Computacional',
    x: -12,
    y: -60,
    rawVector: [0.60, 0.15, 0.55, 0.96, 0.20, 0.85, 0.20, 0.99, 0.15, 0.70],
    description: 'Biblioteca principal de processamento de imagens e transformadas (Slide 7).',
    color: '#a855f7',
  },
  {
    word: 'câmera',
    category: 'Visão Computacional',
    x: 0,
    y: -48,
    rawVector: [0.50, 0.15, 0.50, 0.85, 0.20, 0.75, 0.20, 0.99, 0.20, 0.50],
    description: 'Sensor óptico que capta grades de pixels de luz e cores (Slide 4).',
    color: '#a855f7',
  },
  {
    word: 'pixels',
    category: 'Visão Computacional',
    x: -18,
    y: -45,
    rawVector: [0.45, 0.10, 0.45, 0.90, 0.15, 0.80, 0.15, 0.99, 0.10, 0.60],
    description: 'Menor unidade gráfica digital que compõe a imagem bruta (Slide 4).',
    color: '#a855f7',
  },
  {
    word: 'bissetriz',
    category: 'Visão Computacional',
    x: -22,
    y: -38,
    rawVector: [0.50, 0.10, 0.50, 0.90, 0.30, 0.90, 0.20, 0.85, 0.10, 0.98],
    description: 'Direção média de vetores que garante simetria facial (Slide 6).',
    color: '#a855f7',
  },
  {
    word: 'hough transform',
    category: 'Visão Computacional',
    x: -8,
    y: -68,
    rawVector: [0.55, 0.10, 0.50, 0.95, 0.20, 0.92, 0.15, 0.98, 0.10, 0.95],
    description: 'Mapeamento polar ρ = x*cos(θ) + y*sin(θ) para detectar retas e bordas (Slide 7).',
    color: '#a855f7',
  },
  {
    word: 'keypoints',
    category: 'Visão Computacional',
    x: 5,
    y: -35,
    rawVector: [0.55, 0.15, 0.55, 0.90, 0.60, 0.90, 0.25, 0.95, 0.20, 0.80],
    description: 'Pontos anatômicos de referência que formam a pose esquelética (Slide 8).',
    color: '#a855f7',
  },
  {
    word: 'convolução',
    category: 'Visão Computacional',
    x: -15,
    y: -52,
    rawVector: [0.50, 0.10, 0.50, 0.92, 0.15, 0.95, 0.15, 0.99, 0.10, 0.80],
    description: 'Aplicação de matriz de filtro (kernel) sobre a imagem para isolar feições.',
    color: '#a855f7',
  },
  {
    word: 'bordas',
    category: 'Visão Computacional',
    x: -5,
    y: -42,
    rawVector: [0.45, 0.10, 0.45, 0.85, 0.20, 0.85, 0.15, 0.98, 0.10, 0.90],
    description: 'Descontinuidades de intensidade visual detectadas por filtros Sobel/Canny.',
    color: '#a855f7',
  },

  // =========================================================================
  // GRUPO 8: Psicologia & Apoio Humanizado (Slide 11 - Rosa Claro / Magenta #ec4899)
  // =========================================================================
  {
    word: 'psicólogo',
    category: 'Psicologia & Cuidado',
    x: 55,
    y: 75,
    rawVector: [0.40, 0.10, 0.85, 0.10, 0.50, 0.10, 0.95, 0.10, 0.99, 0.05],
    description: 'Profissional de escuta qualificada e terapia do bem-estar emocional.',
    color: '#ec4899',
  },
  {
    word: 'acolhimento',
    category: 'Psicologia & Cuidado',
    x: 65,
    y: 80,
    rawVector: [0.45, 0.08, 0.90, 0.05, 0.40, 0.05, 0.95, 0.10, 0.99, 0.05],
    description: 'Recepção calorosa e sem julgamentos para quem passa por sobrecarga (Slide 11).',
    color: '#ec4899',
  },
  {
    word: 'terapia',
    category: 'Psicologia & Cuidado',
    x: 50,
    y: 70,
    rawVector: [0.35, 0.15, 0.88, 0.05, 0.50, 0.05, 0.95, 0.05, 0.98, 0.05],
    description: 'Processo clínico de autoconhecimento e restauração da saúde mental.',
    color: '#ec4899',
  },
  {
    word: 'rh',
    category: 'Psicologia & Cuidado',
    x: 45,
    y: 85,
    rawVector: [0.85, 0.25, 0.70, 0.20, 0.40, 0.10, 0.75, 0.10, 0.95, 0.05],
    description: 'Recursos Humanos dedicado a gerir pessoas e prover suporte corporativo ético.',
    color: '#ec4899',
  },
  {
    word: 'empatia',
    category: 'Psicologia & Cuidado',
    x: 72,
    y: 85,
    rawVector: [0.30, 0.05, 0.95, 0.05, 0.35, 0.05, 0.90, 0.10, 0.99, 0.05],
    description: 'Habilidade de compreender e se sensibilizar com a dor alheia.',
    color: '#ec4899',
  },
  {
    word: 'sigilo',
    category: 'Psicologia & Cuidado',
    x: 40,
    y: 90,
    rawVector: [0.50, 0.15, 0.75, 0.15, 0.30, 0.10, 0.85, 0.10, 0.92, 0.10],
    description: 'Confidencialidade estrita que protege o colaborador de exposição.',
    color: '#ec4899',
  },
  {
    word: 'diálogo',
    category: 'Psicologia & Cuidado',
    x: 58,
    y: 65,
    rawVector: [0.55, 0.10, 0.85, 0.10, 0.35, 0.05, 0.88, 0.10, 0.98, 0.05],
    description: 'Conversa franca para identificar desconfortos antes que se agravem.',
    color: '#ec4899',
  },

  // =========================================================================
  // GRUPO 9: Objetos & Geometria do Mundo Real (Slide 5: Evolução - Teal #14b8a6)
  // =========================================================================
  {
    word: 'cone',
    category: 'Objetos & Geometria',
    x: 60,
    y: -65,
    rawVector: [0.10, 0.05, 0.35, 0.20, 0.10, 0.15, 0.30, 0.80, 0.10, 0.99],
    description: 'Sólido geométrico triangular confundido com nariz em bancos 2D antigos.',
    color: '#14b8a6',
  },
  {
    word: 'nariz',
    category: 'Objetos & Geometria',
    x: 48,
    y: -50,
    rawVector: [0.15, 0.10, 0.40, 0.20, 0.88, 0.15, 0.30, 0.85, 0.15, 0.85],
    description: 'Estrutura anatômica central de referência da simetria facial.',
    color: '#14b8a6',
  },
  {
    word: 'cavalo',
    category: 'Objetos & Geometria',
    x: 78,
    y: -55,
    rawVector: [0.15, 0.10, 0.50, 0.15, 0.35, 0.15, 0.40, 0.70, 0.10, 0.65],
    description: 'Animal quadrúpede de silhueta suave.',
    color: '#14b8a6',
  },
  {
    word: 'zebra',
    category: 'Objetos & Geometria',
    x: 88,
    y: -45,
    rawVector: [0.15, 0.10, 0.50, 0.15, 0.35, 0.15, 0.40, 0.85, 0.10, 0.75],
    description: 'Animal quadrúpede marcado por padrão de textura de listras pretas e brancas.',
    color: '#14b8a6',
  },
  {
    word: 'triângulo',
    category: 'Objetos & Geometria',
    x: 68,
    y: -75,
    rawVector: [0.10, 0.05, 0.30, 0.20, 0.10, 0.20, 0.25, 0.75, 0.10, 0.99],
    description: 'Polígono básico de 3 vértices que orientava os primeiros modelos.',
    color: '#14b8a6',
  },
  {
    word: 'círculo',
    category: 'Objetos & Geometria',
    x: 55,
    y: -80,
    rawVector: [0.10, 0.05, 0.30, 0.20, 0.10, 0.20, 0.25, 0.75, 0.10, 0.99],
    description: 'Forma perfeitamente simétrica radial com curvatura uniforme.',
    color: '#14b8a6',
  },
];

// Normalize all vectors to unit length (Euclidean sphere S^(n-1))
export const WORD_DATABASE: WordVector[] = RAW_WORDS.map((w) => ({
  word: w.word,
  category: w.category,
  x: w.x,
  y: w.y,
  vector: normalize(w.rawVector),
  description: w.description,
  color: w.color,
}));

/**
 * Searches the word database using semantic cosine similarity
 */
export function searchWordsByEmbedding(
  queryVector: number[],
  topK: number = 8
): Array<{ word: WordVector; similarity: number; distance: number }> {
  const normQ = normalize(queryVector);

  const results = WORD_DATABASE.map((w) => {
    let dot = 0;
    for (let i = 0; i < normQ.length; i++) {
      dot += normQ[i] * w.vector[i];
    }
    const similarity = Math.max(-1, Math.min(1, dot));

    let sumSq = 0;
    for (let i = 0; i < normQ.length; i++) {
      const diff = normQ[i] - w.vector[i];
      sumSq += diff * diff;
    }
    const distance = Math.sqrt(sumSq);

    return {
      word: w,
      similarity,
      distance,
    };
  });

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

/**
 * Infers or retrieves an embedding vector for arbitrary text or queries
 */
export function getVectorForText(text: string): { vector: number[]; x: number; y: number } {
  const clean = text.toLowerCase().trim();

  // 1. Exact match in dictionary
  const exact = WORD_DATABASE.find((w) => w.word.toLowerCase() === clean);
  if (exact) {
    return { vector: exact.vector, x: exact.x, y: exact.y };
  }

  // 2. Token-based matching & average embedding
  const tokens = clean.split(/[\s,.-]+/);
  const matchedVectors: WordVector[] = [];

  tokens.forEach((t) => {
    if (t.length < 3) return;
    const found = WORD_DATABASE.find(
      (w) => w.word.includes(t) || t.includes(w.word) || (w.description && w.description.toLowerCase().includes(t))
    );
    if (found && !matchedVectors.includes(found)) {
      matchedVectors.push(found);
    }
  });

  if (matchedVectors.length > 0) {
    const dim = matchedVectors[0].vector.length;
    const avgVec = Array(dim).fill(0);
    let avgX = 0;
    let avgY = 0;

    matchedVectors.forEach((m) => {
      avgX += m.x;
      avgY += m.y;
      for (let i = 0; i < dim; i++) {
        avgVec[i] += m.vector[i];
      }
    });

    avgX /= matchedVectors.length;
    avgY /= matchedVectors.length;

    return {
      vector: normalize(avgVec),
      x: avgX,
      y: avgY,
    };
  }

  // 3. Keyword intent heuristic
  const isNegative = /cansa|exaust|ruim|dor|fadiga|stress|triste|burnout|esgot|insonia|pressao/i.test(clean);
  const isPositive = /bem|bom|alegr|feliz|descans|pausa|saud|paz|calm|equilib/i.test(clean);
  const isTech = /ia|python|opencv|vetor|algor|computa|dado|codigo|software|api/i.test(clean);
  const isPosture = /postura|costa|ombro|coluna|pescoco|olho|cervical|ergonom/i.test(clean);
  const isCare = /psicolog|terapia|rh|acolh|empatia|escuta/i.test(clean);

  const raw = [
    0.5,
    isNegative ? 0.95 : 0.15,
    isPositive ? 0.95 : 0.10,
    isTech ? 0.95 : 0.15,
    isPosture ? 0.95 : 0.20,
    isTech ? 0.90 : 0.10,
    isPositive || isCare ? 0.95 : 0.10,
    isTech || isPosture ? 0.85 : 0.15,
    isCare ? 0.98 : 0.30,
    0.2,
  ];

  const x = isPositive ? 70 : isNegative ? -75 : isTech ? -35 : isPosture ? 20 : isCare ? 55 : 0;
  const y = isPositive ? 65 : isNegative ? 65 : isTech ? -75 : isPosture ? 35 : isCare ? 75 : 0;

  return {
    vector: normalize(raw),
    x,
    y,
  };
}

export const WORD_ALGEBRA_PRESETS = [
  {
    title: 'Trabalho + Exaustão = ?',
    wordA: 'trabalho',
    op1: '+' as const,
    wordB: 'exaustão',
    expected: 'burnout',
    explanation: 'Ao somar a atividade profissional com exaustão extrema, o vetor resultante converge para Burnout.',
  },
  {
    title: 'Burnout - Estresse + Descanso = ?',
    wordA: 'burnout',
    op1: '-' as const,
    wordB: 'estresse',
    op2: '+' as const,
    wordC: 'descanso',
    expected: 'bem-estar',
    explanation: 'Subtrair o estressor e adicionar descanso regenerativo move o vetor de volta para o cluster de Bem-Estar.',
  },
  {
    title: 'Postura + Cansaço = ?',
    wordA: 'postura',
    op1: '+' as const,
    wordB: 'cansaço',
    expected: 'coluna',
    explanation: 'A deterioração da postura provocada por fadiga gera desvios e sobrecarga na coluna vertebral.',
  },
  {
    title: 'IA + Câmera = ?',
    wordA: 'inteligência artificial',
    op1: '+' as const,
    wordB: 'câmera',
    expected: 'opencv',
    explanation: 'Unir inteligência algorítmica ao sensor visual converge para bibliotecas de Visão Computacional.',
  },
  {
    title: 'Tristeza + Acolhimento = ?',
    wordA: 'tristeza',
    op1: '+' as const,
    wordB: 'acolhimento',
    expected: 'psicólogo',
    explanation: 'Identificar tristeza e aplicar escuta acolhedora conduz ao apoio com psicólogo corporativo (Slide 11).',
  },
  {
    title: 'Python + Vetor = ?',
    wordA: 'python',
    op1: '+' as const,
    wordB: 'vetor',
    expected: 'embeddings',
    explanation: 'A manipulação de vetores numéricos em Python resulta na tecnologia de Embeddings semânticos.',
  },
];
