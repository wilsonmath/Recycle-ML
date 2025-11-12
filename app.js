var modelURL = "https://wilsonmath.github.io/Recycle-ML/recyle/model.json";
var metadataURL = "https://wilsonmath.github.io/Recycle-ML/recyle/metadata.json";

let model, webcam, maxPredictions;
let currentKey = null;
let recycledCurrentImage = false;

const nameToKey = {
  "plastic bottle": "Plastic",
  "plastic bott...": "Plastic",
  "paper": "Paper",
  "aluminum can": "Metal",
};

let recycleData = JSON.parse(localStorage.getItem("recycleData")) || {
  plastic: 0,
  paper: 0,
  metal: 0
};

function updateDashboard() {
  document.getElementById("plasticnum").textContent = recycleData.Plastic || 0;
  document.getElementById("papernum").textContent = recycleData.Paper || 0;
  document.getElementById("metalnum").textContent = recycleData.Metal || 0;
}

async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
  updateDashboard();
}

async function startWebcam() {
  if (webcam) { webcam.stop(); webcam = null; }
  const flip = true;
  webcam = new tmImage.Webcam(300, 300, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
  const container = document.getElementById("webcam-container");
  container.innerHTML = "";
  container.appendChild(webcam.canvas);
}

async function loop() {
  webcam.update();
  setTimeout(() => predict(webcam.canvas), 100);
  window.requestAnimationFrame(loop);
}

async function predict(input) {
  recycledCurrentImage = false;
  const msg = document.getElementById("recycle-msg");
  msg.textContent = "";

  const prediction = await model.predict(input);
  let best = null;
  let bestProb = 0;
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > bestProb) {
      bestProb = prediction[i].probability;
      best = prediction[i];
    }
  }

  const predictionText = document.getElementById("prediction-text");
  const recycleBtn = document.getElementById("recycleBtn");

  if (best && bestProb > 0.5) {
    const key = nameToKey[best.className.toLowerCase()] || best.className.toLowerCase();
    currentKey = key;
    predictionText.textContent = best.className;
    recycleBtn.disabled = recycledCurrentImage;
  } else {
    currentKey = null;
    predictionText.textContent = "Uncertain, try again";
    recycleBtn.disabled = true;
  }
}

document.getElementById("recycleBtn").onclick = function() {
  if (!currentKey || recycledCurrentImage) return;
  if (recycleData[currentKey] === undefined) recycleData[currentKey] = 0;
  recycleData[currentKey]++;
  localStorage.setItem("recycleData", JSON.stringify(recycleData));
  updateDashboard();
  recycledCurrentImage = true;
  this.disabled = true;

  const msg = document.getElementById("recycle-msg");
  msg.textContent = `Added ${currentKey} to dashboard!`;
  setTimeout(() => { msg.textContent = ""; }, 3000);
};

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async function() {
    if (webcam) { webcam.stop(); webcam = null; }
    const container = document.getElementById("webcam-container");
    container.innerHTML = "";
    img.width = 300; img.height = 300;
    container.appendChild(img);
    predict(img);
  };
}

init();
