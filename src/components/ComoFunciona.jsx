import { DOCUMENTOS } from '../utils/pedido'

/** Regras do acesso gratuito (aparece na tela de entrada e no Manual de Uso). */
export default function ComoFunciona() {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
      <li>
        <strong>Cadastro.</strong> Preencha os dados do aluno, do responsável (se menor de 18 anos) e da escola.
        Você já pode testar o app por <strong>7 dias</strong>.
      </li>
      <li>
        <strong>Documentos.</strong> Você recebe um e-mail e responde anexando, em foto ou PDF:
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {DOCUMENTOS.map((doc) => <li key={doc}>{doc}</li>)}
        </ul>
      </li>
      <li>
        <strong>Avaliação.</strong> Cada pedido é analisado por uma pessoa, e só ela autoriza o envio do código.
        Escolas públicas e particulares podem pedir, desde que comprovem que não têm condições de pagar.
      </li>
      <li>
        <strong>Código.</strong> Estando tudo certo, você recebe por e-mail um código de letras e números. Digite-o
        em <em>Sua conta → Código de Liberação</em>.
      </li>
      <li>
        <strong>Validade e revalidação.</strong> Cada código vale <strong>6 meses</strong>. O acesso gratuito dura
        pelo menos <strong>1 ano</strong> (dois períodos) e pode continuar por mais tempo, desde que, a cada 6
        meses, você envie os documentos atualizados e continue atendendo às condições.
      </li>
    </ol>
  )
}
