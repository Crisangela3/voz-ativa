import { useId, useState } from 'react'
import { Mail, MailCheck, TriangleAlert } from 'lucide-react'
import CadastroForm from './CadastroForm'
import ComoFunciona from './ComoFunciona'
import { botao, campo } from './ui'
import { CONTATO_EMAIL } from '../config'
import { DOCUMENTOS, emailDeContato, enviarPedido, linkPedidoEmail, resumoDaConta } from '../utils/pedido'

/**
 * Tela inicial: "Cadastro do aluno" (pedido de acesso gratuito) ou "Tenho um código".
 * `expirado` mostra o motivo quando a avaliação ou o código acabou.
 */
export default function TelaEntrada({ expirado, abaInicial, onVoltar, onCadastrar, onEntrar, onAtivarCodigo }) {
  const [aba, setAba] = useState(abaInicial ?? (expirado === 'codigo' || expirado === 'avaliacao' ? 'codigo' : 'cadastro'))
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(null) // { dados, resultado }
  const id = useId()
  const [emailCodigo, setEmailCodigo] = useState('')
  const [codigo, setCodigo] = useState('')

  const trocarAba = (nova) => {
    setAba(nova)
    setErro('')
  }

  const enviarCadastro = async (dados) => {
    setEnviando(true)
    const resultado = await enviarPedido(dados)
    onCadastrar(resumoDaConta(dados))
    setEnviado({ dados, resultado })
    setEnviando(false)
  }

  const entrarComCodigo = (e) => {
    e.preventDefault()
    const resposta = onAtivarCodigo(emailCodigo, codigo)
    if (!resposta.ok) setErro(resposta.erro)
  }

  const larga = aba === 'cadastro' && !enviado

  return (
    <main className="flex min-h-screen items-start justify-center bg-fundo p-4 sm:items-center">
      <div className={`w-full ${larga ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-cartao-borda bg-superficie p-6 shadow-lg sm:p-8`}>
        {onVoltar && (
          <button type="button" onClick={onVoltar} className="mb-3 min-h-11 text-sm font-bold text-titulo underline">
            ← Voltar e continuar testando o app
          </button>
        )}
        <h1 className="text-center text-3xl font-extrabold uppercase tracking-wider text-titulo">Voz Ativa</h1>
        <p className="mb-5 mt-1 text-center text-sm text-texto-suave">
          Legendas ao vivo para aulas, consultas e conversas
        </p>

        {expirado && (
          <p role="alert" className="mb-4 rounded-lg border border-aviso-borda bg-aviso-fundo p-3 text-sm">
            {expirado === 'codigo'
              ? 'Seu código de 6 meses terminou. Para revalidar, envie os documentos atualizados por e-mail e peça um novo código (use o mesmo e-mail do cadastro).'
              : 'Seu período de avaliação de 7 dias terminou. Digite o código que você recebeu ou faça o cadastro para pedir o acesso gratuito.'}
          </p>
        )}

        {enviado ? (
          <div className="space-y-4 text-center">
            <MailCheck className="mx-auto text-verde" size={40} aria-hidden="true" />
            <h2 className="text-lg font-bold">Pedido recebido, {enviado.dados.alunoNome.split(' ')[0]}!</h2>
            {enviado.resultado.enviado ? (
              <p className="text-sm leading-relaxed">
                Seu pedido foi registrado. Em breve você recebe um e-mail em <strong>{emailDeContato(enviado.dados)}</strong>{' '}
                pedindo os documentos. <strong>Veja também a caixa de spam.</strong>
              </p>
            ) : (
              <>
                <p className="text-sm leading-relaxed">
                  Para terminar, envie o pedido por e-mail. Depois eu respondo em{' '}
                  <strong>{emailDeContato(enviado.dados)}</strong> pedindo os documentos:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-left text-xs">
                  {DOCUMENTOS.map((doc) => <li key={doc}>{doc}</li>)}
                </ul>
                <a className={`${botao.primario} w-full`} href={linkPedidoEmail(enviado.dados)}>
                  <Mail size={18} aria-hidden="true" /> Abrir e-mail com o pedido
                </a>
                <p className="text-xs text-texto-suave">
                  Se o e-mail não abrir, escreva para <strong>{CONTATO_EMAIL}</strong>.
                </p>
              </>
            )}
            <p className="text-sm">Enquanto isso, você pode usar o app por <strong>7 dias</strong>.</p>
            <button type="button" className={`${botao.verde} w-full`} onClick={() => onEntrar(emailDeContato(enviado.dados))}>
              Entrar e começar a usar
            </button>
          </div>
        ) : (
          <>
            <div role="tablist" aria-label="Como entrar" className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-superficie-2 p-1">
              {[
                ['cadastro', 'Cadastro do aluno'],
                ['codigo', 'Tenho um código'],
              ].map(([valor, rotulo]) => (
                <button
                  key={valor}
                  type="button"
                  role="tab"
                  aria-selected={aba === valor}
                  onClick={() => trocarAba(valor)}
                  className={`min-h-11 rounded-lg px-2 text-sm font-semibold ${
                    aba === valor ? 'bg-superficie text-titulo shadow-sm' : 'text-texto-suave'
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            {aba === 'cadastro' ? (
              <>
                <CadastroForm enviando={enviando} onEnviar={enviarCadastro} onTenhoCodigo={() => trocarAba('codigo')} />
                <details className="mt-5 rounded-xl border border-cartao-borda p-4">
                  <summary className="cursor-pointer font-bold text-titulo">Como funciona o acesso gratuito</summary>
                  <div className="mt-3"><ComoFunciona /></div>
                </details>
              </>
            ) : (
              <>
                {erro && (
                  <p role="alert" className="mb-4 flex gap-2 rounded-lg border-2 border-perigo p-3 text-sm text-perigo">
                    <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {erro}
                  </p>
                )}
                <form onSubmit={entrarComCodigo} className="space-y-3" noValidate>
                  <div>
                    <label htmlFor={`${id}-ec`} className="mb-1 block text-sm font-semibold">E-mail que recebeu o código</label>
                    <input id={`${id}-ec`} type="email" className={campo} value={emailCodigo} onChange={(e) => setEmailCodigo(e.target.value)} autoComplete="email" />
                  </div>
                  <div>
                    <label htmlFor={`${id}-cod`} className="mb-1 block text-sm font-semibold">Código de liberação</label>
                    <input id={`${id}-cod`} className={`${campo} font-mono uppercase tracking-wider`} placeholder="VA-XXXX-XXXX-XXXX" value={codigo} onChange={(e) => setCodigo(e.target.value)} autoComplete="off" />
                  </div>
                  <button type="submit" className={`${botao.primario} w-full`}>Entrar</button>
                </form>
                <p className="mt-4 text-center text-sm text-texto-suave">
                  Ainda não tem código?{' '}
                  <button type="button" className="font-bold text-titulo underline" onClick={() => trocarAba('cadastro')}>
                    Faça o cadastro
                  </button>
                </p>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}
