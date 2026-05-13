import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf"; // Importação necessária para o PDF funcionar

const App = () => {
  const [transcricao, setTranscricao] = useState("");
  const [palavrasConfirmadas, setPalavrasConfirmadas] = useState("");
  const [estaGravando, setEstaGravando] = useState(false);
  const [categoria, setCategoria] = useState("Aula / Palestra");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAjuda, setShowAjuda] = useState(false);
  const [etapaCadastro, setEtapaCadastro] = useState("fechado");

  const [dadosPerfil, setDadosPerfil] = useState({
    nomeAluno: "", cpfRg: "", whatsapp: "", cep: "", endereco: "", bairro: "", cidade: "",
    nomeMae: "", cpfMae: "", whatsappMae: "", nivelEnsino: "Ensino Fundamental I / II",
    serie: "", ra: "", escola: "", tipoEscola: "", telefoneEscola: "", enderecoEscola: "", codigoLiberacao: ""
  });

  const recognitionRef = useRef(null);

  const cores = {
    begeFundo: "#F5F1E3",
    verdeOliva: "#6B705C",
    verdeClaro: "#A5A58D",
    terraCota: "#B58463",
    gold: "#D4AF37",
    branco: "#FFFFFF",
    cinzaTexto: "#333333"
  };

  // --- FUNÇÃO PARA GERAR O PDF ---
  const gerarPDF = () => {
    if (!palavrasConfirmadas && !transcricao) {
      alert("Não há texto para gerar o PDF.");
      return;
    }
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    doc.setFontSize(22);
    doc.setTextColor(107, 112, 92);
    doc.text("Voz Ativa - Relatório de Aula", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`Data: ${dataAtual} | Categoria: ${categoria}`, 20, 30);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(11);
    const textoCompleto = palavrasConfirmadas + " " + transcricao;
    const splitText = doc.splitTextToSize(textoCompleto, 170);
    doc.text(splitText, 20, 45);
    
    doc.save(`Aula_VozAtiva_${dataAtual}.pdf`);
  };

  const enviarParaEmail = async (e) => {
    e.preventDefault();
    try {
      // Enviando para o seu link do Formspree configurado para projeto.oucapormim@gmail.com
      const response = await fetch("https://formspree.io/f/mlgzpqga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosPerfil),
      });

      if (response.ok) {
        alert("Cadastro enviado com sucesso! Verifique seu e-mail para a mala direta.");
        setEtapaCadastro("fechado");
      } else {
        alert("Erro ao enviar. Tente novamente.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor de e-mail.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosPerfil(prev => ({ ...prev, [name]: value }));
  };

  const encerrarReconhecimento = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const iniciarReconhecimento = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.onresult = (event) => {
      let transcriptInterim = "";
      let transcriptFinal = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcriptFinal += event.results[i][0].transcript + " ";
        else transcriptInterim += event.results[i][0].transcript;
      }
      setPalavrasConfirmadas(prev => prev + transcriptFinal);
      setTranscricao(transcriptInterim);
    };
    recognition.onend = () => { if (estaGravando && recognitionRef.current) try { recognition.start(); } catch (e) {} };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const alternarGravacao = () => {
    if (estaGravando) { setEstaGravando(false); encerrarReconhecimento(); }
    else { setEstaGravando(true); iniciarReconhecimento(); }
  };

  return (
    <div style={{ backgroundColor: cores.begeFundo, height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      
      <header style={{ width: '94%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 0' }}>
        <h1 style={{ color: cores.verdeOliva, fontSize: '38px', fontWeight: 'bold', margin: 0 }}>Voz Ativa</h1>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <button onClick={() => setShowAjuda(true)} style={{ background: 'none', border: 'none', color: cores.terraCota, fontWeight: 'bold', cursor: 'pointer', fontSize: '22px' }}>AJUDA</button>
          <button onClick={() => setEtapaCadastro("login")} style={{ backgroundColor: cores.terraCota, color: '#fff', border: 'none', padding: '15px 45px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}>CADASTRAR</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'stretch', width: '94%', height: '82vh' }}>
        <main style={{ flex: 3, backgroundColor: cores.branco, borderRadius: '40px', padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowDropdown(!showDropdown)} style={{ background: 'none', border: 'none', color: cores.terraCota, fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}>SELECIONAR TEMA PARA SALVAR ⬇️</button>
              {showDropdown && (
                <div style={{ position: 'absolute', top: '35px', background: cores.branco, border: `2px solid ${cores.gold}`, borderRadius: '15px', width: '280px', zIndex: 100 }}>
                  {["Aula / Palestra", "Saúde / Médica", "Conversas / Diversas"].map(item => (
                    <div key={item} onClick={() => { setCategoria(item); setShowDropdown(false); }} style={{ padding: '18px', cursor: 'pointer', color: cores.verdeOliva }}>{item}</div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { if(window.confirm("Limpar tela?")) { setPalavrasConfirmadas(""); setTranscricao(""); } }} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}>🗑️</button>
          </div>

          <div style={{ flex: 1, backgroundColor: '#FDFCF7', borderRadius: '30px', border: `1px solid #ddd`, padding: '40px', overflowY: 'auto' }}>
            <span style={{ color: '#333', fontSize: '26px' }}>{palavrasConfirmadas}</span>
            <span style={{ color: cores.terraCota, fontSize: '26px', fontWeight: 'bold' }}>{transcricao}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', marginTop: '20px' }}>
            <button onClick={alternarGravacao} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 40px', border: `2px solid ${estaGravando ? cores.terraCota : cores.verdeOliva}`, borderRadius: '40px', color: cores.verdeOliva, background: '#fff', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg" width="24" alt="Meet" />
              {estaGravando ? "PARAR TRANSCRIÇÃO" : "ASSISTIR AULA E GRAVAR"}
            </button>
            <div onClick={alternarGravacao} style={{ backgroundColor: estaGravando ? cores.terraCota : cores.verdeOliva, width: '70px', height: '70px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '30px', cursor: 'pointer' }}>
              {estaGravando ? "●" : "🎤"}
            </div>
            <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
              <button style={{ flex: 1, backgroundColor: cores.gold, color: '#fff', border: 'none', padding: '22px', borderRadius: '20px', fontWeight: 'bold', fontSize: '20px' }}>SALVAR NO HISTÓRICO</button>
              {/* ADICIONADO A FUNÇÃO DE PDF NO SEU BOTÃO */}
              <button onClick={gerarPDF} style={{ flex: 1, border: `2px solid ${cores.gold}`, color: cores.gold, background: '#fff', padding: '22px', borderRadius: '20px', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }}>📄 GERAR PDF</button>
            </div>
          </div>
        </main>

        <aside style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ flex: 1, backgroundColor: cores.branco, borderRadius: '40px', padding: '30px', borderBottom: `8px solid ${cores.gold}` }}>
            <h3 style={{ color: cores.gold, fontSize: '18px' }}>📂 RECENTES</h3>
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{categoria}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', height: '180px' }}>
            <div style={{ flex: 1, backgroundColor: cores.branco, borderRadius: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '45px' }}>📁</span>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>AULAS</p>
            </div>
            <div style={{ flex: 1, backgroundColor: cores.branco, borderRadius: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '45px' }}>❤️</span>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>SAÚDE</p>
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL AJUDA */}
      {showAjuda && (
        <div style={modalOverlay}>
          <div style={{ backgroundColor: cores.branco, width: '900px', borderRadius: '45px', padding: '40px', position: 'relative', border: `5px solid ${cores.gold}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowAjuda(false)} style={closeBtn}>×</button>
            <h2 style={{ color: cores.terraCota, textAlign: 'center', fontSize: '28px', marginBottom: '30px', fontWeight: 'bold' }}>Guia de Uso - Voz Ativa</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ color: cores.cinzaTexto, fontSize: '14px', lineHeight: '1.6' }}>
                <h3 style={{ color: cores.gold, fontSize: '16px', marginBottom: '15px' }}>› FUNCIONAMENTO DOS BOTÕES</h3>
                <p>💻 <b>Conectar Áudio do Meet:</b> Capture a fala do professor com clareza em aulas online.</p>
                <p>🎤 <b>Microfone Central:</b> Inicie ou pause a escuta de conversas presenciais.</p>
                <p>🗑️ <b>Lixeira:</b> Limpa o texto da tela atual.</p>
                <p>📄 <b>Gerar PDF:</b> Transforma suas anotações em um arquivo para estudo.</p>
              </div>
              <div>
                <h3 style={{ color: cores.gold, fontSize: '16px', marginBottom: '15px' }}>› REGRAS DO CADASTRO (IMPORTANTE)</h3>
                <div style={{ backgroundColor: cores.begeFundo, padding: '20px', borderRadius: '20px', fontSize: '13px', border: `1px solid ${cores.gold}` }}>
                   <ul style={{ paddingLeft: '20px', color: cores.cinzaTexto }}>
                     <li><b>RA do Aluno:</b> Obrigatório número completo mais o dígito.</li>
                     <li><b>Documentos:</b> CPF e RG devem estar completos.</li>
                     <li><b>Código:</b> Digite o código recebido por e-mail para liberar todas as funções.</li>
                   </ul>
                </div>
              </div>
            </div>
            <button onClick={() => setShowAjuda(false)} style={{ ...btnMain(cores), background: cores.verdeOliva, marginTop: '30px' }}>ENTENDI TUDO E QUERO COMEÇAR!</button>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {etapaCadastro === "login" && (
        <div style={modalOverlay}>
          <div style={{ backgroundColor: cores.branco, width: '500px', borderRadius: '40px', padding: '50px', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setEtapaCadastro("fechado")} style={closeBtn}>×</button>
            <h2 style={{ color: cores.terraCota, fontSize: '32px', marginBottom: '35px' }}>Acessar Voz Ativa</h2>
            <input placeholder="E-mail" style={inputStyle(cores)} />
            <input type="password" placeholder="Senha" style={inputStyle(cores)} />
            <button onClick={() => alert("Link enviado!")} style={{ background: 'none', border: 'none', color: cores.terraCota, fontSize: '14px', textDecoration: 'underline', cursor: 'pointer', marginBottom: '20px', display: 'block', width: '100%' }}>Esqueci minha senha</button>
            <button onClick={() => setEtapaCadastro("perfil")} style={btnMain(cores)}>ENTRAR / CADASTRAR NOVO</button>
          </div>
        </div>
      )}

      {/* MODAL PERFIL */}
      {etapaCadastro === "perfil" && (
        <div style={modalOverlay}>
          <form onSubmit={enviarParaEmail} style={{ backgroundColor: cores.branco, width: '950px', borderRadius: '45px', padding: '40px', position: 'relative', border: `8px solid ${cores.terraCota}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <button type="button" onClick={() => setEtapaCadastro("fechado")} style={closeBtn}>×</button>
            <h2 style={{ color: cores.verdeOliva, textAlign: 'center', fontSize: '28px', marginBottom: '30px', fontWeight: 'bold' }}>Perfil do Usuário</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: cores.terraCota, fontSize: '16px', borderBottom: `1px solid ${cores.verdeClaro}`, paddingBottom: '5px' }}>👤 DADOS PESSOAIS</h3>
                <input name="nomeAluno" placeholder="Nome Completo do Aluno" onChange={handleInputChange} style={inputStyle(cores)} required />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input name="cpfRg" placeholder="CPF ou RG" onChange={handleInputChange} style={inputStyle(cores)} required />
                  <input name="whatsapp" placeholder="Celular/WhatsApp" onChange={handleInputChange} style={inputStyle(cores)} required />
                </div>
                <input name="cep" placeholder="CEP" onChange={handleInputChange} style={inputStyle(cores)} />
                <input name="endereco" placeholder="Endereço (Rua e Número)" onChange={handleInputChange} style={inputStyle(cores)} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input name="bairro" placeholder="Bairro" onChange={handleInputChange} style={inputStyle(cores)} />
                  <input name="cidade" placeholder="Cidade" onChange={handleInputChange} style={inputStyle(cores)} />
                </div>
                <h3 style={{ color: cores.terraCota, fontSize: '16px', borderBottom: `1px solid ${cores.verdeClaro}`, paddingBottom: '5px', marginTop: '10px' }}>👩‍👦 RESPONSÁVEL (MÃE)</h3>
                <input name="nomeMae" placeholder="Nome Completo da Mãe" onChange={handleInputChange} style={inputStyle(cores)} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input name="cpfMae" placeholder="CPF/RG da Mãe" onChange={handleInputChange} style={inputStyle(cores)} />
                  <input name="whatsappMae" placeholder="WhatsApp da Mãe" onChange={handleInputChange} style={inputStyle(cores)} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: cores.terraCota, fontSize: '16px', borderBottom: `1px solid ${cores.verdeClaro}`, paddingBottom: '5px' }}>🎓 PERFIL ACADÊMICO</h3>
                <select name="nivelEnsino" onChange={handleInputChange} style={{ ...inputStyle(cores), appearance: 'none', cursor: 'pointer' }}>
                  <option>Ensino Fundamental I / II</option>
                  <option>Ensino Médio</option>
                  <option>Graduação / Outros</option>
                </select>
                <input name="serie" placeholder="Qual série / ano?" onChange={handleInputChange} style={inputStyle(cores)} />
                <input name="ra" placeholder="Número do RA" onChange={handleInputChange} style={inputStyle(cores)} required />
                <div style={{ backgroundColor: '#F0F0F5', padding: '20px', borderRadius: '20px', marginTop: '10px' }}>
                  <h3 style={{ color: cores.verdeOliva, fontSize: '14px', marginBottom: '10px' }}>DADOS DA INSTITUIÇÃO</h3>
                  <input name="escola" placeholder="Nome da Escola ou Faculdade" onChange={handleInputChange} style={{ ...inputStyle(cores), backgroundColor: '#fff', color: '#333' }} />
                  <div style={{ display: 'flex', gap: '20px', margin: '10px 5px' }}>
                    <label><input type="radio" name="tipoEscola" value="Público" onChange={handleInputChange} /> Público</label>
                    <label><input type="radio" name="tipoEscola" value="Particular" onChange={handleInputChange} /> Particular</label>
                  </div>
                  <input name="telefoneEscola" placeholder="Telefone da Instituição" onChange={handleInputChange} style={{ ...inputStyle(cores), backgroundColor: '#fff', color: '#333' }} />
                  <input name="enderecoEscola" placeholder="Endereço da Instituição" onChange={handleInputChange} style={{ ...inputStyle(cores), backgroundColor: '#fff', color: '#333' }} />
                </div>
                <div style={{ border: `2px solid ${cores.verdeClaro}`, padding: '15px', borderRadius: '20px', marginTop: '5px' }}>
                  <h3 style={{ color: cores.gold, fontSize: '14px', marginBottom: '5px' }}>CÓDIGO DE LIBERAÇÃO</h3>
                  <input name="codigoLiberacao" placeholder="Insira o código aqui" onChange={handleInputChange} style={{ ...inputStyle(cores), backgroundColor: 'transparent', border: '1px solid #ccc', color: '#333' }} />
                </div>
              </div>
            </div>

            <button type="submit" style={{ ...btnMain(cores), background: cores.terraCota, marginTop: '30px' }}>
              💾 FINALIZAR CADASTRO E ACESSAR
            </button>

            <footer style={{ marginTop: '30px', textAlign: 'center', borderTop: `1px solid ${cores.verdeClaro}`, paddingTop: '20px' }}>
              <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>Desenvolvido por <strong>Angela Cristina</strong> | Maio de 2026</p>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
};

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const closeBtn = { position: 'absolute', top: '15px', right: '25px', background: 'none', border: 'none', fontSize: '40px', cursor: 'pointer', color: '#bbb' };
const inputStyle = (c) => ({ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: 'none', backgroundColor: c.verdeClaro, color: '#fff', fontSize: '16px', boxSizing: 'border-box' });
const btnMain = (c) => ({ width: '100%', backgroundColor: c.terraCota, color: '#fff', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' });

export default App;