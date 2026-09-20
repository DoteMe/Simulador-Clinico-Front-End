(() => {
  "use strict";

  const CHAVE_REGISTRO = "simuladorClinico.registroConversa.v3";
  const registro = document.querySelector(".registro-conversa");
  const campo = document.getElementById("campo-mensagem");
  const enviar = document.querySelector(".botao--enviar");
  const cronometro = document.getElementById("cronometro-valor");
  const modalProtocolos = document.getElementById("modal-protocolos");
  const botoesAbrirProtocolos = document.querySelectorAll("[data-abrir-protocolos]");
  const botoesFecharProtocolos = document.querySelectorAll("[data-fechar-protocolos]");
  const botaoAvancarAjuda = document.querySelector("[data-avancar-ajuda]");

  if (!registro || !campo || !enviar) return;

  const mensagemInicial = {
    remetente: "paciente",
    conteudo:
      "Doutor(a), estou com uma dor forte no peito há umas duas horas. Estou suando frio e com medo.",
    criadaEm: "2026-09-17T13:00:00.000Z",
  };

  const respostasPaciente = [
    {
      remetente: "paciente",
      conteudo:
        "É bem no meio do peito, como se estivesse apertando. Às vezes vai para o braço esquerdo.",
      criadaEm: "2026-09-17T13:00:18.000Z",
    },
    {
      remetente: "paciente",
      conteudo:
        "Está em oito. Começou quando eu estava subindo a escada e não melhorou quando parei.",
      criadaEm: "2026-09-17T13:00:36.000Z",
    },
    {
      remetente: "paciente",
      conteudo: "Está bem, doutor(a). Estou preocupado, mas consigo responder às perguntas.",
      criadaEm: "2026-09-17T13:00:54.000Z",
    },
  ];

  const estadosClinicos = [
    {
      sinais: {
        pa: ["154/92", "mmHg", "alta", 85],
        fc: ["101", "bpm", "alta", 85],
        fr: ["18", "irpm", "normal", 50],
        spo2: ["96", "%", "baixa", 20],
      },
      sintomas: {
        dor: ["8.0/10", 80, "Grave", "Opressiva, com irradiação para o braço esquerdo.", "alto"],
        sudorese: ["6.5/10", 65, "Moderado", "Associada à palidez e sensação de mal-estar.", "medio"],
        dispneia: ["3.0/10", 30, "Baixa", "Sem esforço respiratório importante no momento.", "baixo"],
      },
    },
    {
      sinais: {
        pa: ["160/96", "mmHg", "alta", 88],
        fc: ["108", "bpm", "alta", 88],
        fr: ["22", "irpm", "alta", 70],
        spo2: ["94", "%", "baixa", 30],
      },
      sintomas: {
        dor: ["8.5/10", 85, "Grave", "Dor opressiva persistente, com irradiação para o braço esquerdo.", "alto"],
        sudorese: ["7.0/10", 70, "Moderado", "Sudorese fria mais intensa, associada à palidez.", "medio"],
        dispneia: ["5.0/10", 50, "Moderada", "Refere dificuldade para respirar ao falar frases longas.", "medio"],
      },
    },
    {
      sinais: {
        pa: ["168/100", "mmHg", "alta", 92],
        fc: ["112", "bpm", "alta", 92],
        fr: ["24", "irpm", "alta", 76],
        spo2: ["93", "%", "baixa", 26],
      },
      sintomas: {
        dor: ["9.0/10", 90, "Grave", "Dor intensa, sem melhora com repouso.", "alto"],
        sudorese: ["7.5/10", 75, "Grave", "Sudorese fria e mal-estar permanecem presentes.", "alto"],
        dispneia: ["6.5/10", 65, "Moderada", "Falta de ar associada à piora da frequência respiratória.", "medio"],
      },
    },
    {
      sinais: {
        pa: ["170/102", "mmHg", "alta", 94],
        fc: ["116", "bpm", "alta", 94],
        fr: ["26", "irpm", "alta", 80],
        spo2: ["92", "%", "baixa", 22],
      },
      sintomas: {
        dor: ["9.0/10", 90, "Grave", "Dor torácica intensa com piora da falta de ar.", "alto"],
        sudorese: ["8.0/10", 80, "Grave", "Sudorese fria intensa e palidez acentuada.", "alto"],
        dispneia: ["8.0/10", 80, "Grave", "Dificuldade para respirar, com fala entrecortada.", "alto"],
      },
    },
  ];

  const CHAVE_CRONOMETRO = "simuladorClinico.fimDaSimulacao.v1";
  const DURACAO_SIMULACAO_MS = 5 * 60 * 1000;
  const niveisDeAjuda = [
    {
      titulo: "Orientação",
      texto: "Observe quais dados indicam maior risco imediato ao paciente.",
      impacto: "Ajuda utilizada: nível 1 · Impacto na autonomia: -2%.",
      acao: "Mostrar direcionamento",
    },
    {
      titulo: "Direcionamento",
      texto: "Compare a saturação, a frequência respiratória e a capacidade do paciente de falar. Considere avaliar diretamente o sistema afetado.",
      impacto: "Maior nível utilizado nesta ajuda: nível 2 · Impacto na autonomia: -5%.",
      acao: "Mostrar conduta sugerida",
    },
    {
      titulo: "Conduta sugerida",
      texto: "Realize uma avaliação pulmonar para investigar alterações respiratórias associadas à falta de ar.",
      impacto: "Maior nível utilizado nesta ajuda: nível 3 · Impacto na autonomia: -10%.",
      acao: "",
    },
  ];

  function lerRegistro() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_REGISTRO));
      if (!Array.isArray(dados)) return [mensagemInicial];

      const mensagensValidas = dados.filter(
        ({ remetente, conteudo }) =>
          ["paciente", "medico"].includes(remetente) &&
          typeof conteudo === "string" &&
          conteudo.trim(),
      );

      return mensagensValidas.length ? mensagensValidas : [mensagemInicial];
    } catch {
      return [mensagemInicial];
    }
  }

  function salvarRegistro(mensagens) {
    try {
      localStorage.setItem(CHAVE_REGISTRO, JSON.stringify(mensagens));
    } catch {
      // A conversa continua disponível na tela se o navegador bloquear o armazenamento.
    }
  }

  function aplicarEstadoClinico(indice) {
    const estado = estadosClinicos[Math.min(indice, estadosClinicos.length - 1)];
    if (!estado) return;

    Object.entries(estado.sinais).forEach(([nome, [valor, unidade, nivel, altura]]) => {
      const valorSinal = document.querySelector(`[data-sinal-valor="${nome}"]`);
      const barraSinal = document.querySelector(`[data-sinal-barra="${nome}"]`);
      if (!valorSinal || !barraSinal) return;

      const unidadeElemento = document.createElement("small");
      unidadeElemento.textContent = unidade;
      valorSinal.replaceChildren(document.createTextNode(valor), unidadeElemento);
      barraSinal.className = `sinal-vital__barra-preenchimento sinal-vital__barra-preenchimento--${nivel}`;
      barraSinal.style.height = `${altura}%`;
      barraSinal.title = `Nível ${nivel}`;
    });

    Object.entries(estado.sintomas).forEach(([nome, [medida, largura, gravidade, descricao, nivel]]) => {
      const sintoma = document.querySelector(`[data-sintoma="${nome}"]`);
      if (!sintoma) return;

      sintoma.querySelector("[data-sintoma-medida]").textContent = medida;
      sintoma.querySelector("[data-sintoma-barra]").style.width = `${largura}%`;
      sintoma.querySelector("[data-sintoma-gravidade]").textContent = gravidade;
      sintoma.querySelector("[data-sintoma-descricao]").textContent = descricao;
      sintoma.className = `sintoma sintoma--${nivel}`;
    });

    const gravidadeAtual = document.querySelector("[data-gravidade-atual]");
    if (gravidadeAtual) gravidadeAtual.textContent = "Grave";
  }

  function iniciarCronometro() {
    if (!cronometro) return;

    let fimDaSimulacao = Number(localStorage.getItem(CHAVE_CRONOMETRO));
    if (!Number.isFinite(fimDaSimulacao) || fimDaSimulacao <= Date.now()) {
      fimDaSimulacao = Date.now() + DURACAO_SIMULACAO_MS;
      localStorage.setItem(CHAVE_CRONOMETRO, String(fimDaSimulacao));
    }

    let intervalo;

    function atualizarCronometro() {
      const segundosRestantes = Math.max(0, Math.ceil((fimDaSimulacao - Date.now()) / 1000));
      const minutos = Math.floor(segundosRestantes / 60);
      const segundos = String(segundosRestantes % 60).padStart(2, "0");
      cronometro.textContent = `${minutos}:${segundos}`;
      cronometro.dateTime = `PT${segundosRestantes}S`;

      if (segundosRestantes === 0) window.clearInterval(intervalo);
    }

    intervalo = window.setInterval(atualizarCronometro, 1000);
    atualizarCronometro();
  }

  function criarMensagem({ remetente, conteudo, criadaEm }) {
    const item = document.createElement("li");
    item.className = `mensagem mensagem--${remetente}`;

    const autor = document.createElement("span");
    autor.className = "mensagem__autor";
    autor.textContent = remetente === "medico" ? "Médico" : "Paciente";

    const texto = document.createElement("p");
    texto.className = "mensagem__texto";
    texto.textContent = conteudo;

    if (criadaEm) {
      const horario = document.createElement("time");
      horario.className = "mensagem__horario";
      horario.dateTime = criadaEm;
      horario.textContent = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(criadaEm));
      autor.append(" · ", horario);
    }

    item.append(autor, texto);
    return item;
  }

  function renderizar(mensagens) {
    registro.replaceChildren(...mensagens.map(criarMensagem));
    registro.scrollTop = registro.scrollHeight;
  }

  let mensagens = lerRegistro();
  salvarRegistro(mensagens);
  renderizar(mensagens);
  aplicarEstadoClinico(Math.max(0, mensagens.filter(({ remetente }) => remetente === "paciente").length - 1));
  iniciarCronometro();

  function enviarMensagem() {
    const conteudo = campo.value.trim();
    if (!conteudo) return;

    const mensagem = {
      remetente: "medico",
      conteudo,
      criadaEm: new Date().toISOString(),
    };

    mensagens = [...mensagens, mensagem];
    salvarRegistro(mensagens);
    registro.append(criarMensagem(mensagem));
    registro.scrollTop = registro.scrollHeight;
    campo.value = "";
    campo.focus();

    adicionarRespostaPaciente();
  }

  function adicionarRespostaPaciente() {
    const quantidadeMensagensMedico = mensagens.filter(({ remetente }) => remetente === "medico").length;
    const resposta = respostasPaciente[quantidadeMensagensMedico - 1];
    if (!resposta) return;

    window.setTimeout(() => {
      const respostaComHorario = { ...resposta, criadaEm: new Date().toISOString() };
      mensagens = [...mensagens, respostaComHorario];
      salvarRegistro(mensagens);
      registro.append(criarMensagem(respostaComHorario));
      registro.scrollTop = registro.scrollHeight;
      aplicarEstadoClinico(quantidadeMensagensMedico);
    }, 500);
  }

  enviar.addEventListener("click", enviarMensagem);
  campo.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    enviarMensagem();
  });

  let ultimoElementoFocado;
  let nivelDeAjudaAtual = 0;

  function resetarAjuda() {
    const titulo = document.querySelector("[data-ajuda-titulo]");
    const texto = document.querySelector("[data-ajuda-texto]");
    const impacto = document.querySelector("[data-ajuda-impacto]");
    nivelDeAjudaAtual = 0;
    titulo.textContent = "Precisa de orientação para continuar?";
    texto.textContent = "O sistema apresentará uma orientação baseada no estado clínico que já está visível.";
    impacto.hidden = true;
    botaoAvancarAjuda.disabled = false;
    botaoAvancarAjuda.textContent = "Mostrar orientação";
  }

  function avancarAjuda() {
    const ajuda = niveisDeAjuda[nivelDeAjudaAtual];
    if (!ajuda) return;

    document.querySelector("[data-ajuda-titulo]").textContent = ajuda.titulo;
    document.querySelector("[data-ajuda-texto]").textContent = ajuda.texto;
    const impacto = document.querySelector("[data-ajuda-impacto]");
    impacto.textContent = ajuda.impacto;
    impacto.hidden = false;
    nivelDeAjudaAtual += 1;

    if (nivelDeAjudaAtual < niveisDeAjuda.length) {
      botaoAvancarAjuda.textContent = niveisDeAjuda[nivelDeAjudaAtual].acao;
    } else {
      botaoAvancarAjuda.textContent = "Nível máximo exibido";
      botaoAvancarAjuda.disabled = true;
    }
  }

  function abrirProtocolos(evento) {
    ultimoElementoFocado = evento.currentTarget;
    resetarAjuda();
    modalProtocolos.classList.add("modal--aberto");
    modalProtocolos.setAttribute("aria-hidden", "false");
    modalProtocolos.querySelector(".modal__fechar").focus();
  }

  function fecharProtocolos() {
    modalProtocolos.classList.remove("modal--aberto");
    modalProtocolos.setAttribute("aria-hidden", "true");
    ultimoElementoFocado?.focus();
  }

  botoesAbrirProtocolos.forEach((botao) => botao.addEventListener("click", abrirProtocolos));
  botoesFecharProtocolos.forEach((botao) => botao.addEventListener("click", fecharProtocolos));
  botaoAvancarAjuda.addEventListener("click", avancarAjuda);
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && modalProtocolos.classList.contains("modal--aberto")) {
      fecharProtocolos();
    }
  });
})();
