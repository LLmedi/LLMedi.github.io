import '/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//import '/scripts/grid.js';
//import board from './src/Loader';
//import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Setup-------------------------------------------------------------------------
const canvas = document.querySelector('#bg');
const renderer = new THREE.WebGLRenderer({canvas});

const fov = 75;
const aspect = 2; //window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.setZ(40);
camera.position.setX(0);
camera.position.setY(15);

// Lights------------------------------------------------------------------------
{
  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(5, 5, 5);
  const ambientLight = new THREE.AmbientLight(0xffffff);

  scene.add(pointLight, ambientLight);
}
//Helpers--------------------------------------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;

// Background-----------------------------------------------------------------------
const spaceTexture = new THREE.TextureLoader().load('/space.jpg');
scene.background = spaceTexture;

const mountains = THREE.ImageUtils.loadTexture('/mountains.png');
mountains.wrapS = THREE.RepeatWrapping; 
mountains.wrapT = THREE.RepeatWrapping;
mountains.repeat.set( 1, 1); 

const mm = new THREE.MeshLambertMaterial({ map : mountains, transparent: true, opacity: 0.8 });
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 400), mm);
plane.position.z = -300;
scene.add(plane);

//Grid-----------------------------------------------------------------------------
let divisions = 30;
let gridLimit = 200;
let grid = new THREE.GridHelper(gridLimit * 2, divisions, 0xffcc00, 0xffcc00);

const moveableZ = [];
for (let i = 0; i <= divisions; i++) {
    moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
}
grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));

grid.material = new THREE.ShaderMaterial({
  uniforms: {
      speedZ: {
          value: 10
      },
      gridLimits: {
          value: new THREE.Vector2(-gridLimit, gridLimit)
      },
      time: {
          value: 0
      }
  },
  vertexShader: `
      uniform float time;
      uniform vec2 gridLimits;
      uniform float speedZ;
      
      attribute float moveableZ;
      
      varying vec3 vColor;
  
      void main() {
          vColor = color;
          float limLen = gridLimits.y - gridLimits.x;
          vec3 pos = position;
          if (floor(moveableZ + 0.5) > 0.5) { // if a point has "moveableZ" attribute = 1 
              float zDist = speedZ * time;
              float curZPos = mod((pos.z + zDist) - gridLimits.x, limLen) + gridLimits.x;
              pos.z = curZPos;
          }
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
  `,
  fragmentShader: `
      varying vec3 vColor;
  
      void main() {
        gl_FragColor = vec4(vColor, 1.); // r, g, b channels + alpha (transparency)
      }
  `,
  vertexColors: THREE.VertexColors
});

scene.add(grid);
grid.time = 0;
grid.clock = new THREE.Clock();

// ico ---------------------------------------------------------------------------------------
const geometry = new THREE.IcosahedronBufferGeometry(10);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347, wireframe: true });
const ico = new THREE.Mesh(geometry, material);
ico.position.z = -20;
ico.position.y = 20;
ico.position.x = 0;
scene.add(ico);

// Planet ----------------------------------------------------
const planetTexture = new THREE.TextureLoader().load('/planet.png');
//const normalTexture = new THREE.TextureLoader().load('normal.jpg');
const planet = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: planetTexture,
    //normalMap: normalTexture,
  })
);
scene.add(planet);

planet.position.z = 0;
planet.position.x = 30;
planet.position.y = 20;

// Scroll Animation ---------------------------------------------------------------
function scrollRotate() {
  const t = document.body.getBoundingClientRect().top;
  ico.rotation.x = t * -0.001;
}

document.body.onscroll = scrollRotate;
scrollRotate();

//Board Model ------------------------------------------
/*board.then(object=>{
  scene.add(object);
  object.scale.set(0.05, 0.05, 0.05);
  object.position.x = 15;
  object.rotation.x = -0.3;
});*/


//Stars------------------------------------------------------------
let stars;
let positions = [], velocities = [];
const starNum = 200;

const maxRange= 1000, minRange = maxRange/2;
const minHeight = 1;
const gm = new THREE.BufferGeometry();
const mt = new THREE.MeshStandardMaterial({ color: 0xffffff });
const textureLoader = new THREE.TextureLoader();
addStars();

function addStars(){
  for(let i=0; i<starNum; i++){
    positions.push(
      Math.floor(Math.random() * maxRange - minRange),
      Math.floor(Math.random() * minRange + minHeight),
      Math.floor(Math.random() * maxRange - minRange));
    velocities.push(
      Math.floor(Math.random() * 6 - 3) * 0.01,
      Math.floor(Math.random() * 5 + 0.12) * 0.01,
      Math.floor(Math.random() * 6 - 3) * 0.2);
  }
  gm.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  gm.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
  
  const flM = new THREE.PointsMaterial({
    size:6,
    map: textureLoader.load("/snow.png"),
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    opacity: 0.7,
  });

//Array and adding to scene
  stars = new THREE.Points(gm, flM);
  scene.add(stars);
}

function updateStars(){
  for(let i = 0; i < starNum*3; i+= 3){
    stars.geometry.attributes.position.array[i] -= stars.geometry.attributes.velocity.array[i];
    stars.geometry.attributes.position.array[i+1] -= stars.geometry.attributes.velocity.array[i+1];
    stars.geometry.attributes.position.array[i+2] -= stars.geometry.attributes.velocity.array[i+2];

    if(stars.geometry.attributes.position.array[i+1] < 0 ){
      stars.geometry.attributes.position.array[i] = Math.floor(Math.random()*maxRange - minRange);
      stars.geometry.attributes.position.array[i+1] = Math.floor(Math.random()*minRange + minHeight);
      stars.geometry.attributes.position.array[i+2] = Math.floor(Math.random()*maxRange - minRange);
    }
  }
  stars.geometry.attributes.position.needsUpdate = true;
}

// Rendering -----------------------------------------------------------------
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width  = canvas.clientWidth  * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

// Render Loop -----------------------------------------------------
function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  //controls.update();
  
  //Ico Shape Movement
  ico.rotation.x += 0.001;
  ico.rotation.y += 0.001;
  ico.rotation.z += 0.001;
  
  //Grid Movement
  grid.time += grid.clock.getDelta();
  grid.material.uniforms.time.value = grid.time;

  planet.rotation.y += 0.001;
  updateStars();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
