import React, { useEffect, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import characterModel from "/man.glb";
import * as THREE from 'three' 
const Character = () => {
  const { scene, animations } = useGLTF(characterModel);
  const characterRef = useRef();
  const { actions } = useAnimations(animations, characterRef);

  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });

  const speed = 0.01;
  let direction = new THREE.Vector3();

  const handleKeyDown = (e) => {
    setKeys((prevKeys) => ({ ...prevKeys, [e.key.toLowerCase()]: true }));
  };

  const handleKeyUp = (e) => {
    setKeys((prevKeys) => ({ ...prevKeys, [e.key.toLowerCase()]: false }));
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    console.log(actions)
    if (keys.w || keys.s && actions["Take 001"]) {
      actions["Take 001"].play();
    } else if (actions["Take 001"]) {
      actions["Take 001"].stop();
    }
  }, [keys.w, keys.s, actions]);

  useFrame(() => {
    if (characterRef.current) {
      console.log(actions)
      direction.set(0, 0, 0);

      if (keys.w) direction.z += speed;
      if (keys.s) direction.z -= speed;

      if (keys.a) characterRef.current.rotation.y += 0.05;
      if (keys.d) characterRef.current.rotation.y -= 0.05;

      characterRef.current.position.add(direction.applyQuaternion(characterRef.current.quaternion));
    }
  });

  return (
    <mesh
      ref={characterRef}
      position={[0, 0, 0]}
      scale={[0.006, 0.006, 0.006]}
    >
      <primitive object={scene} />
    </mesh>
  );
};

export default Character;
