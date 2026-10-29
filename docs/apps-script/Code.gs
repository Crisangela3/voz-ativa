/**
 * Voz Ativa – planilha de pedidos de acesso gratuito (Google Apps Script)
 *
 * O que faz:
 *  1. Recebe cada cadastro do app e grava uma linha na aba "Pedidos".
 *  2. Avisa você por e-mail e manda ao aluno o e-mail pedindo os documentos.
 *  3. Só DEPOIS que você avaliar os documentos: selecione a linha e use o menu
 *     "Voz Ativa → Aprovar e enviar código". O código vai para o e-mail do aluno.
 *  4. Para renovar (a cada 6 meses): selecione a linha e use "Voz Ativa → Renovar (novo código)".
 *  5. A coluna "Aceita novidades" mostra quem autorizou a mala direta (filtre por "Sim").
 *
 * IMPORTANTE: o SAL abaixo precisa ser IGUAL ao de src/utils/licenca.js do app.
 * Passo a passo: docs/apps-script/LEIA-ME.md
 */

var SAL = 'voz-ativa-troque-esta-frase-antes-de-publicar';
var DIAS_VALIDADE = 180;
var NOME_ABA = 'Pedidos';
var EMAIL_ADMIN = 'crisangela3@gmail.com';
var LINK_DO_APP = 'https://COLOQUE-AQUI-O-LINK-DA-VERCEL';

var COLUNAS = [
  'Recebido em', 'Status', 'Período (edição)', 'Válido até', 'E-mail de contato', 'Aceita novidades',
  'Tipo', 'Pública/Particular', 'Matrícula (RA/RGM)', 'Aluno', 'Tel. aluno', 'CEP', 'Endereço aluno',
  'Menor de 18', 'Responsável', 'E-mail responsável', 'Tel. responsável',
  'Escola', 'CNPJ', 'Tel. escola', 'E-mail escola', 'Endereço escola', 'Motivo', 'Observações (suas)'
];

var DOCUMENTOS = [
  'Declaração da escola em papel timbrado, com todas as informações da escola (nome, CNPJ, endereço, telefone, e-mail)',
  'Comprovante de que o aluno está estudando (matrícula, boletim ou declaração de vínculo)',
  'Comprovante de endereço',
  'RG e CPF do aluno',
  'RG e CPF do responsável (quando o aluno é menor de 18 anos)',
  'Documento que comprove a necessidade do acesso gratuito (ex.: CadÚnico, comprovante de renda ou declaração de bolsa)'
];

function aba_() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
  }
  return aba;
}

// Recebe o pedido enviado pelo app
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var email = String(d.emailContato || '').trim().toLowerCase();
  if (!email) return ContentService.createTextOutput('sem e-mail');

  aba_().appendRow([
    new Date(), 'Aguardando documentos', '', '', email, d.aceiteNovidades ? 'Sim' : 'Não',
    d.tipoRotulo, d.publica, "'" + d.matricula, d.alunoNome, "'" + d.alunoTelefone, "'" + d.alunoCep, d.alunoEndereco,
    d.menor ? 'Sim' : 'Não', d.respNome || '', d.respEmail || '', d.respTelefone || '',
    d.escolaNome, "'" + d.escolaCnpj, "'" + d.escolaTelefone, d.escolaEmail, d.escolaEndereco, d.motivo, ''
  ]);

  MailApp.sendEmail(EMAIL_ADMIN, 'Novo pedido Voz Ativa: ' + d.alunoNome, 'Escola: ' + d.escolaNome + '\nTipo: ' + d.tipoRotulo + '\nContato: ' + email + '\n\nAbra a planilha, aba "' + NOME_ABA + '".');

  MailApp.sendEmail(email, 'Voz Ativa – recebemos seu pedido de acesso gratuito',
    'Olá!\n\nRecebemos o pedido de acesso gratuito do(a) aluno(a) ' + d.alunoNome + '.\n\n' +
    'Para avaliarmos, responda a ESTE e-mail anexando (foto ou PDF):\n\n- ' + DOCUMENTOS.join('\n- ') + '\n\n' +
    'Cada pedido é analisado individualmente. Estando tudo certo, você receberá um código de acesso válido por 6 meses. ' +
    'A cada 6 meses será preciso enviar os documentos atualizados para revalidar.\n\nEnquanto isso, você pode usar o app por 7 dias: ' + LINK_DO_APP + '\n\n' +
    'Angela – Voz Ativa', { replyTo: EMAIL_ADMIN });

  return ContentService.createTextOutput('ok');
}

