import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
import { workerEvents } from "../events/constants.js";

console.log("Model training worker initialized");
let _globalCtx = {};

const WEIGHTS = {
  category: 0.4,
  color: 0.3,
  price: 0.2,
  age: 0.1,
};

// Normalize values using the same pattern as the training data
// example: min_age = 25, max_age = 40, so (29 - 25) / (40 - 25) = 0.26
const normalize = (value, min, max) => {
  return (value - min) / (max - min || 1);
};

function makeContext(products, users) {
  const ages = users.map((user) => user.age);
  const prices = products.map((product) => product.price);

  // normalicação dos dados para o modelo, pra poder transformar em one-hot 0-1 values
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const colors = [...new Set(products.map((product) => product.color))];
  const categories = [...new Set(products.map((product) => product.category))];

  const colorIndex = Object.fromEntries(
    colors.map((color, index) => [color, index]),
  );

  const categoriesIndex = Object.fromEntries(
    categories.map((category, index) => [category, index]),
  );

  // Computar a média de idade dos compradores por produto
  // (ajuda a personalizar)
  const midAge = (minAge + maxAge) / 2;
  const ageSums = {};
  const ageCounts = {};

  users.forEach((user) => {
    user.purchases.forEach((purchase) => {
      // pegando a soma das dades que comprara cada produto e o numero de compras de cada produto
      ageSums[purchase.name] = (ageSums[purchase.name] || 0) + user.age;
      ageCounts[purchase.name] = (ageCounts[purchase.name] || 0) + 1;
    });
  });

  const normalizedProductAveragePerAge = Object.fromEntries(
    products.map((product) => {
      const avg = ageCounts[product.name]
        ? ageSums[product.name] / ageCounts[product.name]
        : midAge;

      return [product.name, normalize(avg, minAge, maxAge)];
    }),
  );

  const numCategories = categories.length;
  const numColors = colors.length;

  return {
    products,
    users,
    colorIndex,
    categoriesIndex,
    minAge,
    maxAge,
    minPrice,
    maxPrice,
    numCategories,
    numColors,
    normalizedProductAveragePerAge,

    // price + age + colors + categories
    dimentions: 2 + numCategories + numColors,
  };
}

const oneHotWeighted = (index, length, weight) =>
  tf.oneHot(index, length).cast("float32").mul(weight);

function encodeProduct(product, context) {
  // normalizando pra ficar entre 0 e 1 e aplicar o peso
  const price = tf.tensor1d([
    normalize(product.price, context.minPrice, context.maxPrice) *
      WEIGHTS.price,
  ]);

  const age = tf.tensor1d([
    context.normalizedProductAveragePerAge[product.name] ?? 0.5,
  ]);

  const category = oneHotWeighted(
    context.categoriesIndex[product.category],
    context.numCategories,
    WEIGHTS.category,
  );

  const color = oneHotWeighted(
    context.colorIndex[product.color],
    context.numColors,
    WEIGHTS.color,
  );

  return tf.concat1d([price, age, category, color]);
}

function encodeUser(user, context) {
  if (user.purchases.length) {
    return tf
      .stack(user.purchases.map((product) => encodeProduct(product, context)))
      .mean(0)
      .reshape([1, context.dimentions]);
  }
}

// vamos usar pra gerar os dados de treinamento dos nossos usuarios da base
// criar um tensor pra cada usuario de acordo com seu historico de compras
function createTrainingData(context) {
  const inputs = [];
  const labels = [];

  context.users.forEach((user) => {
    const userVector = encodeUser(user, context).dataSync();

    context.products.forEach((product) => {
      const productVector = encodeProduct(product, context).dataSync();

      const label = user.purchases.some((purchase) =>
        purchase.name === product.name ? 1 : 0,
      );

      // combinar user + product
      inputs.push([...userVector, ...productVector]);
      labels.push(label);
    });
  });

  return {
    xs: tf.tensor2d(inputs),
    ys: tf.tensor2d(labels, [labels.length, 1]),
    inputDimention: context.dimentions * 2,
    // 2 pq o tamanho vai ser userVector + productVector
  };
}

async function trainModel({ users }) {
  console.log("Training model with users:", users);

  postMessage({
    type: workerEvents.progressUpdate,
    progress: { progress: 50 },
  });

  const products = await (await fetch("/data/products.json")).json();

  const context = makeContext(products, users);
  context.productVectors = products.map((product) => {
    return {
      name: product.name,
      meta: { ...product },
      vector: encodeProduct(product, context).dataSync(),
    };
  });

  _globalCtx = context;

  const trainData = createTrainingData(context);

  postMessage({
    type: workerEvents.trainingLog,
    epoch: 1,
    loss: 1,
    accuracy: 1,
  });

  setTimeout(() => {
    postMessage({
      type: workerEvents.progressUpdate,
      progress: { progress: 100 },
    });
    postMessage({ type: workerEvents.trainingComplete });
  }, 1000);
}
function recommend(user, ctx) {
  console.log("will recommend for user:", user);
  // postMessage({
  //     type: workerEvents.recommend,
  //     user,
  //     recommendations: []
  // });
}

const handlers = {
  [workerEvents.trainModel]: trainModel,
  [workerEvents.recommend]: (d) => recommend(d.user, _globalCtx),
};

self.onmessage = (e) => {
  const { action, ...data } = e.data;
  if (handlers[action]) handlers[action](data);
};
