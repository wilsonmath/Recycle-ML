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
  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);
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
    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(img);
    await predict(img);
  };
}
init();
