import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
let socket;
let audioContext; 

const useSocket = (url) => {
  if (!socket) {
    socket = io(url);
  }
  const [players, setPlayers] = useState({});
  const [Rooms, setRooms] = useState({});
  const [currentRoom, setCurrentRoom] = useState("");
  const [peerId, setPeerId]=useState()
  const peerRef=useRef(null)
  const [group, setGroup]=useState("main")
  const [receivedMessage, setReceiverMessage]=useState({})
  useEffect(() => {
      if(group.length==0 || currentRoom.length==0) return
      const newPeer = new Peer();
      peerRef.current=newPeer
      peerRef.current.on("open", (id)=>{
        console.log(id)
        setPeerId(id)
        console.log(currentRoom)
        setCurrentRoom("main")
        socket.emit("join-room", {peerId:id, room:currentRoom ,group:group})
      })
    // }
    socket.on("player-update", (updatedPlayers) => {
      // console.log(players)
      setPlayers(updatedPlayers);
    });
    socket.on("receiveMessage", ({message,user})=>{
      // console.log(message, user)
      setReceiverMessage(prev=>{return {...prev, [user]:message}})
    })
    // Initialize with Room and player data
    socket.on(
      "initial-data",
      ({ players: initialPlayers, rooms: initialRooms }) => {
        setPlayers(initialPlayers);
        setRooms(initialRooms);
      }
    );

    

    
    const handleAudioStream = async (audioBuffer) => {
        
      if (!audioContext) {
        console.log("no")
        await initializeAudioContext()
        return
      }; 
      const buffer = new Float32Array(audioBuffer);
      const audioBufferNode = audioContext.createBuffer(1, buffer.length, audioContext.sampleRate);
      audioBufferNode.copyToChannel(buffer, 0);

      const source = audioContext.createBufferSource();
      source.buffer = audioBufferNode;
      source.connect(audioContext.destination);
      source.start();
    };

    // socket.on("audio-stream", handleAudioStream);

    
    return () => {
      // socket.disconnect();
      socket.off("player-update")
      socket.off("initial-data")
      // newPeer.destroy(); // Clean up Peer instance on unmount
    };
  }, [group]);

  useEffect(()=>{
    
  },[])
  const changeRoom = (newRoom, newGroup) => {
    console.log(newGroup)
    setCurrentRoom(newRoom);
    setGroup(newGroup);
    socket.emit("change-room", {newroom:newRoom, newGroup});
  };

  const initializeAudioContext = async() => {
    if (!audioContext) {
      audioContext = new AudioContext();
      console.log("AudioContext initialized");
      return audioContext
    }
    else return audioContext
  };

  return { socket, players, Rooms, currentRoom, changeRoom, initializeAudioContext, peerRef, peerId, receivedMessage, setReceiverMessage, group, setGroup };
};

export default useSocket;
