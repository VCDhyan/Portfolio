import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Particles({ count = 3000 }) {
  const mesh = useRef();
  const hover = useRef(false);

  // Generate random positions, colors, and sizes
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const color1 = new THREE.Color('#8a2be2'); // Purple
    const color2 = new THREE.Color('#00ffff'); // Cyan
    const color3 = new THREE.Color('#ff00ff'); // Magenta

    for (let i = 0; i < count; i++) {
      // Create a cylindrical/spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 15;
      const y = (Math.random() - 0.5) * 30;

      positions[i * 3] = radius * Math.cos(theta);
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = radius * Math.sin(theta);

      // Randomly assign one of the 3 theme colors
      const mixedColor = [color1, color2, color3][Math.floor(Math.random() * 3)];
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 1.5;
    }
    return [positions, colors, sizes];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    // Slowly rotate the entire particle system
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    mesh.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;

    // Optional: make particles react to mouse/pointer slightly
    mesh.current.rotation.x = THREE.MathUtils.lerp(
      mesh.current.rotation.x,
      (state.mouse.y * Math.PI) / 10,
      0.05
    );
    mesh.current.rotation.y += THREE.MathUtils.lerp(
      0,
      (state.mouse.x * Math.PI) / 10,
      0.05
    );
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
