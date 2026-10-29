import { describe, expect, it } from 'vitest'
import { aplicarTermos, dividirComDestaque, juntarTrecho } from './termos'

describe('aplicarTermos', () => {
  it('corrige termos de programação ouvidos errado', () => {
    expect(aplicarTermos('o uaile repete até o trú virar fause')).toBe(
      'o while repete até o true virar false',
    )
  })

  it('não troca pedaços de outras palavras', () => {
    expect(aplicarTermos('o resultado é nulo, mas nuldade não muda')).toBe(
      'o resultado é nulo, mas nuldade não muda',
    )
  })

  it('aceita vários espaços e maiúsculas', () => {
    expect(aplicarTermos('Console   Log')).toBe('console.log')
  })

  it('converte símbolos falados só quando ligado', () => {
    const texto = 'x igual igual igual 5'
    expect(aplicarTermos(texto, { simbolos: false })).toBe(texto)
    expect(aplicarTermos(texto, { simbolos: true })).toBe('x === 5')
  })

  it('prefere o símbolo mais longo', () => {
    expect(aplicarTermos('a maior ou igual b', { simbolos: true })).toBe('a >= b')
  })

  it('usa termos personalizados', () => {
    const personalizados = [{ ouvido: 'ripacto', escrever: 'React' }]
    expect(aplicarTermos('estudando ripacto hoje', { personalizados })).toBe('estudando React hoje')
  })

  it('pode ser desligado', () => {
    expect(aplicarTermos('uaile', { termos: false })).toBe('uaile')
  })

  it('é idempotente (aplicar duas vezes dá o mesmo resultado)', () => {
    const uma = aplicarTermos('élse e uaile', { simbolos: true })
    expect(aplicarTermos(uma, { simbolos: true })).toBe(uma)
  })
})

describe('dividirComDestaque', () => {
  it('marca só os termos de programação', () => {
    expect(dividirComDestaque('se for true, então if')).toEqual([
      { texto: 'se for ', destaque: false },
      { texto: 'true', destaque: true },
      { texto: ', então ', destaque: false },
      { texto: 'if', destaque: true },
    ])
  })

  it('não marca dentro de outras palavras', () => {
    expect(dividirComDestaque('notificação')).toEqual([{ texto: 'notificação', destaque: false }])
  })

  it('aceita termos extras', () => {
    const partes = dividirComDestaque('usamos React', ['React'])
    expect(partes.at(-1)).toEqual({ texto: 'React', destaque: true })
  })

  it('devolve lista vazia para texto vazio', () => {
    expect(dividirComDestaque('')).toEqual([])
  })
})

describe('juntarTrecho', () => {
  it('junta com um espaço', () => {
    expect(juntarTrecho('olá', 'pessoal')).toBe('olá pessoal')
  })
  it('não duplica espaço e ignora trecho vazio', () => {
    expect(juntarTrecho('olá ', ' pessoal ')).toBe('olá pessoal')
    expect(juntarTrecho('olá', '   ')).toBe('olá')
  })
})
