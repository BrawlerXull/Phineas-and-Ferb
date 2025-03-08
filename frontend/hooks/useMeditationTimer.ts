import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

const useMeditationTimer = (initialDuration: number, initialSound: string) => {
  const [duration, setDuration] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [selectedSound, setSelectedSound] = useState(initialSound);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (isActive && !hasStarted) {
      setHasStarted(true);
      setTimeLeft(duration * 60);
    }
  }, [isActive, hasStarted, duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      logMeditation();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const logMeditation = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/meditate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Failed to log meditation:', error);
    }
  };

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
    if (!isActive && audioRef.current) {
      audioRef.current.play();
    } else if (isActive && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setHasStarted(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    duration,
    setDuration,
    isActive,
    timeLeft,
    selectedSound,
    setSelectedSound,
    audioRef,
    toggleTimer,
    resetTimer,
    formatTime,
  };
};

export default useMeditationTimer;
