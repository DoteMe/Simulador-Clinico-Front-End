# Simulador Clínico

Protótipo front-end de uma simulação clínica conversacional. O estudante digita uma conduta, o mock classifica a entrada como sucesso ou erro e atualiza a resposta do paciente, os sinais, os sintomas e a animação.

A versão atual contém o caso **Crise asmática aguda**, com o paciente simulado **Carlos Mendes**. O diagnóstico fica oculto durante a investigação e é revelado no feedback final.

## Executando

Não há build nem dependências externas. Abra `index.html` diretamente ou execute:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Estrutura

- `index.html`: estrutura semântica da tela e fallbacks visuais.
- `js/caso-mock.js`: configuração do caso, cenário, objetos, personagem, poses, ajuda e regras de sucesso/erro.
- `js/simulacao.js`: motor que monta o cenário e executa o mock.
- `css/style.css`: layout, componentes e responsividade; não contém recortes específicos dos assets.
- `assets/pixel-hospital/`: folhas de sprites.
- `assets/THIRD_PARTY_NOTICES.md`: origem e situação de licença dos assets.

## Mock atual

### Caso clínico: crise asmática aguda

A doença deste mock é uma **exacerbação aguda de asma**, conhecida de forma mais simples como **crise asmática**. Durante a crise, os brônquios ficam inflamados e estreitos, dificultando principalmente a saída do ar. Isso explica o chiado, o aperto no peito, a tosse, a respiração acelerada e a queda da saturação.

O diagnóstico fica oculto durante a simulação. O estudante recebe a queixa, observa os sinais vitais, pode investigar achados adicionais e vê o nome da doença no feedback final.

#### Paciente e sintomas

- **Paciente:** Carlos Mendes, consciente e recém-chegado.
- **Queixa principal:** falta de ar e chiado iniciados há aproximadamente 30 minutos.
- **Sintomas visíveis:** falta de ar, chiado, tosse seca, aperto no peito e dificuldade para falar frases longas.
- **Achado oculto:** sibilos difusos, revelados ao perguntar sobre o chiado ou a ausculta.
- **Gatilho oculto:** contato recente com muita poeira.
- **Antecedente oculto:** asma desde a infância e falta da medicação de resgate.

#### Evolução mockada

| Estado  | PA          | FC      | FR      | SpO₂ | Interpretação                                                |
| ------- | ----------- | ------- | ------- | ---- | ------------------------------------------------------------ |
| Inicial | 138/86 mmHg | 108 bpm | 26 irpm | 92%  | Broncoespasmo, taquicardia e hipóxia leve.                   |
| Piora 1 | 144/90 mmHg | 116 bpm | 30 irpm | 90%  | Maior esforço respiratório e dificuldade para falar.         |
| Piora 2 | 136/84 mmHg | 124 bpm | 34 irpm | 87%  | Hipoxemia e fluxo de ar bastante reduzido.                   |
| Crítico | 90/58 mmHg  | 132 bpm | 38 irpm | 82%  | Exaustão respiratória e risco de insuficiência respiratória. |

O tempo e as condutas incorretas fazem o caso avançar. Ao chegar ao estado crítico, o personagem fica de costas e a simulação termina.

#### Três medidas necessárias para o sucesso

O sucesso não depende mais de uma única frase. O estudante precisa registrar três medidas diferentes, em qualquer ordem:

1. **Oxigênio suplementar** — reconhecido por `oxigênio`, `O2` ou `máscara de oxigênio`.
2. **Salbutamol inalatório** — reconhecido por `salbutamol`, `broncodilatador` ou `nebulização`.
3. **Corticoide sistêmico** — reconhecido por `corticoide`, `corticosteroide`, `prednisona` ou `prednisolona`.

Cada medida correta aparece no HUD como `1/3`, `2/3` ou `3/3` e atualiza imediatamente sintomas, gravidade e sinais vitais. As barras verticais acompanham essas mudanças com animação. Repetir a mesma medida não aumenta a contagem. O caso só termina com sucesso quando as três forem concluídas; então o personagem apresenta a pose de joinha.

O placeholder do campo contém o roteiro curto `oxigênio → salbutamol → corticoide` para facilitar a demonstração.

#### Outras interações

