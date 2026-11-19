import React, { useState } from 'react';
import { PYTHON_SNIPPETS } from '../../data/pythonSnippets';
import { runPythonCode, PythonExecutionResult } from '../../utils/pythonRunner';
import { Play, Copy, Check, Download, Terminal, RefreshCw, Sparkles, FileCode } from 'lucide-react';

interface PythonTerminalModuleProps {
  initialCode?: string;
}

export const PythonTerminalModule: React.FC<PythonTerminalModuleProps> = ({ initialCode }) => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(PYTHON_SNIPPETS[0].id);
  const [code, setCode] = useState<string>(initialCode || PYTHON_SNIPPETS[0].code);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<PythonExecutionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // If initialCode changes from outside props
  React.useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleSelectSnippet = (id: string) => {
    setSelectedSnippetId(id);
    const snippet = PYTHON_SNIPPETS.find((s) => s.id === id);
    if (snippet) {
      setCode(snippet.code);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await runPythonCode(code);
      setExecutionResult(res);
    } catch (e: any) {
      setExecutionResult({
        stdout: '',
        stderr: String(e),
        executionTimeMs: 0,
        engineUsed: 'Python Simulator Lab (Native)',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const snippet = PYTHON_SNIPPETS.find((s) => s.id === selectedSnippetId);
    const filename = snippet ? snippet.filename : 'script_embeddings.py';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <span>Slide 12</span>
            <span>·</span>
            <span>Simulador Prático em Python</span>
            <span>·</span>
            <span>NumPy, SciPy & OpenCV</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Terminal Python: Algoritmos dos Slides em Tempo Real
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Execute os algoritmos reais em Python diretamente no navegador via WebAssembly (Pyodide / NumPy).
            Edite os parâmetros vetoriais, teste o classificador de bem-estar ou baixe o código para rodar no Google Colab.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Script (.py)
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 active:scale-95 disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executando...' : 'Executar Python (Run)'}
          </button>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PYTHON_SNIPPETS.map((snippet) => (
          <button
            key={snippet.id}
            onClick={() => handleSelectSnippet(snippet.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
              selectedSnippetId === snippet.id
                ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 font-semibold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
            {snippet.title}
          </button>
        ))}
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Python Code Editor */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              {PYTHON_SNIPPETS.find((s) => s.id === selectedSnippetId)?.filename || 'script.py'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full flex-1 p-4 bg-slate-950/90 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none min-h-[460px] border-none selection:bg-indigo-500/30 selection:text-white"
          />
        </div>

        {/* Terminal Output Console */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Terminal de Saída (Stdout / Console)
            </span>
            {executionResult && (
              <span className="text-[10px] font-mono text-slate-500">
                {executionResult.executionTimeMs}ms · {executionResult.engineUsed}
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-950 flex-1 overflow-y-auto font-mono text-xs text-slate-300 min-h-[460px] whitespace-pre-wrap leading-relaxed select-text">
            {executionResult ? (
              <>
                {executionResult.stdout && (
                  <div className="text-emerald-400">{executionResult.stdout}</div>
                )}
                {executionResult.stderr && (
                  <div className="text-rose-400 mt-2">{executionResult.stderr}</div>
                )}
              </>
            ) : (
              <div className="text-slate-600 h-full flex flex-col items-center justify-center py-20 text-center">
                <Terminal className="w-8 h-8 mb-2 opacity-40 text-slate-500" />
                <p>Nenhuma execução recente.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Clique em &quot;Executar Python (Run)&quot; acima para compilar e rodar o script.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
