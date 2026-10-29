// Classes reutilizadas nos botões e campos (área de toque mínima de 44px)
const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

export const botao = {
  primario: `${base} border-primaria bg-primaria text-primaria-texto hover:bg-primaria-hover`,
  verde: `${base} border-verde bg-verde text-verde-texto hover:bg-verde-hover`,
  secundario: `${base} border-borda bg-superficie text-texto hover:bg-superficie-2`,
  perigo: `${base} border-perigo bg-superficie text-perigo hover:bg-superficie-2`,
}

export const campo =
  'min-h-11 w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-base text-texto placeholder:text-texto-suave'

export const cartao = 'rounded-2xl border border-cartao-borda bg-superficie p-5 shadow-sm'

export const CATEGORIAS = ['Aulas', 'Saúde', 'Passeios', 'Aleatório']

export const TAMANHOS_FONTE = [1, 1.25, 1.5, 2, 2.5, 3]
