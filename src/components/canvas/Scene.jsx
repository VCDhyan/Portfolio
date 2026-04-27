import React from 'react';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import InteractiveGeometry from './InteractiveGeometry';

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#8a2be2" />
      <directionalLight position={[-10, -10, -5]} intensity={2} color="#00ffff" />
      
      {/* High-end Professional 3D Scene */}
      <InteractiveGeometry />

      {/* Elegant Post-processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.9} 
          intensity={1.2} 
          mipmapBlur 
        />
        <ChromaticAberration 
          blendFunction={BlendFunction.NORMAL} 
          offset={[0.0005, 0.0005]} 
        />
      </EffectComposer>
    </>
  );
}
