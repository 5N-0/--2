import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleShape, HandState } from '../types';
import { generateParticles } from '../utils/geometry';

interface ParticleSceneProps {
  shape: ParticleShape;
  color: string;
  handState: HandState;
}

const Particles: React.FC<ParticleSceneProps> = ({ shape, color, handState }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 5000;
  
  // Target positions based on selected shape
  const targetPositions = useMemo(() => generateParticles(shape), [shape]);
  
  // Current positions buffer
  const currentPositions = useMemo(() => new Float32Array(count * 3), []);
  
  // Initialize current positions to target on mount
  useEffect(() => {
    currentPositions.set(targetPositions);
  }, []); // Run once on mount

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    // Interaction Parameters
    // If hand is detected, use its openness. If not, breathe automatically.
    const targetScale = handState.isDetected 
      ? 0.5 + (handState.openness * 2.5) // Hand: 0.5 (closed) to 3.0 (open)
      : 1.5 + Math.sin(time * 0.8) * 0.5; // Auto breathe
    
    const rotationSpeed = handState.isDetected ? 0.05 : 0.1;

    // Apply rotation to the whole group for galaxy effect
    pointsRef.current.rotation.y += delta * rotationSpeed;
    if (handState.isDetected) {
       // Tilt based on hand Y position
       pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, (handState.position.y - 0.5) * 1, 0.1);
       pointsRef.current.rotation.z = THREE.MathUtils.lerp(pointsRef.current.rotation.z, (handState.position.x - 0.5) * -1, 0.1);
    } else {
       // Subtle float
       pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }

    // Update each particle
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const tx = targetPositions[i3];
      const ty = targetPositions[i3 + 1];
      const tz = targetPositions[i3 + 2];

      // Current pos
      let cx = positions[i3];
      let cy = positions[i3 + 1];
      let cz = positions[i3 + 2];

      // 1. Morph to Target Shape (Linear Interpolation)
      // Smoothly move current particles towards the target shape definitions
      const morphSpeed = 3.0 * delta;
      cx += (tx - cx) * morphSpeed;
      cy += (ty - cy) * morphSpeed;
      cz += (tz - cz) * morphSpeed;

      // 2. Apply "Explosion/Expansion" from center based on Hand Openness
      // We calculate the vector from center (0,0,0) and scale it
      // Actually, we can just multiply the position by the scale factor since origin is center
      // But we need to separate the "base shape" tracking from the "visual scale"
      // So we store the 'morphed' position back to buffer, but Render the scaled version?
      // No, let's apply the scale directly to the geometry for simplicity in this frame, 
      // but we need to remember the 'base' is targetPositions.
      
      // Better approach: 
      // The `positions` array holds the actual render coordinates.
      // We Lerp the `positions` towards `targetPositions * targetScale`.
      
      const scaledTx = tx * targetScale;
      const scaledTy = ty * targetScale;
      const scaledTz = tz * targetScale;

      // Add noise/jitter for "Energy" feel
      const jitter = handState.isDetected ? handState.openness * 0.1 : 0.02;
      
      positions[i3] = THREE.MathUtils.lerp(positions[i3], scaledTx, 0.1) + (Math.random() - 0.5) * jitter;
      positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1], scaledTy, 0.1) + (Math.random() - 0.5) * jitter;
      positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2], scaledTz, 0.1) + (Math.random() - 0.5) * jitter;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent={true}
        opacity={0.8}
      />
    </points>
  );
};

const ParticleScene: React.FC<ParticleSceneProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 2]} // Responsive pixel ratio
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 40]} />
        
        <ambientLight intensity={0.5} />
        
        <Particles {...props} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={!props.handState.isDetected} autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default ParticleScene;