import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap";


const canvas = document.querySelector("#experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const raycasterObjects = [];
let currentIntersects = [];

const links = {
    //Github: "https://github.com/Joanna-Y05?tab=overview&from=2025-10-01&to=2025-10-03",
    computer_right: "https://joannaa23.notion.site/My-Maker-Portfolio-908ec956027d468c896f24f149209271",
    computer_left: "https://www.linkedin.com/in/joanna-ayeni-a58108254/",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

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

//when i have a video available i will add it here to my screens so for now the screens will be set to black
/*const videoElement = document.createElement("video");
videoElement.src = "/textures/videos/filename";
videoElement.loop = true;
videoElement.muted = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.videoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = true;
*/

//for raycasting
window.addEventListener("mousemove", (e)=> {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("touchstart", (e)=>{
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
}, {passive:false}
);
window.addEventListener("touchend", (e)=>{
    e.preventDefault();
    handleRaycasterInteraction();
}, {passive:false}
);

function handleRaycasterInteraction(){
     if(currentIntersects.length > 0){
        const object = currentIntersects[0].object;

        Object.entries(links).forEach(([key, url]) =>{
            if(object.name.includes(key)){
                const newWindow = window.open();
                newWindow.opener = null;
                newWindow,location = url;
                newWindow.target = "_blank";
                newWindow.rel = "noopener no referrer";
            }
        });
    }
};

window.addEventListener("click", handleRaycasterInteraction);

//for loading the date files
const today = new Date().getDate();

const fileName = `date_${today}.webp`;
console.log("Loading texture for today: ${fileName}");

const dateTexture = textureLoader.load(
    `/images/dates/${fileName}`,
    () => console.log("texture loaded correctly"),
    undefined,
    (err) => console.error("error loaidng texture:", err)
);

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
                    });
                }
                //screens
                else if (child.name.includes("screen")){
                    child.material = new THREE.MeshBasicMaterial({
                        //map: videoTexture,
                        color: 0x444444,
                    });

                }
                //curtains
                else if(child.name.includes("curtains")){
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xf2f2f2,
                        opacity: 0.6,
                        transparent: true,
                        depthWrite: false,
                    });

                }
                //date texture
                else if(child.name.includes("date")){
                    const material = new THREE.MeshBasicMaterial({
                        map: dateTexture,
                        transparent:true,
                        alphaTest: 0.1,
                        side: THREE.DoubleSide,
                    });
                     child.material = material;
                     //handles flipping and rotating the texture
                     dateTexture.center.set(0.5, 0.5);  
                     dateTexture.rotation = Math.PI / 2;
                     dateTexture.repeat.x = -1;  
                     child.material.needsUpdate = true;
                    
                }

                else{
                    Object.keys(textureMap).forEach(key=>{
                if(child.name.includes(key)){
                    const material = new THREE.MeshBasicMaterial({
                    map: loadedTextures.day[key],
                });
                child.material = material;

                if(child.name.includes("Raycaster")){
                    raycasterObjects.push(child);
                };

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
    35,
    sizes.width / sizes.height,
    0.1,  
    1000  
);
camera.position.set(23.40, 9.14, 0.86);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

/*const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
*/

//orbit controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(
    -1.5916472956105827,
    4.916293847154762,
    0.4244240899087452
);

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
    /*cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    */
  //this section is used to test where to put the camera after i have positioned it where i need in browser
/*
  console.log(camera.position);
  console.log("00000");
  console.log(controls.target);
*/

//raycaster
raycaster.setFromCamera(pointer, camera);
currentIntersects = raycaster.intersectObjects(raycasterObjects);

for (let i = 0; i < currentIntersects.length; i++){
    currentIntersects[i].object.material.color.set(0xff0000);
}

if(currentIntersects.length>0){
    const currentIntersectObject = currentIntersects[0].object;

    //uncomment this when i add pointer as an id to the computer screen
    /*if(currentIntersectObject.name.includes("Pointer")){
        document.body.style.cursor = "pointer";
    }
    else{
    document.body.style.cursor = "default";
}*/
document.body.style.cursor = "pointer";
}
else{
    document.body.style.cursor = "default";
}


    renderer.render(scene, camera);

    window.requestAnimationFrame(render);
};

render();