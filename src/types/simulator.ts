export type ModuleId =
  | 'semantic-search'
  | 'word-algebra'
  | 'lexical-vs-semantic'
  | 'word-space-clusters'
  | 'burnout-text-search'
  | 'python-terminal'
  | 'slide-deck';

export interface WordVector {
  word: string;
  category: string;
  subCategory?: string;
  x: number; // 2D projection [-100, 100]
  y: number; // 2D projection [-100, 100]
  vector: number[]; // High-dimensional dense representation (e.g., 8D normalized)
  description: string;
  color: string;
}

export interface SearchResult {
  word: string;
  category: string;
  similarity: number; // Cosine similarity 0 - 1
  distance: number; // Euclidean distance
  vector: number[];
  x: number;
  y: number;
  description: string;
  color: string;
}

export interface WordAlgebraOperation {
  wordA: string;
  op1: '+' | '-';
  wordB: string;
  op2?: '+' | '-';
  wordC?: string;
  expectedResult: string;
  explanation: string;
}

export interface SlideInfo {
  number: number;
  title: string;
  category: string;
  subtitle?: string;
  bulletPoints: string[];
  keyConcept: string;
  practicalApplication: string;
  targetModule: ModuleId;
}

export interface PythonCodeSnippet {
  id: string;
  title: string;
  description: string;
  filename: string;
  tags: string[];
  code: string;
}
