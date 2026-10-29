import { describe, expect, it } from 'vitest'
import { gerarCodigo, statusConta, validarCodigo } from './licenca'

const DIA = 24 * 60 * 60 * 1000
const email = 'Aluno@Escola.com'

describe('licenca', () => {
  it('gera sempre o mesmo código para o mesmo e-mail, sem ligar para maiúsculas', () => {
    expect(gerarCodigo(email)).toBe(gerarCodigo(' aluno@escola.com '))
    expect(gerarCodigo(email)).toMatch(/^VA-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
  })

  it('aceita o código de renovação (edição 2) e ele é diferente do 1º', () => {
    expect(gerarCodigo(email, 2)).not.toBe(gerarCodigo(email, 1))
    expect(validarCodigo(email, gerarCodigo(email, 2))).toBe(true)
  })

  it('gera códigos diferentes para e-mails diferentes', () => {
    expect(gerarCodigo('a@x.com')).not.toBe(gerarCodigo('b@x.com'))
  })

  it('valida o código só para o e-mail certo, aceitando minúsculas e sem hífens', () => {
    const codigo = gerarCodigo(email)
    expect(validarCodigo(email, codigo)).toBe(true)
    expect(validarCodigo(email, codigo.toLowerCase().replaceAll('-', ' '))).toBe(true)
    expect(validarCodigo('outro@escola.com', codigo)).toBe(false)
    expect(validarCodigo(email, 'VA-AAAA-BBBB-CCCC')).toBe(false)
    expect(validarCodigo(email, '')).toBe(false)
  })

  it('dá 7 dias de avaliação e depois expira', () => {
    const reg = { email, cadastradoEm: new Date(0).toISOString() }
    expect(statusConta(reg, 1 * DIA).tipo).toBe('avaliacao')
    expect(statusConta(reg, 1 * DIA).dias).toBe(6)
    expect(statusConta(reg, 8 * DIA).tipo).toBe('expirado')
  })

  it('com código vale 6 meses a partir da ativação', () => {
    const reg = {
      email,
      cadastradoEm: new Date(0).toISOString(),
      codigo: gerarCodigo(email),
      ativadoEm: new Date(0).toISOString(),
    }
    expect(statusConta(reg, 100 * DIA).tipo).toBe('ativo')
    expect(statusConta(reg, 179 * DIA).tipo).toBe('ativo')
    expect(statusConta(reg, 181 * DIA).tipo).toBe('expirado')
  })

  it('ignora código falso gravado na conta', () => {
    const reg = { email, cadastradoEm: new Date(0).toISOString(), codigo: 'VA-XXXX-XXXX-XXXX', ativadoEm: new Date(0).toISOString() }
    expect(statusConta(reg, 30 * DIA).tipo).toBe('expirado')
  })
})
