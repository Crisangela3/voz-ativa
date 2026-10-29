import { useCallback, useMemo } from 'react'
import Principal from './Principal'
import TelaEntrada from './components/TelaEntrada'
import { useLocalStorage } from './hooks/useLocalStorage'
import { emailValido, mesmoCodigo, normalizarEmail, statusConta, validarCodigo } from './utils/licenca'

/**
 * Porta de entrada: decide entre a tela de cadastro/código e o app.
 * Os cadastros ficam guardados por e-mail, assim sair e entrar de novo não reinicia
 * os 7 dias de avaliação nem o ano de acesso gratuito.
 */
export default function App() {
  const [registros, setRegistros] = useLocalStorage('vozativa:registros', {})
  const [sessao, setSessao] = useLocalStorage('vozativa:sessao', null)

  const conta = sessao ? registros[sessao] : null
  const status = useMemo(() => statusConta(conta), [conta])

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
      return { ok: true }
    },
    [registros, setRegistros, setSessao],
  )

  const salvarPerfil = useCallback(
    (perfil) => setRegistros((todos) => ({ ...todos, [sessao]: { ...todos[sessao], ...perfil } })),
    [setRegistros, sessao],
  )

  if (!conta || status.tipo === 'expirado') {
    return (
      <TelaEntrada
        key={status.motivo ?? 'novo'}
        expirado={conta ? status.motivo : null}
        onCadastrar={cadastrar}
        onEntrar={(email) => setSessao(normalizarEmail(email))}
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
    />
  )
}
