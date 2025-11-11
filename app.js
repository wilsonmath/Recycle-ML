var modelURL = "https://wilsonmath.github.io/Recycle-ML/recyle/model.json";
var metadataURL = "https://wilsonmath.github.io/Recycle-ML/recyle/metadata.json";

var model, webcam, labelContainer, maxPredictions;

async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container"); 
  labelContainer.innerHTML = ""; 
  
  var container = document.getElementById("webcam-container");
  container.style.width = "300px";
  container.style.height = "300px";

  document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
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
  setTimeout(function() {
      predict(webcam.canvas);
  }, 100); 
  window.requestAnimationFrame(loop);
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
  
  if (labelContainer.innerHTML == "Result") {
      labelContainer.innerHTML = "Checking...";
  }

  if (bestPrediction) {
    var resultText = bestPrediction.className;  
    if (maxProbability > 0.5) {
        labelContainer.innerHTML = resultText;
    } else {
        labelContainer.innerHTML = "Uncertain, try again.";
    }

  } else {
    labelContainer.innerHTML = "Error getting result.";
  }
}

async function handleImageUpload(event) {
  var file = event.target.files[0];
  if (!file) return;

  var img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async function() {
    if (webcam) {
      webcam.stop();
      webcam = null;
    }

    var container = document.getElementById("webcam-container");
    container.innerHTML = "";
    img.width = 300; 
    img.height = 300; 
    container.appendChild(img);
    labelContainer.innerHTML = "Processing...";
    await predict(img);
  };
}

init();