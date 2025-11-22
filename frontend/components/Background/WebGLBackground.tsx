"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { createRoot, Root } from "react-dom/client";
import PlanetMetadataOverlay from "./PlanetMetadataOverlay";

interface DatasetMetadata {
  name: string;
  category: string;
  size: string;
  price: string;
  downloads: number;
  quality: string;
}

interface Planet {
  mesh: THREE.Mesh;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  angle: number;
  moons?: THREE.Mesh[];
  dataset: DatasetMetadata;
}

interface Asteroid {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
}

interface Spacecraft {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
}

export default function WebGLBackground() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cssRendererRef = useRef<CSS3DRenderer | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef({ current: 0, target: 0 });
  const hoveredPlanetRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const planetsRef = useRef<Planet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const spacecraftRef = useRef<Spacecraft[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  // CSS3D Refs
  const selectedPlanetMeshRef = useRef<THREE.Mesh | null>(null);
  const cssObjectRef = useRef<CSS3DObject | null>(null);
  const metadataRootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Detect device capabilities
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const particleMultiplier = isMobile ? 0.5 : 1;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.00025);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.z = 400;
    camera.position.y = 0;
    cameraRef.current = camera;

    // WebGL Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '1';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS3D Renderer setup
    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.pointerEvents = 'none'; // Allow clicks to pass through to WebGL canvas
    cssRenderer.domElement.style.zIndex = '2'; // Overlay on top
    containerRef.current.appendChild(cssRenderer.domElement);
    cssRendererRef.current = cssRenderer;

    // ============================================
    // LIGHTING SYSTEM
    // ============================================
    const ambientLight = new THREE.AmbientLight(0x606080, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffee, 2, 2500);
    sunLight.position.set(800, 400, 600);
    scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    backLight.position.set(-500, 200, -500);
    scene.add(backLight);

    // ============================================
    // STAR FIELD
    // ============================================
    const createStarField = () => {
      const starCount = Math.floor(8000 * particleMultiplier);
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const radius = 800 + Math.random() * 1200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi) - 300;

        const colorChoice = Math.random();
        if (colorChoice > 0.97) {
          colors[i3] = 0.6 + Math.random() * 0.2;
          colors[i3 + 1] = 0.7 + Math.random() * 0.2;
          colors[i3 + 2] = 1.0;
        } else if (colorChoice > 0.94) {
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.8 + Math.random() * 0.2;
          colors[i3 + 2] = 0.6 + Math.random() * 0.2;
        } else {
          const brightness = 0.8 + Math.random() * 0.2;
          colors[i3] = brightness;
          colors[i3 + 1] = brightness;
          colors[i3 + 2] = brightness + Math.random() * 0.1;
        }

        sizes[i] = Math.random() * 8 + 3;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 5,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const stars = new THREE.Points(geometry, material);
      scene.add(stars);
      starsRef.current = stars;
    };

    // ============================================
    // PLANETS
    // ============================================
    const createPlanets = () => {
      const planetData = [
        {
          size: 350,
          color: 0x8b7355,
          emissive: 0x4a3828,
          x: -500,
          y: 200,
          z: -500,
          speed: 0.0001,
          hasRing: true,
          dataset: {
            name: "Climate Archive 2050",
            category: "Climate & Weather",
            size: "2.4 TB",
            price: "150 SUI",
            downloads: 12847,
            quality: "Premium"
          }
        },
        {
          size: 250,
          color: 0x4a6580,
          emissive: 0x1a2530,
          x: 600,
          y: -250,
          z: -300,
          speed: 0.00015,
          hasMoon: true,
          dataset: {
            name: "Global IoT Telemetry",
            category: "IoT & Sensors",
            size: "890 GB",
            price: "85 SUI",
            downloads: 8234,
            quality: "Verified"
          }
        },
        {
          size: 200,
          color: 0xc69c6d,
          emissive: 0x6d4e2a,
          x: -350,
          y: -150,
          z: -150,
          speed: 0.0002,
          dataset: {
            name: "DeFi Transaction Logs",
            category: "Finance & DeFi",
            size: "1.2 TB",
            price: "200 SUI",
            downloads: 15992,
            quality: "Premium"
          }
        },
        {
          size: 280,
          color: 0x6b9faf,
          emissive: 0x2a4a5a,
          x: 450,
          y: 300,
          z: -600,
          speed: 0.00008,
          hasRing: true,
          dataset: {
            name: "Healthcare AI Training",
            category: "Healthcare & Medical",
            size: "3.7 TB",
            price: "320 SUI",
            downloads: 6841,
            quality: "Premium"
          }
        },
        {
          size: 150,
          color: 0x9b6b5e,
          emissive: 0x4a2a1e,
          x: 250,
          y: 150,
          z: -100,
          speed: 0.00025,
          dataset: {
            name: "Real-time Market Data",
            category: "Finance & Trading",
            size: "450 GB",
            price: "95 SUI",
            downloads: 21443,
            quality: "Live Feed"
          }
        },
        {
          size: 320,
          color: 0x7a6b9f,
          emissive: 0x3a2a4a,
          x: -650,
          y: -300,
          z: -550,
          speed: 0.00012,
          hasMoon: true,
          dataset: {
            name: "Neural Network Corpus",
            category: "AI & Machine Learning",
            size: "5.1 TB",
            price: "480 SUI",
            downloads: 9367,
            quality: "Premium"
          }
        },
      ];

      planetData.forEach((data) => {
        const geometry = new THREE.SphereGeometry(data.size, 48, 48);
        const material = new THREE.MeshPhongMaterial({
          color: data.color,
          emissive: data.emissive,
          emissiveIntensity: 0.3,
          shininess: 15,
          flatShading: false,
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.position.set(data.x, data.y, data.z);

        planet.rotation.x = Math.random() * Math.PI;
        planet.rotation.z = Math.random() * Math.PI;

        scene.add(planet);

        const planetObj: Planet = {
          mesh: planet,
          orbitRadius: Math.sqrt(data.x ** 2 + data.z ** 2),
          orbitSpeed: data.speed,
          rotationSpeed: 0.0008 + Math.random() * 0.0012,
          angle: Math.atan2(data.z, data.x),
          moons: [],
          dataset: data.dataset,
        };

        if (data.hasRing) {
          const ringGeometry = new THREE.RingGeometry(
            data.size * 1.5,
            data.size * 2.2,
            64
          );
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b8b8b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
          planet.add(ring);
        }

        if (data.hasMoon) {
          const moonSize = data.size * 0.25;
          const moonGeometry = new THREE.SphereGeometry(moonSize, 24, 24);
          const moonMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            emissive: 0x222222,
            emissiveIntensity: 0.2,
          });
          const moon = new THREE.Mesh(moonGeometry, moonMaterial);
          moon.position.set(data.size * 2.5, 0, 0);
          planet.add(moon);
          planetObj.moons = [moon];
        }

        planetsRef.current.push(planetObj);
      });
    };

    // ============================================
    // ASTEROID BELT
    // ============================================
    const createAsteroids = () => {
      const asteroidCount = Math.floor(40 * particleMultiplier);

      for (let i = 0; i < asteroidCount; i++) {
        const size = 8 + Math.random() * 20;
        const geometry = new THREE.DodecahedronGeometry(size, 0);
        const material = new THREE.MeshPhongMaterial({
          color: 0x666666,
          emissive: 0x111111,
          flatShading: true,
        });

        const asteroid = new THREE.Mesh(geometry, material);

        const angle = Math.random() * Math.PI * 2;
        const radius = 400 + Math.random() * 300;
        asteroid.position.x = Math.cos(angle) * radius;
        asteroid.position.z = Math.sin(angle) * radius;
        asteroid.position.y = (Math.random() - 0.5) * 200;

        asteroid.rotation.x = Math.random() * Math.PI * 2;
        asteroid.rotation.y = Math.random() * Math.PI * 2;
        asteroid.rotation.z = Math.random() * Math.PI * 2;

        scene.add(asteroid);

        asteroidsRef.current.push({
          mesh: asteroid,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          ),
          rotationSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          ),
        });
      }
    };

    // ============================================
    // SPACECRAFT CREATION
    // ============================================
    const createSpacecraft = () => {
      const spacecraftCount = Math.floor(8 * particleMultiplier);

      for (let i = 0; i < spacecraftCount; i++) {
        const geometry = new THREE.Group();

        const bodyGeometry = new THREE.OctahedronGeometry(15, 0);
        const bodyMaterial = new THREE.MeshPhongMaterial({
          color: i % 3 === 0 ? 0x4ECDC4 : i % 3 === 1 ? 0xFF9F1C : 0x95D600,
          emissive: i % 3 === 0 ? 0x2a6d68 : i % 3 === 1 ? 0x8a5010 : 0x4a6b00,
          emissiveIntensity: 0.5,
          shininess: 100,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1, 0.5, 2);
        geometry.add(body);

        const wingGeometry = new THREE.ConeGeometry(8, 20, 3);
        const wingMaterial = new THREE.MeshPhongMaterial({
          color: 0x555555,
          emissive: 0x222222,
          emissiveIntensity: 0.3,
        });

        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.rotation.z = Math.PI / 2;
        leftWing.position.set(-12, 0, 5);
        geometry.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.rotation.z = -Math.PI / 2;
        rightWing.position.set(12, 0, 5);
        geometry.add(rightWing);

        const engineGeometry = new THREE.SphereGeometry(4, 8, 8);
        const engineMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.8,
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(0, 0, -25);
        geometry.add(engine);

        const spacecraft = new THREE.Object3D();
        spacecraft.add(geometry);

        spacecraft.position.x = (Math.random() - 0.5) * 1500;
        spacecraft.position.y = (Math.random() - 0.5) * 800;
        spacecraft.position.z = (Math.random() - 0.5) * 1500;

        const speed = 2 + Math.random() * 3;
        const direction = new THREE.Vector3(
          (Math.random() - 0.5),
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5)
        ).normalize();

        const velocity = direction.multiplyScalar(speed);

        const rotationSpeed = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        );

        scene.add(spacecraft);

        spacecraftRef.current.push({
          mesh: spacecraft as THREE.Mesh,
          velocity,
          rotationSpeed,
        });
      }
    };

    createStarField();
    createPlanets();
    createAsteroids();
    createSpacecraft();

    // ============================================
    // SCROLL TRACKING
    // ============================================
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = window.scrollY / Math.max(maxScroll, 1);
      scrollRef.current.target = scrollPercentage;
    };

    // ============================================
    // MOUSE TRACKING & HOVER
    // ============================================
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        mouseRef.current.targetX,
        mouseRef.current.targetY
      );
      raycaster.setFromCamera(mouse, camera);

      const planetMeshes = planetsRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(planetMeshes);

      if (hoveredPlanetRef.current) {
        const material = hoveredPlanetRef.current.material as THREE.MeshPhongMaterial;
        material.emissiveIntensity = 0.3;
        hoveredPlanetRef.current = null;
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
      }

      if (intersects.length > 0) {
        const planet = intersects[0].object as THREE.Mesh;
        const material = planet.material as THREE.MeshPhongMaterial;
        material.emissiveIntensity = 0.6;
        hoveredPlanetRef.current = planet;
        if (containerRef.current) {
          containerRef.current.style.cursor = 'pointer';
        }
      }
    };

    // ============================================
    // CLICK TO SELECT PLANET
    // ============================================
    const handleClick = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);

      const planetMeshes = planetsRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(planetMeshes);

      // Always cleanup old CSS3D object first
      if (cssObjectRef.current) {
        scene.remove(cssObjectRef.current);
        cssObjectRef.current = null;
      }
      if (metadataRootRef.current) {
        metadataRootRef.current.unmount();
        metadataRootRef.current = null;
      }
      selectedPlanetMeshRef.current = null;

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const clickedPlanet = planetsRef.current.find((p) => p.mesh === clickedMesh);

        if (clickedPlanet) {
          selectedPlanetMeshRef.current = clickedMesh;

          // Create CSS3D Object
          const div = document.createElement('div');
          // div.style.width = '320px';
          // div.style.height = '400px';
          div.style.pointerEvents = 'auto'; // Enable interactions

          const root = createRoot(div);
          metadataRootRef.current = root;

          const handleClose = () => {
            if (cssObjectRef.current) {
              scene.remove(cssObjectRef.current);
              cssObjectRef.current = null;
            }
            if (metadataRootRef.current) {
              metadataRootRef.current.unmount();
              metadataRootRef.current = null;
            }
            selectedPlanetMeshRef.current = null;
          };

          root.render(
            <PlanetMetadataOverlay 
              dataset={clickedPlanet.dataset}
              screenPosition={null}
              scale={1}
              onClose={handleClose}
              is3D={true}
            />
          );

          const cssObject = new CSS3DObject(div);
          
          // Position near planet but slightly offset towards camera
          const offset = clickedMesh.geometry.parameters.radius * 1.5 + 50;
          cssObject.position.copy(clickedMesh.position);
          cssObject.position.x += offset;
          
          // Initial rotation to face camera
          cssObject.lookAt(camera.position);
          
          scene.add(cssObject);
          cssObjectRef.current = cssObject;
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    if (isHomePage) {
      window.addEventListener("click", handleClick);
    }

    handleScroll();

    // ============================================
    // EXPLOSION EFFECT
    // ============================================
    const createExplosion = (position: THREE.Vector3) => {
      const particleCount = 30;
      const particles: Array<{
        mesh: THREE.Mesh;
        velocity: THREE.Vector3;
        life: number;
        maxLife: number;
      }> = [];

      for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? 0xFF9F1C : i % 3 === 1 ? 0x00ffff : 0xFFFFFF,
          transparent: true,
          opacity: 1,
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        );

        scene.add(particle);

        particles.push({
          mesh: particle,
          velocity,
          life: 0,
          maxLife: 30 + Math.random() * 20,
        });
      }

      const animateExplosion = () => {
        let activeParticles = 0;

        particles.forEach((p) => {
          if (p.life < p.maxLife) {
            p.mesh.position.add(p.velocity);
            p.velocity.multiplyScalar(0.95);
            p.life++;

            const material = p.mesh.material as THREE.MeshBasicMaterial;
            material.opacity = 1 - p.life / p.maxLife;

            activeParticles++;
          } else if (p.mesh.parent) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            (p.mesh.material as THREE.Material).dispose();
          }
        });

        if (activeParticles > 0) {
          requestAnimationFrame(animateExplosion);
        }
      };

      animateExplosion();
    };

    const handleResize = () => {
      if (!camera || !renderer) return;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      if (cssRendererRef.current) {
        cssRendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      scrollRef.current.current += (scrollRef.current.target - scrollRef.current.current) * 0.05;
      const scrollInfluence = scrollRef.current.current;

      const scrollCameraZ = 800 - scrollInfluence * 800;
      const scrollCameraY = scrollInfluence * 400 - 200;
      const scrollCameraX = Math.sin(scrollInfluence * Math.PI * 2) * 250;

      camera.position.x = scrollCameraX + mouseRef.current.x * 50;
      camera.position.y = scrollCameraY + mouseRef.current.y * 50;
      camera.position.z = scrollCameraZ;

      camera.lookAt(0, 0, -300);

      if (starsRef.current) {
        starsRef.current.rotation.y += 0.00008;
        starsRef.current.rotation.x += 0.00003;

        const starGeometry = starsRef.current.geometry;
        const sizes = starGeometry.attributes.size.array as Float32Array;
        for (let i = 0; i < sizes.length; i++) {
          if (Math.random() > 0.99) {
            sizes[i] += (Math.random() - 0.5) * 0.5;
            sizes[i] = Math.max(1, Math.min(6, sizes[i]));
          }
        }
        starGeometry.attributes.size.needsUpdate = true;
      }

      planetsRef.current.forEach((planet) => {
        planet.mesh.rotation.y += planet.rotationSpeed;
        planet.mesh.rotation.x += planet.rotationSpeed * 0.1;

        planet.angle += planet.orbitSpeed;
        planet.mesh.position.x += Math.cos(planet.angle) * 0.2;
        planet.mesh.position.z += Math.sin(planet.angle) * 0.2;

        if (planet.moons && planet.moons.length > 0) {
          planet.moons.forEach((moon, i) => {
            const moonAngle = time * 0.5 + i * Math.PI;
            const geometry = planet.mesh.geometry as THREE.SphereGeometry;
            const distance = (geometry.parameters?.radius || 100) * 2.5;
            moon.position.x = Math.cos(moonAngle) * distance;
            moon.position.z = Math.sin(moonAngle) * distance;
            moon.rotation.y += 0.01;
          });
        }
      });

      asteroidsRef.current.forEach((asteroid) => {
        asteroid.mesh.position.add(asteroid.velocity);
        asteroid.mesh.rotation.x += asteroid.rotationSpeed.x;
        asteroid.mesh.rotation.y += asteroid.rotationSpeed.y;
        asteroid.mesh.rotation.z += asteroid.rotationSpeed.z;

        if (Math.abs(asteroid.mesh.position.x) > 1000) asteroid.velocity.x *= -1;
        if (Math.abs(asteroid.mesh.position.y) > 1000) asteroid.velocity.y *= -1;
        if (Math.abs(asteroid.mesh.position.z) > 1000) asteroid.velocity.z *= -1;
      });

      spacecraftRef.current.forEach((spacecraft, i) => {
        spacecraft.mesh.position.add(spacecraft.velocity);

        spacecraft.mesh.rotation.x += spacecraft.rotationSpeed.x;
        spacecraft.mesh.rotation.y += spacecraft.rotationSpeed.y;
        spacecraft.mesh.rotation.z += spacecraft.rotationSpeed.z;

        const direction = spacecraft.velocity.clone().normalize();
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          direction
        );
        spacecraft.mesh.quaternion.slerp(targetQuaternion, 0.1);

        const bounds = 1200;
        if (spacecraft.mesh.position.x > bounds) spacecraft.mesh.position.x = -bounds;
        if (spacecraft.mesh.position.x < -bounds) spacecraft.mesh.position.x = bounds;
        if (spacecraft.mesh.position.y > bounds) spacecraft.mesh.position.y = -bounds;
        if (spacecraft.mesh.position.y < -bounds) spacecraft.mesh.position.y = bounds;
        if (spacecraft.mesh.position.z > bounds) spacecraft.mesh.position.z = -bounds;
        if (spacecraft.mesh.position.z < -bounds) spacecraft.mesh.position.z = bounds;

        for (let j = i + 1; j < spacecraftRef.current.length; j++) {
          const other = spacecraftRef.current[j];
          const distance = spacecraft.mesh.position.distanceTo(other.mesh.position);

          if (distance < 40) {
            const explosionPos = spacecraft.mesh.position.clone().lerp(other.mesh.position, 0.5);
            createExplosion(explosionPos);

            const temp = spacecraft.velocity.clone();
            spacecraft.velocity.copy(other.velocity);
            other.velocity.copy(temp);

            spacecraft.velocity.add(
              new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
              )
            );
            other.velocity.add(
              new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
              )
            );

            const separation = explosionPos.clone().sub(spacecraft.mesh.position).normalize();
            spacecraft.mesh.position.add(separation.multiplyScalar(-25));
            other.mesh.position.add(separation.multiplyScalar(25));
          }
        }
      });

      // Update CSS3D Object Position
      if (cssObjectRef.current && selectedPlanetMeshRef.current) {
        const planet = selectedPlanetMeshRef.current;
        // Simply follow the planet exactly
        // The offset is already applied when adding the object
        // But we need to update it because the planet moves
        const offset = planet.geometry.parameters.radius * 1.5 + 50;
        
        cssObjectRef.current.position.copy(planet.position);
        // We can make it orbit or just stick to the side.
        // Let's stick to the side but rotate with camera
        // Or simpler: just stick to right side relative to camera?
        // For now, just stick to world coordinates relative to planet
        cssObjectRef.current.position.x += offset;
        
        // Make it face the camera so it's readable
        cssObjectRef.current.lookAt(camera.position);
      }

      renderer.render(scene, camera);
      
      if (cssRendererRef.current) {
        cssRendererRef.current.render(scene, camera);
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (isHomePage) {
        window.removeEventListener("click", handleClick);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (starsRef.current) {
        starsRef.current.geometry.dispose();
        (starsRef.current.material as THREE.Material).dispose();
      }

      planetsRef.current.forEach((planet) => {
        planet.mesh.geometry.dispose();
        (planet.mesh.material as THREE.Material).dispose();
        scene.remove(planet.mesh);
      });

      asteroidsRef.current.forEach((asteroid) => {
        asteroid.mesh.geometry.dispose();
        (asteroid.mesh.material as THREE.Material).dispose();
        scene.remove(asteroid.mesh);
      });

      spacecraftRef.current.forEach((spacecraft) => {
        spacecraft.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        scene.remove(spacecraft.mesh);
      });

      if (cssObjectRef.current) {
        scene.remove(cssObjectRef.current);
        cssObjectRef.current = null;
      }
      if (metadataRootRef.current) {
        metadataRootRef.current.unmount();
        metadataRootRef.current = null;
      }

      if (renderer) {
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
      }
      
      if (cssRenderer) {
        containerRef.current?.removeChild(cssRenderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full"
      style={{
        height: isHomePage ? 'calc(100vh + 500px)' : '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: "radial-gradient(ellipse at center, #0f0f18 0%, #050508 50%, #000000 100%)",
      }}
    />
  );
}