// ---------- Menu na planilha ----------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Voz Ativa')
    .addItem('Aprovar e enviar código', 'aprovar')
    .addItem('Renovar (novo código de 6 meses)', 'renovar')
    .addItem('Recusar (avisar por e-mail)', 'recusar')
    .addToUi();
}

function linhaSelecionada_() {
  var aba = SpreadsheetApp.getActiveSheet();
  if (aba.getName() !== NOME_ABA) throw new Error('Abra a aba "' + NOME_ABA + '".');
  var linha = aba.getActiveRange().getRow();
  if (linha < 2) throw new Error('Selecione uma linha de pedido.');
  return { aba: aba, linha: linha };
}

function aprovar() { emitir_(false); }
function renovar() { emitir_(true); }

function emitir_(renovacao) {
  var ui = SpreadsheetApp.getUi();
  var s = linhaSelecionada_();
  var v = s.aba.getRange(s.linha, 1, 1, COLUNAS.length).getValues()[0];
  var email = String(v[4]).trim().toLowerCase();
  var nome = v[9];
  var edicao = Number(v[2]) || 0;
  edicao = renovacao ? edicao + 1 : (edicao || 1);

  var ok = ui.alert((renovacao ? 'Renovar' : 'Aprovar') + ' e enviar código?',
    'Você conferiu todos os documentos de ' + nome + ' (' + email + ')?', ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;

  var codigo = gerarCodigo(email, edicao);
  var ate = new Date(Date.now() + DIAS_VALIDADE * 86400000);

  MailApp.sendEmail(email, 'Voz Ativa – seu código de acesso gratuito',
    'Olá!\n\nSeu pedido foi aprovado. Seu código de acesso:\n\n    ' + codigo + '\n\n' +
    'Como usar: abra ' + LINK_DO_APP + ', toque em "Tenho um código" (ou em Sua conta → Código de Liberação) e digite o e-mail ' +
    email + ' e o código.\n\nO acesso vale por 6 meses (até ' + Utilities.formatDate(ate, Session.getScriptTimeZone(), 'dd/MM/yyyy') + '). ' +
    'Para continuar depois, envie os documentos atualizados quando eu pedir.\n\nAngela – Voz Ativa', { replyTo: EMAIL_ADMIN });

  s.aba.getRange(s.linha, 2).setValue(renovacao ? 'Renovado' : 'Aprovado');
  s.aba.getRange(s.linha, 3).setValue(edicao);
  s.aba.getRange(s.linha, 4).setValue(ate);
  ui.alert('Código enviado para ' + email + '.');
}

function recusar() {
  var ui = SpreadsheetApp.getUi();
  var s = linhaSelecionada_();
  var v = s.aba.getRange(s.linha, 1, 1, COLUNAS.length).getValues()[0];
  var r = ui.prompt('Motivo da recusa (vai no e-mail para ' + v[4] + ')', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  MailApp.sendEmail(String(v[4]), 'Voz Ativa – sobre seu pedido',
    'Olá!\n\nNão foi possível aprovar o pedido neste momento.\n\nMotivo: ' + r.getResponseText() +
    '\n\nSe puder, envie o que falta respondendo este e-mail e avaliamos de novo.\n\nAngela – Voz Ativa', { replyTo: EMAIL_ADMIN });
  s.aba.getRange(s.linha, 2).setValue('Recusado');
}

// ---------- Mesmo código do app (src/utils/licenca.js) ----------
var ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function hash_(texto, semente) {
  var h1 = 0xdeadbeef ^ semente;
  var h2 = 0x41c6ce57 ^ semente;
  for (var i = 0; i < texto.length; i++) {
    var c = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function gerarCodigo(email, edicao) {
  var base = String(email).trim().toLowerCase() + '|' + SAL + (edicao > 1 ? '|ed' + edicao : '');
  var letras = '';
  for (var i = 0; i < 12; i++) letras += ALFABETO.charAt(hash_(base + i, i + 1) % ALFABETO.length);
  return 'VA-' + letras.slice(0, 4) + '-' + letras.slice(4, 8) + '-' + letras.slice(8, 12);
}
