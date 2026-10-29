import { describe, expect, it } from 'vitest'
import { CAMPOS_VAZIOS, dadosDoPerfil, emailDeContato, resumoDaConta, validarPerfil, enviarPedido, linkPedidoEmail, tipoPorId, validarPedido } from './pedido'

const completo = {
  ...CAMPOS_VAZIOS,
  tipoId: 'publica-estadual',
  matricula: '123456789',
  alunoNome: 'João Silva',
  alunoTelefone: '(11) 91234-5678',
  alunoEndereco: 'Rua A, 10, Centro, São Paulo',
  alunoCep: '01001-000',
  respNome: 'Maria Silva',
  respEmail: 'maria@email.com',
  respTelefone: '11 91234-5678',
  escolaNome: 'EE Exemplo',
  escolaEndereco: 'Av. B, 200',
  escolaCnpj: '12.345.678/0001-90',
  escolaTelefone: '1133334444',
  escolaEmail: 'escola@sp.gov.br',
  motivo: 'Família sem condições de pagar',
  aceite: true,
}

describe('pedido de acesso', () => {
  it('aceita um pedido completo', () => {
    expect(validarPedido(completo)).toEqual({})
  })

  it('aponta os campos que faltam', () => {
    const erros = validarPedido(CAMPOS_VAZIOS)
    for (const campo of ['tipoId', 'matricula', 'alunoNome', 'alunoCep', 'respEmail', 'escolaCnpj', 'motivo', 'aceite']) {
      expect(erros).toHaveProperty(campo)
    }
  })

  it('exige o e-mail do aluno só quando ele é maior de idade, e o do responsável só quando é menor', () => {
    const adulto = { ...completo, menor: false, respNome: '', respEmail: '', respTelefone: '' }
    expect(validarPedido(adulto)).toHaveProperty('alunoEmail')
    expect(validarPedido({ ...adulto, alunoEmail: 'joao@email.com' })).toEqual({})
    expect(emailDeContato({ ...adulto, alunoEmail: 'joao@email.com' })).toBe('joao@email.com')
    expect(emailDeContato(completo)).toBe('maria@email.com')
  })

  it('pede o número certo para cada tipo (RA ou RGM)', () => {
    expect(tipoPorId('publica-municipal').matricula).toMatch(/RA/)
    expect(tipoPorId('faculdade').matricula).toMatch(/RGM/)
    expect(tipoPorId('particular').publica).toBe(false)
  })

  it('sem endereço da planilha, oferece o envio por e-mail', async () => {
    expect(await enviarPedido(completo, '')).toEqual({ enviado: false, porEmail: true })
    expect(linkPedidoEmail(completo, 'x@y.com')).toMatch(/^mailto:x@y.com\?subject=/)
  })

  it('guarda os dados no aparelho sem o motivo nem as autorizações, e preenche o perfil com eles', () => {
    const conta = resumoDaConta(completo)
    expect(conta.email).toBe('maria@email.com')
    expect(conta.dados).not.toHaveProperty('motivo')
    expect(conta.dados).not.toHaveProperty('aceite')
    const perfil = dadosDoPerfil(conta)
    expect(perfil.alunoNome).toBe('João Silva')
    expect(perfil.respNome).toBe('Maria Silva')
    expect(perfil.matricula).toBe('123456789')
    expect(validarPerfil(perfil)).toEqual({})
  })

  it('perfil de conta antiga (só nome e e-mail) começa com o que existe e aponta o que falta', () => {
    const perfil = dadosDoPerfil({ nome: 'Ana', email: 'ana@x.com', escola: 'Escola Z' })
    expect(perfil.alunoNome).toBe('Ana')
    expect(perfil.escolaNome).toBe('Escola Z')
    expect(perfil.respEmail).toBe('ana@x.com')
    expect(validarPerfil(perfil)).toHaveProperty('matricula')
  })
})
