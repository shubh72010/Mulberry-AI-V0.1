// THREE.js Setup (same as before)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

// Sphere
const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = new THREE.MeshStandardMaterial({ color: 0x2194ce });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Resize Handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Volume-Based Pulse
let audioContext, analyser, microphone, dataArray;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  microphone = audioContext.createMediaStreamSource(stream);
  microphone.connect(analyser);
  analyser.fftSize = 512;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}).catch(err => {
  console.error("Mic error:", err);
});

// Smooth pulsing vars
let targetScale = 1;
let currentScale = 1;

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Update scale based on volume
  if (analyser) {
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      let v = (dataArray[i] - 128) / 128;
      sum += v * v;
    }
    let volume = Math.sqrt(sum / dataArray.length);
    targetScale = 1 + volume * 2;  // Subtle pulse effect
  }

  // Smooth scaling
  currentScale += (targetScale - currentScale) * 0.1;
  sphere.scale.set(currentScale, currentScale, currentScale);

  renderer.render(scene, camera);
}
animate();

// Voice Commands
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = function (event) {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  console.log("Heard:", transcript);

  if (transcript.includes("expand")) {
    gsap.to(sphere.scale, { x: 3, y: 3, z: 3, duration: 0.5, ease: "power2.out" });
  } else if (transcript.includes("shrink")) {
    gsap.to(sphere.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 0.5, ease: "power2.out" });
  }
};

recognition.onerror = console.error;
recognition.start();