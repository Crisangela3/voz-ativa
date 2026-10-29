import { useEffect, useState } from 'react'

/**
 * Igual ao useState, mas guarda o valor no navegador (localStorage),
 * então a transcrição e o histórico não somem ao recarregar a página.
 * Nada é enviado para servidor: fica só neste aparelho.
 */
export function useLocalStorage(chave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const salvo = window.localStorage.getItem(chave)
      return salvo !== null ? JSON.parse(salvo) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor))
    } catch {
      // Navegação privada ou armazenamento cheio: o app segue funcionando sem salvar.
    }
  }, [chave, valor])

  return [valor, setValor]
}
