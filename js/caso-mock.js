(() => {
  "use strict";

  window.CASO_MOCK = {
    id: "crise-asmatica",
    duracaoMinutos: 3,
    avancoTempoSegundos: 60,
    doenca: {
      nome: "Exacerbação aguda de asma",
      sigla: "Crise asmática",
      explicacao: "A inflamação e o estreitamento dos brônquios dificultam a saída do ar, causando chiado, falta de ar, tosse, aumento da frequência respiratória e queda da saturação.",
    },

    ajudas: [
      {
        titulo: "Orientação",
        texto: "Observe a saturação, a frequência respiratória, o chiado e a capacidade de falar.",
        impacto: "Ajuda utilizada: nível 1 · Impacto na autonomia: -2%.",
      },
      {
        titulo: "Direcionamento",
        texto: "Priorize suporte de oxigenação e tratamento para abrir os brônquios.",
        impacto: "Maior nível utilizado nesta ajuda: nível 2 · Impacto na autonomia: -5%.",
      },
      {
        titulo: "Condutas sugeridas",
        texto: "Ofereça oxigênio, administre salbutamol inalatório e corticoide sistêmico.",
        impacto: "Maior nível utilizado nesta ajuda: nível 3 · Impacto na autonomia: -10%.",
      },
    ],

    investigacoes: [
      {
        padroes: ["chiado", "sibilo", "ausculta"],
        achado: "Sibilos difusos",
        resposta: "O chiado está forte, principalmente quando tento soltar o ar.",
      },
      {
        padroes: ["gatilho", "poeira", "alergia", "fumaca"],
        achado: "Gatilho provável",
        resposta: "A crise começou depois que limpei um cômodo com muita poeira.",
      },
      {
        padroes: ["historico", "antecedente", "asma", "bombinha"],
        achado: "Histórico de asma",
        resposta: "Tenho asma desde criança e uso bombinha, mas hoje ela acabou.",
      },
    ],

    avaliacao: {
      sucesso: {
        etapas: [
          {
            id: "oxigenio",
            rotulo: "Oxigênio suplementar",
            padroes: ["oxigenio", "o2", "mascara de oxigenio"],
            resposta: "Com a máscara de oxigênio, consigo respirar um pouco melhor.",
          },
          {
            id: "salbutamol",
            rotulo: "Salbutamol inalatório",
            padroes: ["salbutamol", "broncodilatador", "nebulizacao"],
            resposta: "Depois do broncodilatador, o peito começou a abrir e o chiado diminuiu.",
          },
          {
            id: "corticoide",
            rotulo: "Corticoide sistêmico",
            padroes: ["corticoide", "corticosteroide", "prednisona", "prednisolona"],
            resposta: "Certo. A equipe administrou o corticoide para controlar a inflamação.",
          },
        ],
        feedback: "Tratamento completo · três condutas corretas realizadas",
        pose: "sucesso",
        resumo: "As três medidas esperadas foram realizadas antes do agravamento crítico.",
        acertos: "Você corrigiu a hipóxia, utilizou um broncodilatador de ação rápida e tratou a inflamação das vias aéreas.",
        melhoria: "Continue reavaliando saturação, frequência respiratória, fala e resposta ao broncodilatador.",
      },
      erro: {
        resposta: "Ainda estou com muita falta de ar e o chiado está piorando.",
        feedback: "Conduta não reconhecida · o quadro respiratório piorou",
        maxErros: 3,
      },
    },

    visual: {
      sala: {
        width: 600,
        height: 500,
      },

      objetos: [
        { nome: "placa-medica", top: 22, left: 260, width: 80, height: 72, zIndex: 1 },
        { nome: "cilindro-oxigenio", top: 224, left: 44, width: 62, height: 184, zIndex: 2 },
        { nome: "suporte-soro", top: 146, left: 142, width: 72, height: 250, zIndex: 2 },
        { nome: "maca-exame", top: 318, left: 28, width: 228, height: 104, zIndex: 3 },
        { nome: "monitor", top: 150, right: 36, width: 118, height: 180, zIndex: 2 },
        { nome: "banco", top: 348, right: 52, width: 74, height: 88, zIndex: 3 },
      ],

      personagem: {
        asset: "assets/pixel-hospital/patient.png",
        top: 248,
        left: "50%",
        width: 192,
        height: 192,
        backgroundSize: "1152px 768px",
        estados: [
          { frames: ["0 0", "-192px 0"], velocidade: "1.2s" },
          { frames: ["-768px 0", "-960px 0"], velocidade: "1s" },
          { frames: ["-768px -384px", "-960px -384px"], velocidade: "0.85s" },
          { frames: ["0 -576px", "-192px -576px"], velocidade: "0.75s" },
        ],
        poses: {
          sucesso: { frames: ["0 -192px", "-192px -192px"], velocidade: "0.65s" },
        },
      },
    },
  };
})();
