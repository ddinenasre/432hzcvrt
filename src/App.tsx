import { AudioConverter } from "./components/AudioConverter";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <AudioConverter />
      </main>
      <Footer />
    </div>
  );
}

export default App;