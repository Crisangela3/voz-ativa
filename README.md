# Voz Ativa

**Legendas ao vivo em português para aulas, consultas e conversas, com correção de termos de programação (`if`, `else`, `while`, `true`...).**

🔗 **Demonstração:** [adicione aqui o link da Vercel]

<!-- Adicione um print da tela em docs/tela.png e descomente a linha abaixo -->
<!-- ![Tela do Voz Ativa](docs/tela.png) -->

## Por que fiz este projeto

Uma amiga Deficiente Auditiva (surda), acompanhava aulas de programação pelo Google Meet, mas a legenda automática era ruim e não entendia os termos técnicos que o professor falava: `if`, `else`, `while`, `true`. Ela perdia a aula.

O Voz Ativa resolve isso: transforma a fala em legenda grande e legível, corrige esses termos e destaca o código em cores. Também serve para consultas médicas, conversas presenciais e qualquer situação em que alguém precise ler o que está sendo dito.

## O que ele faz

- **Legenda ao vivo**: o texto aparece enquanto a pessoa fala (o trecho ainda em andamento fica mais claro).
- **Termos de programação corrigidos e destacados**: "uaile" vira `while`, "trú" vira `true`, "console log" vira `console.log`.
- **Símbolos falados** (opcional): "igual igual" vira `==`, "abre parênteses" vira `(`.
- **Termos personalizados**: a pessoa ensina o app a corrigir palavras novas, e isso fica salvo.
- **Acessibilidade**: tamanho de letra ajustável, modo de alto contraste, tela cheia para ler a distância, navegação por teclado, rótulos para leitores de tela e contraste de cores acima de 4,5:1.
- **Pastas Organizadas e Recentes**: salva as conversas por categoria (Aulas, Saúde, Passeios, Aleatório), neste aparelho.
- **Cadastro do aluno e acesso gratuito**: formulário completo (aluno, responsável, escola, RA/RGM), avaliação manual e código revalidado a cada 6 meses.
- **Manual de Uso** e **Perfil do usuário** (Dados Pessoais e Acadêmico) dentro do app.
- **Exportação** em PDF (com várias páginas) e TXT.
- **Idiomas**: português (Brasil), inglês e espanhol (Latinoamérica, para crianças de países vizinhos como a Argentina), escolhidos por bandeiras. Só a fala é reconhecida nesses idiomas; os textos do app continuam em português.
- **Funciona no celular** e pode ser instalado como app.
- A tela do aparelho fica acesa enquanto as legendas rodam.

## Tecnologias

React 18 · Vite · Tailwind CSS 4 · Web Speech API · jsPDF · Lucide · Vitest · ESLint

## Como rodar

Você precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev      # abre em http://localhost:5173
```

Outros comandos:

```bash
npm test         # testes
npm run lint     # verificação de código
npm run build    # gera a pasta dist/
```

Para testar no celular, deixe o `npm run dev` rodando e abra o endereço de rede mostrado no terminal. O reconhecimento de voz no celular exige conexão segura (HTTPS), então para uso real use o link publicado.

## Acesso gratuito para estudantes

O Voz Ativa é gratuito para quem comprova que não tem condições de pagar (escolas públicas e particulares, cursos técnicos e faculdades).

1. O aluno se cadastra no app (dados do aluno, do responsável e da escola, com RA/RGM) e testa por 7 dias.
2. O pedido cai numa **planilha privada** (Google Sheets) e o aluno recebe um e-mail pedindo os documentos (foto ou PDF).
3. Só a administradora avalia e autoriza: menu **Voz Ativa → Aprovar e enviar código** na planilha.
4. O aluno digita o código em **Sua conta → Código de Liberação**.
5. Cada código vale **6 meses**. O acesso dura no mínimo 1 ano e continua enquanto o aluno revalidar os documentos a cada 6 meses.

Montagem da planilha e rotina de aprovação: [`docs/apps-script/LEIA-ME.md`](docs/apps-script/LEIA-ME.md).
Sem a planilha ligada, o pedido sai por e-mail pronto (`src/config.js`), e o código pode ser gerado à mão: `npm run codigo -- aluno@email.com` (renovação: `--edicao=2`).

**Antes de publicar**, troque a frase `SAL` em `src/utils/licenca.js` (e a mesma no `Code.gs`) por uma frase só sua e não a divulgue.

> **Limite honesto:** o app não tem servidor, então a conferência do código roda no navegador. Ela organiza a distribuição, mas quem entende de programação consegue contornar. Bloqueio de verdade exigiria um servidor (ex.: Supabase).

## Como publicar na Vercel

1. Envie o projeto para o GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e escolha o repositório.
3. A Vercel reconhece o Vite sozinha (build `npm run build`, pasta `dist`). Clique em **Deploy**.

## Limitações conhecidas e privacidade

- Funciona melhor no **Google Chrome** e no **Microsoft Edge**. O Firefox não tem reconhecimento de voz.
- O app escuta o **microfone do aparelho**. Numa aula online, o som da aula precisa sair pelas caixas, e o app não funciona com fones de ouvido.
- O Chrome e o Edge enviam o áudio ao serviço de reconhecimento de voz deles. O Voz Ativa **não tem servidor próprio**: o texto e o histórico ficam só no navegador de quem usa.
- Em consultas médicas ou conversas privadas, avise as pessoas envolvidas antes de usar.
- A precisão varia com o sotaque, o ruído e a distância do microfone. Termos técnicos fora da lista podem sair errados, e por isso existe a edição de texto e os termos personalizados.

## Próximos passos

- Trocar o motor do navegador por um modelo como o Whisper, que entende melhor termos técnicos e permite legendar diretamente o áudio de Meet, Zoom e Teams.
- Modo offline completo.
- Mais idiomas e uma lista de termos maior (Python, SQL, HTML/CSS).

## Licença

[MIT](LICENSE): uso livre, inclusive em escolas e projetos sociais.

---

Criado por [Angela Cristina Silva](https://github.com/Crisangela3).
