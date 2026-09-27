export function OutputPanel({ result, running, error }) {
  const text = error
    || result?.compileOutput
    || result?.stderr
    || result?.output
    || (running ? "Running..." : "Run code to see output.");

  return (
    <section className="flex h-56 flex-col border-t border-white/10 bg-zinc-950">
      <header className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-widest text-zinc-500">
        <span>Output</span>
        {result?.exitCode !== undefined && result?.exitCode !== null && <span>exit {result.exitCode}</span>}
      </header>
      <pre className="flex-1 overflow-auto px-4 pb-4 font-mono text-sm text-zinc-200">{text}</pre>
    </section>
  );
}
