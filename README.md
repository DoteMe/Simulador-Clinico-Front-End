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
