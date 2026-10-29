import { useId, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { botao } from './ui'
import { Campo, Secao, SecaoAluno, SecaoEscola, SecaoResponsavel } from './SecoesPedido'
import { criarEntrada } from './entrada'
import { CAMPOS_VAZIOS, DOCUMENTOS, validarPedido } from '../utils/pedido'

/** Formulário completo do pedido de acesso gratuito. */
export default function CadastroForm({ enviando, onEnviar, onTenhoCodigo }) {
  const id = useId()
  const [d, setD] = useState(CAMPOS_VAZIOS)
  const [erros, setErros] = useState({})

  const mudar = (nome) => (e) => setD((v) => ({ ...v, [nome]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const entrada = criarEntrada({ id, d, erros, mudar })
  const comuns = { id, d, erros, mudar }

  const enviar = (e) => {
    e.preventDefault()
    const encontrados = validarPedido(d)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) {
      const primeiro = Object.keys(encontrados)[0]
      document.getElementById(`${id}-${primeiro}`)?.focus()
      return
    }
    onEnviar(d)
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <div className="rounded-xl bg-superficie-2 p-3 text-sm leading-relaxed">
        <p>
          O acesso é <strong>gratuito</strong> para estudantes que comprovam a necessidade. Eu avalio cada pedido
          e envio o código por e-mail. Veja <strong>como funciona</strong> logo abaixo do formulário.
        </p>
        <button type="button" onClick={onTenhoCodigo} className="mt-2 font-bold text-titulo underline">
          Já recebi meu código →
        </button>
      </div>

      {Object.keys(erros).length > 0 && (
        <p role="alert" className="flex gap-2 rounded-lg border-2 border-perigo p-3 text-sm font-semibold text-perigo">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          Falta preencher alguns campos. Eles estão marcados em vermelho.
        </p>
      )}

      <SecaoEscola {...comuns} titulo="1. Onde estuda" />
      <SecaoAluno {...comuns} titulo="2. Dados do aluno" />
      {d.menor && <SecaoResponsavel {...comuns} titulo="3. Dados do responsável" />}

      <Secao titulo={d.menor ? '4. Sua situação' : '3. Sua situação'}>
        <Campo id={`${id}-motivo`} rotulo="Por que precisa do acesso gratuito?" erro={erros.motivo}>
          <textarea {...entrada('motivo', { rows: 3 })} />
        </Campo>
      </Secao>

      <div className="rounded-xl border-2 border-aviso-borda bg-aviso-fundo p-4 text-sm">
        <p className="mb-2 font-bold">Depois do cadastro, você vai receber um e-mail pedindo (em foto ou PDF):</p>
        <ul className="list-disc space-y-1 pl-5">
          {DOCUMENTOS.map((doc) => <li key={doc}>{doc}</li>)}
        </ul>
        <p className="mt-2 text-xs">Os documentos <strong>não</strong> são enviados por este formulário: você os anexa respondendo ao e-mail.</p>
      </div>

      <div className="space-y-1">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input id={`${id}-aceite`} type="checkbox" className="mt-1 size-5 shrink-0" checked={d.aceite} onChange={mudar('aceite')} />
          <span>
            Autorizo o uso dos dados informados somente para avaliar o meu pedido e enviar o código de acesso.
            Os dados ficam guardados em planilha privada, sem venda a terceiros.
          </span>
        </label>
        {erros.aceite && <p className="text-xs font-semibold text-perigo">{erros.aceite}</p>}
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 size-5 shrink-0" checked={d.aceiteNovidades} onChange={mudar('aceiteNovidades')} />
          <span>(Opcional) Quero receber novidades e promoções do Voz Ativa por e-mail. Posso cancelar quando quiser.</span>
        </label>
      </div>

      <button type="submit" className={`${botao.primario} w-full`} disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar pedido de acesso gratuito'}
      </button>
    </form>
  )
}
