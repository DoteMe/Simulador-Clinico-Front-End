(() => {
  "use strict";

  const casoMock = window.CASO_MOCK;
  if (!casoMock) {
    console.error("Configuração CASO_MOCK não encontrada.");
    return;
  }

  const ID_CASO = casoMock.id;
  const CHAVE_REGISTRO = "simuladorClinico." + ID_CASO + ".registro.v2";
  const registro = document.querySelector(".registro-conversa");
  const campo = document.getElementById("campo-mensagem");
  const enviar = document.querySelector(".botao--enviar");
  const cronometro = document.getElementById("cronometro-valor");
  const modalProtocolos = document.getElementById("modal-protocolos");
  const botoesAbrirProtocolos = document.querySelectorAll("[data-abrir-protocolos]");
  const botoesFecharProtocolos = document.querySelectorAll("[data-fechar-protocolos]");
  const botaoAvancarAjuda = document.querySelector("[data-avancar-ajuda]");
  const feedbackFinal = document.getElementById("feedback-final");
  const botaoReiniciar = document.querySelector("[data-reiniciar-simulacao]");
  const botaoAvancarTempo = document.querySelector("[data-avancar-tempo]");

  if (!registro || !campo || !enviar) return;

  const mensagemInicial = {
    remetente: "paciente",
    conteudo: "Doutor(a), estou com muita falta de ar, chiado no peito e não consigo falar frases longas.",
    criadaEm: "2026-09-17T13:00:00.000Z",
  };

  const estadosClinicos = [
    {
      sinais: {
        pa: ["138/86", "mmHg", "alta", 68],
        fc: ["108", "bpm", "alta", 86],
        fr: ["26", "irpm", "alta", 82],
        spo2: ["92", "%", "baixa", 24],
      },
      sintomas: {
        dor: ["6.0/10", 60, "Moderada", "Aperto no peito, pior durante a expiração.", "medio"],
        sudorese: ["7.0/10", 70, "Moderado", "Chiado audível e tosse seca frequente.", "medio"],
        dispneia: ["7.0/10", 70, "Moderada", "Fala em frases curtas, com esforço respiratório.", "medio"],
      },
    },
    {
      sinais: {
        pa: ["144/90", "mmHg", "alta", 76],
        fc: ["116", "bpm", "alta", 92],
        fr: ["30", "irpm", "alta", 90],
        spo2: ["90", "%", "baixa", 18],
      },
      sintomas: {
        dor: ["7.0/10", 70, "Moderada", "Aperto torácico persistente e expiração prolongada.", "medio"],
        sudorese: ["8.0/10", 80, "Grave", "Sibilos difusos e tosse mais frequente.", "alto"],
        dispneia: ["8.0/10", 80, "Grave", "Fala entrecortada e uso de musculatura acessória.", "alto"],
      },
    },
    {
      sinais: {
        pa: ["136/84", "mmHg", "normal", 55],
        fc: ["124", "bpm", "alta", 96],
        fr: ["34", "irpm", "alta", 96],
        spo2: ["87", "%", "baixa", 12],
      },
      sintomas: {
        dor: ["8.0/10", 80, "Grave", "Aperto intenso e grande dificuldade para expirar.", "alto"],
        sudorese: ["8.5/10", 85, "Grave", "Fluxo de ar reduzido apesar do esforço intenso.", "alto"],
        dispneia: ["9.0/10", 90, "Grave", "Consegue pronunciar apenas poucas palavras por vez.", "alto"],
      },
    },
    {
      sinais: {
        pa: ["90/58", "mmHg", "baixa", 16],
        fc: ["132", "bpm", "alta", 100],
        fr: ["38", "irpm", "alta", 100],
        spo2: ["82", "%", "baixa", 7],
      },
      sintomas: {
        dor: ["9.0/10", 90, "Grave", "Exaustão e aperto torácico crítico.", "alto"],
        sudorese: ["9.0/10", 90, "Grave", "Entrada de ar muito reduzida, com risco de silêncio auscultatório.", "alto"],
        dispneia: ["10/10", 100, "Crítica", "Incapaz de completar frases e com sinais de exaustão.", "alto"],
      },
    },
    {
      sinais: {
        pa: ["136/84", "mmHg", "normal", 54],
        fc: ["102", "bpm", "alta", 78],
        fr: ["23", "irpm", "alta", 68],
        spo2: ["95", "%", "normal", 52],
      },
      sintomas: {
        dor: ["5.0/10", 50, "Moderada", "O aperto no peito começou a diminuir.", "medio"],
        sudorese: ["6.0/10", 60, "Moderado", "O chiado ainda existe, mas está menos intenso.", "medio"],
        dispneia: ["5.0/10", 50, "Moderada", "Já consegue falar frases um pouco maiores.", "medio"],
      },
    },
    {
      sinais: {
        pa: ["130/82", "mmHg", "normal", 50],
        fc: ["94", "bpm", "normal", 52],
        fr: ["20", "irpm", "normal", 50],
        spo2: ["97", "%", "normal", 62],
      },
      sintomas: {
        dor: ["3.0/10", 30, "Baixa", "Aperto leve, sem piora durante a fala.", "baixo"],
        sudorese: ["3.0/10", 30, "Baixa", "Chiado discreto e tosse ocasional.", "baixo"],
        dispneia: ["3.0/10", 30, "Baixa", "Respira com pouco esforço e fala frases completas.", "baixo"],
      },
    },
    {
      sinais: {
        pa: ["126/80", "mmHg", "normal", 48],
        fc: ["86", "bpm", "normal", 48],
        fr: ["18", "irpm", "normal", 45],
        spo2: ["98", "%", "normal", 68],
      },
      sintomas: {
        dor: ["1.0/10", 10, "Baixa", "Sem aperto relevante no peito.", "baixo"],
        sudorese: ["1.0/10", 10, "Baixa", "Chiado quase ausente e sem tosse no momento.", "baixo"],
        dispneia: ["1.0/10", 10, "Baixa", "Respira confortavelmente e fala normalmente.", "baixo"],
      },
    },

  ];
  function normalizarTexto(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function sinalizarInteracao(mensagem) {
    const feedback = document.querySelector("[data-ambiente-feedback]");
    if (feedback) feedback.textContent = mensagem;
  }


  function valorCss(valor) {
    return typeof valor === "number" ? valor + "px" : valor;
  }

  function configurarSprite(elemento, configuracao) {
    ["top", "right", "bottom", "left", "width", "height"].forEach((propriedade) => {
      if (configuracao[propriedade] !== undefined) {
        elemento.style[propriedade] = valorCss(configuracao[propriedade]);
      }
    });
    if (configuracao.zIndex !== undefined) elemento.style.zIndex = configuracao.zIndex;
    if (configuracao.asset) {
      elemento.style.backgroundImage = 'url("' + configuracao.asset + '")';
    }
    if (configuracao.backgroundPosition) {
      elemento.style.backgroundPosition = configuracao.backgroundPosition;
    }
    if (configuracao.backgroundSize) {
      elemento.style.backgroundSize = configuracao.backgroundSize;
    }
  }

  function criarCenario(configuracao) {
    const cena = document.querySelector(".ambiente-clinico__pixel-scene");
    if (!cena) return null;

    const sala = document.createElement("div");
    sala.className = "pixel-room";
    configurarSprite(sala, configuracao.sala);

    configuracao.objetos.forEach((objeto) => {
      const elemento = document.createElement("span");
      elemento.className = "pixel-prop";
      elemento.dataset.objeto = objeto.nome;
      configurarSprite(elemento, objeto);
      sala.append(elemento);
    });

    const personagem = document.createElement("span");
    personagem.className = "pixel-patient";
    personagem.setAttribute("aria-hidden", "true");
    configurarSprite(personagem, configuracao.personagem);

    sala.append(personagem);
    cena.replaceChildren(sala);
    return personagem;
  }

  const personagemVisual = criarCenario(casoMock.visual);

  function atualizarPersonagem(indiceEstado, pose) {
    const personagem = casoMock.visual.personagem;
    const configuracao = pose
      ? personagem.poses?.[pose]
      : personagem.estados[indiceEstado];
    if (!personagemVisual || !configuracao) return;

    personagemVisual.style.setProperty("--patient-frame-a", configuracao.frames[0]);
    personagemVisual.style.setProperty("--patient-frame-b", configuracao.frames[1]);
    personagemVisual.style.animationDuration = configuracao.velocidade;
    personagemVisual.dataset.pose = pose || `estado-${indiceEstado}`;
  }

  function interpretarMensagemDoEstudante(texto) {
    const mensagem = normalizarTexto(texto);
    const etapaCorreta = casoMock.avaliacao.sucesso.etapas.find((etapa) =>
      etapa.padroes.some((padrao) => mensagem.includes(normalizarTexto(padrao))),
    );

    if (etapaCorreta) return { ...etapaCorreta, resultado: "conduta_correta" };

    return casoMock.investigacoes
      .map((investigacao) => ({
        ...investigacao,
        resultado: "investigacao",
        corresponde: investigacao.padroes.some((padrao) =>
          mensagem.includes(normalizarTexto(padrao)),
        ),
      }))
      .find(({ corresponde }) => corresponde) || {
        ...casoMock.avaliacao.erro,
        resultado: "erro",
      };
  }

  const CHAVE_CRONOMETRO = "simuladorClinico." + ID_CASO + ".cronometro.v1";
  const DURACAO_SIMULACAO_MINUTOS = casoMock.duracaoMinutos;
  const DURACAO_SIMULACAO_MS = DURACAO_SIMULACAO_MINUTOS * 60 * 1000;
  const niveisDeAjuda = casoMock.ajudas;
  const PENALIDADES_AJUDA = [0, 2, 5, 10];
  let intervaloCronometro;
  let fimDaSimulacao;
  let atualizarCronometro;
  let segundosRestantesAtual = DURACAO_SIMULACAO_MINUTOS * 60;
  let errosCometidos = 0;
  let totalCondutas = 0;
  const achadosDescobertos = new Set();
  const condutasCorretas = new Set();
  let simulacaoEncerrada = false;
  let estadoClinicoAtual = 0;

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

  function aplicarEstadoClinico(indice, registrarEvolucao = true) {
    const indiceSeguro = Math.max(0, Math.min(indice, estadosClinicos.length - 1));
    const estado = estadosClinicos[indiceSeguro];
    if (registrarEvolucao) estadoClinicoAtual = Math.max(estadoClinicoAtual, indiceSeguro);
    if (!estado) return;

    const ambienteClinico = document.getElementById("ambiente-clinico");
    if (ambienteClinico) {
      const estadoVisual = indiceSeguro <= 3 ? indiceSeguro : 0;
      ambienteClinico.dataset.clinicalState = String(estadoVisual);
      atualizarPersonagem(estadoVisual);
    }

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

    const gravidades = [
      ["Grave", 2],
      ["Grave", 2],
      ["Grave", 2],
      ["Crítica", 2],
      ["Moderada", 1],
      ["Baixa", 0],
      ["Baixa", 0],
    ];
    const [rotuloGravidade, nivelGravidade] = gravidades[indiceSeguro];
    const gravidadeAtual = document.querySelector("[data-gravidade-atual]");
    const escalaGravidade = document.querySelector(".gravidade-escala");
    if (gravidadeAtual) gravidadeAtual.textContent = rotuloGravidade;
    if (gravidadeAtual) gravidadeAtual.dataset.nivel = String(nivelGravidade);
    document.querySelectorAll("[data-gravidade-nivel]").forEach((nivel) => {
      nivel.classList.toggle("gravidade-escala__nivel--ativo", Number(nivel.dataset.gravidadeNivel) === nivelGravidade);
    });
    if (escalaGravidade) escalaGravidade.setAttribute("aria-label", "Escala de gravidade: " + rotuloGravidade);
  }

  function iniciarCronometro() {
    if (!cronometro) return;

    fimDaSimulacao = Number(localStorage.getItem(CHAVE_CRONOMETRO));
    if (!Number.isFinite(fimDaSimulacao) || fimDaSimulacao <= Date.now()) {
      fimDaSimulacao = Date.now() + DURACAO_SIMULACAO_MS;
      localStorage.setItem(CHAVE_CRONOMETRO, String(fimDaSimulacao));
    }

    atualizarCronometro = () => {
      const segundosRestantes = Math.max(0, Math.ceil((fimDaSimulacao - Date.now()) / 1000));
      segundosRestantesAtual = segundosRestantes;
      const proporcaoRestante = segundosRestantes / (DURACAO_SIMULACAO_MINUTOS * 60);
      const estadoPeloTempo = proporcaoRestante <= 0.34 ? 2 : proporcaoRestante <= 0.67 ? 1 : 0;
      if (!simulacaoEncerrada && estadoPeloTempo > estadoClinicoAtual) aplicarEstadoClinico(estadoPeloTempo);
      const minutos = Math.floor(segundosRestantes / 60);
      const segundos = String(segundosRestantes % 60).padStart(2, "0");
      cronometro.textContent = `${minutos}:${segundos}`;
      cronometro.dateTime = `PT${segundosRestantes}S`;

      if (segundosRestantes === 0) {
        window.clearInterval(intervaloCronometro);
        encerrarSimulacao("tempo");
      }
    }

    intervaloCronometro = window.setInterval(atualizarCronometro, 1000);
    atualizarCronometro();
  }

  function formatarDuracao(totalSegundos) {
    const minutos = Math.floor(totalSegundos / 60);
    return `${minutos}:${String(totalSegundos % 60).padStart(2, "0")}`;
  }

  function preencherFeedbackFinal(motivo) {
    if (!feedbackFinal) return;
    const sucesso = motivo === "sucesso";
    const penalidadeAjuda = PENALIDADES_AJUDA[Math.min(maiorNivelAjuda, 3)];
    const autonomia = Math.max(0, 100 - penalidadeAjuda - errosCometidos * 15);
    const tempoUsado = DURACAO_SIMULACAO_MINUTOS * 60 - segundosRestantesAtual;
    const textos = sucesso
      ? {
          titulo: "Atendimento concluído com sucesso",
          resumo: casoMock.avaliacao.sucesso.resumo,
          acertos: casoMock.avaliacao.sucesso.acertos,
          melhorias: errosCometidos ? "Evite condutas sem efeito respiratório e priorize as três medidas indicadas." : casoMock.avaliacao.sucesso.melhoria,
        }
      : motivo === "tempo"
        ? {
            titulo: "Tempo esgotado",
            resumo: "O atendimento foi encerrado porque o limite do caso chegou a zero.",
            acertos: totalCondutas ? "Você iniciou a investigação e acompanhou a evolução clínica do paciente." : "Você observou os dados clínicos apresentados no início do caso.",
            melhorias: "Reconheça cedo a hipóxia e priorize oxigênio, broncodilatador e corticoide.",
          }
        : {
            titulo: "Paciente em agravamento crítico",
            resumo: "As condutas não controlaram o quadro e o paciente atingiu um desfecho clínico definitivo.",
            acertos: "Você completou " + condutasCorretas.size + " de " + casoMock.avaliacao.sucesso.etapas.length + " medidas corretas antes do encerramento.",
            melhorias: "Complete oxigênio, salbutamol e corticoide antes que a crise asmática se torne crítica.",
          };

    feedbackFinal.dataset.resultado = sucesso ? "sucesso" : "erro";
    feedbackFinal.querySelector("[data-feedback-tag]").textContent = sucesso ? "Caso resolvido" : "Caso encerrado";
    feedbackFinal.querySelector("[data-feedback-titulo]").textContent = textos.titulo;
    feedbackFinal.querySelector("[data-feedback-resumo]").textContent = textos.resumo;
    feedbackFinal.querySelector("[data-feedback-doenca]").textContent = `${casoMock.doenca.nome} (${casoMock.doenca.sigla})`;
    feedbackFinal.querySelector("[data-feedback-correlacao]").textContent = casoMock.doenca.explicacao;
    feedbackFinal.querySelector("[data-feedback-autonomia]").textContent = `${autonomia}%`;
    feedbackFinal.querySelector("[data-feedback-tempo]").textContent = formatarDuracao(Math.max(0, tempoUsado));
    feedbackFinal.querySelector("[data-feedback-condutas]").textContent = String(totalCondutas);
    feedbackFinal.querySelector("[data-feedback-ajuda]").textContent = maiorNivelAjuda ? `Nível ${maiorNivelAjuda}` : "Nenhuma";
    feedbackFinal.querySelector("[data-feedback-acertos]").textContent = textos.acertos;
    feedbackFinal.querySelector("[data-feedback-melhorias]").textContent = textos.melhorias;
  }

  function encerrarSimulacao(motivo) {
    if (simulacaoEncerrada) return;
    simulacaoEncerrada = true;
    window.clearInterval(intervaloCronometro);
    campo.disabled = true;
    enviar.disabled = true;
    if (botaoAvancarTempo) botaoAvancarTempo.disabled = true;
    const sucesso = motivo === "sucesso";
    if (sucesso) {
      atualizarPersonagem(0, casoMock.avaliacao.sucesso.pose);
      sinalizarInteracao("Atendimento concluído · paciente estabilizado");
    } else {
      aplicarEstadoClinico(3);
      sinalizarInteracao(motivo === "tempo" ? "Tempo esgotado" : "Agravamento crítico");
    }
    const ambiente = document.getElementById("ambiente-clinico");
    if (ambiente) ambiente.dataset.simulationResult = sucesso ? "sucesso" : "erro";
    preencherFeedbackFinal(motivo);
    window.setTimeout(() => {
      feedbackFinal.classList.add("feedback-final--aberto");
      feedbackFinal.setAttribute("aria-hidden", "false");
      botaoReiniciar?.focus();
    }, 1050);
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
  aplicarEstadoClinico(0);
  iniciarCronometro();

  function enviarMensagem() {
    if (simulacaoEncerrada) return;
    const conteudo = campo.value.trim();
    if (!conteudo) return;
    totalCondutas += 1;

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
    sinalizarInteracao("Paciente elaborando a resposta…");

    adicionarRespostaPaciente();
  }

  function adicionarRespostaPaciente() {
    const ultimaMensagem = [...mensagens]
      .reverse()
      .find(({ remetente }) => remetente === "medico");
    const interacao = interpretarMensagemDoEstudante(ultimaMensagem?.conteudo || "");

    window.setTimeout(() => {
      const respostaComHorario = {
        remetente: "paciente",
        conteudo: interacao.resposta,
        criadaEm: new Date().toISOString(),
      };
      mensagens = [...mensagens, respostaComHorario];
      salvarRegistro(mensagens);
      registro.append(criarMensagem(respostaComHorario));
      registro.scrollTop = registro.scrollHeight;
      if (interacao.resultado === "conduta_correta") {
        const totalEtapas = casoMock.avaliacao.sucesso.etapas.length;
        if (condutasCorretas.has(interacao.id)) {
          sinalizarInteracao(`Conduta já realizada · ${condutasCorretas.size}/${totalEtapas}`);
          return;
        }
        condutasCorretas.add(interacao.id);
        aplicarEstadoClinico(3 + condutasCorretas.size, false);
        sinalizarInteracao(`Conduta correta · ${condutasCorretas.size}/${totalEtapas}`);
        if (condutasCorretas.size === totalEtapas) encerrarSimulacao("sucesso");
        return;
      }

      if (interacao.resultado === "investigacao") {
        achadosDescobertos.add(interacao.achado);
        const listaAchados = document.querySelector("[data-achados-descobertos]");
        const areaAchados = document.querySelector("[data-area-achados]");
        if (listaAchados && areaAchados) {
          listaAchados.replaceChildren(...Array.from(achadosDescobertos, (achado) => {
            const item = document.createElement("li");
            item.textContent = achado;
            return item;
          }));
          areaAchados.hidden = false;
        }
        sinalizarInteracao(`Novo achado descoberto · ${interacao.achado}`);
        return;
      }

      errosCometidos += 1;
      const maxErros = casoMock.avaliacao.erro.maxErros;
      aplicarEstadoClinico(Math.min(estadoClinicoAtual + 1, 3));
      sinalizarInteracao(`${interacao.feedback} · ${errosCometidos}/${maxErros}`);
      if (estadoClinicoAtual >= 3 || errosCometidos >= maxErros) encerrarSimulacao("agravamento");
    }, 650);
  }

  campo.addEventListener("input", () => {
    sinalizarInteracao(
      campo.value.trim() ? "Paciente ouvindo…" : "Paciente em avaliação",
    );
  });
  campo.addEventListener("focus", () =>
    sinalizarInteracao("Paciente aguardando sua pergunta"),
  );
  campo.addEventListener("blur", () => {
    if (!campo.value.trim()) sinalizarInteracao("Paciente em avaliação");
  });

  enviar.addEventListener("click", enviarMensagem);
  campo.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    enviarMensagem();
  });

  let ultimoElementoFocado;
  let nivelDeAjudaAtual = 0;
  let maiorNivelAjuda = 0;

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
    maiorNivelAjuda = Math.max(maiorNivelAjuda, nivelDeAjudaAtual);

    const proximaAjuda = niveisDeAjuda[nivelDeAjudaAtual];
    if (proximaAjuda) {
      botaoAvancarAjuda.textContent = "Mostrar " + proximaAjuda.titulo.toLowerCase();
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
  botaoAvancarTempo?.addEventListener("click", () => {
    if (simulacaoEncerrada || !Number.isFinite(fimDaSimulacao)) return;
    const segundosDeAvanco = casoMock.avancoTempoSegundos || 60;
    fimDaSimulacao -= segundosDeAvanco * 1000;
    localStorage.setItem(CHAVE_CRONOMETRO, String(fimDaSimulacao));
    atualizarCronometro();
    if (!simulacaoEncerrada) sinalizarInteracao("Tempo avançado em " + segundosDeAvanco + "s · quadro reavaliado");
  });
  botaoReiniciar?.addEventListener("click", () => {
    localStorage.removeItem(CHAVE_REGISTRO);
    localStorage.removeItem(CHAVE_CRONOMETRO);
    window.location.reload();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && modalProtocolos.classList.contains("modal--aberto")) {
      fecharProtocolos();
    }
  });
})();