- Perguntas sobre chiado, gatilhos ou histórico revelam achados sem penalidade.
- Uma frase que não corresponda a investigação nem a uma das três medidas agrava o paciente.
- O botão `Avançar +1 min` reduz o tempo do caso em um minuto e aplica a evolução clínica correspondente.
- O feedback final mostra a doença, correlação clínica, autonomia, tempo, número de condutas, ajuda utilizada e pontos de aprendizado.

#### Autonomia

A autonomia começa em 100%. Cada conduta incorreta reduz 15 pontos. A maior ajuda clínica utilizada desconta 2, 5 ou 10 pontos, conforme o nível.

> Este é um mock simplificado para demonstração de software. Ele não substitui protocolos institucionais nem orientação médica real.

## Criando um caso mockado

### 1. Duplique e identifique o caso

Edite `js/caso-mock.js`:

```js
window.CASO_MOCK = {
  id: "crise-asmatica",
  duracaoMinutos: 7,
  // ...
};
```

Use um `id` novo para separar conversa e cronômetro no `localStorage`.

### 2. Configure as medidas de sucesso e o erro

Cada item de `etapas` representa uma medida obrigatória. Os IDs precisam ser únicos e a ordem digitada pelo estudante não importa.

```js
avaliacao: {
  sucesso: {
    etapas: [
      {
        id: "oxigenio",
        rotulo: "Oxigênio suplementar",
        padroes: ["oxigenio", "o2"],
        resposta: "Consigo respirar um pouco melhor.",
      },
      {
        id: "salbutamol",
        rotulo: "Salbutamol inalatório",
        padroes: ["salbutamol", "broncodilatador"],
        resposta: "O chiado começou a diminuir.",
      },
      {
        id: "corticoide",
        rotulo: "Corticoide sistêmico",
        padroes: ["corticoide", "prednisona"],
        resposta: "A equipe administrou o corticoide.",
      },
    ],
    pose: "sucesso",
    resumo: "As três medidas foram realizadas.",
    acertos: "Descrição do que o estudante fez corretamente.",
    melhoria: "Orientação para a próxima tentativa.",
  },
  erro: {
    resposta: "O quadro piorou.",
    feedback: "Conduta não reconhecida",
    maxErros: 3,
  },
},
```

O motor normaliza acentos, aceita qualquer padrão de cada etapa e impede que uma medida repetida aumente a contagem. Uma frase que não corresponda a uma investigação nem a uma etapa é tratada como erro.

### 3. Configure o cenário

A geometria da sala e dos objetos é declarada em `visual`. Os móveis clínicos são componentes CSS estáveis, sem recortes de folhas de sprites:

```js
visual: {
  sala: { width: 600, height: 500 },
  objetos: [
    { nome: "maca-exame", top: 318, left: 28, width: 228, height: 104 },
    { nome: "monitor", top: 150, right: 36, width: 118, height: 180 },
  ],
}
```

Para adicionar um objeto, inclua outro item no array. Para remover, apague apenas sua configuração.

### 4. Configure o personagem

```js
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
}
```

Cada estado informa dois quadros da folha e a velocidade da animação. A pose `sucesso` usa especificamente o par do personagem fazendo joinha e só é aplicada depois das três medidas corretas.

O personagem é filho de `.pixel-room` e usa `left: "50%"`; por isso permanece centralizado na sala em celular, tablet e desktop. Para subir ou descer o conjunto sem quebrar a responsividade, altere apenas o deslocamento vertical de `.pixel-room`, nunca a posição isolada do personagem.

### 5. Atualize os dados clínicos

Em `js/simulacao.js`, altere `mensagemInicial` e `estadosClinicos`.

Um sinal vital usa:

```js
spo2: ["91", "%", "baixa", 22];
//      valor unidade nível  altura visual
```

Um sintoma usa:

```js
dispneia: ["8.0/10", 80, "Grave", "Fala entrecortada.", "alto"];
```

Mantenha as chaves correspondentes aos atributos `data-sinal-valor` e `data-sintoma` do HTML.

### 6. Configure a ajuda

Os itens de `ajudas` ficam no próprio `caso-mock.js`:

```js
{
  titulo: "Conduta sugerida",
  texto: "Administre o tratamento esperado pelo mock.",
  impacto: "Ajuda utilizada · Impacto na autonomia: -10%.",
}
```

O botão seguinte é gerado pelo título, portanto não fica vazio.

### 7. Atualize o perfil visível

Em `index.html`, altere nome, iniciais, contexto de chegada e queixa principal. Os valores iniciais de sinais e sintomas são fallbacks; o JavaScript aplica o primeiro estado ao carregar.

