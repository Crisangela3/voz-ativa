import { CONTATO_EMAIL, ENDPOINT_PEDIDOS } from '../config'
import { emailValido } from './licenca'

// Tipos de instituição. O número exigido muda conforme o tipo (RA, RGM...).
export const TIPOS_INSTITUICAO = [
  { id: 'publica-estadual', rotulo: 'Escola pública – estadual', publica: true, matricula: 'RA (Registro do Aluno)', dica: 'Número do RA que aparece na carteirinha ou no boletim.' },
  { id: 'publica-municipal', rotulo: 'Escola pública – municipal', publica: true, matricula: 'RA (Registro do Aluno)', dica: 'Número do RA que aparece na carteirinha ou no boletim.' },
  { id: 'particular', rotulo: 'Escola particular', publica: false, matricula: 'Matrícula ou RA', dica: 'Número de matrícula informado pela escola.' },
  { id: 'tecnico', rotulo: 'Curso técnico', publica: false, matricula: 'Matrícula ou RA do curso', dica: 'Número de matrícula do curso técnico.' },
  { id: 'faculdade', rotulo: 'Faculdade', publica: false, matricula: 'RGM / RA', dica: 'RGM ou RA da faculdade (só números).' },
]

// Documentos pedidos por e-mail depois do cadastro (foto ou PDF). Edite à vontade.
export const DOCUMENTOS = [
  'Declaração da escola em papel timbrado, com todas as informações da escola (nome, CNPJ, endereço, telefone, e-mail)',
  'Comprovante de que o aluno está estudando (matrícula, boletim ou declaração de vínculo)',
  'Comprovante de endereço',
  'RG e CPF do aluno',
  'RG e CPF do responsável (quando o aluno é menor de 18 anos)',
  'Documento que comprove a necessidade do acesso gratuito (ex.: CadÚnico, comprovante de renda ou declaração de bolsa)',
]

export const CAMPOS_VAZIOS = {
  tipoId: '',
  matricula: '',
  menor: true,
  alunoNome: '',
  alunoEmail: '',
  alunoTelefone: '',
  alunoEndereco: '',
  alunoCep: '',
  respNome: '',
  respEmail: '',
  respTelefone: '',
  escolaNome: '',
  escolaEndereco: '',
  escolaCnpj: '',
  escolaTelefone: '',
  escolaEmail: '',
  motivo: '',
  curso: '',
  turma: '',
  aceite: false,
  aceiteNovidades: false,
}

const soNumeros = (t) => String(t ?? '').replace(/\D/g, '')

export function tipoPorId(id) {
  return TIPOS_INSTITUICAO.find((t) => t.id === id)
}

/** E-mail que recebe o código: o do responsável (aluno menor) ou o do próprio aluno. */
export function emailDeContato(d) {
  return (d.menor ? d.respEmail : d.alunoEmail).trim()
}

/** Devolve { campo: mensagem } com o que falta ou está errado. Vazio = tudo certo. */
export function validarPedido(d) {
  const e = {}
  const obrig = (campo, msg) => {
    if (!String(d[campo] ?? '').trim()) e[campo] = msg
  }
  if (!tipoPorId(d.tipoId)) e.tipoId = 'Escolha o tipo de escola ou curso.'
  obrig('matricula', 'Informe o número de matrícula (RA/RGM).')
  obrig('alunoNome', 'Informe o nome do aluno.')
  obrig('alunoEndereco', 'Informe o endereço.')
  if (soNumeros(d.alunoCep).length !== 8) e.alunoCep = 'CEP com 8 números.'
  if (![10, 11].includes(soNumeros(d.alunoTelefone).length)) e.alunoTelefone = 'Telefone com DDD.'
  if (d.menor) {
    obrig('respNome', 'Informe o nome do responsável.')
    if (!emailValido(d.respEmail)) e.respEmail = 'Informe um e-mail válido do responsável.'
    if (![10, 11].includes(soNumeros(d.respTelefone).length)) e.respTelefone = 'Telefone do responsável com DDD.'
  } else if (!emailValido(d.alunoEmail)) {
    e.alunoEmail = 'Informe um e-mail válido.'
  }
  obrig('escolaNome', 'Informe o nome da escola.')
  obrig('escolaEndereco', 'Informe o endereço da escola.')
  if (soNumeros(d.escolaCnpj).length !== 14) e.escolaCnpj = 'CNPJ com 14 números.'
  if (![10, 11].includes(soNumeros(d.escolaTelefone).length)) e.escolaTelefone = 'Telefone da escola com DDD.'
  if (!emailValido(d.escolaEmail)) e.escolaEmail = 'Informe um e-mail válido da escola.'
  if (String(d.motivo).trim().length < 10) e.motivo = 'Conte em poucas palavras por que precisa do acesso gratuito.'
  if (!d.aceite) e.aceite = 'Marque a autorização para continuar.'
  return e
}

