import { SlideInfo } from '../types/simulator';

export interface PresentationAuthor {
  name: string;
  role: string;
}

export const PRESENTATION_AUTHORS: PresentationAuthor[] = [
  { name: 'Afonso Brum', role: 'Inteligência Artificial & Visão Computacional' },
  { name: 'Larissa Rodrigues', role: 'Inteligência Artificial & Visão Computacional' },
  { name: 'Luiza Bracher', role: 'Inteligência Artificial & Visão Computacional' },
  { name: 'Rafael Berrones', role: 'Inteligência Artificial & Visão Computacional' },
];

export const SLIDES_DATA: SlideInfo[] = [
  {
    number: 1,
    title: 'Embeddings, Vetores e Visão Computacional',
    category: 'Capa & Apresentação',
    subtitle: 'Como a matemática e os mapas de vetores ajudam a IA a entender imagens, identificar feições e cuidar do bem-estar no trabalho.',
    bulletPoints: [
      'Visão geral da ponte entre álgebra linear e visão computacional moderna.',
      'Aplicações práticas em ergonomia e saúde mental no trabalho corporativo.',
      'Apresentação dos integrantes e objetivos do simulador prático.'
    ],
    keyConcept: 'Transformação de dados brutos perceptuais em geometria computável (vetores multidimensionais).',
    practicalApplication: 'Base teórica para os módulos de simetria facial, detecção de bordas e saúde corporativa.',
    targetModule: 'semantic-search'
  },
  {
    number: 2,
    title: '1. O que são Embeddings?',
    category: 'Conceitos Básicos',
    subtitle: 'Traduzindo Dados em Números e Proximidade como Semelhança',
    bulletPoints: [
      'Traduzindo Dados em Números: Embeddings transformam dados complexos (imagens e textos) em sequências numéricas organizadas em um mapa f: X → R^n.',
      'Proximidade é Semelhança: Elementos parecidos ficam próximos no mapa.',
      'O computador mede essa distância matemática (euclidiana ou cosseno) para saber o quanto são similares.'
    ],
    keyConcept: 'f: X → R^n (Mapeamento de manifold de alta dimensão em um espaço contínuo).',
    practicalApplication: 'Comparação de palavras e textos, detecção de similaridade semântica e busca vetorial.',
    targetModule: 'semantic-search'
  },
  {
    number: 3,
    title: '2. Como Funciona o Espaço Vetorial',
    category: 'Conceitos Básicos',
    subtitle: 'Múltiplas Dimensões, Grupos de Afinidade e Linhas de Divisão',
    bulletPoints: [
      'Múltiplas Dimensões: Vários atributos são analisados simultaneamente (cor, formato, textura e tamanho).',
      'Grupos de Afinidade: Imagens da mesma categoria se agrupam naturalmente na mesma região (clustering).',
      'Linhas de Divisão: O sistema cria limites claros (hiperplanos) para separar e classificar diferentes objetos.'
    ],
    keyConcept: 'Geometria de hiperplanos de separação (w · x + b = 0) e agrupamento semântico.',
    practicalApplication: 'Classificadores de emoção e postura (SVM, k-NN, Redes Neurais).',
    targetModule: 'word-space-clusters'
  },
  {
    number: 4,
    title: '3. Visão Computacional na Prática',
    category: 'Visão Computacional',
    subtitle: 'Além dos Pixels Isolados e Extração de Características',
    bulletPoints: [
      'Além dos Pixels Isolados: Em vez de olhar apenas para pontos de cor, a IA identifica formatos, bordas e estruturas inteiras.',
      'Imagem Bruta: Apenas uma grade bidimensional de brilho e cores (matriz RGB).',
      'Vetorização Inteligente: Identificação de contornos, rostos e objetos via filtros Sobel, Harris e descritores.'
    ],
    keyConcept: 'Feature Extraction (Edge Detection, Blob Detection, Corner Detection, Texture Analysis).',
    practicalApplication: 'Pré-processamento visual de câmeras de trabalho para análise postural e facial.',
    targetModule: 'lexical-vs-semantic'
  },
  {
    number: 5,
    title: '4. A Evolução do Treinamento',
    category: 'Visão Computacional',
    subtitle: 'Bancos Vetoriais Pequenos vs Grandes Bancos Vetoriais',
    bulletPoints: [
      'Primeiros Modelos (Bancos Vetoriais Pequenos): Como os mapas eram simples, formatos parecidos se confundiam facilmente.',
      'Erros Históricos Comuns: Cone ↔ Nariz | Cavalo ↔ Zebra (colapso de dimensionalidade).',
      'Grandes Bancos Vetoriais Atuais: Com mais treino e mais dimensões (ex: 128D, 512D), a IA aprendeu a separar detalhes sutis com altíssima precisão.'
    ],
    keyConcept: 'Resolução dimensional: mais eixos ortogonais evitam sobreposições ilusórias de projeção.',
    practicalApplication: 'Diferenciação exata entre termos e desambiguação contextual de palavras.',
    targetModule: 'word-space-clusters'
  },
  {
    number: 6,
    title: '5. Bissetrizes e Alinhamento',
    category: 'Geometria & Vetores',
    subtitle: 'A Linha Central de Equilíbrio e Direção Média dos Vetores',
    bulletPoints: [
      'A Linha Central de Equilíbrio: A bissetriz divide um ângulo exatamente ao meio. Encontra a linha média que divide o rosto ou corpo em duas partes iguais.',
      'Linha de Simetria = Direção Média dos Vetores unitários.',
      'Simetria Facial: Garante o alinhamento correto dos olhos, nariz e boca.',
      'Independente da Distância: Mantém a orientação certa esteja a pessoa perto ou longe da webcam.'
    ],
    keyConcept: 'Bissetriz B = (u / ||u||) + (v / ||v||) e invariância a zoom e rotação 3D.',
    practicalApplication: 'Álgebra e operações vetoriais no espaço latente.',
    targetModule: 'word-algebra'
  },
  {
    number: 7,
    title: '6. Encontrando Formas com OpenCV',
    category: 'Geometria & Vetores',
    subtitle: 'Transformada de Hough e Votação no Espaço de Parâmetros',
    bulletPoints: [
      'Hough Transform: Ferramenta matemática utilizada para encontrar padrões geométricos (linhas retas e contornos) em imagem binária.',
      'Mapeamento Polar: Transforma pontos (x, y) no espaço cartesiano em senoides no espaço polar (ρ, θ).',
      'Votação Coletiva: Quando múltiplos pontos colineares votam no mesmo par (ρ, θ), o sistema identifica a borda estrutural.'
    ],
    keyConcept: 'ρ = x·cos(θ) + y·sin(θ) e acumulador de votos discretizado.',
    practicalApplication: 'Detecção de alinhamentos e correspondência de padrões.',
    targetModule: 'semantic-search'
  },
  {
    number: 8,
    title: '7. Mapeamento de Pontos-Chave (Keypoints)',
    category: 'Geometria & Vetores',
    subtitle: 'Pontos de Referência, Conexões Vetoriais e Leitura de Ângulos',
    bulletPoints: [
      'Pontos de Referência: Cada keypoint possui coordenadas (x, y) ou (x, y, z) que formam o vetor de características.',
      'Conexões Vetoriais: Liga os pontos de referência anatômicos marcados no corpo.',
      'Leitura de Ângulos: Mede se a postura está curvada ou ereta e a dinâmica das microexpressões.',
      'Variação Temporal: Mede a velocidade de deslocamento para classificar cansaço e tensão muscular.'
    ],
    keyConcept: 'Estimativa de pose corporal e malha facial (MediaPipe / OpenPose)',
    practicalApplication: 'Vetor de características e distâncias semânticas.',
    targetModule: 'word-algebra'
  },
  {
    number: 9,
    title: '8. Síntese: Da Matemática à Imagem',
    category: 'Geometria & Vetores',
    subtitle: 'União da Bissetriz, Linhas de Hough e Pontos-Chave',
    bulletPoints: [
      '1. Bissetrizes: Calculam o eixo médio angular para garantir simetria e alinhamento facial 3D.',
      '2. Linhas & Bordas: Mapeia pontos ruidosos no espaço polar para isolar contornos marcantes das feições e postura.',
      '3. Pontos-Chave: Estruturam uma constelação de coordenadas vetoriais para medir a variação de microexpressões em tempo real.'
    ],
    keyConcept: 'Fusão geométrica: Geometria clássica + Espaço vetorial contínuo = Visão analítica robusta.',
    practicalApplication: 'Arquitetura unificada para sensores e busca de palavras.',
    targetModule: 'word-algebra'
  },
  {
    number: 10,
    title: '9. Aplicação: Análise de Bem-Estar',
    category: 'Aplicação Prática',
    subtitle: 'Monitoramento Passivo de Expressões e Prevenção de Burnout',
    bulletPoints: [
      'Monitoramento Passivo de Expressões: Captação de microexpressões e postura no ambiente de trabalho através de sensores visuais.',
      'Conversão Contínua: Tradução contínua de feições em vetores comparativos de perfil emocional ao longo das horas do dia.',
      'Objetivo Preventivo: Identificar sinais de cansaço ou tristeza constante antes que evoluam para o Burnout grave.'
    ],
    keyConcept: 'Índice de Bem-Estar (Wellbeing Score), EAR (Eye Aspect Ratio) e tracking temporal de humor.',
    practicalApplication: 'Triagem de relatos e busca de sinais de exaustão em textos.',
    targetModule: 'burnout-text-search'
  },
  {
    number: 11,
    title: '10. Fluxo de Cuidado Emocional',
    category: 'Aplicação Prática',
    subtitle: 'Protocolo Ético de 4 Etapas: Do Sensor ao Acolhimento Humano',
    bulletPoints: [
      '1. Leitura do Rosto: Mapeamento rápido e não invasivo dos pontos de expressão facial e postura.',
      '2. Sinal de Tristeza: Identificação estatística de desânimo frequente ou fadiga ocular acumulada.',
      '3. Alerta Discreto: Notificação interna, pessoal e estritamente confidencial (sem expor o colaborador).',
      '4. Apoio Emocional: Acolhimento proativo com psicólogo, terapeuta ocupacional ou RH parceiro.'
    ],
    keyConcept: 'IA Responsável & Ética: Uso de visão computacional para proteção da saúde do trabalhador.',
    practicalApplication: 'Fluxo real de intervenção preventiva em RH e ergonomia industrial.',
    targetModule: 'burnout-text-search'
  },
  {
    number: 12,
    title: 'Obrigado! Apresentação do Simulador Prático',
    category: 'Conclusão & Apresentação',
    subtitle: 'Interação Ao Vivo com os Algoritmos em Python e Espaços Vetoriais',
    bulletPoints: [
      'Execução dos scripts Python em tempo real no navegador.',
      'Experimentação livre com vetores, transformadas e métricas faciais.',
      'Código disponível para download e execução no Google Colab / VS Code.'
    ],
    keyConcept: 'Demonstração prática dos conceitos apresentados pelos autores Afonso, Larissa, Luiza e Rafael.',
    practicalApplication: 'Ferramenta interativa de laboratório educacional e prototipagem.',
    targetModule: 'python-terminal'
  }
];
