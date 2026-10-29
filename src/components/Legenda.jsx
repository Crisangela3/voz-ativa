import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { dividirComDestaque } from '../utils/termos'
import { botao, campo } from './ui'

/**
 * Área onde a legenda aparece.
 * - Termos de programação ficam em destaque.
 * - O texto "provisório" (ainda sendo falado) aparece mais claro.
 * - A rolagem acompanha o texto novo, mas para se a pessoa subir para reler.
 */
export default function Legenda({
  texto,
  provisorio,
  tamanhoFonte,
  editando,
  onMudarTexto,
  destacar,
  termosExtras,
  vazio,
  altura = 'h-80',
}) {
  const caixa = useRef(null)
  const noFimRef = useRef(true)
  const [noFim, setNoFim] = useState(true)

  useEffect(() => {
    const el = caixa.current
    if (el && noFimRef.current) el.scrollTop = el.scrollHeight
  }, [texto, provisorio, caixa])

  const aoRolar = () => {
    const el = caixa.current
    if (!el) return
    const perto = el.scrollHeight - el.scrollTop - el.clientHeight < 48
    noFimRef.current = perto
    setNoFim(perto)
  }

  const irParaOFim = () => {
    const el = caixa.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    noFimRef.current = true
    setNoFim(true)
  }

  const estiloFonte = { fontSize: `${tamanhoFonte}rem`, lineHeight: 1.5 }

  if (editando) {
    return (
      <textarea
        aria-label="Editar texto da transcrição"
        value={texto}
        onChange={(e) => onMudarTexto(e.target.value)}
        style={estiloFonte}
        className={`${campo} ${altura} resize-y`}
      />
    )
  }

  const partes = destacar ? dividirComDestaque(texto, termosExtras) : [{ texto, destaque: false }]
  const vazioTudo = !texto && !provisorio

  return (
    <div className="relative">
      <div
        ref={caixa}
        onScroll={aoRolar}
        role="log"
        aria-live="off"
        aria-label="Legenda ao vivo"
        tabIndex={0}
        style={estiloFonte}
        className={`${altura} overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-borda bg-superficie p-4 text-texto`}
      >
        {vazioTudo && <p className="text-texto-suave">{vazio}</p>}
        {partes.map((parte, i) =>
          parte.destaque ? (
            <code
              key={i}
              className="rounded bg-destaque px-1.5 py-0.5 font-mono font-bold text-destaque-texto"
            >
              {parte.texto}
            </code>
          ) : (
            <span key={i}>{parte.texto}</span>
          ),
        )}
        {provisorio && (
          <span className="italic text-texto-suave">
            {texto ? ' ' : ''}
            {provisorio}
          </span>
        )}
      </div>

      {!noFim && (
        <button
          type="button"
          onClick={irParaOFim}
          className={`${botao.primario} absolute bottom-3 right-5 shadow-lg`}
        >
          <ArrowDown size={18} aria-hidden="true" />
          Ir para o fim
        </button>
      )}
    </div>
  )
}
