import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

export const useFaceDetection = (videoElement: HTMLVideoElement | null) => {
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [blazeFaceModel, setBlazeFaceModel] = useState<blazeface.BlazeFaceModel | null>(null);

  
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready(); 
        const model = await blazeface.load(); 
        setBlazeFaceModel(model);
      } catch (error) {
        console.error('Failed to load BlazeFace model:', error);
      }
    };

    loadModel();
  }, []);

  
  useEffect(() => {
    if (!videoElement || !blazeFaceModel) return;

    const detectFace = async () => {
      const predictions = await blazeFaceModel.estimateFaces(videoElement, false);
      setIsFaceDetected(predictions.length > 0);
    };

    const intervalId = setInterval(detectFace, 100);

    
    return () => {
      clearInterval(intervalId);
    };
  }, [blazeFaceModel, videoElement]);

  return isFaceDetected;
};
