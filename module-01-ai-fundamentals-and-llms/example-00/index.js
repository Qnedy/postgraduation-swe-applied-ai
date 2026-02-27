import tf from "@tensorflow/tfjs-node";

// com tensorflow js a gente tem tensores e adicionamos
// fluxos de dados para treinar o modelo,
// e depois usamos o modelo para fazer previsões.
async function trainModel(inputXs, outputYs) {
  const model = tf.sequential();

  // primeira cada oculta da rede:
  // entrada de 7 posições (idade normalizada + 3 cores + 3 localizações)

  // 80 neuronios = aqui usamos tudo isso pq tem pouca base de treino
  // quanto mais neuronios, mais complexidade a rede pode aprender
  // e consequentemente, mais processamento ela vai usar

  // a ReLU age como um filtro:
  // é como se ela deixasse somente os dados interessantes seguirem na rede
  // se a informação chegou nesse neurônio, é porque ela tem um valor positivo e é relevante para o aprendizado
  // ou seja, se e positivo deixa passar, se e zero ou negativa, pode jogar fora.
  model.add(
    tf.layers.dense({ inputShape: [7], units: 80, activation: "relu" }),
  );

  // saída: 3 neuronios
  // 1 para cada categoria (premium, medium, basic)
  // activation softmax que basicamente normaliza a saida em probabilidades
  model.add(tf.layers.dense({ units: 3, activation: "softmax" }));

  // compilando o modelo
  // usando o optimizer adam (Adaptative Moment Estimation)
  // é um treinador pessoal moderno para redes neurais
  // ele ajusta os pesos de forma eficiente e inteligente
  // aprende com o historico de erros e acertos

  // loss categoricalCrossentropy
  // compara o que o modelo "acha" (os scores de cada caterogira)
  // com a resposta certa

  // categoricalCrossentropy usa em classificação de imagens, recomendação,
  // categorização de usuários
  // qualquer coisa em que a resposta certa é "apenas uma entre várias possíveis"

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"], // opcional, para acompanhar a acurácia durante o treino
  });

  // Treinamento do modelo
  await model.fit(inputXs, outputYs, {
    verbose: 0, // desabilita o log interno, usamos so o callback
    epochs: 100, // qtd de vezes que vai rodar no dataset
    shuffle: true, // embaralha os dados para evitar viés
    callbacks: {
      // onEpochEnd: (epoch, logs) =>
      //   console.log(`Epoch: ${epoch}: loss = ${logs.loss}`),
    },
  });

  return model;
}

// Exemplo de pessoas para treino (cada pessoa com idade, cor e localização)
// const pessoas = [
//     { nome: "Erick", idade: 30, cor: "azul", localizacao: "São Paulo" },
//     { nome: "Ana", idade: 25, cor: "vermelho", localizacao: "Rio" },
//     { nome: "Carlos", idade: 40, cor: "verde", localizacao: "Curitiba" }
// ];

// Vetores de entrada com valores já normalizados e one-hot encoded
// Ordem: [idade_normalizada, azul, vermelho, verde, São Paulo, Rio, Curitiba]
// const tensorPessoas = [
//     [0.33, 1, 0, 0, 1, 0, 0], // Erick
//     [0, 0, 1, 0, 0, 1, 0],    // Ana
//     [1, 0, 0, 1, 0, 0, 1]     // Carlos
// ]

// Usamos apenas os dados numéricos, como a rede neural só entende números.
// tensorPessoasNormalizado corresponde ao dataset de entrada do modelo.
const tensorPessoasNormalizado = [
  [0.33, 1, 0, 0, 1, 0, 0], // Erick
  [0, 0, 1, 0, 0, 1, 0], // Ana
  [1, 0, 0, 1, 0, 0, 1], // Carlos
];

// Labels das categorias a serem previstas (one-hot encoded)
// [premium, medium, basic]
const labelsNomes = ["premium", "medium", "basic"]; // Ordem dos labels
const tensorLabels = [
  [1, 0, 0], // premium - Erick
  [0, 1, 0], // medium - Ana
  [0, 0, 1], // basic - Carlos
];

// Criamos tensores de entrada (xs) e saída (ys) para treinar o modelo
const inputXs = tf.tensor2d(tensorPessoasNormalizado);
const outputYs = tf.tensor2d(tensorLabels);

//output é o objeto ou labels no formato que deve ser a saida

// inputXs.print();
// outputYs.print();

// quanto mais dados melhor
// assim o algoritmo consegue entender melhor os padroes complexos dos dados
const model = trainModel(inputXs, outputYs);
