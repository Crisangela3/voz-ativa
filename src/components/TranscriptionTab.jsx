import { useState, useRef, useCallback } from 'react'
import { Mic, StopCircle, Download, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'

const CATEGORIES = [
  { id: 'aula', label: 'Aula' },
  { id: 'saude', label: 'Saúde' },
  { id: 'conversa', label: 'Conversa' },
]

export default function TranscriptionTab() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [category, setCategory] = useState('aula')
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Reconhecimento de voz não é suportado neste navegador. Tente o Google Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += text + ' '
        } else {
          interim += text
        }
      }
      if (final) setTranscript((prev) => prev + final)
      setInterimText(interim)
    }

    recognition.onerror = (event) => {
      setError(`Erro: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setError('')
  }, [])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
    setInterimText('')
  }, [])

  const clearTranscript = () => {
    setTranscript('')
    setInterimText('')
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category
    const date = new Date().toLocaleDateString('pt-BR')

    doc.setFontSize(18)
    doc.setTextColor(125, 140, 105)
    doc.text('Voz Ativa — Transcrição', 14, 20)

    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(`Categoria: ${categoryLabel}   |   Data: ${date}`, 14, 30)

    doc.setDrawColor(201, 168, 76)
    doc.line(14, 34, 196, 34)

    doc.setFontSize(12)
    doc.setTextColor(50, 50, 50)
    const lines = doc.splitTextToSize(transcript || '(sem conteúdo)', 180)
    doc.text(lines, 14, 44)

    doc.save(`voz-ativa-${category}-${date.replace(/\//g, '-')}.pdf`)
  }

  const hasContent = transcript.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: '#7D8C69' }}>
          Categoria
        </p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                category === cat.id
                  ? { background: '#7D8C69', color: '#F2E8D5' }
                  : { background: '#e8dfc8', color: '#7D8C69', border: '1px solid #7D8C69' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isRecording ? 'pulse-ring' : 'hover:scale-105'
          }`}
          style={{
            background: isRecording ? '#A65D37' : '#7D8C69',
            color: '#F2E8D5',
          }}
          aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
        >
          {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
        </button>
        <span className="text-sm font-medium" style={{ color: '#A65D37' }}>
          {isRecording ? 'Gravando... clique para parar' : 'Clique para transcrever'}
        </span>
      </div>

      {error && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ background: '#fde8d8', color: '#A65D37' }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-xl p-4 transcript-area text-base leading-relaxed"
        style={{ background: '#ede4d0', color: '#3a3028', minHeight: '180px' }}
      >
        {transcript || interimText ? (
          <>
            <span>{transcript}</span>
            {interimText && (
              <span style={{ color: '#7D8C69', opacity: 0.7 }}>{interimText}</span>
            )}
          </>
        ) : (
          <span style={{ color: '#b0a898' }}>A transcrição aparecerá aqui...</span>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={exportPDF}
          disabled={!hasContent}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: '#C9A84C', color: '#F2E8D5' }}
        >
          <Download size={16} /> Exportar PDF
        </button>
        <button
          onClick={clearTranscript}
          disabled={!hasContent}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: '#e8dfc8', color: '#A65D37', border: '1px solid #A65D37' }}
        >
          <Trash2 size={16} /> Limpar
        </button>
      </div>
    </div>
  )
}
