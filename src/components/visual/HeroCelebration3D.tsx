import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const HeroCelebration3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let isVisible = true;
    let animationFrameId: number;

    // Three.js Scene Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Controlled Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const primaryLight = new THREE.DirectionalLight(0xecd8ff, 2.2);
    primaryLight.position.set(4, 6, 5);
    primaryLight.castShadow = true;
    primaryLight.shadow.mapSize.width = 1024;
    primaryLight.shadow.mapSize.height = 1024;
    scene.add(primaryLight);

    const coralRimLight = new THREE.PointLight(0xff7c91, 2.8, 12);
    coralRimLight.position.set(-4, -2, 3);
    scene.add(coralRimLight);

    const violetRimLight = new THREE.PointLight(0x7655e8, 3.0, 15);
    violetRimLight.position.set(2, -4, 2);
    scene.add(violetRimLight);

    // Group for celebration objects
    const celebrationGroup = new THREE.Group();
    scene.add(celebrationGroup);

    // 1. Glossy Celebration Balloons (Lilac, Coral, Ivory, Deep Violet)
    const balloonColors = [0x7655e8, 0xff7c91, 0xc5b4ff, 0xfffcf7, 0x5535b8];
    const balloons: THREE.Mesh[] = [];

    balloonColors.forEach((color, i) => {
      // Teardrop balloon geometry using sphere stretched on Y
      const balloonGeo = new THREE.SphereGeometry(0.7 + (i % 2) * 0.15, 32, 32);
      balloonGeo.scale(1, 1.25, 1);

      const balloonMat = new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: 0.15,
        metalness: 0.1,
        clearcoat: 0.95,
        clearcoatRoughness: 0.1,
        reflectivity: 0.8,
        transmission: i === 2 ? 0.35 : 0, // Translucent frosted balloon
      });

      const balloon = new THREE.Mesh(balloonGeo, balloonMat);
      balloon.castShadow = true;
      balloon.receiveShadow = true;

      const angle = (i / balloonColors.length) * Math.PI * 2;
      const radius = 1.3 + (i % 2) * 0.4;
      balloon.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.8 + 0.3,
        (i % 3) * 0.4 - 0.2
      );

      // Add a tiny knot to each balloon
      const knotGeo = new THREE.CylinderGeometry(0.06, 0.02, 0.1, 12);
      const knot = new THREE.Mesh(knotGeo, balloonMat);
      knot.position.y = -0.9;
      balloon.add(knot);

      celebrationGroup.add(balloon);
      balloons.push(balloon);
    });

    // 2. Center Sculptural Gift Box
    const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffcf7,
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 0.5,
    });
    const giftBox = new THREE.Mesh(boxGeo, boxMat);
    giftBox.position.set(0, -0.6, 0.5);
    giftBox.castShadow = true;
    giftBox.receiveShadow = true;
    celebrationGroup.add(giftBox);

    // Metallic Ribbon on Gift Box
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xff7c91,
      roughness: 0.3,
      metalness: 0.6,
    });
    const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.25, 1.22), ribbonMat);
    const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.22, 1.22), ribbonMat);
    giftBox.add(ribbonH);
    giftBox.add(ribbonV);

    // 3. Floating Confetti Prisms & Stars
    const confettiCount = 38;
    const confettiGeos = [
      new THREE.PlaneGeometry(0.12, 0.2),
      new THREE.TetrahedronGeometry(0.1),
      new THREE.OctahedronGeometry(0.09),
    ];
    const confettiParticles: { mesh: THREE.Mesh; rotSpeed: THREE.Vector3; floatSpeed: number }[] = [];

    for (let i = 0; i < confettiCount; i++) {
      const geo = confettiGeos[i % confettiGeos.length];
      const mat = new THREE.MeshStandardMaterial({
        color: balloonColors[i % balloonColors.length],
        roughness: 0.2,
        metalness: 0.5,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      celebrationGroup.add(mesh);
      confettiParticles.push({
        mesh,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
        floatSpeed: 0.005 + Math.random() * 0.008,
      });
    }

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = x * 0.35;
      targetRotX = -y * 0.25;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    // Handle Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // IntersectionObserver to pause rendering when scrolled out
    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Smooth mouse parallax
      celebrationGroup.rotation.y += (targetRotY - celebrationGroup.rotation.y) * 0.06;
      celebrationGroup.rotation.x += (targetRotX - celebrationGroup.rotation.x) * 0.06;

      // Gentle floating oscillation for balloons
      balloons.forEach((b, idx) => {
        b.position.y += Math.sin(elapsed * 1.5 + idx * 1.2) * 0.003;
        b.rotation.z = Math.sin(elapsed * 0.8 + idx) * 0.08;
      });

      // Subtle float on gift box
      giftBox.rotation.y = Math.sin(elapsed * 0.5) * 0.15;
      giftBox.position.y = -0.6 + Math.sin(elapsed * 1.2) * 0.04;

      // Confetti floating & tumbling
      confettiParticles.forEach(p => {
        p.mesh.rotation.x += p.rotSpeed.x;
        p.mesh.rotation.y += p.rotSpeed.y;
        p.mesh.rotation.z += p.rotSpeed.z;
        p.mesh.position.y += Math.sin(elapsed * 2 + p.mesh.position.x) * p.floatSpeed;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    // Elegant CSS Fallback
    return (
      <div className="relative flex h-full w-full items-center justify-center p-6">
        <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-primary/20 via-brand-soft to-brand-coral/20 p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <span className="text-6xl animate-bounce">🎈</span>
            <div className="mt-4 font-serif text-2xl font-bold text-brand-text">FêteFlow Celebration</div>
            <p className="mt-1 text-xs text-brand-text-secondary">Crafting magical moments in 3D</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[360px] sm:h-[420px] md:h-[500px] w-full select-none cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Celebration Canvas"
    />
  );
};
