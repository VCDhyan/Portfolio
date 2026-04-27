import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

export default function InteractiveGeometry() {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Smooth, elegant rotation
    meshRef.current.rotation.x = Math.sin(time / 4);
    meshRef.current.rotation.y = Math.sin(time / 2);
    
    // Interactive mouse tracking for subtle tilt
    const targetX = (state.mouse.y * Math.PI) / 8;
    const targetY = (state.mouse.x * Math.PI) / 8;
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.1);
  });

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group ref={meshRef}>
          {/* Inner Glowing Core */}
          <Icosahedron args={[2, 2]} scale={1.2}>
            <MeshDistortMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={2}
              distort={0.4}
              speed={2}
              roughness={0}
              metalness={1}
              transparent
              opacity={0.8}
            />
          </Icosahedron>
          
          {/* Outer Wireframe Shell */}
          <Icosahedron args={[2.5, 1]} scale={1.2}>
            <meshStandardMaterial
              color="#8a2be2"
              wireframe
              wireframeLinewidth={2}
              transparent
              opacity={0.3}
            />
          </Icosahedron>
          
          {/* Orbiting rings */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[4, 0.02, 16, 100]} />
            <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
            <torusGeometry args={[5, 0.01, 16, 100]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
          </mesh>
        </group>
      </Float>
    </>
  );
}
