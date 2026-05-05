import * as THREE from 'three';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, renderer, controls, model;

let scene = new THREE.Scene();

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

    let pLight = new THREE.PointLight(0xffeedd, 5);
    let dLight1 = new THREE.DirectionalLight(0xffdddd, 1);
    let dLight2 = new THREE.DirectionalLight(0xddeeff, 1);
    let dLight3 = new THREE.DirectionalLight(0xdddddd, 1);
    dLight1.position.set(1, 1, 1);
    dLight2.position.set(-2, 0, 0.25);
    dLight3.position.set(0.25, -0.25, -1);

    // dLight1.add(new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(0.01, 0.01, 0.01)), 0xffff00));
    // dLight2.add(new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(0.01, 0.01, 0.01)), 0xffff00));
    // dLight3.add(new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3(0.01, 0.01, 0.01)), 0xffff00));

    //camera.add(pLight);
    
    scene.add(dLight1);
    scene.add(dLight2);
    scene.add(dLight3);
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
    let textureAsg = tLoader.load("res/models/sm/backpack_computer_asg.png");
    let textureMask = tLoader.load("res/models/sm/backpack_computer_mask.png");
    textureNormal.colorSpace = THREE.SRGBColorSpace;
    textureAsg.colorSpace = THREE.SRGBColorSpace;
    textureMask.colorSpace = THREE.SRGBColorSpace;

    let material = new THREE.MeshStandardMaterial({
        //color: 0xaaaaaa, // Darken the model
        map: ct,
        normalMap: textureNormal,
        aoMap: textureAsg,

        roughness: 0.8,
        metalness: 0.1
    });

    materials.materials.m_main = material;

    // Load the model
    let mLoader = new OBJLoader().setPath('res/models/sm/');
    mLoader.setMaterials(materials);

    model = await mLoader.loadAsync('backpack_computer.obj');
    
    model.position.y = -3.25;
    model.position.z = -1;
    model.rotation.y = Math.PI;
    scene.add(model);

    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(mainLoop);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;

    // let axisHelper = new THREE.AxesHelper(5);
    // scene.add(axisHelper);

    window.addEventListener('resize', onWindowResize);

    // Remove "loading" text
    let title = document.getElementById("title");
    title.classList.remove("center");
    title.textContent = "$ Backpack computer...";
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
let lastTime = 0;

function mainLoop(time) {
    controls.update();

    // Update UI at a fix framerate
    if (time - lastTime > 125) {
        loopCounter++;
        lastTime = time;
        
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(image, 0, 0);
        
        ctx.font = `16px monospace`;
        ctx.fillStyle = "#5dd85a";
        
        let text = screenManager.update();
        let lines = text.split("\n");
        
        for (let i in lines) {
            ctx.fillText(lines[i], 694, 348 + 16*i + 16);
        }

        ct.needsUpdate = true;
    }

    renderer.render(scene, camera);
}