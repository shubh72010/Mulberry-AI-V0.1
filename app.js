// Basic Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sphere
const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = new THREE.MeshStandardMaterial({ color: 0x23d5ab, roughness: 0.4 });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

camera.position.z = 3;

let pulse = 0;
function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.01 + pulse;
    pulse *= 0.9; // decay
    renderer.render(scene, camera);
}
animate();

// Speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.onresult = (event) => {
    const confidence = event.results[event.results.length - 1][0].confidence;
    pulse = confidence * 0.1; // Boost rotation speed slightly
    material.color.setHSL(Math.random(), 1, 0.5); // Random color shift
};
recognition.start();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});