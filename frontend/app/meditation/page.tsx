'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import useMeditationTimer from '@/hooks/useMeditationTimer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { backgroundSounds, meditationTechniques } from '../../lib/meditationData';
import { useEffect } from 'react';
import { useFaceDetection } from '@/hooks/useFaceDetection'; 
import { useWebcam } from "@/hooks/useWebCam";
import useMeditationStaking from "@/hooks/useMeditationStakingContract";


export default function Meditation() {
  const {
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
  } = useMeditationTimer(0.1, backgroundSounds[0].name);
  const {checkIn, userData}=useMeditationStaking()
  const videoRef = useWebcam(); 
  const isFaceDetected = useFaceDetection(videoRef.current); 
  useEffect(()=>{
    if(!isFaceDetected) resetTimer();
  }, [isFaceDetected , resetTimer])
  
  useEffect(()=>{
    async function completeMeditate(){
      const result = await checkIn();
      console.log(result)
    }
    if(userData?.hasStaked && timeLeft==0) completeMeditate()
    else if(timeLeft==0) console.log("You have not staked")
  }, [timeLeft, userData , checkIn])

  const handleToggleTimer = () => {
    toggleTimer();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meditation Techniques</h1>
      <p className="text-lg">Explore these meditation techniques to improve your mental well-being.</p>
      {meditationTechniques.map((technique, index) => (
        <Card key={index} className="mb-6">
          <CardHeader>
            <CardTitle>{technique.title}</CardTitle>
            <CardDescription>{technique.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {technique.steps.map((step, stepIndex) => (
                <li key={stepIndex}>{step}</li>
              ))}
            </ol>
          </CardContent>
          <CardFooter>
            <Button>Start {technique.title}</Button>
          </CardFooter>
        </Card>
      ))}

      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Physical Exercises for Mental Health</h1>
        <p className="text-lg">Discover how physical activity can boost your mental well-being.</p>

      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Guided Meditation</CardTitle>
          <CardDescription>Set your meditation duration and background sound</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration: {duration} minutes
            </label>
            <Slider
              id="duration"
              min={1}
              max={60}
              step={1}
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              disabled={isActive}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="sound" className="text-sm font-medium">
              Background Sound
            </label>
            <Select
              value={selectedSound}
              onValueChange={(value) => setSelectedSound(value)}
              disabled={isActive}
            >
              <SelectTrigger id="sound">
                <SelectValue placeholder="Select a sound" />
              </SelectTrigger>
              <SelectContent>
                {backgroundSounds.map((sound) => (
                  <SelectItem key={sound.name} value={sound.name}>
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{formatTime(timeLeft)}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleToggleTimer}>{isActive ? 'Pause' : 'Start'}</Button>
          <Button onClick={resetTimer} variant="outline">Reset</Button>
        </CardFooter>
        <audio ref={audioRef} src={backgroundSounds.find(sound => sound.name === selectedSound)?.src} loop />
      </Card>

      <div className="w-full max-w-md mx-auto">
        <video ref={videoRef} autoPlay muted></video>
      </div>

      <div className="text-center mt-6">
        {isFaceDetected ? (
          <p className="text-lg text-green-600">You&apos;re meditating! Stay focused and present.</p>
        ) : (
          <p className="text-lg text-red-600">Please look at the camera to meditate.</p>
        )}
      </div>
    </div>
  );
}
