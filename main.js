import * as THREE from 'three';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, renderer, controls, model;

let scene = new THREE.Scene();
let light;

// Create screen canvas
let c = document.getElementById("maincv");
let ctx = c.getContext("2d");

c.width = 1024;
c.height = 1024;

// Create the texture from the canvas
let ct = new THREE.CanvasTexture(c);
ct.minFilter = THREE.NearestFilter;
ct.magFilter = THREE.NearestFilter;
ct.wrapS = THREE.RepeatWrapping;
ct.wrapT = THREE.RepeatWrapping;
ct.center.set(0.5, 0.5);
ct.repeat.set(1.0, 1.0);

let image, mask;

/********/
/* MAIN */
/********/

init();

async function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20);
    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.75);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffeedd, 15);
    camera.add(light);
    scene.add(camera);

    scene.background = new THREE.Color().setHex(0x0f160c);

    // Load the materials (later they will be overwritten later)
    const mtlLoader = new MTLLoader().setPath("res/models/sm/");
    const materials = await mtlLoader.loadAsync("backpack_computer.mtl");
    materials.preload();

    // Load color textures
    let iLoader = new THREE.ImageLoader();
    image = await iLoader.loadAsync("res/models/sm/backpack_computer_diff.png");
    image.colorSpace = THREE.SRGBColorSpace;
    
    // Load model textures
    let tLoader = new THREE.TextureLoader();
    let textureNormal = tLoader.load("res/models/sm/backpack_computer_nor.png");
    textureNormal.colorSpace = THREE.SRGBColorSpace;
    let textureAsg = tLoader.load("res/models/sm/backpack_computer_asg.png");
    textureAsg.colorSpace = THREE.SRGBColorSpace;
    let textureMask = tLoader.load("res/models/sm/backpack_computer_mask.png");
    textureMask.colorSpace = THREE.SRGBColorSpace;

    let material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, // Darken the model
        map: ct,
        normalMap: textureNormal,
        aoMap: textureAsg,

        roughness: 1.0,
        metalness: 0.0
    });

    materials.materials.m_main = material;

    // Load the model
    const mLoader = new OBJLoader().setPath('res/models/sm/');
    mLoader.setMaterials(materials);

    model = await mLoader.loadAsync('backpack_computer.obj');
    
    model.position.y = -3.25;
    model.position.z = -1;
    model.rotation.y = Math.PI;
    scene.add(model);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 8;

    /*const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);*/

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


function randInt(min, max) {
    return min + Math.round(Math.random() * (max - min));
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

let loopCounter = 0;
let text = "";

let data = {
    index: 0,
}

function animate() {
    controls.update();

    /*let r = Math.sin(loopCounter * 0.001) * 0.2;

    camera.position.x = Math.sin(r) * 5;
    camera.position.z = Math.cos(r) * 5;
    camera.position.y = Math.sin(loopCounter * 0.01) * 0.1;*/

    // Update text
    if (loopCounter % 16 == 0) {
        data.index = (data.index + 1) %  4;
        let chars = "|/-\\";

        // Generate interface (16x8 characters)
        text = `\
 --- B.P.C ---
$ help
Version: 1.0
8-bit edition


Loading...
${chars[data.index]}
`
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(image, 0, 0);
        //ctx.drawImage(mask, 0, 0);

        ctx.font = `16px monospace`;
        ctx.fillStyle = "#5dd85a";
        
        let lines = text.split("\n");
        
        for (let i in lines) {
            ctx.fillText(lines[i], 694, 348 + 16*i + 16);
        }

        ct.needsUpdate = true;
    }

    loopCounter++;

    renderer.render(scene, camera);
}