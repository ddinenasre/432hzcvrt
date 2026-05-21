export function Header() {
  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">432</span>
          </div>
          <div>
            <h2 className="text-white font-bold">Hz Converter</h2>
            <p className="text-slate-500 text-xs">Audio Frequency Shifter</p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
            التوثيق
          </a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}