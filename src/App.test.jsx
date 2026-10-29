import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App'
import Principal from './Principal'
import { gerarCodigo } from './utils/licenca'

const agora = new Date().toISOString()
const conta = { nome: 'Ana Souza', email: 'ana@escola.com', cadastradoEm: agora }
const status = { tipo: 'avaliacao', dias: 7, ate: new Date() }
const acoes = { onAtivarCodigo: () => ({ ok: true }), onSalvarPerfil: () => {}, onSair: () => {} }

describe('Tela de entrada', () => {
  const html = renderToString(<App />)

  it('mostra o cadastro do aluno e a entrada com código', () => {
    expect(html).toContain('Voz Ativa')
    expect(html).toContain('Cadastro do aluno')
    expect(html).toContain('Tenho um código')
    expect(html).toContain('Enviar pedido de acesso gratuito')
    expect(html).toContain('Já recebi meu código')
  })

  it('pede os dados do aluno, do responsável e da escola, com os tipos de instituição', () => {
    for (const texto of ['Dados do aluno', 'Dados do responsável', 'CNPJ da escola', 'Escola particular', 'Faculdade', 'Curso técnico']) {
      expect(html).toContain(texto)
    }
  })

  it('explica os documentos, a validade de 6 meses e pede autorização', () => {
    expect(html).toContain('papel timbrado')
    expect(html).toContain('6 meses')
    expect(html).toContain('Autorizo o uso dos dados')
    expect(html).toContain('novidades e promoções')
  })
})

describe('Tela principal', () => {
  const html = renderToString(<Principal conta={conta} status={status} {...acoes} />)

  it('mostra o título, a faixa de avaliação e o botão de iniciar', () => {
    expect(html).toContain('Voz Ativa')
    expect(html).toContain('Período de avaliação: 7 dias restantes')
    expect(html).toContain('Iniciar legendas e gravar')
  })

  it('avisa quando o navegador não tem reconhecimento de voz', () => {
    expect(html).toContain('não tem reconhecimento de voz')
  })

  it('tem os controles de acessibilidade', () => {
    expect(html).toContain('Alto contraste')
    expect(html).toContain('Tela cheia')
    expect(html).toContain('Aumentar o tamanho das letras')
  })

  it('tem manual, conta, categorias e pastas', () => {
    expect(html).toContain('Manual de Uso')
    expect(html).toContain('Sua conta')
    expect(html).toContain('Categoria ao salvar')
    expect(html).toContain('Pastas Organizadas')
    expect(html).toContain('Recentes')
    expect(html).toContain('Passeios')
  })

  it('mostra o idioma por bandeiras', () => {
    expect(html).toContain('Português (Brasil)')
    expect(html).toContain('English (US)')
    expect(html).toContain('Español (Latinoamérica)')
    expect(html).toContain('role="radiogroup"')
  })

  it('mostra a data final quando o acesso é gratuito', () => {
    const ate = new Date('2027-10-28T12:00:00')
    const ativo = renderToString(
      <Principal conta={{ ...conta, codigo: gerarCodigo(conta.email) }} status={{ tipo: 'ativo', dias: 180, ate }} {...acoes} />,
    )
    expect(ativo).toContain('Acesso gratuito liberado até 28/10/2027')
  })
})
