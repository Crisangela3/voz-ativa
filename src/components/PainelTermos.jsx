import { useId, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { SIMBOLOS_FALADOS, TERMOS_PROGRAMACAO } from '../utils/termos'
import { botao, campo, cartao } from './ui'

export default function PainelTermos({
  corrigirTermos,
  onCorrigirTermos,
  simbolosFalados,
  onSimbolosFalados,
  personalizados,
  onPersonalizados,
}) {
  const idOuvido = useId()
  const idEscrever = useId()
  const [ouvido, setOuvido] = useState('')
  const [escrever, setEscrever] = useState('')

  const adicionar = (e) => {
    e.preventDefault()
    if (!ouvido.trim() || !escrever.trim()) return
    onPersonalizados([...personalizados, { ouvido: ouvido.trim(), escrever: escrever.trim() }])
    setOuvido('')
    setEscrever('')
  }

  const remover = (indice) => onPersonalizados(personalizados.filter((_, i) => i !== indice))

  return (
    <section className={cartao} aria-labelledby="titulo-termos">
      <h2 id="titulo-termos" className="mb-3 text-lg font-extrabold text-titulo">
        Termos de programação
      </h2>

      <div className="space-y-3">
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={corrigirTermos}
            onChange={(e) => onCorrigirTermos(e.target.checked)}
            className="mt-1 size-5 accent-primaria"
          />
          <span>
            <strong>Corrigir e destacar termos</strong>
            <span className="block text-sm text-texto-suave">
              Troca "uaile" por <code className="font-mono">while</code>, "trú" por{' '}
              <code className="font-mono">true</code> e assim por diante.
            </span>
          </span>
        </label>

        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={simbolosFalados}
            onChange={(e) => onSimbolosFalados(e.target.checked)}
            className="mt-1 size-5 accent-primaria"
          />
          <span>
            <strong>Converter símbolos falados</strong>
            <span className="block text-sm text-texto-suave">
              "igual igual" vira <code className="font-mono">==</code>, "abre parênteses" vira{' '}
              <code className="font-mono">(</code>.
            </span>
          </span>
        </label>
      </div>

      <details className="mt-4 rounded-lg border border-linha p-3">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold">Ver termos reconhecidos</summary>
        <ul className="mt-2 space-y-1 text-sm">
          {TERMOS_PROGRAMACAO.map((t) => (
            <li key={t.codigo}>
              <code className="font-mono font-bold">{t.codigo}</code>
              <span className="text-texto-suave"> ← {t.ouvido.join(', ')}</span>
            </li>
          ))}
          {SIMBOLOS_FALADOS.map((s) => (
            <li key={s.simbolo}>
              <code className="font-mono font-bold">{s.simbolo}</code>
              <span className="text-texto-suave"> ← {s.ouvido.join(', ')}</span>
            </li>
          ))}
        </ul>
      </details>

      <form onSubmit={adicionar} className="mt-4 space-y-3" aria-label="Adicionar termo personalizado">
        <h3 className="font-semibold">Termos personalizados</h3>
        <p className="text-sm text-texto-suave">
          O app escreveu errado? Ensine a troca. Fica salvo neste aparelho.
        </p>
        <div>
          <label htmlFor={idOuvido} className="mb-1 block text-sm font-semibold">
            Como saiu na legenda
          </label>
          <input
            id={idOuvido}
            value={ouvido}
            onChange={(e) => setOuvido(e.target.value)}
            className={campo}
            placeholder="ex.: ripacto"
          />
        </div>
        <div>
          <label htmlFor={idEscrever} className="mb-1 block text-sm font-semibold">
            Como deve aparecer
          </label>
          <input
            id={idEscrever}
            value={escrever}
            onChange={(e) => setEscrever(e.target.value)}
            className={campo}
            placeholder="ex.: React"
          />
        </div>
        <button type="submit" className={botao.secundario} disabled={!ouvido.trim() || !escrever.trim()}>
          <Plus size={18} aria-hidden="true" /> Adicionar termo
        </button>
      </form>

      {personalizados.length > 0 && (
        <ul className="mt-3 space-y-2">
          {personalizados.map((p, i) => (
            <li
              key={`${p.ouvido}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-linha px-3 py-1"
            >
              <span className="text-sm">
                {p.ouvido} → <strong>{p.escrever}</strong>
              </span>
              <button
                type="button"
                onClick={() => remover(i)}
                aria-label={`Remover termo ${p.ouvido}`}
                className="inline-flex size-11 items-center justify-center rounded-lg text-perigo hover:bg-superficie-2"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
