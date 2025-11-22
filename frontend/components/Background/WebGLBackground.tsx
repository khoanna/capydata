"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
// @ts-ignore
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
  const sunRef = useRef<{ mesh: THREE.Mesh, glow: THREE.Mesh } | null>(null);
  
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

    // Sun light positioned to match sun object - subdued intensity
    const sunLight = new THREE.PointLight(0xffbb88, 2.0, 3500);
    sunLight.position.set(1000, 600, -1200);
    sunLight.castShadow = false;
    scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    backLight.position.set(-500, 200, -500);
    scene.add(backLight);

    // ============================================
    // SUN OBJECT - Cinematic realistic sun
    // ============================================
    const createSun = () => {
      // Sun core with turbulence shader - larger for cinematic effect
      const sunGeometry = new THREE.SphereGeometry(200, 128, 128);
      
      // Custom shader for realistic burning sun effect
      const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        
        // 3D Noise function for surface displacement
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // Multi-octave noise for realistic solar flare surface
          float noise1 = snoise(normal * 2.0 + time * 0.05);
          float noise2 = snoise(normal * 4.0 + time * 0.08);
          float noise3 = snoise(normal * 8.0 + time * 0.12);
          float displacement = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * 8.0;
          
          vec3 newPosition = position + normal * displacement;
          vPosition = newPosition;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `;

      const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          // Multi-layered turbulent noise for realistic solar surface
          vec3 noiseCoord = vPosition * 0.01;
          float noiseVal1 = snoise(vec3(vUv * 3.0, time * 0.08));
          float noiseVal2 = snoise(vec3(vUv * 6.0 + 100.0, time * 0.12));
          float noiseVal3 = snoise(vec3(vUv * 12.0 - 200.0, time * 0.15));
          
          float combinedNoise = noiseVal1 * 0.5 + noiseVal2 * 0.3 + noiseVal3 * 0.2;
          
          // Realistic sun colors - subdued, not too bright
          vec3 deepRed = vec3(0.5, 0.08, 0.0);      // Deep crimson core
          vec3 darkOrange = vec3(0.7, 0.25, 0.05);  // Burning orange
          vec3 warmYellow = vec3(0.85, 0.55, 0.25); // Warm yellow corona
          
          // Mix colors based on noise for plasma effect
          vec3 baseColor = mix(deepRed, darkOrange, combinedNoise * 0.5 + 0.5);
          baseColor = mix(baseColor, warmYellow, pow(combinedNoise * 0.5 + 0.5, 2.0) * 0.6);
          
          // Fresnel effect for edge glow (subdued)
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.5);
          vec3 fresnelColor = vec3(0.65, 0.35, 0.15) * fresnel * 0.7;
          
          // Add some darker spots (sunspots)
          float spotNoise = snoise(vPosition * 0.15 + time * 0.02);
          float spots = smoothstep(0.3, 0.5, spotNoise);
          baseColor = mix(baseColor * 0.4, baseColor, spots);
          
          vec3 finalColor = baseColor + fresnelColor;
          
          // Enhanced visibility while keeping cinematic look
          finalColor = finalColor * 1.8;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader,
        fragmentShader,
        side: THREE.FrontSide,
        transparent: false
      });

      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      // Position sun in visible area - upper right background for cinematic effect
      sun.position.set(1000, 600, -1200);
      scene.add(sun);

      // Sun Corona/Atmosphere - Multiple layers for realism
      const coronaGeometry = new THREE.SphereGeometry(240, 64, 64);
      const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color(0xff6622) }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float time;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float intensity = pow(0.6 - dot(vNormal, viewDirection), 3.5);
            
            // Pulsating effect
            float pulse = sin(time * 0.5) * 0.15 + 0.95;
            intensity *= pulse;
            
            vec3 glow = glowColor * intensity * 0.8; // Enhanced glow for visibility
            gl_FragColor = vec4(glow, intensity * 0.8);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });

      const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
      corona.position.copy(sun.position);
      scene.add(corona);

      // Outer atmospheric glow - very subtle
      const atmoGeometry = new THREE.SphereGeometry(320, 64, 64);
      const atmoMaterial = new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(0xff8844) }
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying vec3 vNormal;
          
          void main() {
            float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
            vec3 glow = glowColor * intensity * 0.6;
            gl_FragColor = vec4(glow, intensity * 0.5);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });

      const atmosphere = new THREE.Mesh(atmoGeometry, atmoMaterial);
      atmosphere.position.copy(sun.position);
      scene.add(atmosphere);

      sunRef.current = { mesh: sun, glow: corona };
      
      // Store atmosphere reference for updates
      (sun as any).atmosphere = atmosphere;
    };

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

    createSun();
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
          const geometry = clickedMesh.geometry as THREE.SphereGeometry;
          const offset = (geometry.parameters?.radius || 100) * 1.5 + 50;
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

      // Update Sun Shader with realistic slow rotation
      if (sunRef.current) {
        const sunMaterial = sunRef.current.mesh.material as THREE.ShaderMaterial;
        if (sunMaterial.uniforms) {
          sunMaterial.uniforms.time.value = time;
        }
        
        // Update Corona (glow) Shader
        const coronaMaterial = sunRef.current.glow.material as THREE.ShaderMaterial;
        if (coronaMaterial.uniforms) {
          coronaMaterial.uniforms.time.value = time;
        }
        
        // Update atmosphere if exists
        const atmosphere = (sunRef.current.mesh as any).atmosphere;
        if (atmosphere) {
          const atmoMaterial = atmosphere.material as THREE.ShaderMaterial;
          if (atmoMaterial.uniforms && atmoMaterial.uniforms.time) {
            atmoMaterial.uniforms.time.value = time;
          }
        }
        
        // Very slow rotation for realistic effect
        sunRef.current.mesh.rotation.y += 0.0005;
        sunRef.current.mesh.rotation.x += 0.0002;
      }

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
        const geometry = planet.geometry as THREE.SphereGeometry;
        const offset = (geometry.parameters?.radius || 100) * 1.5 + 50;
        
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

      // Sun Cleanup (sun, corona, and atmosphere)
      if (sunRef.current) {
        // Clean sun mesh
        sunRef.current.mesh.geometry.dispose();
        (sunRef.current.mesh.material as THREE.Material).dispose();
        scene.remove(sunRef.current.mesh);
        
        // Clean corona (glow)
        sunRef.current.glow.geometry.dispose();
        (sunRef.current.glow.material as THREE.Material).dispose();
        scene.remove(sunRef.current.glow);
        
        // Clean atmosphere
        const atmosphere = (sunRef.current.mesh as any).atmosphere;
        if (atmosphere) {
          atmosphere.geometry.dispose();
          (atmosphere.material as THREE.Material).dispose();
          scene.remove(atmosphere);
        }
      }

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
