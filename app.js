var modelURL = "https://wilsonmath.github.io/Recycle-ML/recyle/model.json";
var metadataURL = "https://wilsonmath.github.io/Recycle-ML/recyle/metadata.json";

var model, webcam, labelContainer, maxPredictions;
let currentPrediction = "";
let recycleData = JSON.parse(localStorage.getItem("recycleData")) || {
  plastic: 0,
  paper: 0,
  metal: 0,
};

async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
  updateDashboard(true);
}

async function startWebcam() {
  if (webcam) {
    webcam.stop();
    webcam = null;
  }
  var flip = true;
  webcam = new tmImage.Webcam(300, 300, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
  var container = document.getElementById("webcam-container");
  container.innerHTML = "";
  container.appendChild(webcam.canvas);
}

async function loop() {
  webcam.update();
  await predict(webcam.canvas);
  window.requestAnimationFrame(loop);
}

async function handleImageUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  var img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async function () {
    if (webcam) {
      webcam.stop();
      webcam = null;
    }
    var container = document.getElementById("webcam-container");
    container.innerHTML = "";
    img.width = 300;
    img.height = 300;
    container.appendChild(img);
    await predict(img);
  };
}

async function predict(input) {
  var prediction = await model.predict(input);
  var bestPrediction = null;
  var maxProbability = 0;
  for (var i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > maxProbability) {
      maxProbability = prediction[i].probability;
      bestPrediction = prediction[i];
    }
  }
  if (bestPrediction) {
    if (maxProbability > 0.5) {
      currentPrediction = bestPrediction.className;
      onNewPrediction(currentPrediction);
    } else {
      currentPrediction = "";
      document.getElementById("prediction-text").textContent = "Uncertain, try again.";
      document.getElementById("recycle-instructions").textContent = "";
    }
  } else {
    document.getElementById("prediction-text").textContent = "Error getting result.";
  }
}

function animateCount(id, endValue, duration = 1000) {
  const el = document.getElementById(id);
  const start = 0;
  const range = endValue - start;
  const stepTime = 16;
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.floor(start + range * progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateDashboard(animate = false) {
  if (animate) {
    animateCount("plasticnum", recycleData.plastic || 0);
    animateCount("papernum", recycleData.paper || 0);
    animateCount("metalnum", recycleData.metal || 0);
  } else {
    document.getElementById("plasticnum").textContent = recycleData.plastic || 0;
    document.getElementById("papernum").textContent = recycleData.paper || 0;
    document.getElementById("metalnum").textContent = recycleData.metal || 0;
  }
}

document.getElementById("recycleBtn").addEventListener("click", () => {
  const btn = document.getElementById("recycleBtn");
  if (btn.disabled || !currentPrediction) return;
  const prediction = currentPrediction.toLowerCase();
  if (prediction.includes("plastic")) recycleData.plastic++;
  else if (prediction.includes("paper")) recycleData.paper++;
  else if (prediction.includes("aluminum")) recycleData.metal++;
  localStorage.setItem("recycleData", JSON.stringify(recycleData));
  updateDashboard(false);
  btn.disabled = true;
  btn.textContent = "Recycled and Saved to your Dashboard";
});

function onNewPrediction(predictionText) {
  const predictionElement = document.getElementById("prediction-text");
  const recycleBtn = document.getElementById("recycleBtn");
  const instructionBox = document.getElementById("recycle-instructions");
  predictionElement.textContent = predictionText;
  recycleBtn.disabled = false;
  recycleBtn.textContent = "Recycle Now"
}

init();
