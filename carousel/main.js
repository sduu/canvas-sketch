import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class App {
	constructor() {
		const divContainer = document.querySelector('#container');
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;

		const scene = new THREE.Scene();
		this._scene = scene;

		const clock = new THREE.Clock();
		this._clock = clock;

		this._setupCamera();
		this._setupLight();
		this._setupModel();

		this._setupControls();

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

	_setupControls() {
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		// PerspectiveCamera(높이 방향 각도, 종횡비, 카메라로부터의 거리 앞쪽, 카메라로부터의 거리 뒤쪽)
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.set(0, 15, 35);

		this._camera = camera;
	}

	_setupLight() {
		const hemisphereLight = new THREE.HemisphereLight('#b0d8f5', '#ffdec1', 0.3);
		this._scene.add(hemisphereLight);

		const pointLight = new THREE.PointLight('#ffffff', 0.5);
		pointLight.position.set(0, 15, 35);
		this._scene.add(pointLight);

		// const pointHelper = new THREE.PointLightHelper(pointLight);
		// this._scene.add(pointHelper);
		// this._pointLightHelper = pointHelper;

		const spotLight = new THREE.SpotLight('#e070bb', 0.5);
		spotLight.position.set(0, 30, 8);
		spotLight.target.position.set(0, 0, 0);
		spotLight.angle = THREE.Math.degToRad(30);
		spotLight.penumbra = 0.2;

		this._scene.add(spotLight);
		this._scene.add(spotLight.target);

		// const spotHelper = new THREE.SpotLightHelper(spotLight);
		// this._scene.add(spotHelper);
		// this._spotLightHelper = spotHelper;

		const d = 15;
		pointLight.castShadow = true;
		pointLight.shadow.mapSize.width = pointLight.shadow.mapSize.height = 2048;
		pointLight.shadow.radius = 10;
		pointLight.shadow.bias = -0.003;
		pointLight.shadow.camera.left = -d;
		pointLight.shadow.camera.right = d;
		pointLight.shadow.camera.top = d;
		pointLight.shadow.camera.bottom = -d; 
	}

	_setupModel() {
		const textureLoader = new THREE.TextureLoader();

		const carouselSystem = new THREE.Object3D();
		this._scene.add(carouselSystem);
		this._carouselSystem = carouselSystem;

		// core
		const core = new THREE.Object3D();
		this._scene.add(core);

		const coreMap = textureLoader.load(
			'./images/window.png',
			texture => {
				texture.repeat.x = 8;
				texture.repeat.y = 5;

				texture.wrapS = THREE.RepeatWrapping; 
				texture.wrapT = THREE.ClampToEdgeWrapping;

				texture.offset.x = 0;
				texture.offset.y = -1.5;

				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.NearestFilter;
			}
		);

		const coreGeometry = new THREE.CylinderGeometry(4, 4, 10, 8, 1, true);
		coreGeometry.clearGroups();
		coreGeometry.addGroup( 0, Infinity, 0 );
		coreGeometry.addGroup( 0, Infinity, 1 );

		const coreMaterial1 = new THREE.MeshStandardMaterial({
			color: '#dbd3d3',
			metalness: 0.2,
			roughness: 0.5,
			flatShading: true,
		});
		const coreMaterial2 = new THREE.MeshStandardMaterial({
			map: coreMap,
			transparent: true,
			roughness: 1,
		});
		const materials = [coreMaterial1, coreMaterial2];
		const coreMesh = new THREE.Mesh(coreGeometry, materials);
		coreMesh.receiveShadow = true;
		coreMesh.castShadow = true;
		core.add(coreMesh);

		// hat
		const hat = new THREE.Object3D();
		hat.position.set(0, 10, 0);
		carouselSystem.add(hat);

		const hatMap = textureLoader.load(
			'./images/hat_pink_lathe.png',
			texture => {
				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.NearestFilter;
			}
		);

		const hatSegment = 18;
		const hatRadius = 10;

		const points = [];
		points.push(new THREE.Vector2(0.0, 0.0));
		points.push(new THREE.Vector2(hatRadius, -5.0));
		
		//const hatGeometry = new THREE.ConeGeometry(10, 5, hatSegment, 1, true, 0, Math.PI * 2);
		const hatGeometry = new THREE.LatheGeometry(points, hatSegment, 0, Math.PI * 2);
		const hatMaterial = new THREE.MeshStandardMaterial({
			side: THREE.DoubleSide,
			map: hatMap,
			metalness: 0.2,
			roughness: 0.5,
			flatShading: true,
		});
		const hatMesh = new THREE.Mesh(hatGeometry, hatMaterial);
		hatMesh.receiveShadow = true;
		hatMesh.castShadow = true;
		hat.add(hatMesh);

		const garlandRadius = Math.sin(360 / hatSegment / 2 * (Math.PI / 180)) / hatRadius * 100;
		const garlandGeometry =  new THREE.CircleGeometry(garlandRadius, 24, Math.PI, Math.PI);
		const garlandMaterial1 = new THREE.MeshStandardMaterial({
			color: '#dfabaf',
			side: THREE.DoubleSide,
			metalness: 0.2,
			roughness: 0.5,
			flatShading: true,
		});
		const garlandMaterial2 = new THREE.MeshStandardMaterial({
			color: '#fff',
			side: THREE.DoubleSide,
			metalness: 0.2,
			roughness: 0.5,
			flatShading: true,
		});

		for (let i = 0; i < hatSegment; i++) {
			const garland = new THREE.Object3D();
			const garlandMesh = new THREE.Mesh(garlandGeometry, i % 2 ? garlandMaterial2 : garlandMaterial1);
			garlandMesh.position.set(1.71, -5, 9.7);
			garlandMesh.rotation.y = THREE.Math.degToRad(190);
			garlandMesh.receiveShadow = true;
			garlandMesh.castShadow = true;
			garland.rotation.y = THREE.Math.degToRad(360 / hatSegment * i);
			garland.add(garlandMesh);
			hat.add(garland);
		}

		// horses
		const horses = new THREE.Object3D();
		carouselSystem.add(horses);

		const horseMap = textureLoader.load(
			'./images/carousel-horse_1f3a0_s.png',
			texture => {
				texture.repeat.x = 0.25;
				texture.repeat.y = 0.25;

				texture.offset.x = -0.07;
				texture.offset.y = 0.94;

				texture.magFilter = THREE.LinearFilter;
				texture.minFilter = THREE.LinearMipmapNearestFilter;
			}
		);

		const xmul = 0.03, ymul = 0.03;
		const xoff  = 0, yoff = -4;
		const shape = new THREE.Shape();
		shape.moveTo(64 * xmul + xoff, 136 * ymul + yoff);
		shape.lineTo(82 * xmul + xoff, 136 * ymul + yoff);
		shape.lineTo(81 * xmul + xoff, 92 * ymul + yoff);
		shape.quadraticCurveTo(93 * xmul + xoff, 108 * ymul + yoff, 99 * xmul + xoff, 90 * ymul + yoff);
		shape.lineTo(104 * xmul + xoff, 88 * ymul + yoff);
		shape.bezierCurveTo(126 * xmul + xoff, 93 * ymul + yoff, 106 * xmul + xoff, 83 * ymul + yoff, 134 * xmul + xoff, 89 * ymul + yoff);
		shape.bezierCurveTo(146 * xmul + xoff, 88 * ymul + yoff, 139 * xmul + xoff, 62 * ymul + yoff, 119 * xmul + xoff, 65 * ymul + yoff);
		shape.lineTo(116 * xmul + xoff, 54 * ymul + yoff);
		shape.bezierCurveTo(126 * xmul + xoff, 53 * ymul + yoff, 130 * xmul + xoff, 31 * ymul + yoff, 117 * xmul + xoff, 32 * ymul + yoff);
		shape.bezierCurveTo(104 * xmul + xoff, 14 * ymul + yoff, 88 * xmul + xoff, 45 * ymul + yoff, 95 * xmul + xoff, 47 * ymul + yoff);
		shape.quadraticCurveTo(85 * xmul + xoff, 49 * ymul + yoff, 81 * xmul + xoff, 53 * ymul + yoff);
		shape.lineTo(81 * xmul + xoff, 32 * ymul + yoff);
		shape.bezierCurveTo(86 * xmul + xoff, 18 * ymul + yoff, 93 * xmul + xoff, 12 * ymul + yoff, 72 * xmul + xoff, 12 * ymul + yoff);
		shape.bezierCurveTo(52 * xmul + xoff, 11.999999999999996 * ymul + yoff, 65 * xmul + xoff, 25 * ymul + yoff, 65 * xmul + xoff, 31 * ymul + yoff);
		shape.lineTo(65 * xmul + xoff, 50 * ymul + yoff);
		shape.lineTo(60 * xmul + xoff, 51 * ymul + yoff);
		shape.quadraticCurveTo(70 * xmul + xoff, 34 * ymul + yoff, 50 * xmul + xoff, 34 * ymul + yoff);
		shape.quadraticCurveTo(44 * xmul + xoff, 34 * ymul + yoff, 40 * xmul + xoff, 37 * ymul + yoff);
		shape.bezierCurveTo(24 * xmul + xoff, 37 * ymul + yoff, 6 * xmul + xoff, 66 * ymul + yoff, 34 * xmul + xoff, 69 * ymul + yoff);
		shape.lineTo(33 * xmul + xoff, 85 * ymul + yoff);
		shape.bezierCurveTo(4 * xmul + xoff, 75 * ymul + yoff, 15 * xmul + xoff, 106 * ymul + yoff, 22 * xmul + xoff, 108 * ymul + yoff);
		shape.quadraticCurveTo(21 * xmul + xoff, 116 * ymul + yoff, 25 * xmul + xoff, 119 * ymul + yoff);
		shape.quadraticCurveTo(29 * xmul + xoff, 128 * ymul + yoff, 38 * xmul + xoff, 125 * ymul + yoff);
		shape.quadraticCurveTo(56 * xmul + xoff, 126 * ymul + yoff, 59 * xmul + xoff, 115 * ymul + yoff);
		shape.lineTo(66 * xmul + xoff, 109 * ymul + yoff);
		shape.lineTo(66 * xmul + xoff, 136 * ymul + yoff);

		const horseGeometry = new THREE.ShapeGeometry(shape);
		const horseMaterial = new THREE.MeshStandardMaterial({
			map: horseMap,
			side: THREE.DoubleSide,
			transparent: true,
			metalness: 0,
			roughness: 0,
			flatShading: true,
		});

		const horses1 = new THREE.Object3D();
		const horses2 = new THREE.Object3D();

		horses.add(horses1);
		horses.add(horses2);

		this._horses1 = horses1;
		this._horses2 = horses2;

		for (let i = 0; i < 14; i++) {
			const horse = new THREE.Object3D();
			const horseMesh = new THREE.Mesh(horseGeometry, horseMaterial);
			horseMesh.receiveShadow = true;
			horseMesh.castShadow = true;
			if (i % 2) {
				horseMesh.position.z = 8;
				horse.rotation.y = THREE.Math.degToRad(360 / 14 * i);
				horse.add(horseMesh);
				horses1.add(horse);
			} else {
				horseMesh.position.z = 9;
				horse.rotation.y = THREE.Math.degToRad(360 / 14 * i);
				horse.add(horseMesh);
				horses2.add(horse);
			}
		}

		// floor
		const floor = new THREE.Object3D();
		carouselSystem.add(floor);

		const floorMap = textureLoader.load(
			'./images/floor_pink.png',
			texture => {
				texture.repeat.x = 0.05;
				texture.repeat.y = 0.05;

				texture.wrapT = THREE.RepeatWrapping;

				texture.magFilter = THREE.LinearFilter;
				texture.minFilter = THREE.LinearMipmapNearestFilter;
			}
		);

		const floorOuterRadius = 10;
		const floorInnerRadius = 5;
		const floorHeight = 1;

		const arcShape = new THREE.Shape();
		arcShape.moveTo(floorOuterRadius * 2, floorOuterRadius);
		arcShape.absarc(floorOuterRadius, floorOuterRadius, floorOuterRadius, 0, Math.PI * 2, false);
		const holePath = new THREE.Path();
		holePath.moveTo(floorOuterRadius + floorInnerRadius, floorOuterRadius);
		holePath.absarc(floorOuterRadius, floorOuterRadius, floorInnerRadius, 0, Math.PI * 2, true);
		arcShape.holes.push(holePath);

		const floorGeometry = new THREE.ExtrudeGeometry(arcShape, {
			depth: floorHeight,
			bevelEnabled: false,
			steps: 1,
			curveSegments: 60,
		});
		floorGeometry.center();

		const floorMesh = new THREE.Mesh(floorGeometry, [new THREE.MeshStandardMaterial({
			map: floorMap,
			metalness: 0.2,
			roughness: 0.5,
			flatShading: true,
		}), new THREE.MeshStandardMaterial({
			color: '#dbd3d3',
			metalness: 0.2,
			roughness: 0.5,
			flatShading: false,
		})]);
		floorMesh.rotation.x = THREE.Math.degToRad(90);
		floorMesh.position.set(0, -4.3, 0);
		floorMesh.receiveShadow = true;
		floorMesh.castShadow = true;
		floor.add(floorMesh);

		// table
		// const tableGeometry = new THREE.BoxGeometry();
		// const tableMaterial = new THREE.MeshPhongMaterial({color: 0x878787});
		// const table = new THREE.Mesh(tableGeometry, tableMaterial);
		// table.receiveShadow = true;
		// table.position.set(0, -5, 0);
		// table.scale.set(50, 0.2, 50);
		// this._scene.add(table);
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render() {
		// getElapsedTime() : Get the seconds passed since the clock started and sets oldTime to the current time
		const elapsedTime = this._clock.getElapsedTime();

		this.update(elapsedTime);

		this._renderer.render(this._scene, this._camera);

		requestAnimationFrame(this.render.bind(this));
	}

	update(time) {
		this._carouselSystem.rotation.y = -time / 2;
		this._horses1.position.y = (Math.sin((time + 1.05) * 3) + 1) / 2;
		this._horses2.position.y = (Math.sin(time * 3) + 1) / 2;
	}
}

window.onload = function() {
	new App();
}