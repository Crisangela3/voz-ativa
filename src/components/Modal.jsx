import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { botao } from './ui'

/** Janela de diálogo: fundo desfocado, fecha com Esc ou clicando fora, devolve o foco a quem abriu. */
export default function Modal({ aberto, onFechar, titulo, idTitulo, larga = false, children }) {
  const fechar = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const quemAbriu = document.activeElement
    fechar.current?.focus()
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      quemAbriu?.focus?.()
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={`max-h-[90vh] w-full ${larga ? 'max-w-2xl' : 'max-w-md'} overflow-y-auto rounded-2xl border border-cartao-borda bg-superficie p-6 text-texto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={idTitulo} className="text-xl font-extrabold text-titulo">
            {titulo}
          </h2>
          <button ref={fechar} type="button" onClick={onFechar} className={botao.secundario} aria-label="Fechar">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
