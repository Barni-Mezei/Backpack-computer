import * as THREE from 'three';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, renderer, controls, object;

let scene = new THREE.Scene();
let light;

// Create screen canvas
let c = document.getElementById("maincv");
let ctx = c.getContext("2d");
let ct; // Canvas texture

let margin = 25;
c.width = 256 + margin*2;
c.height = 256 + margin*2;

/********/
/* MAIN */
/********/

init();

async function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 40);
    camera.position.z = 1.25;

    const ambientLight = new THREE.AmbientLight(0xffeedd);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 15);
    camera.add(light);
    scene.add(camera);

    // Load the textures
    const mtlLoader = new MTLLoader().setPath('res/models/');
    const materials = await mtlLoader.loadAsync('computer_backpack.mtl');
    materials.preload();

    // Find the screen texture and replace it with the canvas texture
    let screenUUID = "";

    for (let uuid in materials.materialsInfo) {
        if (materials.materialsInfo[uuid].map_kd == "screen.png") {
            screenUUID = uuid;
        }
    }

    // Replace material, if it was found
    if (screenUUID != "") {
        // Create the texture from the canvas
        ct = new THREE.CanvasTexture(c);
        ct.minFilter = THREE.NearestFilter;
        ct.magFilter = THREE.NearestFilter;
        ct.wrapS = THREE.RepeatWrapping;
        ct.wrapT = THREE.RepeatWrapping;
        ct.center.set(0.5, 0.5);
        ct.repeat.set(1.0, 1.0);

        // Assign the new screen material
        materials.materials[screenUUID] = new THREE.MeshStandardMaterial({ map: ct, roughness: 1.0, metalness: 0.0 });
    }

    // Load the model
    const objLoader = new OBJLoader().setPath('res/models/');
    objLoader.setMaterials(materials);

    object = await objLoader.loadAsync('computer_backpack.obj');

    object.position.y = -0.5;
    object.rotation.y = Math.PI;
    scene.add(object);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.25;
    controls.maxDistance = 2;

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
    altitude: 1254,
    speed: 84,
    blink: false,
}

function animate() {
    controls.update();

    object.rotation.y = Math.PI + Math.sin(loopCounter * 0.005) * 0.2;
    object.rotation.x = Math.cos(loopCounter * 0.005) * 0.1;

    // Subtle screen motion
    let a = 0.01;
    let z = Math.sin(loopCounter * 0.25)*a + a
    let r = Math.cos(loopCounter * 0.1)*a + a
    //ct.repeat.set(1+z, 1+z);
    //ct.rotation = r;
    
    // Update text
    if (loopCounter % 20 == 0) {
        // Update data
        data.blink = !data.blink;
        data.altitude += randInt(-2, 2);
        data.altitude = clamp(data.altitude, 1200, 1300)
        data.speed += randInt(-1, 1);
        data.speed = clamp(data.speed, 64, 98)

        // Generate interface
        text = `\
$ stat${data.blink ? "_" : ""}

HSFV stat:
----------
ENG: OK
ALT: ${data.altitude}m
SPD: ${data.speed}kph
----------
`
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.font = `32px minecraft`;
        ctx.fillStyle = "#00ff00";
        
        let lines = text.split("\n");
        
        for (let i in lines) {
            ctx.fillText(lines[i], margin, margin+32*i);
        }

        ct.needsUpdate = true;
    }

    loopCounter++;

    renderer.render(scene, camera);
}