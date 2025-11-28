import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { HandState } from '../types';

interface HandTrackerProps {
  onHandUpdate: (state: HandState) => void;
  showDebug?: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, showDebug = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const requestRef = useRef<number>(0);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        if (!mounted) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (!mounted) return;

        landmarkerRef.current = landmarker;
        setIsLoaded(true);
        startWebcam();
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
      }
    };

    setupMediaPipe();

    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' 
        } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    } catch (err) {
      console.error("Webcam access denied:", err);
    }
  };

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to match video
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    let startTimeMs = performance.now();
    
    if (video.currentTime > 0) {
      const results = landmarkerRef.current.detectForVideo(video, startTimeMs);

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // --- Calculate Openness ---
        // Wrist is index 0
        // Tips are 4 (Thumb), 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
        // We calculate the average distance from wrist to all tips
        const wrist = landmarks[0];
        const tips = [4, 8, 12, 16, 20];
        let totalDist = 0;
        
        tips.forEach(idx => {
          const tip = landmarks[idx];
          const dist = Math.sqrt(
            Math.pow(tip.x - wrist.x, 2) + 
            Math.pow(tip.y - wrist.y, 2) + 
            Math.pow(tip.z - wrist.z, 2)
          );
          totalDist += dist;
        });

        const avgDist = totalDist / 5;
        // Empirically, closed fist avgDist is ~0.15, open palm is ~0.35 to 0.4
        // Normalize this to 0-1
        const minOpen = 0.15;
        const maxOpen = 0.45;
        let openness = (avgDist - minOpen) / (maxOpen - minOpen);
        openness = Math.max(0, Math.min(1, openness)); // Clamp

        // --- Calculate Position ---
        // Center of palm roughly index 0 or 9
        const handX = 1 - landmarks[9].x; // Mirror X
        const handY = 1 - landmarks[9].y; // Invert Y for 3D mapping

        // Update App State
        onHandUpdate({
          isDetected: true,
          openness,
          position: { x: handX, y: handY }
        });

        // Debug Drawing
        if (showDebug && ctx) {
          const drawingUtils = new DrawingUtils(ctx);
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2
          });
          drawingUtils.drawLandmarks(landmarks, { 
            color: "#FF0000", 
            lineWidth: 1, 
            radius: 3 
          });
        }
      } else {
        onHandUpdate({ isDetected: false, openness: 0, position: { x: 0.5, y: 0.5 } });
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-xl overflow-hidden shadow-lg border border-white/20 bg-black/50 transition-opacity duration-300 ${showDebug ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative w-32 h-24 sm:w-48 sm:h-36">
        <video 
          ref={videoRef} 
          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" 
          autoPlay 
          playsInline 
          muted
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" 
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-xs">
            Loading AI...
          </div>
        )}
      </div>
    </div>
  );
};

export default HandTracker;