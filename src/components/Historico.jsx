import { useState } from 'react'
import { FileDown, Folder, FolderOpen, Trash2 } from 'lucide-react'
import { botao, cartao, CATEGORIAS } from './ui'

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/** "Pastas Organizadas" (uma por categoria, com contagem) e "Recentes". */
export default function Historico({ itens, onAbrir, onPDF, onExcluir }) {
  const [pasta, setPasta] = useState(null)
  const lista = pasta ? itens.filter((i) => i.categoria === pasta) : itens
  const visiveis = lista.slice(0, pasta ? 50 : 5)

  return (
    <>
      <section className={cartao} aria-labelledby="titulo-pastas">
        <h2 id="titulo-pastas" className="mb-3 text-lg font-extrabold text-titulo">Pastas Organizadas</h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIAS.map((nome) => {
            const total = itens.filter((i) => i.categoria === nome).length
            const ativa = pasta === nome
            return (
              <button
                key={nome}
                type="button"
                aria-pressed={ativa}
                onClick={() => setPasta(ativa ? null : nome)}
                className={`flex min-h-16 flex-col items-start gap-1 rounded-xl border p-3 text-left ${
                  ativa ? 'border-primaria bg-primaria text-primaria-texto' : 'border-cartao-borda bg-superficie-2 hover:border-primaria'
                }`}
              >
                <Folder size={20} aria-hidden="true" />
                <span className="font-bold">{nome}</span>
                <span className="text-xs">{total} {total === 1 ? 'arquivo' : 'arquivos'}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className={cartao} aria-labelledby="titulo-recentes">
        <h2 id="titulo-recentes" className="mb-3 text-lg font-extrabold text-titulo">
          {pasta ? `Pasta: ${pasta}` : 'Recentes'}
        </h2>
        {visiveis.length === 0 ? (
          <p className="text-sm text-texto-suave">
            {itens.length === 0
              ? 'Nada salvo ainda. Use "Salvar na pasta" para guardar uma conversa neste aparelho.'
              : 'Nenhuma conversa nesta pasta.'}
          </p>
        ) : (
          <ul className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {visiveis.map((item) => {
              const rotulo = `${item.categoria}, ${formatarData(item.criadoEm)}`
              return (
                <li key={item.id} className="rounded-xl border border-cartao-borda bg-superficie-2 p-3">
                  <div className="mb-1 flex justify-between gap-2 text-sm font-semibold">
                    <span className="text-titulo">{item.categoria}</span>
                    <time dateTime={item.criadoEm} className="text-texto-suave">{formatarData(item.criadoEm)}</time>
                  </div>
                  <p className="mb-3 line-clamp-3 text-sm leading-relaxed">{item.texto}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={botao.secundario} onClick={() => onAbrir(item)} aria-label={`Abrir conversa: ${rotulo}`}>
                      <FolderOpen size={18} aria-hidden="true" /> Abrir
                    </button>
                    <button type="button" className={botao.secundario} onClick={() => onPDF(item)} aria-label={`Baixar PDF: ${rotulo}`}>
                      <FileDown size={18} aria-hidden="true" /> PDF
                    </button>
                    <button type="button" className={botao.perigo} onClick={() => onExcluir(item)} aria-label={`Excluir conversa: ${rotulo}`}>
                      <Trash2 size={18} aria-hidden="true" /> Excluir
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
