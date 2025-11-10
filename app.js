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
  // Stop existing webcam if running
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
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = `${prediction[i].className}: ${prediction[i].probability.toFixed(2)}`;
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    // Stop webcam if running
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