/** Dados que ficam guardados neste aparelho para preencher o Perfil (sem o motivo e sem autorizações). */
export function resumoDaConta(d) {
  const dados = { ...d }
  delete dados.motivo
  delete dados.aceite
  delete dados.aceiteNovidades
  return {
    nome: d.alunoNome.trim(),
    email: emailDeContato(d),
    escola: d.escolaNome.trim(),
    dados,
  }
}

/** Valores iniciais do Perfil: o que foi cadastrado, ou o pouco que a conta já tem. */
export function dadosDoPerfil(conta) {
  const base = { ...CAMPOS_VAZIOS, alunoNome: conta.nome ?? '', escolaNome: conta.escola ?? '' }
  const dados = { ...base, ...(conta.dados ?? {}) }
  if (!conta.dados) dados.respEmail = conta.email
  return dados
}

/** Valida só os campos do Perfil (sem o motivo e a autorização, que são do pedido). */
export function validarPerfil(d) {
  return validarPedido({ ...d, motivo: 'campo-do-pedido', aceite: true })
}

function textoPedido(d) {
  const t = tipoPorId(d.tipoId)
  return [
    'Pedido de acesso gratuito – Voz Ativa',
    '',
    `Tipo: ${t?.rotulo} (${t?.publica ? 'pública' : 'particular/outro'})`,
    `${t?.matricula}: ${d.matricula}`,
    `Motivo: ${d.motivo}`,
    '',
    `Aluno: ${d.alunoNome} | Tel: ${d.alunoTelefone} | CEP: ${d.alunoCep}`,
    `Endereço: ${d.alunoEndereco}`,
    d.menor ? `Responsável: ${d.respNome} | ${d.respEmail} | ${d.respTelefone}` : `E-mail do aluno: ${d.alunoEmail}`,
    '',
    `Escola: ${d.escolaNome} | CNPJ: ${d.escolaCnpj}`,
    `Endereço: ${d.escolaEndereco}`,
    `Tel: ${d.escolaTelefone} | E-mail: ${d.escolaEmail}`,
    '',
    `Aceita receber novidades: ${d.aceiteNovidades ? 'sim' : 'não'}`,
  ].join('\n')
}

export function linkPedidoEmail(d, destino = CONTATO_EMAIL) {
  return `mailto:${destino}?subject=${encodeURIComponent('Pedido de acesso gratuito – Voz Ativa')}&body=${encodeURIComponent(textoPedido(d))}`
}

/**
 * Envia o pedido para a planilha (Google Apps Script). Sem endereço configurado,
 * devolve { enviado: false, porEmail: true } e a tela oferece o e-mail pronto.
 */
export async function enviarPedido(d, enderecoAlvo = ENDPOINT_PEDIDOS) {
  if (!enderecoAlvo) return { enviado: false, porEmail: true }
  const t = tipoPorId(d.tipoId)
  const corpo = {
    ...d,
    emailContato: emailDeContato(d),
    tipoRotulo: t?.rotulo,
    publica: t?.publica ? 'Pública' : 'Particular/outro',
    enviadoEm: new Date().toISOString(),
  }
  try {
    // text/plain evita a "pré-checagem" de CORS do navegador; o Apps Script lê o JSON do corpo
    await fetch(enderecoAlvo, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corpo) })
    return { enviado: true }
  } catch {
    return { enviado: false, erro: true, porEmail: true }
  }
}
