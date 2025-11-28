import { ParticleShape } from '../types';
import * as THREE from 'three';

const COUNT = 5000;

const getRandomPointInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return {
    x: r * sinPhi * Math.cos(theta),
    y: r * sinPhi * Math.sin(theta),
    z: r * Math.cos(phi)
  };
};

export const generateParticles = (shape: ParticleShape): Float32Array => {
  const positions = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    let x = 0, y = 0, z = 0;
    const i3 = i * 3;

    switch (shape) {
      case ParticleShape.GALAXY: {
        // Spiral Galaxy
        const branches = 3;
        const radius = Math.random() * 5 + 0.5;
        const spinAngle = radius * 2.5;
        const branchAngle = (i % branches) * ((2 * Math.PI) / branches);
        const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
        const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;

        x = Math.cos(branchAngle + spinAngle) * radius + randomX;
        y = randomY * 2; // Flattened
        z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        break;
      }

      case ParticleShape.HEART: {
        // Parametric Heart
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.3; // Volume factor
        const scale = 0.35;
        
        // Base heart curve
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        let hz = 0;

        // Add volume
        const p = getRandomPointInSphere(1.5);
        
        x = (hx + p.x) * scale;
        y = (hy + p.y) * scale;
        z = (hz + p.z * 2) * scale; // Thinner in Z
        break;
      }

      case ParticleShape.FLOWER: {
        // Rose curve / Flower
        const theta = Math.random() * Math.PI * 2;
        const k = 4; // Petals
        const r = Math.cos(k * theta); 
        const spread = Math.random() * 1.5;
        
        // Add some depth and randomness
        x = r * Math.cos(theta) * 4 * spread;
        y = r * Math.sin(theta) * 4 * spread;
        z = (Math.random() - 0.5) * 2;
        break;
      }

      case ParticleShape.SATURN: {
        const isRing = i > COUNT * 0.3; // 70% ring, 30% planet
        if (isRing) {
          const innerR = 3;
          const outerR = 6;
          const r = innerR + Math.random() * (outerR - innerR);
          const theta = Math.random() * Math.PI * 2;
          x = r * Math.cos(theta);
          y = (Math.random() - 0.5) * 0.2; // Thin ring
          z = r * Math.sin(theta);
        } else {
          // Planet sphere
          const p = getRandomPointInSphere(2.2);
          x = p.x;
          y = p.y;
          z = p.z;
        }
        break;
      }

      case ParticleShape.FIREWORKS: {
        const p = getRandomPointInSphere(6);
        x = p.x;
        y = p.y;
        z = p.z;
        break;
      }

      case ParticleShape.SPHERE:
      default: {
        const p = getRandomPointInSphere(4);
        x = p.x;
        y = p.y;
        z = p.z;
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};