const modelURL = "https://wilsonmath.github.io/Recycle-ML/recyle/model.json";
const metadataURL = "https://wilsonmath.github.io/Recycle-ML/recyle/metadata.json";

let model, webcam, labelContainer, maxPredictions;
async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
}
async function startWebcam() {
  if (webcam) {
    webcam.stop();
    webcam = null;
  }

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  const container = document.getElementById("webcam-container");
  container.innerHTML = "";
  container.appendChild(webcam.canvas);
}


async function loop() {
  webcam.update();
  await predict(webcam.canvas);
  window.requestAnimationFrame(loop);
}


async function predict(input) {
  const prediction = await model.predict(input);
  let bestPrediction = null;
  let maxProbability = 0;

  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > maxProbability) {
      maxProbability = prediction[i].probability;
      bestPrediction = prediction[i];
    }
  }
  labelContainer.innerHTML = "";
  if (bestPrediction) {
    const resultText = bestPrediction.className; 
    const resultElement = document.createElement("div");
    resultElement.innerHTML = resultText;
    resultElement.style.fontSize = "24px";
    resultElement.style.fontWeight = "bold";
    
    labelContainer.appendChild(resultElement);
  }
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    if (webcam) {
      webcam.stop();
      webcam = null;
    }

    const container = document.getElementById("webcam-container");
    container.innerHTML = "";
    img.width = 200;
    img.height = 200;
    container.appendChild(img);

    await predict(img);
  };
}

init();
