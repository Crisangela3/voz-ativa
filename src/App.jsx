import { useState } from 'react'
import { Mic, FileText, ClipboardList } from 'lucide-react'
import TranscriptionTab from './components/TranscriptionTab'
import RegistrationForm from './components/RegistrationForm'

const TABS = [
  { id: 'transcricao', label: 'Transcrição', icon: FileText },
  { id: 'ficha', label: 'Ficha Cadastral', icon: ClipboardList },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('transcricao')

  return (
    <div className="min-h-screen" style={{ background: '#F2E8D5' }}>
      <header className="shadow-sm" style={{ background: '#7D8C69' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#C9A84C' }}
          >
            <Mic size={20} color="#F2E8D5" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: '#F2E8D5' }}>
              Voz Ativa
            </h1>
            <p className="text-xs" style={{ color: '#d6e0cb' }}>
              Transcrição em tempo real para acessibilidade
            </p>
          </div>
        </div>
      </header>

      <div style={{ background: '#7D8C69' }}>
        <div className="max-w-2xl mx-auto px-4 flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2"
              style={
                activeTab === id
                  ? { color: '#C9A84C', borderColor: '#C9A84C' }
                  : { color: '#d6e0cb', borderColor: 'transparent' }
              }
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-6 shadow-md" style={{ background: '#faf5ec' }}>
          {activeTab === 'transcricao' ? <TranscriptionTab /> : <RegistrationForm />}
        </div>
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: '#a09080' }}>
        Voz Ativa © {new Date().getFullYear()} — Acessibilidade pedagógica
      </footer>
    </div>
  )
}
