/*
  Correção de termos de programação.

  O reconhecimento de voz do navegador é treinado para frases do dia a dia,
  então palavras como "while" ou "else" saem como "uaile" ou "élse".
  Aqui ficam as regras que trocam o que foi ouvido pelo termo correto.

  Esta lista é um ponto de partida: dá para aumentar pela própria tela
  ("Termos personalizados") ou editando este arquivo.
*/

// Termo correto -> como o reconhecimento costuma escrever
export const TERMOS_PROGRAMACAO = [
  { codigo: 'if', ouvido: ['ífi', 'ifi', 'ife', 'i f', 'ai éfe', 'ai efe'] },
  { codigo: 'else', ouvido: ['élse', 'elsi', 'élsi', 'élce', 'elce'] },
  { codigo: 'while', ouvido: ['uaile', 'uáile', 'uaili', 'wile', 'waile', 'uail'] },
  { codigo: 'true', ouvido: ['trú', 'tru', 'trúi', 'trui'] },
  { codigo: 'false', ouvido: ['fáuse', 'fause', 'fálse', 'fálsi', 'fôlse', 'folse'] },
  { codigo: 'return', ouvido: ['ritórn', 'ritorn', 'ri térn', 'riturn', 'ritérn'] },
  { codigo: 'function', ouvido: ['fânction', 'fanction', 'fânshion', 'fânxon'] },
  { codigo: 'const', ouvido: ['cônst', 'consti', 'cônsti'] },
  { codigo: 'let', ouvido: ['lét', 'léti', 'leti'] },
  { codigo: 'null', ouvido: ['nul', 'nól', 'nál'] },
  { codigo: 'switch', ouvido: ['suitch', 'suítche', 'suitche', 'suich'] },
  { codigo: 'break', ouvido: ['bréik', 'breik', 'brêique'] },
  { codigo: 'array', ouvido: ['arrei', 'arréi', 'aréi', 'arrai'] },
  { codigo: 'string', ouvido: ['estring', 'strim', 'estrim', 'istring'] },
  { codigo: 'boolean', ouvido: ['búlian', 'bulian', 'bulean', 'búlean'] },
  {
    codigo: 'console.log',
    ouvido: ['console log', 'cônsole log', 'consol log', 'console ponto log', 'consoli log'],
  },
]

// Símbolo -> como a pessoa costuma falar
export const SIMBOLOS_FALADOS = [
  { simbolo: '===', ouvido: ['igual igual igual', 'triplo igual'] },
  { simbolo: '==', ouvido: ['igual igual', 'duplo igual'] },
  { simbolo: '>=', ouvido: ['maior ou igual', 'maior igual'] },
  { simbolo: '<=', ouvido: ['menor ou igual', 'menor igual'] },
  { simbolo: '(', ouvido: ['abre parênteses', 'abre parêntese', 'abre parenteses'] },
  { simbolo: ')', ouvido: ['fecha parênteses', 'fecha parêntese', 'fecha parenteses'] },
  { simbolo: '{', ouvido: ['abre chaves', 'abre chave'] },
  { simbolo: '}', ouvido: ['fecha chaves', 'fecha chave'] },
  { simbolo: '[', ouvido: ['abre colchetes', 'abre colchete'] },
  { simbolo: ']', ouvido: ['fecha colchetes', 'fecha colchete'] },
  { simbolo: ';', ouvido: ['ponto e vírgula', 'ponto e virgula'] },
]

// Palavras que ganham destaque na legenda (só as que não existem em português)
const PALAVRAS_DESTACADAS = TERMOS_PROGRAMACAO.map((t) => t.codigo)

// \b não entende acentos, então usamos "letra ou número" do Unicode
const LETRA = '[\\p{L}\\p{N}_]'

function escapar(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function criarRegex(frase) {
  const corpo = escapar(frase.trim()).replace(/\s+/g, '\\s+')
  return new RegExp(`(?<!${LETRA})${corpo}(?!${LETRA})`, 'giu')
}

// Cada item tem { ouvido: [frases], [campoSaida]: texto final }
function criarRegras(lista, campoSaida) {
  const regras = []
  for (const item of lista) {
    for (const frase of item.ouvido) {
      regras.push({ regex: criarRegex(frase), saida: item[campoSaida] })
    }
  }
  // Frases maiores primeiro, para "igual igual igual" ganhar de "igual igual"
  return regras.sort((a, b) => b.regex.source.length - a.regex.source.length)
}

const REGRAS_TERMOS = criarRegras(TERMOS_PROGRAMACAO, 'codigo')
const REGRAS_SIMBOLOS = criarRegras(SIMBOLOS_FALADOS, 'simbolo')

function aplicarRegras(texto, regras) {
  let resultado = texto
  for (const { regex, saida } of regras) {
    resultado = resultado.replace(regex, () => saida)
  }
  return resultado
}

/**
 * Aplica as correções na ordem: termos personalizados, termos de
 * programação e símbolos falados.
 *
 * @param {string} texto
 * @param {{termos?: boolean, simbolos?: boolean, personalizados?: {ouvido: string, escrever: string}[]}} opcoes
 */
export function aplicarTermos(texto, opcoes = {}) {
  const { termos = true, simbolos = false, personalizados = [] } = opcoes
  if (!texto) return texto

  const regrasPersonalizadas = criarRegras(
    personalizados
      .filter((p) => p.ouvido?.trim() && p.escrever?.trim())
      .map((p) => ({ ouvido: [p.ouvido], escrever: p.escrever })),
    'escrever',
  )

  let resultado = aplicarRegras(texto, regrasPersonalizadas)
  if (termos) resultado = aplicarRegras(resultado, REGRAS_TERMOS)
  if (simbolos) resultado = aplicarRegras(resultado, REGRAS_SIMBOLOS)
  return resultado
}

/**
 * Quebra o texto em pedaços para mostrar os termos de programação
 * em destaque. Devolve [{ texto, destaque }].
 */
export function dividirComDestaque(texto, extras = []) {
  if (!texto) return []

  const palavras = [...PALAVRAS_DESTACADAS, ...extras]
    .map((p) => p.trim())
    .filter(Boolean)
    // frases longas antes das curtas ("console.log" antes de "console")
    .sort((a, b) => b.length - a.length)
    .map(escapar)

  const regex = new RegExp(`(?<!${LETRA})(?:${palavras.join('|')})(?!${LETRA})`, 'giu')

  const partes = []
  let fim = 0
  for (const achado of texto.matchAll(regex)) {
    if (achado.index > fim) partes.push({ texto: texto.slice(fim, achado.index), destaque: false })
    partes.push({ texto: achado[0], destaque: true })
    fim = achado.index + achado[0].length
  }
  if (fim < texto.length) partes.push({ texto: texto.slice(fim), destaque: false })
  return partes
}

/** Junta um novo trecho reconhecido ao texto que já existe. */
export function juntarTrecho(anterior, novo) {
  const trecho = novo.trim()
  if (!trecho) return anterior
  if (!anterior) return trecho
  const separador = /\s$/.test(anterior) ? '' : ' '
  return anterior + separador + trecho
}
