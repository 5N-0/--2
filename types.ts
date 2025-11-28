export enum ParticleShape {
  GALAXY = 'Galaxy',
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  FIREWORKS = 'Fireworks',
  SPHERE = 'Sphere'
}

export interface HandState {
  isDetected: boolean;
  openness: number; // 0 (closed fist) to 1 (open palm)
  position: { x: number; y: number }; // Normalized -1 to 1
}

export interface ParticleConfig {
  count: number;
  color: string;
  size: number;
  shape: ParticleShape;
}