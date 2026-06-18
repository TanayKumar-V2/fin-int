import { TopBar } from './components/layout/TopBar';
import { DocumentVault } from './components/documents/DocumentVault';
import { AnalysisPanel } from './components/analysis/AnalysisPanel';
import { ChatBar } from './components/chat/ChatBar';

function App() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#0d0d12] text-text font-sans overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <DocumentVault />
        <AnalysisPanel />
        <ChatBar />
      </div>
    </div>
  );
}

export default App;
