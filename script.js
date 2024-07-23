import * as THREE from "three";

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x262626);

// Create a camera and positions it
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
//adds the renderer to the html document
const d = document.body.appendChild(renderer.domElement);
//tells the renderer to support shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Create a directional light
const directionalLight = new THREE.SpotLight(0xffffff, 1);
directionalLight.position.set(7, 15, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
scene.add(directionalLight);

//add helper to see the light source position
const helper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(helper)

// soft white light to view all objects
const light = new THREE.AmbientLight(0xd3d3d3, 0.5);
scene.add(light);

//creates carbon molecule
const carbonGeometry = new THREE.SphereGeometry(4, 32, 16);

//colors carbon molecule red
const carbonMaterial = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  shininess: 50,
});
const carbonMesh = new THREE.Mesh(carbonGeometry, carbonMaterial);
// set shadow for carbon molecule
carbonMesh.castShadow = true;
scene.add(carbonMesh);

//creates hydrogen molecule
const hydrogenGeometry = new THREE.SphereGeometry(2, 32, 16);

//colors hydrogen molecule bright blue
const hydrogenMaterial = new THREE.MeshPhongMaterial({
  color: 0x0000ff,
  shininess: 50,
});

// creating multiple hydrogen molecules at different positions
const hydrogenMeshes = [];
const hydrogenPositions = [
  new THREE.Vector3(-3, 10, 0),
  new THREE.Vector3(10, -3, 0),
  new THREE.Vector3(-10, -3, 0),
  new THREE.Vector3(0, -3, -10),
];

hydrogenPositions.forEach((position) => {
  const hydrogenMesh = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
  hydrogenMesh.position.copy(position);
  hydrogenMeshes.push(hydrogenMesh);
  hydrogenMesh.castShadow = true;
  scene.add(hydrogenMesh);
});

//creating bonds between hydrogen molecules and carbon molecules
const bondMeshes = [];

hydrogenMeshes.forEach((hydrogenMesh) => {
  // finding midpoint between carbon and hydrogen molecules
  const midpoint = new THREE.Vector3()
    .addVectors(carbonMesh.position, hydrogenMesh.position)
    .multiplyScalar(0.5);
  //creates a bond with cylinder geometry
  const bondGeometry = new THREE.CylinderGeometry(0.6, 0.6, 10, 32);
  // colors bond white with a light gray emissive
  const bondMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xd3d3d3,
  });
  const bondMesh = new THREE.Mesh(bondGeometry, bondMaterial);
  bondMesh.position.set(...midpoint);
  //sets shadow for bond
  bondMesh.castShadow = true;
  bondMeshes.push(bondMesh);
  scene.add(bondMesh);
});

// rotates bond to match carbon molecule and hydrogen molecule positions
bondMeshes[0].rotation.z = 0.25;
bondMeshes[1].rotation.z = 1.3;
bondMeshes[2].rotation.z = 1.85;
bondMeshes[3].rotation.z = 1.3;
bondMeshes[3].rotation.y = 1.5;

// group carbon molecule, hydrogen molecules and bond together
const methaneGroup = new THREE.Group();
methaneGroup.add(carbonMesh);
hydrogenMeshes.forEach((mesh) => methaneGroup.add(mesh));
bondMeshes.forEach((mesh) => methaneGroup.add(mesh));
scene.add(methaneGroup);

// event handling for mouse controls
let lastMouseX = 0;
let lastMouseY = 0;
let shouldAnimate = true;

document.addEventListener("mousedown", onDown);
document.addEventListener("mouseup", (event) => {
  console.log("mouseup");
  document.removeEventListener("mousemove", dragging);
  shouldAnimate = true;
});

function onDown(event) {
  document.addEventListener("mousemove", dragging);
  shouldAnimate = false;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function dragging(event) {
  const deltaX = event.clientX - lastMouseX;
  const deltaY = event.clientY - lastMouseY;
  methaneGroup.rotation.y += deltaX * 0.01;
  methaneGroup.rotation.x += deltaY * 0.01;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

// positioning camera
camera.position.z = 28;

// creating a plane
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = Math.PI / 2;
planeMesh.position.y = -20;
planeMesh.receiveShadow = true;

scene.add(planeMesh);
// Rendering animation loop
function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (shouldAnimate) {
    methaneGroup.rotation.x += 0.01;
    methaneGroup.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

animate();
