import { useCallback, useEffect, useRef, useState } from 'react'

const MENSAGENS_DE_ERRO = {
  'not-allowed':
    'O microfone está bloqueado. Clique no cadeado ao lado do endereço do site e permita o microfone.',
  'service-not-allowed':
    'O navegador bloqueou o reconhecimento de voz. Verifique as permissões do site.',
  'audio-capture': 'Nenhum microfone foi encontrado. Conecte um microfone e tente de novo.',
  network: 'Sem conexão com o serviço de reconhecimento de voz. Verifique a internet.',
  'language-not-supported': 'Este idioma não é suportado neste navegador.',
}

// Erros em que insistir não adianta: paramos e avisamos
const ERROS_FATAIS = Object.keys(MENSAGENS_DE_ERRO)

/**
 * Escuta o microfone e entrega o texto reconhecido.
 *
 * - aoFinal(texto): chamado a cada frase confirmada
 * - provisorio: o que está sendo falado agora (ainda pode mudar)
 * - Reinicia sozinho quando o navegador encerra a escuta (acontece em pausas longas)
 */
export function useReconhecimentoVoz({ idioma, aoFinal }) {
  const Construtor =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined
  const suportado = Boolean(Construtor)

  const [gravando, setGravando] = useState(false)
  const [provisorio, setProvisorio] = useState('')
  const [erro, setErro] = useState('')

  const reconhecimento = useRef(null)
  const querEscutar = useRef(false)
  const aoFinalRef = useRef(aoFinal)
  const ultimoFinal = useRef({ texto: '', quando: 0 })
  const temporizador = useRef(null)

  useEffect(() => {
    aoFinalRef.current = aoFinal
  }, [aoFinal])

  const criar = useCallback(() => {
    const rec = new Construtor()
    rec.lang = idioma
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onresult = (evento) => {
      let parcial = ''
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const resultado = evento.results[i]
        const texto = resultado[0].transcript
        if (resultado.isFinal) {
          const limpo = texto.trim()
          const agora = Date.now()
          // No Chrome do Android a mesma frase às vezes chega duas vezes seguidas
          const repetido =
            limpo === ultimoFinal.current.texto && agora - ultimoFinal.current.quando < 1500
          if (limpo && !repetido) {
            ultimoFinal.current = { texto: limpo, quando: agora }
            aoFinalRef.current(limpo)
          }
        } else {
          parcial += texto
        }
      }
      setProvisorio(parcial)
    }

    rec.onerror = (evento) => {
      // Silêncio e cancelamento não são problemas
      if (evento.error === 'no-speech' || evento.error === 'aborted') return
      setErro(MENSAGENS_DE_ERRO[evento.error] || `Erro no reconhecimento de voz (${evento.error}).`)
      if (ERROS_FATAIS.includes(evento.error)) {
        querEscutar.current = false
        setGravando(false)
        setProvisorio('')
      }
    }

    rec.onend = () => {
      setProvisorio('')
      if (!querEscutar.current) {
        setGravando(false)
        return
      }
      // O navegador encerrou sozinho: religa depois de um instante
      clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => {
        if (!querEscutar.current) return
        try {
          rec.start()
        } catch {
          // já estava ligado
        }
      }, 250)
    }

    return rec
  }, [Construtor, idioma])

  const iniciar = useCallback(() => {
    if (!Construtor) return
    setErro('')
    const rec = criar()
    reconhecimento.current = rec
    querEscutar.current = true
    try {
      rec.start()
      setGravando(true)
    } catch {
      querEscutar.current = false
      setErro('Não foi possível ligar o microfone. Recarregue a página e tente de novo.')
    }
  }, [Construtor, criar])

  const parar = useCallback(() => {
    querEscutar.current = false
    clearTimeout(temporizador.current)
    try {
      reconhecimento.current?.stop()
    } catch {
      // já estava parado
    }
    setGravando(false)
    setProvisorio('')
  }, [])

  // Ao sair da página, desliga o microfone
  useEffect(() => {
    const escuta = querEscutar
    const reconhecimentoAtual = reconhecimento
    const tempo = temporizador
    return () => {
      escuta.current = false
      clearTimeout(tempo.current)
      try {
        reconhecimentoAtual.current?.abort()
      } catch {
        // nada a fazer
      }
    }
  }, [])

  return { suportado, gravando, provisorio, erro, limparErro: () => setErro(''), iniciar, parar }
}
