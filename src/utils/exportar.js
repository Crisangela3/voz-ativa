const CATEGORIA_PADRAO = 'Aula'

function dataParaNome(data = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}_${p(data.getHours())}h${p(data.getMinutes())}`
}

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Baixa a transcrição como PDF, com quebra de página e numeração. */
export async function baixarPDF({ texto, categoria = CATEGORIA_PADRAO, criadoEm = new Date().toISOString() }) {
  // Carrega o jsPDF só quando a pessoa pede o PDF (o site abre mais rápido)
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const margem = 18
  const larguraUtil = 210 - margem * 2
  const alturaLinha = 7
  const limiteInferior = 297 - margem

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Voz Ativa - Transcrição', margem, 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Categoria: ${categoria}   |   ${formatarData(criadoEm)}`, margem, 29)

  doc.setFontSize(12)
  const linhas = doc.splitTextToSize(texto, larguraUtil)
  let y = 42
  for (const linha of linhas) {
    if (y > limiteInferior) {
      doc.addPage()
      y = margem + 4
    }
    doc.text(linha, margem, y)
    y += alturaLinha
  }

  const total = doc.getNumberOfPages()
  doc.setFontSize(9)
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.text(`Página ${i} de ${total}`, 105, 290, { align: 'center' })
  }

  doc.save(`voz-ativa_${dataParaNome()}.pdf`)
}

/** Baixa a transcrição como arquivo de texto simples. */
export function baixarTXT({ texto }) {
  baixarArquivo(new Blob([texto], { type: 'text/plain;charset=utf-8' }), `voz-ativa_${dataParaNome()}.txt`)
}
