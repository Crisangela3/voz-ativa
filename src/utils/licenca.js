// Acesso gratuito: o aluno pede, a Angela avalia os documentos, gera um código ligado ao e-mail
// dele e envia. Cada código vale 6 meses; para continuar, o aluno revalida (renovação) e recebe um novo.
//
// ATENÇÃO: o Voz Ativa não tem servidor. A conferência do código roda no navegador, então
// serve para organizar a distribuição gratuita, não para impedir quem entende de programação.
// Para bloqueio de verdade seria preciso um servidor (ex.: Supabase). Veja o README.
//
// Para gerar um código: npm run codigo -- aluno@email.com
// Troque o SAL abaixo por uma frase só sua ANTES de publicar (e não mostre a ninguém).

export const SAL = 'cafe-com-leite-2026-pedagoga-de-sp-voz-ativa'
export const VALIDADE_DIAS = 180
export const AVALIACAO_DIAS = 7

const DIA = 24 * 60 * 60 * 1000
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem 0/O e 1/I, para não confundir

export function normalizarEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizarEmail(email))
}

// Hash simples de 53 bits (cyrb53)
function hash(texto, semente) {
  let h1 = 0xdeadbeef ^ semente
  let h2 = 0x41c6ce57 ^ semente
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

const MAX_EDICOES = 10

/** Gera o código do e-mail (VA-XXXX-XXXX-XXXX). Edição 2, 3... são as renovações anuais. */
export function gerarCodigo(email, edicao = 1) {
  const base = normalizarEmail(email) + '|' + SAL + (edicao > 1 ? `|ed${edicao}` : '')
  let letras = ''
  for (let i = 0; i < 12; i++) letras += ALFABETO[hash(base + i, i + 1) % ALFABETO.length]
  return `VA-${letras.slice(0, 4)}-${letras.slice(4, 8)}-${letras.slice(8, 12)}`
}

function limparCodigo(codigo) {
  return String(codigo ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function mesmoCodigo(a, b) {
  return limparCodigo(a) === limparCodigo(b)
}

export function validarCodigo(email, codigo) {
  if (!emailValido(email) || !codigo) return false
  for (let edicao = 1; edicao <= MAX_EDICOES; edicao++) {
    if (mesmoCodigo(codigo, gerarCodigo(email, edicao))) return true
  }
  return false
}

/**
 * Situação da conta:
 *  - ativo: código válido, dentro de 6 meses da ativação do código
 *  - avaliacao: sem código, dentro de 7 dias do cadastro
 *  - expirado: o resto
 */
export function statusConta(registro, agora = Date.now()) {
  if (!registro) return { tipo: 'expirado', dias: 0, ate: null }

  if (registro.codigo && validarCodigo(registro.email, registro.codigo) && registro.ativadoEm) {
    const fim = new Date(registro.ativadoEm).getTime() + VALIDADE_DIAS * DIA
    if (agora < fim) return { tipo: 'ativo', dias: Math.ceil((fim - agora) / DIA), ate: new Date(fim) }
    return { tipo: 'expirado', dias: 0, ate: new Date(fim), motivo: 'codigo' }
  }

  const fim = new Date(registro.cadastradoEm).getTime() + AVALIACAO_DIAS * DIA
  if (agora < fim) return { tipo: 'avaliacao', dias: Math.ceil((fim - agora) / DIA), ate: new Date(fim) }
  return { tipo: 'expirado', dias: 0, ate: new Date(fim), motivo: 'avaliacao' }
}
