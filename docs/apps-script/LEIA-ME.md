# Planilha de pedidos (Google Sheets + Apps Script)

Isto liga o formulário de cadastro do Voz Ativa a uma planilha **sua e privada**. Os pedidos caem na planilha, você avalia os documentos e só você autoriza o envio do código.

## Montar (uma vez, uns 10 minutos)

1. Em [sheets.google.com](https://sheets.google.com), crie uma planilha em branco chamada **Voz Ativa – Pedidos**. Não compartilhe com ninguém.
2. Menu **Extensões → Apps Script**. Apague o que estiver lá e cole todo o conteúdo de `Code.gs`.
3. No topo do código, confira:
   - `SAL`: tem que ser **igual** ao `SAL` de `src/utils/licenca.js` (e trocado por uma frase só sua antes de publicar o app).
   - `EMAIL_ADMIN`: seu e-mail.
   - `LINK_DO_APP`: o link da Vercel.
4. Clique em **Implantar → Nova implantação → tipo "App da Web"**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   - Autorize quando o Google pedir (ele avisa que o app não foi verificado: é o seu próprio script, escolha *Avançado → Acessar*).
5. Copie o **URL do app da Web** e cole em `src/config.js`, em `ENDPOINT_PEDIDOS`. Publique de novo na Vercel.
6. Recarregue a planilha: aparece o menu **Voz Ativa**.

## No dia a dia

1. Chega um pedido: nova linha com status **Aguardando documentos** e um e-mail para você. O aluno recebe automaticamente o e-mail pedindo os documentos.
2. O aluno responde o e-mail com os anexos (eles ficam no **seu Gmail**).
3. Conferiu tudo? Clique na linha → **Voz Ativa → Aprovar e enviar código**. O código vai para o e-mail do aluno, e a planilha registra status, edição e validade.
4. Faltou algo ou não se enquadra? **Voz Ativa → Recusar**, com o motivo.
5. A cada 6 meses: peça os documentos atualizados e use **Renovar (novo código de 6 meses)**.
6. **Mala direta:** filtre a coluna **Aceita novidades = Sim**. Só envie promoções a essas pessoas, e inclua em todo e-mail um jeito de sair da lista.

## Cuidados com os dados (LGPD)

- Documentos de crianças e responsáveis são dados sensíveis. Deixe-os só no seu Gmail/Drive, com verificação em duas etapas ligada, e apague quando a análise terminar e o prazo legal permitir.
- Não compartilhe a planilha. Se alguém for ajudar, dê acesso só de leitura e só a quem precisa.
- O formulário não pede número de CPF nem RG: esses documentos vêm só por anexo de e-mail.
- Guarde a frase `SAL` em lugar seguro: quem a tiver consegue gerar códigos.

## Limites

- O Apps Script de conta Gmail comum envia até ~100 e-mails por dia. Para mala direta grande, use uma ferramenta própria (ex.: Mailchimp, Brevo) importando só quem aceitou.
- Qualquer pessoa que descobrir o endereço do script pode enviar pedidos falsos. Como você aprova um a um, isso só gera linhas a mais.
