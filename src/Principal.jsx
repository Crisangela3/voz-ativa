import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  BookOpen,
  CircleUserRound,
  Contrast,
  FileDown,
  FileText,
  Maximize,
  Mic,
  Minimize,
  Pencil,
  Save,
  Square,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import Legenda from './components/Legenda'
import Historico from './components/Historico'
import ModalManual from './components/ModalManual'
import ModalConta from './components/ModalConta'
import { textoStatus } from './utils/statusTexto'
import PainelTermos from './components/PainelTermos'
import SeletorIdioma from './components/SeletorIdioma'
import { botao, cartao, CATEGORIAS, TAMANHOS_FONTE } from './components/ui'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useReconhecimentoVoz } from './hooks/useReconhecimentoVoz'
import { baixarPDF, baixarTXT } from './utils/exportar'
import { aplicarTermos, juntarTrecho } from './utils/termos'


export default function Principal({ conta, status, onAtivarCodigo, onSalvarPerfil, onSair }) {
  // Preferências e dados (ficam salvos neste aparelho)
  const [textoBruto, setTextoBruto] = useLocalStorage('vozativa:texto', '')
  const [categoria, setCategoria] = useLocalStorage('vozativa:categoria', 'Aulas')
  const [historico, setHistorico] = useLocalStorage('vozativa:historico', [])
  const [indiceFonte, setIndiceFonte] = useLocalStorage('vozativa:fonte', 2)
  const [altoContraste, setAltoContraste] = useLocalStorage('vozativa:contraste', false)
  const [idioma, setIdioma] = useLocalStorage('vozativa:idioma', 'pt-BR')
  const [corrigirTermos, setCorrigirTermos] = useLocalStorage('vozativa:corrigir', true)
  const [simbolosFalados, setSimbolosFalados] = useLocalStorage('vozativa:simbolos', false)
  const [personalizados, setPersonalizados] = useLocalStorage('vozativa:personalizados', [])

  // Estado da tela
  const [editando, setEditando] = useState(false)
  const [ajudaAberta, setAjudaAberta] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const [telaCheia, setTelaCheia] = useState(false)
  const [aviso, setAviso] = useState('')

  const painelRef = useRef(null)
  const temporizadorAviso = useRef(null)

  const avisar = useCallback((mensagem) => {
    setAviso(mensagem)
    clearTimeout(temporizadorAviso.current)
    temporizadorAviso.current = setTimeout(() => setAviso(''), 4000)
  }, [])

  useEffect(() => {
    const temporizador = temporizadorAviso
    return () => clearTimeout(temporizador.current)
  }, [])

  // Voz
  const aoFinal = useCallback(
    (trecho) => setTextoBruto((anterior) => juntarTrecho(anterior, trecho)),
    [setTextoBruto],
  )
  const { suportado, gravando, provisorio, erro, limparErro, iniciar, parar } = useReconhecimentoVoz({
    idioma,
    aoFinal,
  })

  // Texto que aparece na tela = texto bruto + correções (as correções podem ser ligadas e desligadas)
  const opcoesTermos = useMemo(
    () => ({ termos: corrigirTermos, simbolos: simbolosFalados, personalizados }),
    [corrigirTermos, simbolosFalados, personalizados],
  )
  const textoExibido = useMemo(() => aplicarTermos(textoBruto, opcoesTermos), [textoBruto, opcoesTermos])
  const provisorioExibido = useMemo(() => aplicarTermos(provisorio, opcoesTermos), [provisorio, opcoesTermos])
  const termosExtras = useMemo(() => personalizados.map((p) => p.escrever), [personalizados])

  // Alto contraste: troca as variáveis de cor da página inteira
  useEffect(() => {
    document.documentElement.dataset.contraste = altoContraste ? 'alto' : 'normal'
  }, [altoContraste])

  // Mantém a tela acesa enquanto escuta (aulas longas)
  useEffect(() => {
    if (!gravando || !('wakeLock' in navigator)) return
    let trava = null
    let cancelado = false
    navigator.wakeLock
      .request('screen')
      .then((lock) => {
        if (cancelado) lock.release().catch(() => {})
        else trava = lock
      })
      .catch(() => {})
    return () => {
      cancelado = true
      trava?.release().catch(() => {})
    }
  }, [gravando])

  // Tela cheia: usa a API do navegador quando existe; senão o painel só ocupa a tela toda
  useEffect(() => {
    const aoMudar = () => {
      if (!document.fullscreenElement) setTelaCheia(false)
    }
    const aoTeclar = (e) => {
      if (e.key === 'Escape') setTelaCheia(false)
    }
    document.addEventListener('fullscreenchange', aoMudar)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('fullscreenchange', aoMudar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [])

  const alternarTelaCheia = async () => {
    if (telaCheia) {
      setTelaCheia(false)
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
      return
    }
    setTelaCheia(true)
    try {
      await painelRef.current?.requestFullscreen?.()
    } catch {
      // Sem tela cheia nativa (ex.: iPhone): o painel já ocupa a tela toda pelo CSS
    }
  }

  // Ações
  const alternarGravacao = () => {
    if (gravando) {
      parar()
    } else {
      setEditando(false)
      iniciar()
    }
  }

  const alternarEdicao = () => {
    if (!editando) setTextoBruto(textoExibido) // fixa as correções antes de editar
    setEditando((valor) => !valor)
  }

  const limpar = () => {
    if (!textoBruto.trim()) return
    if (!window.confirm('Apagar o texto atual? Isso não pode ser desfeito.')) return
    setTextoBruto('')
    setEditando(false)
  }

  const salvar = () => {
    if (!textoExibido.trim()) {
      avisar('Não há texto para salvar.')
      return
    }
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      texto: textoExibido,
      categoria,
      criadoEm: new Date().toISOString(),
    }
    setHistorico((anterior) => [item, ...anterior])
    avisar(`Salvo na pasta ${categoria}.`)
  }

  const exportarPDF = async (dados) => {
    if (!dados.texto.trim()) {
      avisar('Não há texto para exportar.')
      return
    }
    try {
      await baixarPDF(dados)
    } catch {
      avisar('Não foi possível gerar o PDF. Tente de novo.')
    }
  }

  const abrirDoHistorico = (item) => {
    if (textoBruto.trim() && textoBruto !== item.texto) {
      if (!window.confirm('Substituir o texto atual por esta conversa?')) return
    }
    setTextoBruto(item.texto)
    setCategoria(item.categoria)
    setEditando(false)
    avisar('Conversa aberta.')
  }

  const excluirDoHistorico = (item) => {
    if (!window.confirm('Excluir esta conversa?')) return
    setHistorico((anterior) => anterior.filter((i) => i.id !== item.id))
  }

  const indice = Math.min(Math.max(indiceFonte, 0), TAMANHOS_FONTE.length - 1)
  const tamanhoFonte = TAMANHOS_FONTE[indice]

  return (
    <div className="min-h-screen">
      <a
        href="#legenda"
        className="sr-only rounded bg-primaria px-4 py-2 text-primaria-texto focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50"
      >
        Pular para a legenda
      </a>

      <header className="border-b border-linha bg-superficie-2">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-wider text-titulo">Voz Ativa</h1>
            <p className="text-sm text-texto-suave">Legendas ao vivo para aulas, consultas e conversas</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={botao.verde} onClick={() => setAjudaAberta(true)}>
              <BookOpen size={18} aria-hidden="true" /> Manual de Uso
            </button>
            <button type="button" className={botao.primario} onClick={() => setContaAberta(true)}>
              <CircleUserRound size={18} aria-hidden="true" /> Sua conta
            </button>
          </div>
        </div>
        <p
          role="status"
          className="bg-faixa px-4 py-2 text-center text-sm font-semibold text-faixa-texto"
        >
          {textoStatus(status)}
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section
          id="legenda"
          ref={painelRef}
          aria-label="Legenda ao vivo"
          className={
            telaCheia ? 'fixed inset-0 z-40 space-y-4 overflow-y-auto bg-fundo p-4' : `${cartao} space-y-4 lg:self-start`
          }
        >
          {!suportado && (
            <div role="alert" className="flex gap-3 rounded-lg border-2 border-perigo p-3">
              <TriangleAlert className="mt-0.5 shrink-0 text-perigo" aria-hidden="true" />
              <p>
                Este navegador não tem reconhecimento de voz. Abra o site no <strong>Google Chrome</strong>{' '}
                ou no <strong>Microsoft Edge</strong> (no celular, use o Chrome). Você ainda pode digitar e
                exportar textos.
              </p>
            </div>
          )}

          {erro && (
            <div role="alert" className="flex items-start gap-3 rounded-lg border-2 border-perigo p-3">
              <TriangleAlert className="mt-0.5 shrink-0 text-perigo" aria-hidden="true" />
              <p className="flex-1">{erro}</p>
              <button type="button" className={botao.secundario} onClick={limparErro}>
                Entendi
              </button>
            </div>
          )}

          <fieldset>
            <legend className="mb-2 text-sm font-bold">Categoria ao salvar</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((c) => (
                <label
                  key={c}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco ${
                    categoria === c ? 'border-primaria bg-primaria text-primaria-texto' : 'border-cartao-borda bg-superficie-2'
                  }`}
                >
                  <input
                    type="radio"
                    name="categoria"
                    className="sr-only"
                    value={c}
                    checked={categoria === c}
                    onChange={() => setCategoria(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={alternarGravacao}
              disabled={!suportado}
              className={`${gravando ? botao.perigo : botao.primario} min-h-14 flex-1 border-2 px-6 text-lg font-extrabold uppercase tracking-wide sm:flex-none`}
            >
              {gravando ? (
                <>
                  <Square size={22} aria-hidden="true" /> Parar legendas
                </>
              ) : (
                <>
                  <Mic size={22} aria-hidden="true" /> Iniciar legendas e gravar
                </>
              )}
            </button>
            <p role="status" aria-live="polite" className="font-semibold">
              {gravando ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-full bg-perigo motion-safe:animate-pulse" aria-hidden="true" />
                  Ouvindo… pode falar.
                </span>
              ) : (
                'Parado.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Aparência da legenda">
            <button
              type="button"
              className={botao.secundario}
              onClick={() => setIndiceFonte(Math.max(indice - 1, 0))}
              disabled={indice === 0}
              aria-label="Diminuir o tamanho das letras"
            >
              A−
            </button>
            <button
              type="button"
              className={botao.secundario}
              onClick={() => setIndiceFonte(Math.min(indice + 1, TAMANHOS_FONTE.length - 1))}
              disabled={indice === TAMANHOS_FONTE.length - 1}
              aria-label="Aumentar o tamanho das letras"
            >
              A+
            </button>
            <button
              type="button"
              className={botao.secundario}
              aria-pressed={altoContraste}
              onClick={() => setAltoContraste(!altoContraste)}
            >
              <Contrast size={18} aria-hidden="true" /> Alto contraste
            </button>
            <button type="button" className={botao.secundario} onClick={alternarTelaCheia}>
              {telaCheia ? (
                <>
                  <Minimize size={18} aria-hidden="true" /> Sair da tela cheia
                </>
              ) : (
                <>
                  <Maximize size={18} aria-hidden="true" /> Tela cheia
                </>
              )}
            </button>
          </div>

          <Legenda
            texto={editando ? textoBruto : textoExibido}
            provisorio={provisorioExibido}
            tamanhoFonte={tamanhoFonte}
            editando={editando}
            onMudarTexto={setTextoBruto}
            destacar={corrigirTermos}
            termosExtras={termosExtras}
            altura={telaCheia ? 'h-[60vh]' : 'h-80'}
            vazio="A legenda vai aparecer aqui. Toque em “Iniciar legendas” e comece a falar."
          />

          <div className="flex flex-wrap gap-2 border-t border-linha pt-4">
            <button type="button" className={botao.verde} onClick={salvar}>
              <Save size={18} aria-hidden="true" /> Salvar na pasta
            </button>
            <button
              type="button"
              className={botao.secundario}
              onClick={() => exportarPDF({ texto: textoExibido, categoria, criadoEm: new Date().toISOString() })}
            >
              <FileDown size={18} aria-hidden="true" /> Baixar PDF
            </button>
            <button
              type="button"
              className={botao.secundario}
              onClick={() =>
                textoExibido.trim() ? baixarTXT({ texto: textoExibido }) : avisar('Não há texto para exportar.')
              }
            >
              <FileText size={18} aria-hidden="true" /> Baixar TXT
            </button>
            <button type="button" className={botao.secundario} onClick={alternarEdicao} disabled={gravando}>
              {editando ? (
                <>
                  <Check size={18} aria-hidden="true" /> Concluir edição
                </>
              ) : (
                <>
                  <Pencil size={18} aria-hidden="true" /> Editar texto
                </>
              )}
            </button>
            <button type="button" className={botao.perigo} onClick={limpar} disabled={!textoBruto.trim()}>
              <Trash2 size={18} aria-hidden="true" /> Limpar
            </button>
          </div>
        </section>

        {!telaCheia && (
          <aside className="space-y-6">
            <section className={cartao} aria-labelledby="titulo-config">
              <h2 id="titulo-config" className="mb-3 text-lg font-extrabold text-titulo">
                Configurações
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-sm font-semibold">
                    Idioma da fala
                  </p>
                  <SeletorIdioma valor={idioma} onChange={setIdioma} desabilitado={gravando} />
                </div>
              </div>
            </section>

            <PainelTermos
              corrigirTermos={corrigirTermos}
              onCorrigirTermos={setCorrigirTermos}
              simbolosFalados={simbolosFalados}
              onSimbolosFalados={setSimbolosFalados}
              personalizados={personalizados}
              onPersonalizados={setPersonalizados}
            />

            <Historico
              itens={historico}
              onAbrir={abrirDoHistorico}
              onPDF={exportarPDF}
              onExcluir={excluirDoHistorico}
            />
          </aside>
        )}
      </main>

      {!telaCheia && (
        <footer className="mx-auto max-w-7xl px-4 pb-8 text-sm text-texto-suave">
          <p>
            Criado por{' '}
            <a className="font-semibold text-titulo underline" href="https://github.com/Crisangela3">
              Angela Cristina Silva
            </a>{' '}
            para tornar aulas de programação mais acessíveis a pessoas surdas. O texto fica salvo só neste
            aparelho; o áudio é processado pelo reconhecimento de voz do navegador.
          </p>
        </footer>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        {aviso && (
          <p className="rounded-lg border border-borda bg-superficie px-4 py-3 font-semibold text-texto shadow-lg">
            {aviso}
          </p>
        )}
      </div>

      <ModalManual aberto={ajudaAberta} onFechar={() => setAjudaAberta(false)} />
      <ModalConta
        aberto={contaAberta}
        onFechar={() => setContaAberta(false)}
        conta={conta}
        status={status}
        onAtivarCodigo={onAtivarCodigo}
        onSalvarPerfil={onSalvarPerfil}
        onSair={onSair}
      />
    </div>
  )
}
