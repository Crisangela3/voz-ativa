import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";

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
      const response = await fetch("https://formspree.io/f/mlgzpqga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosPerfil),
      });
      if (response.ok) {
        alert("Cadastro enviado com sucesso! O código de liberação foi registrado.");
        setEtapaCadastro("fechado");
      } else {
        alert("Erro ao enviar o cadastro.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosPerfil(prev => ({ ...prev, [name]: value }));
  };

  const encerrarReconhecimento = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const iniciarReconhecimento = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Navegador não suportado. Use o Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    // DIAGNÓSTICO PARA O MICROFONE (Caso não funcione no PC da amiga)
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        alert("ATENÇÃO: Microfone bloqueado! Clique no CADEADO lá em cima na barra de endereço e mude para 'Permitir'.");
      } else {
        alert("Erro no microfone: " + event.error);
      }
      setEstaGravando(false);
    };

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
            <button onClick={() => setShowAjuda(false)} style={{ ...btnMain(cores), background: cores.verdeOliva, marginTop: '30px' }}>ENTENDI TUDO!</button>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {etapaCadastro === "login" && (
        <div style={modalOverlay}>
          <div style={{ backgroundColor: cores.branco, width: '500px', borderRadius: '40px', padding: '50px', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setEtapaCadastro("fechado")} style={closeBtn}>×</button>
            <h2 style={{ color: cores.terraCota, fontSize: '32px', marginBottom: '35px' }}>Acessar Voz Ativa</h2>
            <button onClick={() => setEtapaCadastro("perfil")} style={btnMain(cores)}>ENTRAR / CADASTRAR NOVO</button>
          </div>
        </div>
      )}

      {/* MODAL PERFIL (Cadastro com campo de código) */}
      {etapaCadastro === "perfil" && (
        <div style={modalOverlay}>
          <form onSubmit={enviarParaEmail} style={{ backgroundColor: cores.branco, width: '950px', borderRadius: '45px', padding: '40px', position: 'relative', border: `8px solid ${cores.terraCota}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <button type="button" onClick={() => setEtapaCadastro("fechado")} style={closeBtn}>×</button>
            <h2 style={{ color: cores.verdeOliva, textAlign: 'center', fontSize: '28px', marginBottom: '30px', fontWeight: 'bold' }}>Perfil do Usuário</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: cores.terraCota, fontSize: '16px' }}>👤 DADOS PESSOAIS</h3>
                <input name="nomeAluno" placeholder="Nome Completo do Aluno" onChange={handleInputChange} style={inputStyle(cores)} required />
                <input name="cpfRg" placeholder="CPF ou RG" onChange={handleInputChange} style={inputStyle(cores)} required />
                <input name="whatsapp" placeholder="WhatsApp" onChange={handleInputChange} style={inputStyle(cores)} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: cores.terraCota, fontSize: '16px' }}>🎓 ACADÊMICO</h3>
                <input name="ra" placeholder="Número do RA" onChange={handleInputChange} style={inputStyle(cores)} required />
                <div style={{ border: `2px solid ${cores.gold}`, padding: '15px', borderRadius: '20px' }}>
                  <h3 style={{ color: cores.gold, fontSize: '14px', marginBottom: '5px' }}>CÓDIGO DE LIBERAÇÃO</h3>
                  <input name="codigoLiberacao" placeholder="Insira o código aqui" onChange={handleInputChange} style={{ ...inputStyle(cores), backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }} />
                </div>
              </div>
            </div>
            <button type="submit" style={{ ...btnMain(cores), background: cores.terraCota, marginTop: '30px' }}>💾 FINALIZAR CADASTRO</button>
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