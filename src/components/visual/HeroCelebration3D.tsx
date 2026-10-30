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

    // Scene Setup
    const scene = new THREE.Scene();

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 750;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

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

    // Controlled Ambient & Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.5);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const violetRim = new THREE.PointLight(0xa48bff, 3.5, 20);
    violetRim.position.set(-6, -2, 4);
    scene.add(violetRim);

    const warmGoldLight = new THREE.PointLight(0xffb800, 3.0, 18);
    warmGoldLight.position.set(6, -3, 3);
    scene.add(warmGoldLight);

    const coralFill = new THREE.PointLight(0xff7c91, 2.5, 15);
    coralFill.position.set(0, 5, 2);
    scene.add(coralFill);

    // Main Group containing all celebration objects
    const celebrationGroup = new THREE.Group();
    scene.add(celebrationGroup);

    // Reusable Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.18,
    });

    const roseGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa4b2,
      metalness: 0.75,
      roughness: 0.22,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.6,
      reflectivity: 0.9,
    });

    const champagneLiquidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4d35e,
      transmission: 0.6,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
    });

    const dynamicObjects: {
      mesh: THREE.Object3D;
      basePos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      floatFreq: number;
      floatAmp: number;
      interactiveAmp?: number;
    }[] = [];

    // --- 1. CHAMPAGNE BOTTLE (Upper Left Foreground) ---
    const bottleGroup = new THREE.Group();
    // Bottle Body
    const bottleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 1.4, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x1b3b22, roughness: 0.1, transmission: 0.4, transparent: true })
    );
    bottleBody.position.y = 0;
    bottleGroup.add(bottleBody);

    // Bottle Neck
    const bottleNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.38, 0.8, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x1b3b22, roughness: 0.1, transmission: 0.4, transparent: true })
    );
    bottleNeck.position.y = 1.0;
    bottleGroup.add(bottleNeck);

    // Gold Foil Neck Wrap
    const neckFoil = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 0.6, 24), goldMaterial);
    neckFoil.position.y = 1.2;
    bottleGroup.add(neckFoil);

    // Cork Top
    const cork = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.12, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xc89d68, roughness: 0.8 })
    );
    cork.position.y = 1.55;
    bottleGroup.add(cork);

    // Label
    const bottleLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.422, 0.422, 0.6, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xfffbf2, roughness: 0.4 })
    );
    bottleLabel.position.y = 0;
    bottleGroup.add(bottleLabel);

    bottleGroup.position.set(-4.2, 1.4, 1.2);
    bottleGroup.rotation.set(0.3, -0.4, -0.45);
    celebrationGroup.add(bottleGroup);

    dynamicObjects.push({
      mesh: bottleGroup,
      basePos: bottleGroup.position.clone(),
      rotSpeed: new THREE.Vector3(0.003, 0.006, 0.002),
      floatFreq: 1.2,
      floatAmp: 0.08,
      interactiveAmp: 0.5,
    });

    // --- 2. CHAMPAGNE COUPE GLASSES (Right Midground) ---
    const coupeGroup = new THREE.Group();
    // Glass Bowl
    const coupeBowl = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glassMaterial);
    coupeBowl.rotation.x = Math.PI;
    coupeBowl.position.y = 0.5;
    coupeGroup.add(coupeBowl);

    // Liquid in Coupe
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.1, 0.25, 24), champagneLiquidMaterial);
    liquid.position.y = 0.38;
    coupeGroup.add(liquid);

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 16), glassMaterial);
    stem.position.y = 0.05;
    coupeGroup.add(stem);

    // Base
    const glassBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24), glassMaterial);
    glassBase.position.y = -0.3;
    coupeGroup.add(glassBase);

    coupeGroup.position.set(4.5, 0.8, 1.5);
    coupeGroup.rotation.set(-0.2, 0.3, 0.2);
    celebrationGroup.add(coupeGroup);

    dynamicObjects.push({
      mesh: coupeGroup,
      basePos: coupeGroup.position.clone(),
      rotSpeed: new THREE.Vector3(0.004, 0.008, 0.003),
      floatFreq: 1.4,
      floatAmp: 0.09,
    });

    // --- 3. TIERED CELEBRATION CAKE (Lower Left) ---
    const cakeGroup = new THREE.Group();
    const cakeMat = new THREE.MeshStandardMaterial({ color: 0xfffcf7, roughness: 0.25 });
    const frostingGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.3 });

    // Tier 1 (Bottom)
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.45, 32), cakeMat);
    tier1.position.y = -0.2;
    cakeGroup.add(tier1);
    const goldBand1 = new THREE.Mesh(new THREE.TorusGeometry(0.81, 0.03, 12, 32), frostingGold);
    goldBand1.rotation.x = Math.PI / 2;
    goldBand1.position.y = -0.4;
    cakeGroup.add(goldBand1);

    // Tier 2 (Top)
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 32), cakeMat);
    tier2.position.y = 0.22;
    cakeGroup.add(tier2);
    const goldBand2 = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.025, 12, 32), frostingGold);
    goldBand2.rotation.x = Math.PI / 2;
    goldBand2.position.y = 0.03;
    cakeGroup.add(goldBand2);

    // Candle on top
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: 0xff7c91, roughness: 0.3 })
    );
    candle.position.y = 0.58;
    cakeGroup.add(candle);

    // Flame
    const flameGeo = new THREE.ConeGeometry(0.05, 0.12, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.8;
    cakeGroup.add(flame);

    // Candle flickering light
    const candleLight = new THREE.PointLight(0xffaa00, 1.8, 4);
    candleLight.position.y = 0.82;
    cakeGroup.add(candleLight);

    cakeGroup.position.set(-4.0, -2.4, 0.5);
    cakeGroup.rotation.set(0.25, 0.5, -0.1);
    celebrationGroup.add(cakeGroup);

    dynamicObjects.push({
      mesh: cakeGroup,
      basePos: cakeGroup.position.clone(),
      rotSpeed: new THREE.Vector3(0.002, 0.005, 0),
      floatFreq: 1.0,
      floatAmp: 0.06,
    });

    // --- 4. FACETED DISCO / MIRROR BALL (Upper Center-Right) ---
    const discoGeo = new THREE.SphereGeometry(0.75, 24, 20);
    const discoMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.08,
      flatShading: true, // Creates sparkling mirror facets!
    });
    const discoBall = new THREE.Mesh(discoGeo, discoMat);
    discoBall.position.set(4.2, 2.5, 0.2);
    celebrationGroup.add(discoBall);

    dynamicObjects.push({
      mesh: discoBall,
      basePos: discoBall.position.clone(),
      rotSpeed: new THREE.Vector3(0.008, 0.015, 0.004),
      floatFreq: 1.6,
      floatAmp: 0.08,
    });

    // --- 5. PARTY POPPER / CRACKER (Lower Right) ---
    const popperGroup = new THREE.Group();
    const popperBody = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.9, 20, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x7655e8, metalness: 0.6, roughness: 0.3 })
    );
    popperBody.rotation.x = Math.PI;
    popperGroup.add(popperBody);

    // Metallic Rim & Ribbons bursting out
    const popperRim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 12, 24), goldMaterial);
    popperGroup.add(popperRim);

    popperGroup.position.set(4.4, -2.2, 0.8);
    popperGroup.rotation.set(-0.6, -0.3, 0.8);
    celebrationGroup.add(popperGroup);

    dynamicObjects.push({
      mesh: popperGroup,
      basePos: popperGroup.position.clone(),
      rotSpeed: new THREE.Vector3(0.004, 0.007, 0.003),
      floatFreq: 1.3,
      floatAmp: 0.07,
    });

    // --- 6. SCULPTURAL GIFT BOX (Mid Background Left) ---
    const giftGroup = new THREE.Group();
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xfffcf7, roughness: 0.2 })
    );
    giftGroup.add(boxMesh);

    const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(0.87, 0.18, 0.87), roseGoldMaterial);
    const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.87, 0.87), roseGoldMaterial);
    giftGroup.add(ribbonH);
    giftGroup.add(ribbonV);

    giftGroup.position.set(-2.8, -1.2, -1.5);
    giftGroup.rotation.set(0.4, -0.3, 0.2);
    celebrationGroup.add(giftGroup);

    dynamicObjects.push({
      mesh: giftGroup,
      basePos: giftGroup.position.clone(),
      rotSpeed: new THREE.Vector3(0.003, 0.006, 0.002),
      floatFreq: 1.1,
      floatAmp: 0.05,
    });

    // --- 7. LUXURY METALLIC & PEARL BALLOONS (Scattered dynamically) ---
    const balloonPositions = [
      { pos: new THREE.Vector3(-5.2, 3.0, -1.0), color: 0xa48bff, scale: 0.85 },
      { pos: new THREE.Vector3(-2.0, 3.4, -2.0), color: 0xff7c91, scale: 0.95 },
      { pos: new THREE.Vector3(2.5, 3.2, -1.8), color: 0xffd700, scale: 0.75 },
      { pos: new THREE.Vector3(5.2, -1.0, -1.2), color: 0xc5b4ff, scale: 0.9 },
      { pos: new THREE.Vector3(-5.0, -0.8, -1.8), color: 0xffa4b2, scale: 0.8 },
      { pos: new THREE.Vector3(3.0, -2.8, -2.2), color: 0x7655e8, scale: 0.85 },
    ];

    balloonPositions.forEach(b => {
      const bGroup = new THREE.Group();
      const bGeo = new THREE.SphereGeometry(b.scale, 28, 28);
      bGeo.scale(1, 1.25, 1);
      const bMat = new THREE.MeshPhysicalMaterial({
        color: b.color,
        roughness: 0.12,
        metalness: 0.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bGroup.add(bMesh);

      // Balloon Knot
      const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.08, 12), bMat);
      knot.position.y = -b.scale * 1.22;
      bGroup.add(knot);

      bGroup.position.copy(b.pos);
      celebrationGroup.add(bGroup);

      dynamicObjects.push({
        mesh: bGroup,
        basePos: bGroup.position.clone(),
        rotSpeed: new THREE.Vector3(0.002, 0.004, 0.001),
        floatFreq: 1.0 + Math.random() * 0.8,
        floatAmp: 0.1 + Math.random() * 0.05,
      });
    });

    // --- 8. SWIRLING 3D CELEBRATION RIBBONS ---
    const createCurvedRibbon = (startPos: THREE.Vector3, color: number) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startPos.x, startPos.y - 1.5, startPos.z),
        new THREE.Vector3(startPos.x + 0.6, startPos.y - 0.5, startPos.z + 0.4),
        new THREE.Vector3(startPos.x - 0.5, startPos.y + 0.6, startPos.z - 0.2),
        new THREE.Vector3(startPos.x + 0.4, startPos.y + 1.6, startPos.z + 0.3),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.04, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.2 });
      const ribbonMesh = new THREE.Mesh(tubeGeo, tubeMat);
      celebrationGroup.add(ribbonMesh);

      dynamicObjects.push({
        mesh: ribbonMesh,
        basePos: ribbonMesh.position.clone(),
        rotSpeed: new THREE.Vector3(0.001, 0.003, 0.002),
        floatFreq: 1.1,
        floatAmp: 0.06,
      });
    };

    createCurvedRibbon(new THREE.Vector3(-3.2, 0.5, -0.5), 0xffd700);
    createCurvedRibbon(new THREE.Vector3(3.2, -0.8, -0.8), 0xff7c91);

    // --- 9. DRIFTING FLORAL PETALS (Rose & Lavender) ---
    const petalGeo = new THREE.CylinderGeometry(0.12, 0.02, 0.24, 16);
    petalGeo.scale(1, 0.1, 1.8);
    const petalMat1 = new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.4, side: THREE.DoubleSide });
    const petalMat2 = new THREE.MeshStandardMaterial({ color: 0xc5b4ff, roughness: 0.4, side: THREE.DoubleSide });

    const petals: { mesh: THREE.Mesh; driftSpeed: THREE.Vector3; rotSpeed: THREE.Vector3 }[] = [];
    for (let i = 0; i < 24; i++) {
      const mesh = new THREE.Mesh(petalGeo, i % 2 === 0 ? petalMat1 : petalMat2);
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      celebrationGroup.add(mesh);
      petals.push({
        mesh,
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          -0.006 - Math.random() * 0.008, // Gently drifting down
          (Math.random() - 0.5) * 0.004
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
      });
    }

    // --- 10. SHIMMERING STARS & CONFETTI PIECES ---
    const confettiColors = [0xffd700, 0xa48bff, 0xff7c91, 0x10b981, 0xffffff];
    const confettiGeos = [
      new THREE.PlaneGeometry(0.12, 0.2),
      new THREE.TetrahedronGeometry(0.09),
      new THREE.OctahedronGeometry(0.08),
    ];

    const confettis: { mesh: THREE.Mesh; rotSpeed: THREE.Vector3; floatSpeed: number }[] = [];
    for (let i = 0; i < 50; i++) {
      const geo = confettiGeos[i % confettiGeos.length];
      const mat = new THREE.MeshStandardMaterial({
        color: confettiColors[i % confettiColors.length],
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
      });
      const cMesh = new THREE.Mesh(geo, mat);
      cMesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 5
      );
      cMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      celebrationGroup.add(cMesh);
      confettis.push({
        mesh: cMesh,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04
        ),
        floatSpeed: 0.004 + Math.random() * 0.008,
      });
    }

    // Interactive Mouse Tracking & Parallax
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragRotX = 0;
    let dragRotY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetX = x * 0.45;
      targetY = -y * 0.35;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        dragRotY += deltaX * 0.005;
        dragRotX += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Click anywhere to pop celebratory impulse
    const onClick = (e: MouseEvent) => {
      // Small pulse impulse on all items
      dynamicObjects.forEach(obj => {
        obj.mesh.position.y += (Math.random() - 0.5) * 0.3;
        obj.mesh.rotation.y += (Math.random() - 0.5) * 0.8;
      });
      // Flashes candle and rim lights
      warmGoldLight.intensity = 5.5;
      violetRim.intensity = 6.0;
      setTimeout(() => {
        warmGoldLight.intensity = 3.0;
        violetRim.intensity = 3.5;
      }, 300);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 750;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(container);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Flickering candle flame
      candleLight.intensity = 1.8 + Math.sin(elapsed * 12) * 0.4 + Math.cos(elapsed * 23) * 0.2;
      flame.scale.set(
        1 + Math.sin(elapsed * 15) * 0.15,
        1 + Math.cos(elapsed * 18) * 0.2,
        1 + Math.sin(elapsed * 15) * 0.15
      );

      // Smooth camera / group rotation with drag + mouse parallax
      celebrationGroup.rotation.y += (targetX + dragRotY - celebrationGroup.rotation.y) * 0.05;
      celebrationGroup.rotation.x += (targetY + dragRotX - celebrationGroup.rotation.x) * 0.05;

      // Float & rotate each signature object
      dynamicObjects.forEach((obj, idx) => {
        obj.mesh.rotation.x += obj.rotSpeed.x;
        obj.mesh.rotation.y += obj.rotSpeed.y;
        obj.mesh.rotation.z += obj.rotSpeed.z;
        obj.mesh.position.y =
          obj.basePos.y + Math.sin(elapsed * obj.floatFreq + idx * 0.8) * obj.floatAmp;
        obj.mesh.position.x =
          obj.basePos.x + Math.cos(elapsed * (obj.floatFreq * 0.7) + idx) * (obj.floatAmp * 0.5);
      });

      // Drifting petals (wrap around top when fall below viewport)
      petals.forEach(p => {
        p.mesh.position.add(p.driftSpeed);
        p.mesh.rotation.x += p.rotSpeed.x;
        p.mesh.rotation.y += p.rotSpeed.y;
        p.mesh.rotation.z += p.rotSpeed.z;

        if (p.mesh.position.y < -5) {
          p.mesh.position.y = 5;
          p.mesh.position.x = (Math.random() - 0.5) * 12;
        }
      });

      // Shimmering Confetti tumbling
      confettis.forEach(c => {
        c.mesh.rotation.x += c.rotSpeed.x;
        c.mesh.rotation.y += c.rotSpeed.y;
        c.mesh.rotation.z += c.rotSpeed.z;
        c.mesh.position.y += Math.sin(elapsed * 2 + c.mesh.position.x) * c.floatSpeed;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Complete GPU memory reclamation: traverse and dispose all geometries and materials
      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat: THREE.Material) => mat.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        <div className="text-center text-brand-primary opacity-60">
          <span className="text-7xl">✨</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full select-none cursor-none overflow-hidden pointer-events-auto"
      aria-label="Full-bleed 3D Celebration Environment"
    />
  );
};
