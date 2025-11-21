"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Planet {
  mesh: THREE.Mesh;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  angle: number;
  moons?: THREE.Mesh[];
}

interface Asteroid {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
}

export default function WebGLBackground() {
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
  const animationFrameRef = useRef<number | undefined>(undefined);

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
        // Large gas giant in the distance
        {
          size: 350,
          color: 0x8b7355,
          emissive: 0x4a3828,
          x: -500,
          y: 200,
          z: -500,
          speed: 0.0001,
          hasRing: true,
        },
        // Blue-gray rocky planet (closer)
        {
          size: 250,
          color: 0x4a6580,
          emissive: 0x1a2530,
          x: 600,
          y: -250,
          z: -300,
          speed: 0.00015,
          hasMoon: true,
        },
        // Capy-brown desert planet (very close)
        {
          size: 200,
          color: 0xc69c6d,
          emissive: 0x6d4e2a,
          x: -350,
          y: -150,
          z: -150,
          speed: 0.0002,
        },
        // Icy planet (distant)
        {
          size: 280,
          color: 0x6b9faf,
          emissive: 0x2a4a5a,
          x: 450,
          y: 300,
          z: -600,
          speed: 0.00008,
          hasRing: true,
        },
        // Small reddish rocky planet (very close)
        {
          size: 150,
          color: 0x9b6b5e,
          emissive: 0x4a2a1e,
          x: 250,
          y: 150,
          z: -100,
          speed: 0.00025,
        },
        // Purple gas giant
        {
          size: 320,
          color: 0x7a6b9f,
          emissive: 0x3a2a4a,
          x: -650,
          y: -300,
          z: -550,
          speed: 0.00012,
          hasMoon: true,
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

    // Initialize scene
    createStarField();
    createPlanets();
    createAsteroids();

    console.log("WebGL Background initialized:", {
      stars: starsRef.current ? "✓" : "✗",
      planets: planetsRef.current.length,
      asteroids: asteroidsRef.current.length,
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
    // CLICK INTERACTIONS
    // ============================================
    const handleClick = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);

      // Check if we clicked on a planet
      const planetMeshes = planetsRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(planetMeshes);

      if (intersects.length > 0) {
        // Planet clicked - create explosion effect
        const planet = intersects[0].object as THREE.Mesh;
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities: THREE.Vector3[] = [];

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3] = planet.position.x;
          positions[i3 + 1] = planet.position.y;
          positions[i3 + 2] = planet.position.z;

          velocities.push(
            new THREE.Vector3(
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 5
            )
          );
        }

        particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 4,
          transparent: true,
          opacity: 1,
          blending: THREE.AdditiveBlending,
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        let life = 0;
        const animateExplosion = () => {
          life += 0.02;
          const pos = particles.attributes.position.array as Float32Array;

          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            pos[i3] += velocities[i].x;
            pos[i3 + 1] += velocities[i].y;
            pos[i3 + 2] += velocities[i].z;
          }

          particles.attributes.position.needsUpdate = true;
          particleMaterial.opacity = Math.max(0, 1 - life);

          if (life < 1) {
            requestAnimationFrame(animateExplosion);
          } else {
            scene.remove(particleSystem);
            particles.dispose();
            particleMaterial.dispose();
          }
        };

        animateExplosion();
      } else {
        // Empty space click - create ripple
        const { clientX, clientY } = event;
        const rippleCount = 30;
        const ripplePositions = new Float32Array(rippleCount * 3);
        const rippleVelocities = new Float32Array(rippleCount * 3);

        const centerX = (clientX / window.innerWidth) * 2 - 1;
        const centerY = -(clientY / window.innerHeight) * 2 + 1;

        const vector = new THREE.Vector3(centerX, centerY, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));

        for (let i = 0; i < rippleCount; i++) {
          const i3 = i * 3;
          const angle = (i / rippleCount) * Math.PI * 2;
          const speed = 2 + Math.random() * 3;

          ripplePositions[i3] = pos.x;
          ripplePositions[i3 + 1] = pos.y;
          ripplePositions[i3 + 2] = pos.z;

          rippleVelocities[i3] = Math.cos(angle) * speed;
          rippleVelocities[i3 + 1] = Math.sin(angle) * speed;
          rippleVelocities[i3 + 2] = (Math.random() - 0.5) * speed;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(ripplePositions, 3));

        const material = new THREE.PointsMaterial({
          size: 4,
          color: 0xccddff,
          transparent: true,
          opacity: 1,
          blending: THREE.AdditiveBlending,
        });

        const ripple = new THREE.Points(geometry, material);
        scene.add(ripple);

        let rippleLife = 0;
        const animateRipple = () => {
          rippleLife += 0.025;

          const positions = geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < rippleCount; i++) {
            const i3 = i * 3;
            positions[i3] += rippleVelocities[i3];
            positions[i3 + 1] += rippleVelocities[i3 + 1];
            positions[i3 + 2] += rippleVelocities[i3 + 2];

            rippleVelocities[i3] *= 0.96;
            rippleVelocities[i3 + 1] *= 0.96;
            rippleVelocities[i3 + 2] *= 0.96;
          }

          geometry.attributes.position.needsUpdate = true;
          material.opacity = Math.max(0, 1 - rippleLife);

          if (rippleLife < 1) {
            requestAnimationFrame(animateRipple);
          } else {
            scene.remove(ripple);
            geometry.dispose();
            material.dispose();
          }
        };

        animateRipple();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial scroll position
    handleScroll();

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

      // Camera parallax
      camera.position.x = mouseRef.current.x * 80;
      camera.position.y = mouseRef.current.y * 80;
      camera.lookAt(0, 0, 0);

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

      // Animate planets with scroll influence
      const scrollInfluence = scrollRef.current.current;

      planetsRef.current.forEach((planet, index) => {
        // Rotate on axis - speed increases with scroll
        const scrollSpeedMultiplier = 1 + scrollInfluence * 2;
        planet.mesh.rotation.y += planet.rotationSpeed * scrollSpeedMultiplier;
        planet.mesh.rotation.x += planet.rotationSpeed * 0.1 * scrollSpeedMultiplier;

        // Orbital motion - accelerated by scroll
        planet.angle += planet.orbitSpeed * scrollSpeedMultiplier;
        const baseX = planet.mesh.position.x;
        const baseZ = planet.mesh.position.z;
        planet.mesh.position.x += Math.cos(planet.angle) * 0.2;
        planet.mesh.position.z += Math.sin(planet.angle) * 0.2;

        // Additional scroll-based motion - planets drift based on scroll
        const scrollOffset = scrollInfluence * Math.PI * 2;
        const driftX = Math.sin(scrollOffset + index * 0.5) * 50;
        const driftY = Math.cos(scrollOffset + index * 0.7) * 30;
        planet.mesh.position.x += driftX * 0.01;
        planet.mesh.position.y += driftY * 0.01;

        // Animate moons
        if (planet.moons && planet.moons.length > 0) {
          planet.moons.forEach((moon, i) => {
            const moonAngle = time * 0.5 + i * Math.PI;
            const distance = planet.mesh.geometry.parameters.radius * 2.5;
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

      renderer.render(scene, camera);
    };

    animate();

    // ============================================
    // CLEANUP
    // ============================================
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
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

      if (renderer) {
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        background: "radial-gradient(ellipse at center, #0f0f18 0%, #050508 50%, #000000 100%)",
      }}
    />
  );
}
