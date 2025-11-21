"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
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
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef({ current: 0, target: 0 });
  const hoveredPlanetRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const planetsRef = useRef<Planet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const spacecraftRef = useRef<Spacecraft[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const selectedPlanetMeshRef = useRef<THREE.Mesh | null>(null);
  const selectedPlanetDataRef = useRef<{
    dataset: DatasetMetadata;
    screenPos: { x: number; y: number };
    scale: number;
  } | null>(null);

  // State for selected planet metadata overlay
  const [selectedPlanet, setSelectedPlanet] = useState<{
    dataset: DatasetMetadata;
    screenPos: { x: number; y: number };
    scale: number;
  } | null>(null);

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

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.pointerEvents = 'auto';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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
    // STAR FIELD - Much more visible
    // ============================================
    const createStarField = () => {
      const starCount = Math.floor(8000 * particleMultiplier);
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Stars distributed in a large sphere, but closer to camera
        const radius = 800 + Math.random() * 1200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi) - 300; // Shift back

        // Realistic star colors with more variety
        const colorChoice = Math.random();
        if (colorChoice > 0.97) {
          // Blue-white stars (hot)
          colors[i3] = 0.6 + Math.random() * 0.2;
          colors[i3 + 1] = 0.7 + Math.random() * 0.2;
          colors[i3 + 2] = 1.0;
        } else if (colorChoice > 0.94) {
          // Yellow-orange stars (warm)
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.8 + Math.random() * 0.2;
          colors[i3 + 2] = 0.6 + Math.random() * 0.2;
        } else {
          // White stars (most common)
          const brightness = 0.8 + Math.random() * 0.2;
          colors[i3] = brightness;
          colors[i3 + 1] = brightness;
          colors[i3 + 2] = brightness + Math.random() * 0.1;
        }

        // Much larger stars for visibility
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
    // PLANETS - Large and visible
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
        // Create planet
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

        // Add subtle surface detail
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

        // Add ring if specified
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

        // Add moon if specified
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

        // Position in a belt around the scene
        const angle = Math.random() * Math.PI * 2;
        const radius = 400 + Math.random() * 300;
        asteroid.position.x = Math.cos(angle) * radius;
        asteroid.position.z = Math.sin(angle) * radius;
        asteroid.position.y = (Math.random() - 0.5) * 200;

        // Random rotation
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
        // Create futuristic spacecraft geometry
        const geometry = new THREE.Group();

        // Main body (elongated octahedron)
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

        // Wings (two flat triangular prisms)
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

        // Engine glow (small sphere at back)
        const engineGeometry = new THREE.SphereGeometry(4, 8, 8);
        const engineMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.8,
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(0, 0, -25);
        geometry.add(engine);

        // Random starting position across the scene
        const spacecraft = new THREE.Object3D();
        spacecraft.add(geometry);

        spacecraft.position.x = (Math.random() - 0.5) * 1500;
        spacecraft.position.y = (Math.random() - 0.5) * 800;
        spacecraft.position.z = (Math.random() - 0.5) * 1500;

        // Random velocity direction
        const speed = 2 + Math.random() * 3;
        const direction = new THREE.Vector3(
          (Math.random() - 0.5),
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5)
        ).normalize();

        const velocity = direction.multiplyScalar(speed);

        // Random rotation speed
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

    // Initialize scene
    createStarField();
    createPlanets();
    createAsteroids();
    createSpacecraft();

    console.log("WebGL Background initialized:", {
      stars: starsRef.current ? "✓" : "✗",
      planets: planetsRef.current.length,
      asteroids: asteroidsRef.current.length,
      spacecraft: spacecraftRef.current.length,
    });

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

      // Hover detection for planets
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        mouseRef.current.targetX,
        mouseRef.current.targetY
      );
      raycaster.setFromCamera(mouse, camera);

      const planetMeshes = planetsRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(planetMeshes);

      // Reset previous hovered planet
      if (hoveredPlanetRef.current) {
        const material = hoveredPlanetRef.current.material as THREE.MeshPhongMaterial;
        material.emissiveIntensity = 0.3;
        hoveredPlanetRef.current = null;
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
      }

      // Highlight new hovered planet
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

      // Check if clicked on a planet
      const planetMeshes = planetsRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(planetMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const clickedPlanet = planetsRef.current.find((p) => p.mesh === clickedMesh);

        if (clickedPlanet) {
          // Calculate 2D screen position from 3D world position
          const vector = new THREE.Vector3();
          clickedMesh.getWorldPosition(vector);
          vector.project(camera);

          const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const screenY = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

          // Calculate scale based on distance from camera
          const distance = camera.position.distanceTo(clickedMesh.position);
          const scale = Math.max(0.4, Math.min(1, 1000 / distance));

          selectedPlanetMeshRef.current = clickedMesh;
          selectedPlanetDataRef.current = {
            dataset: clickedPlanet.dataset,
            screenPos: { x: screenX, y: screenY },
            scale,
          };
          setSelectedPlanet({
            dataset: clickedPlanet.dataset,
            screenPos: { x: screenX, y: screenY },
            scale,
          });
        }
      } else {
        // Clicked empty space - close overlay
        selectedPlanetMeshRef.current = null;
        selectedPlanetDataRef.current = null;
        setSelectedPlanet(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Only enable planet click interactions on home page
    if (isHomePage) {
      window.addEventListener("click", handleClick);
    }

    // Initial scroll position
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

        // Random explosion direction
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

      // Animate explosion particles
      const animateExplosion = () => {
        let activeParticles = 0;

        particles.forEach((p) => {
          if (p.life < p.maxLife) {
            p.mesh.position.add(p.velocity);
            p.velocity.multiplyScalar(0.95); // Deceleration
            p.life++;

            // Fade out
            const material = p.mesh.material as THREE.MeshBasicMaterial;
            material.opacity = 1 - p.life / p.maxLife;

            activeParticles++;
          } else if (p.mesh.parent) {
            // Remove particle
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            (p.mesh.material as THREE.Material).dispose();
          }
        });

        // Continue animation if particles are still active
        if (activeParticles > 0) {
          requestAnimationFrame(animateExplosion);
        }
      };

      animateExplosion();
    };

    // ============================================
    // WINDOW RESIZE
    // ============================================
    const handleResize = () => {
      if (!camera || !renderer) return;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // ============================================
    // ANIMATION LOOP
    // ============================================
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Smooth mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Smooth scroll interpolation
      scrollRef.current.current += (scrollRef.current.target - scrollRef.current.current) * 0.05;
      const scrollInfluence = scrollRef.current.current;

      // Camera journey through space based on scroll
      // Move camera forward but stay further back for panoramic view
      const scrollCameraZ = 800 - scrollInfluence * 800; // Moves from 800 to 0 (further back)
      const scrollCameraY = scrollInfluence * 400 - 200; // Moves up and down (-200 to 200)
      const scrollCameraX = Math.sin(scrollInfluence * Math.PI * 2) * 250; // Sways left-right

      // Combine scroll-based position with mouse parallax
      camera.position.x = scrollCameraX + mouseRef.current.x * 50;
      camera.position.y = scrollCameraY + mouseRef.current.y * 50;
      camera.position.z = scrollCameraZ;

      // Look at center of the scene
      camera.lookAt(0, 0, -300);

      // Animate stars - slow rotation and twinkling
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.00008;
        starsRef.current.rotation.x += 0.00003;

        // Twinkling effect
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

      // Animate planets - simple rotation and orbit
      planetsRef.current.forEach((planet) => {
        // Rotate on axis
        planet.mesh.rotation.y += planet.rotationSpeed;
        planet.mesh.rotation.x += planet.rotationSpeed * 0.1;

        // Orbital motion
        planet.angle += planet.orbitSpeed;
        planet.mesh.position.x += Math.cos(planet.angle) * 0.2;
        planet.mesh.position.z += Math.sin(planet.angle) * 0.2;

        // Animate moons
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

      // Animate asteroids
      asteroidsRef.current.forEach((asteroid) => {
        asteroid.mesh.position.add(asteroid.velocity);
        asteroid.mesh.rotation.x += asteroid.rotationSpeed.x;
        asteroid.mesh.rotation.y += asteroid.rotationSpeed.y;
        asteroid.mesh.rotation.z += asteroid.rotationSpeed.z;

        // Wrap around bounds
        if (Math.abs(asteroid.mesh.position.x) > 1000) asteroid.velocity.x *= -1;
        if (Math.abs(asteroid.mesh.position.y) > 1000) asteroid.velocity.y *= -1;
        if (Math.abs(asteroid.mesh.position.z) > 1000) asteroid.velocity.z *= -1;
      });

      // Animate spacecraft
      spacecraftRef.current.forEach((spacecraft, i) => {
        // Move spacecraft
        spacecraft.mesh.position.add(spacecraft.velocity);

        // Apply rotation
        spacecraft.mesh.rotation.x += spacecraft.rotationSpeed.x;
        spacecraft.mesh.rotation.y += spacecraft.rotationSpeed.y;
        spacecraft.mesh.rotation.z += spacecraft.rotationSpeed.z;

        // Orient spacecraft in direction of travel
        const direction = spacecraft.velocity.clone().normalize();
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          direction
        );
        spacecraft.mesh.quaternion.slerp(targetQuaternion, 0.1);

        // Wrap around bounds (respawn on opposite side)
        const bounds = 1200;
        if (spacecraft.mesh.position.x > bounds) spacecraft.mesh.position.x = -bounds;
        if (spacecraft.mesh.position.x < -bounds) spacecraft.mesh.position.x = bounds;
        if (spacecraft.mesh.position.y > bounds) spacecraft.mesh.position.y = -bounds;
        if (spacecraft.mesh.position.y < -bounds) spacecraft.mesh.position.y = bounds;
        if (spacecraft.mesh.position.z > bounds) spacecraft.mesh.position.z = -bounds;
        if (spacecraft.mesh.position.z < -bounds) spacecraft.mesh.position.z = bounds;

        // Check collisions with other spacecraft
        for (let j = i + 1; j < spacecraftRef.current.length; j++) {
          const other = spacecraftRef.current[j];
          const distance = spacecraft.mesh.position.distanceTo(other.mesh.position);

          // Collision threshold (sum of approximate radii)
          if (distance < 40) {
            // Create explosion effect at collision point
            const explosionPos = spacecraft.mesh.position.clone().lerp(other.mesh.position, 0.5);
            createExplosion(explosionPos);

            // Reflect velocities (simple collision response)
            const temp = spacecraft.velocity.clone();
            spacecraft.velocity.copy(other.velocity);
            other.velocity.copy(temp);

            // Add some randomness to prevent stuck collisions
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

            // Move spacecraft apart to prevent continuous collision
            const separation = explosionPos.clone().sub(spacecraft.mesh.position).normalize();
            spacecraft.mesh.position.add(separation.multiplyScalar(-25));
            other.mesh.position.add(separation.multiplyScalar(25));
          }
        }
      });

      // Update selected planet metadata position to stick to planet
      if (selectedPlanetMeshRef.current && selectedPlanetDataRef.current) {
        const vector = new THREE.Vector3();
        selectedPlanetMeshRef.current.getWorldPosition(vector);
        vector.project(camera);

        const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

        // Calculate scale based on distance from camera
        const distance = camera.position.distanceTo(selectedPlanetMeshRef.current.position);
        const scale = Math.max(0.4, Math.min(1, 1000 / distance));

        // Update ref data every frame
        selectedPlanetDataRef.current.screenPos = { x: screenX, y: screenY };
        selectedPlanetDataRef.current.scale = scale;

        // Trigger React update by setting new state object
        setSelectedPlanet({
          dataset: selectedPlanetDataRef.current.dataset,
          screenPos: { x: screenX, y: screenY },
          scale,
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // ============================================
    // CLEANUP
    // ============================================
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

      if (renderer) {
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed top-0 left-0 w-full h-full"
        style={{
          zIndex: 0,
          pointerEvents: 'none',
          background: "radial-gradient(ellipse at center, #0f0f18 0%, #050508 50%, #000000 100%)",
        }}
      />
      {/* Only show planet metadata overlay on home page */}
      {isHomePage && (
        <PlanetMetadataOverlay
          dataset={selectedPlanet?.dataset || null}
          screenPosition={selectedPlanet?.screenPos || null}
          scale={selectedPlanet?.scale || 1}
          onClose={() => {
            selectedPlanetMeshRef.current = null;
            selectedPlanetDataRef.current = null;
            setSelectedPlanet(null);
          }}
        />
      )}
    </>
  );
}
