import { campo } from './ui'

/** Props comuns dos campos de formulário: valor, mudança, erro e acessibilidade. */
export function criarEntrada({ id, d, erros, mudar }) {
  return (nome, extra = {}) => ({
    id: `${id}-${nome}`,
    className: campo,
    value: d[nome] ?? '',
    onChange: mudar(nome),
    'aria-invalid': erros[nome] ? true : undefined,
    'aria-describedby': erros[nome] ? `${id}-${nome}-erro` : undefined,
    ...extra,
  })
}
