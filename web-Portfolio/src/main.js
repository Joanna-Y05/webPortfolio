import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const canvas = document.querySelector("#experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerheight
};

//loaders
const textureLoader = new THREE.TextureLoader()

//model loaders
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );
loader.setDRACOLoader( dracoLoader );

const textureMap = {
    First:{day:"/textures/room/TextureSetOne.webp"},
    Second:{day:"/textures/room/TextureSetTwo.webp"},
    Third:{day:"/textures/room/TextureSetThree.webp"},
    Fourth:{day:"/textures/room/TextureSetFour.webp"},
    Backdrop:{day:"/textures/room/Backdrop.webp"},
};

const loadedTextures = {
    day:{},
    night:{},
};

Object.entries(textureMap.array.forEach(([key, paths])=> {
    const dayTexture = textureLoader.load(paths.day);
    loadedTextures.day[key] = dayTexture;
})); //when night texture is done copy this but change it for night

loader.load("/models/room_portfolio.glb", (glb)=>{
    glb.scene.traverse(child=>{
        if(child.isMesh){
            Object.Keys(textureMap).for(key=>{
                if(child.name.includes(key)){
                    const material = new THREE.MeshBasicMaterial({
                    map: loadedTextures.day[key],
                });
                child.material = material;
                }
            });
        }

        scene.add(glb.scene);
    });
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );


//orbit controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor - 0.05;
controls.update();


//Event Listener
window.addEventListener("resize", ()=>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //update renderer
    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
});

const render = () => {
    controls.update();
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);

    window.requestAnimationFrame(render);
};

render();