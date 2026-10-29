const formatarData = (data) => data?.toLocaleDateString('pt-BR') ?? ''

export function textoStatus(status) {
  if (status.tipo === 'ativo') return `Acesso gratuito liberado até ${formatarData(status.ate)}`
  if (status.tipo === 'avaliacao') {
    return `Período de avaliação: ${status.dias} ${status.dias === 1 ? 'dia restante' : 'dias restantes'}`
  }
  return 'Acesso encerrado'
}
