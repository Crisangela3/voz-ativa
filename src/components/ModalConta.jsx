import { useId, useState } from 'react'
import { KeyRound, LogOut, Mail, User } from 'lucide-react'
import Modal from './Modal'
import { botao, campo } from './ui'
import { SecaoAluno, SecaoEscola, SecaoResponsavel } from './SecoesPedido'
import { dadosDoPerfil, emailDeContato, validarPerfil } from '../utils/pedido'
import { CONTATO_EMAIL } from '../config'
import { textoStatus } from '../utils/statusTexto'

/** "Sua conta" e "Perfil do usuário" (abas Dados Pessoais e Acadêmico) na mesma janela. */
export default function ModalConta({ aberto, onFechar, conta, status, onAtivarCodigo, onSalvarPerfil, onSair, onAbrirEntrada }) {
  const [vista, setVista] = useState('conta')
  const [aba, setAba] = useState('pessoais')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const [perfil, setPerfil] = useState({})
  const [errosPerfil, setErrosPerfil] = useState({})
  const id = useId()

  const fechar = () => {
    setVista('conta')
    setErro('')
    setOk('')
    onFechar()
  }

  const abrirPerfil = () => {
    setPerfil(dadosDoPerfil(conta))
    setErrosPerfil({})
    setVista('perfil')
  }

  const ativar = (e) => {
    e.preventDefault()
    const resposta = onAtivarCodigo(conta.email, codigo)
    if (resposta.ok) {
      setOk('Código ativado! Seu acesso gratuito de 6 meses começou.')
      setErro('')
      setCodigo('')
    } else {
      setErro(resposta.erro)
      setOk('')
    }
  }

  const salvarPerfil = (e) => {
    e.preventDefault()
    const encontrados = validarPerfil(perfil)
    setErrosPerfil(encontrados)
    if (Object.keys(encontrados).length > 0) {
      // mostra a aba onde está o primeiro problema
      const escolares = ['tipoId', 'matricula', 'escolaNome', 'escolaCnpj', 'escolaTelefone', 'escolaEmail', 'escolaEndereco']
      setAba(Object.keys(encontrados).some((c) => escolares.includes(c)) && !Object.keys(encontrados).some((c) => !escolares.includes(c)) ? 'academico' : 'pessoais')
      return
    }
    onSalvarPerfil({ nome: perfil.alunoNome.trim(), escola: perfil.escolaNome.trim(), dados: perfil })
    setOk('Perfil salvo.')
    setVista('conta')
  }

  const mudar = (campoNome) => (e) =>
    setPerfil((p) => ({ ...p, [campoNome]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const inicial = (conta.nome || conta.email || '?').trim()[0].toUpperCase()

  if (vista === 'perfil') {
    const comuns = { id: `${id}-p`, d: perfil, erros: errosPerfil, mudar }
    return (
      <Modal aberto={aberto} onFechar={fechar} titulo="Perfil do usuário" idTitulo="titulo-perfil" larga>
        <div role="tablist" aria-label="Seções do perfil" className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-superficie-2 p-1">
          {[
            ['pessoais', 'Dados Pessoais'],
            ['academico', 'Acadêmico'],
          ].map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={aba === valor}
              onClick={() => setAba(valor)}
              className={`min-h-11 rounded-lg text-sm font-semibold ${aba === valor ? 'bg-superficie text-titulo shadow-sm' : 'text-texto-suave'}`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {Object.keys(errosPerfil).length > 0 && (
          <p role="alert" className="mb-3 rounded-lg border-2 border-perigo p-3 text-sm font-semibold text-perigo">
            Falta preencher alguns campos (marcados em vermelho). Veja as duas abas.
          </p>
        )}

        <form onSubmit={salvarPerfil} className="space-y-4" noValidate>
          {aba === 'pessoais' ? (
            <>
              <p className="rounded-lg bg-superficie-2 p-3 text-sm">
                E-mail da conta (recebe o código): <strong>{conta.email}</strong>
                {perfil.menor !== undefined && emailDeContato(perfil) && emailDeContato(perfil) !== conta.email && (
                  <span className="mt-1 block text-xs text-texto-suave">
                    O e-mail do responsável/aluno acima é diferente do e-mail da conta. Para mudar de e-mail, faça um novo cadastro.
                  </span>
                )}
              </p>
              <SecaoAluno {...comuns} titulo="Dados do aluno" />
              {perfil.menor && <SecaoResponsavel {...comuns} titulo="Dados do responsável" />}
            </>
          ) : (
            <SecaoEscola {...comuns} titulo="Escola ou curso" comCursoTurma />
          )}
          <p className="text-xs text-texto-suave">
            Estes dados ficam guardados só neste aparelho. Para atualizar o pedido de acesso gratuito, envie os
            documentos novos por e-mail.
          </p>
          <div className="flex gap-2">
            <button type="button" className={`${botao.secundario} flex-1`} onClick={() => setVista('conta')}>Voltar</button>
            <button type="submit" className={`${botao.primario} flex-1`}>Salvar</button>
          </div>
        </form>
      </Modal>
    )
  }

  if (conta.visitante) {
    return (
      <Modal aberto={aberto} onFechar={fechar} titulo="Sua conta" idTitulo="titulo-conta">
        <p className="mb-4 rounded-lg bg-faixa px-3 py-2 text-sm font-semibold text-faixa-texto">{textoStatus(status)}</p>
        <p className="mb-4 text-sm leading-relaxed">
          Você está testando o Voz Ativa como visitante. Para continuar depois dos 7 dias, peça o{' '}
          <strong>acesso gratuito</strong> (estudantes que comprovam a necessidade) ou digite um código que já recebeu.
        </p>
        <div className="grid gap-2">
          <button type="button" className={botao.primario} onClick={() => { fechar(); onAbrirEntrada('cadastro') }}>
            Cadastrar e pedir acesso gratuito
          </button>
          <button type="button" className={botao.secundario} onClick={() => { fechar(); onAbrirEntrada('codigo') }}>
            <KeyRound size={18} aria-hidden="true" /> Já tenho um código
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo="Sua conta" idTitulo="titulo-conta">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primaria text-xl font-bold text-primaria-texto" aria-hidden="true">
          {inicial}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{conta.nome || 'Aluno(a)'}</p>
          <p className="truncate text-sm text-texto-suave">{conta.email}</p>
        </div>
      </div>

      <p className="mb-4 rounded-lg bg-faixa px-3 py-2 text-sm font-semibold text-faixa-texto">{textoStatus(status)}</p>

      <form onSubmit={ativar} className="mb-4 space-y-2 rounded-xl border-2 border-aviso-borda bg-aviso-fundo p-4">
        <label htmlFor={`${id}-cod`} className="flex items-center gap-2 text-sm font-bold">
          <KeyRound size={18} aria-hidden="true" /> Código de Liberação
        </label>
        <input
          id={`${id}-cod`}
          className={`${campo} font-mono uppercase tracking-wider`}
          placeholder="VA-XXXX-XXXX-XXXX"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className={`${botao.primario} w-full`} disabled={!codigo.trim()}>Ativar código</button>
        <p className="text-xs text-texto-suave">
          Ainda não tem ou precisa renovar?{' '}
          <a className="font-semibold underline" href={`mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent('Renovação / código – Voz Ativa')}&body=${encodeURIComponent('Olá! Meu e-mail de cadastro: ' + conta.email)}`}>Fale comigo por e-mail</a>.
        </p>
      </form>

      {erro && <p role="alert" className="mb-3 text-sm font-semibold text-perigo">{erro}</p>}
      {ok && <p role="status" className="mb-3 text-sm font-semibold text-verde">{ok}</p>}

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" className={botao.secundario} onClick={abrirPerfil}>
          <User size={18} aria-hidden="true" /> Perfil do usuário
        </button>
        <button type="button" className={botao.secundario} onClick={onSair}>
          <LogOut size={18} aria-hidden="true" /> Sair
        </button>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-texto-suave">
        <Mail size={14} aria-hidden="true" /> Dúvidas: {CONTATO_EMAIL}
      </p>
    </Modal>
  )
}
