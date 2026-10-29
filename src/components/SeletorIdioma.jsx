// Bandeiras em SVG (os emojis de bandeira não aparecem no Windows)
const BR = (
  <svg viewBox="0 0 28 20" className="h-7 w-10 rounded-sm" aria-hidden="true">
    <rect width="28" height="20" fill="#009c3b" />
    <path d="M14 2.5 25 10 14 17.5 3 10Z" fill="#ffdf00" />
    <circle cx="14" cy="10" r="4.2" fill="#002776" />
    <path d="M10 9.2c2.6-.6 5.4-.2 8 1.3" stroke="#fff" strokeWidth="0.9" fill="none" />
  </svg>
)

const US = (
  <svg viewBox="0 0 28 20" className="h-7 w-10 rounded-sm" aria-hidden="true">
    <rect width="28" height="20" fill="#fff" />
    {[0, 2, 4, 6, 8, 10, 12].map((i) => (
      <rect key={i} y={i * 1.54} width="28" height="1.54" fill="#b22234" />
    ))}
    <rect width="12" height="10.8" fill="#3c3b6e" />
    {[2, 5, 8, 11].map((y) => [2, 5, 8, 11].map((x) => <circle key={`${x}${y}`} cx={x} cy={y - 0.5} r="0.55" fill="#fff" />))}
  </svg>
)

const AR = (
  <svg viewBox="0 0 28 20" className="h-7 w-10 rounded-sm" aria-hidden="true">
    <rect width="28" height="20" fill="#74acdf" />
    <rect y="6.67" width="28" height="6.66" fill="#fff" />
    <circle cx="14" cy="10" r="2" fill="#f6b40e" />
  </svg>
)

const OPCOES = [
  { valor: 'pt-BR', nome: 'Português (Brasil)', bandeira: BR },
  { valor: 'en-US', nome: 'English (US)', bandeira: US },
  { valor: 'es-419', nome: 'Español (Latinoamérica)', bandeira: AR },
]

/** Escolha do idioma da fala por bandeiras. */
export default function SeletorIdioma({ valor, onChange, desabilitado }) {
  return (
    <div role="radiogroup" aria-label="Idioma da fala" className="flex gap-2">
      {OPCOES.map((o) => {
        const ativo = valor === o.valor
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={o.nome}
            title={o.nome}
            disabled={desabilitado}
            onClick={() => onChange(o.valor)}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2 text-center text-xs font-bold disabled:opacity-50 ${
              ativo ? 'border-primaria bg-superficie-2' : 'border-cartao-borda bg-superficie hover:border-primaria'
            }`}
          >
            {o.bandeira}
            {o.nome}
          </button>
        )
      })}
    </div>
  )
}