### 8. Reinicie e teste

Para limpar o caso atual:

```js
localStorage.removeItem("simuladorClinico.dor-toracica.registro.v2");
localStorage.removeItem("simuladorClinico.dor-toracica.cronometro.v1");
location.reload();
```

Checklist:

- testar uma frase de sucesso;
- testar qualquer frase de erro;
- confirmar respostas e cores do resultado;
- conferir pose inicial, giros progressivos, costas no desfecho negativo e joinha no sucesso;
- conferir o feedback final nos três desfechos;
- testar o botão `Avançar +1 min` e conferir a piora dos sinais;
- percorrer todos os níveis da ajuda;
- testar desktop, tablet e celular.

## Assets

O personagem usa o pacote `Assets Pixel Art - Hospital.zip`, fornecido pelo responsável do projeto. A sala e os móveis são desenhados pela interface para evitar recortes inconsistentes das folhas de sprites. O arquivo recebido não contém licença; confirme os direitos de redistribuição antes de publicar.


# Integração de Cálculo I ao Simulador Clínico — LXP Moinhos

**Disciplina:** Cálculo (Differentiated Problem Solving)
**Projeto:** Simulador Clínico — LXP Moinhos (Challenge FIAP × Hospital Moinhos de Vento)
**Caso clínico:** Exacerbação aguda de asma (crise asmática) — paciente simulado Carlos Mendes

## Integrantes do grupo

Integrantes: 
• RM 573865 – João Victor Sant'Ana Cortabitart 
• RM 574025 – João Victor Barbon Naymayer 
• RM 573678 – João Vitor Dutra de Freitas

---

## 1. Objetivo

Integrar os conceitos de **limite** e **derivada** (Cálculo I) ao Simulador Clínico já desenvolvido pelo grupo, **sem criar uma calculadora matemática separada**. A matemática analisa a evolução dos sinais vitais que o próprio simulador já possui e aparece na interface como uma ferramenta de interpretação e apoio à decisão, na tela de resultado final do atendimento.

## 2. Fenômeno analisado

> Como a saturação de oxigênio (SpO₂) do paciente varia ao longo do tempo, e como essa variação muda durante a piora e a recuperação do quadro clínico.

Como segundo indicador, comparamos esse comportamento com o da **frequência respiratória (FR)**, que evolui no sentido oposto ao da SpO₂ no mesmo caso.

## 3. Variáveis

| Variável | Significado | Unidade |
| --- | --- | --- |
| `t` | tempo da simulação (cada estado clínico já existente no simulador corresponde a 1 minuto) | min |
| `S(t)` | saturação de oxigênio (SpO₂) em função do tempo — indicador principal | % |
| `FR(t)` | frequência respiratória em função do tempo — segundo indicador, usado por comparação | irpm |

## 4. Dados utilizados

Os dados **já existiam** no arquivo `js/simulacao.js` (array `estadosClinicos`, 7 estados clínicos do caso). Nenhum dado foi inventado; a matemática apenas lê esses valores:

| t (min) | SpO₂ (%) | FR (irpm) |
| :-: | :-: | :-: |
| 0 | 92 | 26 |
| 1 | 90 | 30 |
| 2 | 87 | 34 |
| 3 | 82 | 38 |
| 4 | 95 | 23 |
| 5 | 97 | 20 |
| 6 | 98 | 18 |

## 5. Onde a derivada é utilizada

A derivada é aproximada numericamente pela taxa de variação média entre dois estados consecutivos:

```
taxa de variação = (S(t2) − S(t1)) / (t2 − t1)
```

Implementada de forma independente em `js/simulacao.js`:

```js
function calcularTaxaVariacao(valorAtual, valorAnterior, tempoAtual, tempoAnterior) {
  return (valorAtual - valorAnterior) / (tempoAtual - tempoAnterior);
}
```

Essa mesma função é reaproveitada tanto para a SpO₂ quanto para a FR. Resultado no caso simulado:

| Intervalo | Taxa de variação da SpO₂ |
| --- | --- |
| 0 → 1 min | −2 %/min |
| 1 → 2 min | −3 %/min |
| 2 → 3 min | **−5 %/min (maior queda)** |
| 3 → 4 min | **+13 %/min (maior recuperação)** |
| 4 → 5 min | +2 %/min |
| 5 → 6 min | +1 %/min |

