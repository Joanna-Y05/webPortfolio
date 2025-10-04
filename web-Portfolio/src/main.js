import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { roughness, specularColor } from 'three/tsl';


const canvas = document.querySelector("#experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

//loaders
const textureLoader = new THREE.TextureLoader();

//model loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
	.setPath( "textures/skybox/" )
	.load( [
				'px.webp',
				'nx.webp',
				'py.webp',
				'ny.webp',
				'pz.webp',
				'nz.webp'
			] );

//when night texture is completed come back and populate all of these
const textureMap = {
    First: {
        day:"/textures/room/TextureSetOne.webp",
    },
    Second: {
        day:"/textures/room/TextureSetTwo.webp",
    },
    Third: {
        day:"/textures/room/TextureSetThree.webp",
    },
    Fourth: {
        day:"/textures/room/TextureSetFour.webp",
    },
    //Backdrop:{day:"/textures/room/Backdrop.webp"},
};

const loadedTextures = {
    day:{},
};

Object.entries(textureMap).forEach(([key, paths])=> {
    //when night texture is done copy this but change it for night
    const dayTexture = textureLoader.load(paths.day);
    dayTexture.flipY = false;
    //dayTexture.colorSpace = THREE.SRGBColorSpace;
    //for more vibrant colors remove the comment
    loadedTextures.day[key] = dayTexture;
    //paste inside loop
}); 

const glassMaterial = new THREE.MeshPhysicalMaterial({
                        transmission: 1,
                        opacity: 1,
                        metalness: 0,
                        roughness: 0,
                        ior: 1.5,
                        thickness: 0.01,
                        specularIntensity: 1,
                        envMap: environmentMap,
                        envMapIntensity: 1,
                        depthWrite: false,
                    });

loader.load("/models/room_portfolio.glb", (glb)=>{
    glb.scene.traverse(child=>{
        if(child.isMesh){

             //water objects
                if (child.name.includes("water")){
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0x558BC8,
                        transparent: true,
                        opacity: 0.2,
                        depthWrite: false,
                    });
                }
            // glass objects
                else if (child.name.includes("glass")){
                    child.material = glassMaterial;
                }
            
                //back drop
                else if (child.name.includes("Backdrop")){
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xbfeeff,
                    })
                }

                else{
                    Object.keys(textureMap).forEach(key=>{
                if(child.name.includes(key)){
                    const material = new THREE.MeshBasicMaterial({
                    map: loadedTextures.day[key],
                });
                child.material = material;

                 if (child.material.map) {
                    child.material.map.minFilter = THREE.LinearFilter;
                    }
                }
                    });
                }
    
            
        }
    });
    scene.add(glb.scene);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,  
    1000 
);

//camera positioning and rotation
camera.position.set(23.40, 9.14, 0.86);

camera.rotation.set(
    THREE.MathUtils.degToRad(-92.65),
    THREE.MathUtils.degToRad(80.66),
    THREE.MathUtils.degToRad(92.69)
);

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
controls.dampingFactor = 0.05;
controls.update();


//Event Listeners
window.addEventListener("resize", ()=>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
});

function animate(){}

const render = () => {
    controls.update();
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
/*
   console.log(
    `Camera position: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`
  );
   console.log(
    `Camera rotation: x=${THREE.MathUtils.radToDeg(camera.rotation.x).toFixed(2)}°, y=${THREE.MathUtils.radToDeg(camera.rotation.y).toFixed(2)}°, z=${THREE.MathUtils.radToDeg(camera.rotation.z).toFixed(2)}°`
  );
*/
  //this section is used to test where to put the camera after i have positioned it where i need in browser

    renderer.render(scene, camera);

    window.requestAnimationFrame(render);
};

render();