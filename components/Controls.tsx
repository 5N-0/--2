import React, { useState } from 'react';
import { ParticleShape } from '../types';
import { Maximize2, Minimize2, Video, VideoOff } from 'lucide-react';

interface ControlsProps {
  currentShape: ParticleShape;
  currentColor: string;
  onShapeChange: (shape: ParticleShape) => void;
  onColorChange: (color: string) => void;
  showCamera: boolean;
  onToggleCamera: () => void;
}

const SHAPE_OPTIONS = [
  { label: 'Galaxy', value: ParticleShape.GALAXY },
  { label: 'Heart', value: ParticleShape.HEART },
  { label: 'Flower', value: ParticleShape.FLOWER },
  { label: 'Saturn', value: ParticleShape.SATURN },
  { label: 'Fireworks', value: ParticleShape.FIREWORKS },
  { label: 'Sphere', value: ParticleShape.SPHERE },
];

const COLORS = [
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ff4444', // Red
  '#44ff44', // Green
  '#ffffff', // White
];

const Controls: React.FC<ControlsProps> = ({
  currentShape,
  currentColor,
  onShapeChange,
  onColorChange,
  showCamera,
  onToggleCamera,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-40">
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col gap-4 text-white">
        
        {/* Header / Info */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              GestureFlow
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Open/Close hand to control expansion. Move hand to rotate.
            </p>
          </div>
          
          <div className="flex gap-2">
             <button
              onClick={onToggleCamera}
              className={`p-2 rounded-full transition-colors ${showCamera ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}
              title="Toggle Camera Preview"
            >
              {showCamera ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Shapes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Shape</label>
            <div className="flex flex-wrap gap-2">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onShapeChange(opt.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all border ${
                    currentShape === opt.value
                      ? 'bg-white/20 border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                      : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Color</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onColorChange(c)}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      currentColor === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c, boxShadow: currentColor === c ? `0 0 10px ${c}` : 'none' }}
                  />
                ))}
              </div>
              
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              
              {/* Custom Color Picker */}
              <div className="relative group">
                 <input 
                    type="color" 
                    value={currentColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                 />
                 <div 
                    className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center bg-gradient-to-br from-gray-700 to-black group-hover:border-white transition-colors"
                 >
                    <span className="text-[10px] text-white">+</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hint (Only visible on small screens) */}
        <p className="text-xs text-center text-gray-500 sm:hidden pt-2 border-t border-white/10">
          Pinch to shrink, Open palm to expand
        </p>

      </div>
    </div>
  );
};

export default Controls;