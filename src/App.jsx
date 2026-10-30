import { useCallback, useEffect, useMemo, useState } from 'react'
import Principal from './Principal'
import TelaEntrada from './components/TelaEntrada'
import { useLocalStorage } from './hooks/useLocalStorage'
import { emailValido, mesmoCodigo, normalizarEmail, statusConta, validarCodigo } from './utils/licenca'

const VISITANTE = { nome: 'Visitante', email: '', visitante: true }

/**
 * Porta de entrada. Quem chega pela primeira vez já cai no app, em avaliação de 7 dias
 * (visitante). O cadastro e o código ficam a um toque, em "Sua conta".
 * Os cadastros ficam guardados por e-mail, assim sair e entrar de novo não reinicia
 * a avaliação nem o período do código.
 */
export default function App() {
  const [registros, setRegistros] = useLocalStorage('vozativa:registros', {})
  const [sessao, setSessao] = useLocalStorage('vozativa:sessao', null)

  const [inicioVisita, setInicioVisita] = useLocalStorage('vozativa:inicio', null)
  const [entrada, setEntrada] = useState(null) // null = app; 'cadastro' | 'codigo' = tela de entrada

  // Marca o primeiro acesso: daí contam os 7 dias de avaliação do visitante
  useEffect(() => {
    if (!inicioVisita) setInicioVisita(new Date().toISOString())
  }, [inicioVisita, setInicioVisita])

  const contaCadastrada = sessao ? registros[sessao] : null
  const conta = contaCadastrada ?? VISITANTE
  const registroParaStatus = useMemo(
    () => contaCadastrada ?? { cadastradoEm: inicioVisita ?? new Date().toISOString() },
    [contaCadastrada, inicioVisita],
  )
  const status = useMemo(() => statusConta(registroParaStatus), [registroParaStatus])

  const cadastrar = useCallback(
    ({ nome, email, escola, dados }) => {
      const chave = normalizarEmail(email)
      setRegistros((todos) => {
        const antigo = todos[chave]
        return {
          ...todos,
          [chave]: { ...antigo, nome, escola, dados, email: chave, cadastradoEm: antigo?.cadastradoEm ?? new Date().toISOString() },
        }
      })
    },
    [setRegistros],
  )

  const ativarCodigo = useCallback(
    (email, codigo) => {
      if (!emailValido(email)) return { ok: false, erro: 'Informe o e-mail usado no cadastro.' }
      const chave = normalizarEmail(email)
      if (!validarCodigo(chave, codigo)) {
        return { ok: false, erro: 'Código inválido para este e-mail. Confira se digitou igual ao que recebeu.' }
      }
      const agora = new Date().toISOString()
      const antigo = registros[chave]
      const novo = {
        ...antigo,
        email: chave,
        cadastradoEm: antigo?.cadastradoEm ?? agora,
        codigo,
        ativadoEm: antigo?.codigo && mesmoCodigo(antigo.codigo, codigo) ? antigo.ativadoEm : agora,
      }
      if (statusConta(novo).tipo !== 'ativo') {
        return { ok: false, erro: 'Este código já passou de 6 meses. Peça a renovação por e-mail.' }
      }
      setRegistros((todos) => ({ ...todos, [chave]: novo }))
      setSessao(chave)
      setEntrada(null)
      return { ok: true }
    },
    [registros, setRegistros, setSessao],
  )

  const salvarPerfil = useCallback(
    (perfil) => setRegistros((todos) => ({ ...todos, [sessao]: { ...todos[sessao], ...perfil } })),
    [setRegistros, sessao],
  )

  const entrar = (email) => {
    setSessao(normalizarEmail(email))
    setEntrada(null)
  }

  if (status.tipo === 'expirado' || entrada) {
    return (
      <TelaEntrada
        key={`${status.motivo ?? 'novo'}-${entrada}`}
        expirado={status.tipo === 'expirado' ? (contaCadastrada ? status.motivo : 'avaliacao') : null}
        abaInicial={entrada}
        onVoltar={status.tipo !== 'expirado' ? () => setEntrada(null) : null}
        onCadastrar={cadastrar}
        onEntrar={entrar}
        onAtivarCodigo={ativarCodigo}
      />
    )
  }

  return (
    <Principal
      conta={conta}
      status={status}
      onAtivarCodigo={ativarCodigo}
      onSalvarPerfil={salvarPerfil}
      onSair={() => setSessao(null)}
      onAbrirEntrada={(aba) => setEntrada(aba)}
    />
  )
}
