import React, { useEffect, useState, forwardRef, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Character = ({ playerId, players, socket, audioListener, currentRoom, isTyping }) => {
  const { scene, animations } = useGLTF('/man.glb');
  const characterRef = useRef();
  const { actions } = useAnimations(animations, characterRef);
  // console.log(actions)
  const size={
    main:[0.2,0.2,0.2],
    movieRoom:[0.006,0.006,0.006]
  }
  useEffect(()=>{
    if(characterRef.current){

      characterRef.current.position.x=0;
      characterRef.current.position.z=0;
    }
  },[currentRoom])
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
  const isLocalPlayer = playerId === socket.id;
  const speed = {
    main:2,
    movieRoom:0.15
  }
  const direction = new THREE.Vector3();
  const [isMoving, setIsMoving] = useState(false);
  scene.traverse((child) => {
    if (child.isMesh) {
      child.geometry.center(); 
    }
  });
  
  const height={
    movieRoom:1,
    main:16.8*2
  }
  
  useEffect(() => {
    if (!isLocalPlayer) return;

    const handleKeyDown = (e) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isLocalPlayer]);

  useEffect(() => {
    console.log(actions)
    if (isLocalPlayer && (keys.w || keys.s) && actions["Take 001"]) {
      actions["Take 001"].play();
      setIsMoving(true);
    } else if (actions["Take 001"]) {
      actions["Take 001"].stop();
      setIsMoving(false);
    }
  }, [keys.w, keys.s, actions, isLocalPlayer]);

  useFrame(({ camera }) => {
    camera.add(audioListener)
    if (isLocalPlayer && characterRef.current ) {
      direction.set(0, 0, 0);
  
      if(!isTyping){

        if (keys.w) direction.z += speed[currentRoom];  
        if (keys.s) direction.z -= speed[currentRoom];  
        
        
        if (keys.a) characterRef.current.rotation.y += 0.05;  
        if (keys.d) characterRef.current.rotation.y -= 0.05;  
        
        direction.applyQuaternion(characterRef.current.quaternion);
        characterRef.current.position.add(direction);
      }
  

      camera.position.set(
        characterRef.current.position.x,
        characterRef.current.position.y + height[currentRoom], 
        characterRef.current.position.z
      );
  

      camera.rotation.set(
        0, 
        characterRef.current.rotation.y+Math.PI, 
        0  
      );
  
      socket.emit("move", {
        position: characterRef.current.position,
        rotation: characterRef.current.rotation,
        isMoving: isMoving
      });
    }
  });
  
  
  

  return (
    <mesh ref={characterRef} scale={[size[currentRoom]]}>
      <primitive object={scene} />
    </mesh>
  );
};

export default Character;
