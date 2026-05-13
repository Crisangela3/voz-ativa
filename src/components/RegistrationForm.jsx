import { useState } from 'react'

const inputClass = 'w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2'
const inputStyle = { background: '#ede4d0', color: '#3a3028' }

export default function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    const data = new FormData(form)

    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })

      if (response.ok) {
        setSubmitted(true)
        form.reset()
      } else {
        alert('Erro ao enviar. Tente novamente.')
      }
    } catch {
      alert('Erro de rede. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="text-4xl">✅</div>
        <p className="text-lg font-semibold" style={{ color: '#7D8C69' }}>
          Ficha enviada com sucesso!
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm underline"
          style={{ color: '#A65D37' }}
        >
          Enviar outra ficha
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7D8C69' }}>
            Nome completo *
          </label>
          <input
            name="nome"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7D8C69' }}>
            E-mail *
          </label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7D8C69' }}>
            Instituição de ensino
          </label>
          <input
            name="instituicao"
            className={inputClass}
            style={inputStyle}
            placeholder="Universidade / Escola"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7D8C69' }}>
            Curso / Área
          </label>
          <input
            name="curso"
            className={inputClass}
            style={inputStyle}
            placeholder="Ex: Pedagogia, Medicina..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#7D8C69' }}>
          Como você usa o Voz Ativa?
        </label>
        <select name="uso" className={inputClass} style={inputStyle}>
          <option value="aulas">Transcrever aulas</option>
          <option value="saude">Consultas de saúde</option>
          <option value="acessibilidade">Acessibilidade pessoal</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#7D8C69' }}>
          Observações
        </label>
        <textarea
          name="observacoes"
          rows={3}
          className={inputClass}
          style={inputStyle}
          placeholder="Necessidades especiais, feedback..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-60"
        style={{ background: '#7D8C69', color: '#F2E8D5' }}
      >
        {loading ? 'Enviando...' : 'Enviar Ficha'}
      </button>
    </form>
  )
}
