// saturday-shirt-mode.js — Saturday AR Experience
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from '../vendor/mindar/mindar-image-three.prod.js';

document.getElementById('start').onclick = async () => {
  document.getElementById('intro').style.display = 'none';
  document.getElementById('hint').style.display = 'block';
  const mindar = new MindARThree({ container: document.getElementById('ar'), imageTargetSrc: 'target/saturday-alien-target.mind',
    filterMinCF: 0.0001, filterBeta: 0.01, uiLoading: 'yes', uiScanning: 'yes' });
  const { renderer, scene, camera } = mindar;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene.add(new THREE.HemisphereLight(0xbffcff, 0x2a0a3a, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(0.5, 1, 1); scene.add(key);

  const gltf = await new GLTFLoader().loadAsync('models/saturday-alien.glb');
  const alien = gltf.scene;
  alien.getObjectByName('Projector').visible = false;     // on the shirt the print is the "projector"
  alien.getObjectByName('Beam').visible = false;
  alien.scale.setScalar(1.25);
  alien.position.set(0, -0.47, 0.18);                      // hover the 3D head over the printed head, popping toward the viewer
  const anchor = mindar.addAnchor(0);
  anchor.group.add(alien);
  const mixer = new THREE.AnimationMixer(alien);
  gltf.animations.forEach(c => mixer.clipAction(c).play());
  anchor.onTargetFound = () => document.getElementById('hint').textContent = 'Summoned 👽';
  anchor.onTargetLost = () => document.getElementById('hint').textContent = 'Hold steady over the print · ocean meets sky';

  await mindar.start();
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => { mixer.update(clock.getDelta()); renderer.render(scene, camera); });
};