A queda fica cada vez mais rápida até o minuto 3 (piora) e depois se torna fortemente positiva (recuperação após as condutas), confirmando o padrão descrito no fenômeno analisado.

## 6. Onde o limite é utilizado

Dois usos distintos do conceito de limite foram implementados:

**a) Aproximação do ponto de maior agravamento (o limite propriamente dito)**

À medida que `t` se aproxima de 3 minutos pela esquerda, `S(t)` se aproxima de 82% — o ponto de maior agravamento do caso:

```
lim S(t), quando t → 3⁻, = 82
```

**b) Limite de atenção definido para a simulação (regra do jogo)**

```js
function verificarLimiteSpO2(spo2, limite) {
  return spo2 < limite;
}
```

Valor de referência: **90% de SpO₂**. Quando a série cruza esse valor, a interface exibe um alerta. Esse limite é uma regra definida pelo grupo para esta simulação, **não uma recomendação médica universal**.

## 7. Segundo indicador: frequência respiratória (FR)

Depois de validar a SpO₂, a mesma lógica foi reaplicada à FR, permitindo comparar dois indicadores com comportamentos opostos:

| Indicador | Padrão observado |
| --- | --- |
| SpO₂ | cai durante a piora → sobe durante a recuperação |
| FR | sobe durante a piora → cai durante a recuperação |

No caso simulado: maior aumento da FR de **+4 irpm/min** (piora) e maior redução de **−15 irpm/min** (recuperação), entre os minutos 3 e 4 — exatamente quando a SpO₂ também vira para a recuperação.

## 8. Como o resultado aparece na interface

Ao final do atendimento (tela de resultado), uma nova seção **"Análise Matemática da Evolução"** é exibida com:

1. gráfico SpO₂ × tempo, com a linha horizontal do limite de atenção;
2. indicadores numéricos (SpO₂ final, maior queda, maior recuperação, limite usado, tendência);
3. texto interpretativo gerado automaticamente (nenhum número é digitado manualmente no HTML);
4. bloco do segundo indicador (FR), com o comparativo entre os dois sinais.

![Seção Análise Matemática da Evolução](assets/calculo/analise-matematica-evolucao.png)

## 9. Como essa matemática ajuda o usuário

A derivada permite identificar não apenas se a SpO₂ está subindo ou descendo, mas **a velocidade** dessa mudança. O limite permite observar a aproximação do paciente a uma condição crítica definida na simulação. Juntas, essas ferramentas ajudam o estudante a interpretar a **tendência** de evolução do caso — e não só o valor pontual de um sinal vital — e a relacionar suas condutas com essa evolução.

## 10. Implementação técnica

| Arquivo | O que foi adicionado |
| --- | --- |
| `js/simulacao.js` | Módulo independente de análise matemática (funções de derivada, limite, série de dados, interpretação e gráfico SVG). Não altera `estadosClinicos` nem a lógica original do simulador. |
| `index.html` | Seção `"Análise Matemática da Evolução"` dentro da tela de resultado final (`#feedback-final`). |
| `css/style.css` | Estilos da nova seção, seguindo a mesma paleta e os mesmos componentes já usados no restante da interface. |

Principais funções criadas: `calcularTaxaVariacao`, `verificarLimiteSpO2`, `construirSerieDoSinal`, `calcularIntervalosDeVariacao`, `calcularAnaliseMatematica`, `calcularAnaliseFR`, `gerarTextoInterpretativo`, `gerarTextoComparativoFR`, `construirGraficoSvg`, `renderizarAnaliseMatematica`.

## 11. Como executar e ver a análise

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`, converse com o paciente (ou use o botão **"Avançar +1 min"** repetidamente) até o atendimento ser encerrado. A seção de análise matemática aparece automaticamente na tela de resultado.

## 12. O que este trabalho **não** faz (limitações intencionais)

- Não cria uma tela separada só para matemática — a análise fica integrada ao resultado do atendimento.
- Não digita nenhum resultado manualmente no HTML — todos os números vêm do cálculo em JavaScript.
- Não substitui os dados clínicos nem a lógica original do simulador.
- Não transforma o projeto em um sistema médico real.
- Não apresenta o limite de 90% como uma regra médica universal, nem afirma que a derivada, sozinha, determina o estado clínico real de uma pessoa.

## 13. Referências

- Guia de Implementação da Matemática no Simulador (documento interno do grupo, base desta implementação).
- README principal do projeto: [`README.md`](README.md).