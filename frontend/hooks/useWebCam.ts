import { useEffect, useRef } from 'react';

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    
    videoElement.width = 640;
    videoElement.height = 480;

    
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        videoElement.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  }, []);

  return videoRef;
};
