import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGraph } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  PositionalAudio,
  Text,
  Text3D,
} from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import model from "./otherCharacter.glb";
import * as THREE from "three";
export function OtherCharacter(props) {
  // console.log(props.listener)
  // const pos=new PositionalAudio
  const group = React.useRef();

  const { scene, animations } = useGLTF(model);
  // console.log(animations)
  // console.log(animations)
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  // console.log(actions)
  const {
    playerId,
    players,
    audio,
    socket,
    listener,
    currentRoom,
    receivedMessage,
    setReceivedMessage,
    // currentRoom,
currentGroup
  } = props;
  const size = {
    main: [0.2, 0.2, 0.2],
    movieRoom: [0.006, 0.006, 0.006],
  };
  // console.log(players)
  const [playerData, setPlayerData] = useState(players[playerId]);
  const audioRef = useRef();
  const [audioSrc, setAudioSrc] = useState(new Audio());
  useEffect(() => {
    console.log(
      "Animations:",
      animations.map((clip) => clip.name)
    );
    console.log("Actions:", actions);
  }, [animations, actions]);
  // useEffect(() => {
  //   console.log("yaya")
  //   console.log(audioRef)
  //   console.log(audio)
  //   if (audio && audioRef.current) {
  //     console.log("ayay")
  //     const audioSource = audioRef.current.context.createMediaStreamSource(audio);
  //     console.log(audioSource)
  //     audioRef.current.setNodeSource(audioSource);
  //     if (!audioRef.current.isPlaying) {
  //       audioRef.current.play();
  //     }
  //     // audioRef.current.setBuffer(buffer); // Set the buffer to PositionalAudio
  //   }
  // }, [audio, audioRef]);
  // useEffect(()=>{
  //   if(players[playerId]){

  //     // audioRef.current=new Audio()
  //     // const aud=new Audio()
  //     // // aud.stop
  //     // audioRef.current.srcObject=audio
  //     // audioRef.current.play()
  //     audioSrc.srcObject=audio
  //     // audioSrc.oncanplay(()=>{audioSrc.play()})
  //     const tryToPlayAudio = async () => {
  //       try {
  //         audioSrc.muted = true; // Start muted to comply with autoplay policies
  //         await audioSrc.play(); // Attempt playback
  //         audioSrc.muted = false; // Unmute after playback starts
  //         console.log("Audio playback started automatically");
  //       } catch (error) {
  //         console.warn(
  //           "Autoplay restrictions prevented audio playback. Retrying after user interaction...",
  //           error
  //         );

  //         // Add event listener for user interaction as a fallback
  //         // document.addEventListener("click", handleUserInteraction, { once: true });
  //         tryToPlayAudio();
  //       }
  //     };
  //     // audioSrc.play()
  //   }
  // },[audio, socket])

  // console.log(audio)
  // if(audio)audio.play()
  // const distance=useMemo(()=>{
  //   console.log(socket)
  //   if(playerData && playerData?.position && playerData.position.x && socket){
  //     return Math.sqrt((players[playerId].position.x*players[socket.id].position.x - players[socket.id].position.x*players[playerId].position.x)+(players[playerId].position.z*players[socket.id].position.z - players[socket.id].position.z*players[playerId].position.z))
  //   }
  //   else return 1
  // },[playerData, socket])
  // console.log(distance)
  useEffect(() => {
    setPlayerData(players[playerId]);
    
  }, [players, playerId]);
  if (!playerData || !playerData.position) return null;
  useEffect(() => {
    if (playerData.isMoving) {
      // console.log(actions)
      actions["Take 001"].play();
      // console.log(playerData.isMoving)
    } else {
      actions["Take 001"].stop();
    } // Cl
  }, [playerData]);
  useFrame(() => {
    if (group.current) {
      // group.current.scale=size[currentRoom]
      // console.log(group.current)
    }
  });
  useEffect(() => {
    console.log(receivedMessage);
    setTimeout(() => {
      if (receivedMessage) {
        setReceivedMessage((prev) => {
          const updated = { ...prev };
          delete updated[playerId];
          return updated;
        });
      }
    }, 5000);
  }, [receivedMessage]);
  useEffect(() => {
    if (audioRef.current && playerData?.position) {
      audioRef.current.position.set(
        playerData.position.x || 0,
        playerData.position.y || 0,
        playerData.position.z || 0
      );
    }
  }, [playerData]);
  // if(players[playerId]?.room!==currentRoom && players[playerId]?.group!==currentGroup) return <></>
  return (
    <group
      scale={size[currentRoom]}
      position={[
        playerData.position.x || 0,
        playerData.position.y || 0,
        playerData.position.z || 0,
      ]}
      rotation={[
        playerData.rotation?._x || 0,
        playerData.rotation?._y || 0,
        playerData.rotation?._z || 0,
      ]}
      ref={group}
      dispose={null}
    >
      <group name="Sketchfab_Scene">
        <primitive object={nodes._rootJoint} />
        {/* {listener
        // &&
        // <positionalAudio ref={audioRef} args={[listener]} autoplay />
        //  <positionalAudio ref={audioRef}/>
      // <PositionalAudio ref={audioRef} args={[listener]} autoplay />
      } */}
        {/* <PositionalAudio listener={listener} ref={audioRef} /> */}
        <skinnedMesh
          name="Object_96"
          geometry={nodes.Object_96.geometry}
          material={materials.rp_nathan_animated_003_mat}
          skeleton={nodes.Object_96.skeleton}
        />
      </group>
      {
        receivedMessage && (
          // <meshStandardMaterial color={"black"}>

          <Text
            fillOpacity={100}
            color={"white"}
            maxWidth={200}
            position={[0, 200, 0]}
            fontSize={10}
          >
            {receivedMessage}
          </Text>
        )

        // </meshStandardMaterial>}
      }
    </group>
  );
}

// useGLTF.preload('/nathan_animated_003_-_walking_3d_man-transformed.glb')
