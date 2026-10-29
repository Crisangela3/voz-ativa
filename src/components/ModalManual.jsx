import ComoFunciona from './ComoFunciona'
import Modal from './Modal'

export default function ModalManual({ aberto, onFechar }) {
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Manual de Uso" idTitulo="titulo-manual" larga>
      <ol className="list-decimal space-y-3 pl-5 leading-relaxed">
        <li>
          Escolha a <strong>categoria</strong> (Aulas, Saúde, Passeios ou Aleatório). É nela que a conversa
          será guardada.
        </li>
        <li>
          Toque em <strong>Iniciar legendas e gravar</strong> e permita o microfone quando o navegador
          pedir.
        </li>
        <li>
          Fale perto do microfone ou deixe o aparelho perto de quem está falando. A legenda aparece na hora;
          o trecho ainda em andamento fica mais claro.
        </li>
        <li>
          Termos como <code className="font-mono">if</code>, <code className="font-mono">else</code>,{' '}
          <code className="font-mono">while</code> e <code className="font-mono">true</code> são corrigidos e
          ficam em destaque. Se algo sair errado, ensine em <em>Termos personalizados</em>.
        </li>
        <li>
          Use <strong>A−</strong> e <strong>A+</strong> para o tamanho das letras e{' '}
          <strong>Alto contraste</strong> para fundo preto com letras claras.
        </li>
        <li>
          <strong>Tela cheia</strong> deixa só a legenda: ótimo para colocar o celular sobre a mesa numa
          consulta ou conversa.
        </li>
        <li>
          Ao terminar, toque em <strong>Salvar na pasta</strong>. Depois você abre, baixa em PDF ou apaga em{' '}
          <em>Pastas Organizadas</em> e <em>Recentes</em>.
        </li>
      </ol>

      <h3 className="mb-2 mt-6 font-bold text-titulo">Aula online (Meet, Zoom, Teams)</h3>
      <p className="leading-relaxed">
        O app escuta o <strong>microfone do aparelho</strong>. Deixe o som da aula nas caixas do computador e
        use o celular ou outro aparelho ao lado. Com fones de ouvido o app não escuta a aula.
      </p>

      <h3 className="mb-2 mt-6 font-bold text-titulo">Como funciona o acesso gratuito</h3>
      <ComoFunciona />

      <h3 className="mb-2 mt-6 font-bold text-titulo">Privacidade</h3>
      <p className="leading-relaxed">
        Para transformar voz em texto, o Chrome e o Edge enviam o áudio ao serviço de reconhecimento de voz
        deles. O Voz Ativa <strong>não tem servidor</strong>: as conversas e o cadastro ficam guardados só
        neste aparelho. Em consultas médicas ou conversas privadas, avise as pessoas envolvidas antes de
        usar. Os documentos do pedido de acesso são enviados por e-mail, nunca digitados no app.
      </p>
    </Modal>
  )
}
