// Uso: npm run codigo -- aluno@email.com [outro@email.com ...]
// Renovação (2º ano em diante): npm run codigo -- aluno@email.com --edicao=2
import { emailValido, gerarCodigo, normalizarEmail, VALIDADE_DIAS } from '../src/utils/licenca.js'

const args = process.argv.slice(2)
const edicao = Number(args.find((a) => a.startsWith('--edicao='))?.split('=')[1] ?? 1)
const emails = args.filter((a) => !a.startsWith('--'))
if (emails.length === 0) {
  console.log('Uso: npm run codigo -- aluno@email.com')
  process.exit(1)
}

for (const e of emails) {
  if (!emailValido(e)) {
    console.log(`E-mail inválido: ${e}`)
    continue
  }
  console.log(`\nE-mail: ${normalizarEmail(e)}\nCódigo: ${gerarCodigo(e, edicao)}   (vale ${VALIDADE_DIAS} dias = 6 meses, a partir do primeiro uso)`)
}
