import React, { useState } from 'react';
import ParticleScene from './components/ParticleScene';
import HandTracker from './components/HandTracker';
import Controls from './components/Controls';
import { ParticleShape, HandState } from './types';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ParticleShape>(ParticleShape.GALAXY);
  const [currentColor, setCurrentColor] = useState<string>('#00ffff');
  const [showCamera, setShowCamera] = useState<boolean>(true);
  
  const [handState, setHandState] = useState<HandState>({
    isDetected: false,
    openness: 0,
    position: { x: 0.5, y: 0.5 }
  });

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleScene 
          shape={currentShape} 
          color={currentColor} 
          handState={handState}
        />
      </div>

      {/* Vision Logic Layer (Invisible/Minimized by default) */}
      <HandTracker 
        onHandUpdate={setHandState} 
        showDebug={showCamera}
      />

      {/* UI Overlay Layer */}
      <Controls 
        currentShape={currentShape}
        currentColor={currentColor}
        onShapeChange={setCurrentShape}
        onColorChange={setCurrentColor}
        showCamera={showCamera}
        onToggleCamera={() => setShowCamera(prev => !prev)}
      />
      
      {/* Interaction Feedback Indicator */}
      {handState.isDetected && (
        <div 
           className="absolute pointer-events-none z-30 transition-all duration-100 ease-out border-2 border-white/30 rounded-full"
           style={{
             top: `${handState.position.y * 100}%`,
             left: `${handState.position.x * 100}%`,
             width: '40px',
             height: '40px',
             transform: `translate(-50%, -50%) scale(${0.5 + handState.openness})`,
             opacity: 0.3,
             boxShadow: `0 0 20px ${currentColor}`
           }}
        />
      )}

      {!handState.isDetected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-sm pointer-events-none animate-pulse z-10">
          Waiting for hands...
        </div>
      )}

    </div>
  );
};

export default App;