import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Character from "../Models/Character.jsx";
import Room from "../Models/Room.jsx";
import useSocket from "../Hooks/useSocket.jsx";
import { OtherCharacter } from "../Models/OtherCharacter.jsx";
import { GiOldMicrophone } from "react-icons/gi";
import axiosInstance from "../axios/axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import Peer from "peerjs";
import Tv from "../Models/Tv.jsx";
import Model from "../Models/Sci-fi__future_tunnel.jsx";
import * as THREE from "three";
import Gallery from "../Models/Gallery_museum_showroom_banquet_hall.jsx";
import Televe from "../Models/Televe.jsx";
const HangoutRoom = () => {

  const { groupId } = useParams();
  useEffect(() => {
    console.log(groupId)
    setGroup(groupId);
  }, [groupId]);
  // console.log(groupId)
  const {
    socket,
    players,
    rooms,
    changeRoom,
    peerRef,
    peerId,
    receivedMessage,
    setReceiverMessage,
    group,
    setGroup,
  } = useSocket("http://localhost:3000");
  // setGroup(groupId)
  const [isTyping, setIsTyping] = useState(false);
  const [audioListener] = useState(() => new THREE.AudioListener());
  const [micOn, setMicOn] = useState(true);
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    setMessage(e.target.value);
  };
  
  const [audioStream, setAudioStream] = useState(null);
  const [currentRoom, setCurrentRoom] = useState("main");
  const [peers, setPeers] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const navigate = useNavigate();
  const [remoteAudios, setRemoteAudio] = useState({});
  const [audioContext] = useState(
    () => new (window.AudioContext || window.webkitAudioContext)()
  );
  // const existingCalls = {}; // To track active calls
  const [existingCalls, setExistingCalls] = useState({});
  const [videoTexture, setVideoTexture] = useState(null);
  useEffect(()=>{
    changeRoom(currentRoom, groupId)
  },[])
  useEffect(() => {
    // Ensure the AudioContext starts when the component is mounted
    if (audioContext.state === "suspended") {
      audioContext.resume(); // Automatically resume AudioContext if it's suspended
    }
  }, [audioContext]);
  useEffect(() => {
    Object.values(existingCalls).forEach((call) => {
      call.close();
      console.log(call)
    })
    setRemoteAudio({});
    setExistingCalls({})
    if (socket) changeRoom(currentRoom, groupId);

    // Inform server about Room change
  }, [currentRoom, socket, group, groupId]);
  const sendMessage = () => {
    socket.emit("sendMessage", { message });
    setMessage("");
  };
  useEffect(() => {
    if (!socket || Object.keys(players).length === 0) return;

    // Handle incoming calls
    peerRef.current?.on("call", async (call) => {
      console.log(call);
      // console.log(call.metadata.screenShare)
      if (call.metadata.screenShare) {
        console.log("share");
        // setIsScreenSharing(true)

        const nullStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        call.answer(nullStream);

        call.on("stream", (stream) => {
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();

          // Create a video texture for Three.js
          const texture = new THREE.VideoTexture(video);
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.format = THREE.RGBAFormat;

          return setVideoTexture(texture);
        });
      } else {
        setPeers((prev) => [...prev, call.peer]);

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          call.answer(stream, { metadata: { receiverId: socket.id } }); // Answer the call

          // Listen for the remote stream
          call.on("stream", (remoteStream) => {
            setRemoteAudio((prev) => ({
              ...prev,
              [call.metadata.senderId]: remoteStream,
            }));
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play();
          });

          call.on("close", () => {
            // Clean up when the call ends
            setRemoteAudio((prev) => {
              const updated = { ...prev };
              delete updated[call.metadata.senderId];
              return updated;
            });
          });
        });
      }
    });

    // Handle new peers joining the room
    const handlePeerJoined = async ({ id, peerId }) => {
      console.log(`${id} joined!`);
      if ((id === socket.id || existingCalls[id]) || (players[id]?.room !==players[socket.id]?.room && players[id]?.group !==players[socket.id]?.group) ) return; // Ignore self or existing calls
      console.log(id);
      try {
        const stream =
          audioStream ||
          (await navigator.mediaDevices.getUserMedia({ audio: true }));
        setAudioStream(stream);

        const call = peerRef.current?.call(peerId, stream, {
          metadata: { senderId: socket.id },
        });
        // console.log(call)
        if (call) {
          // existingCalls[id] = call; // Track the call
          setExistingCalls((prev) => {
            return { ...prev, [id]: call };
          });
          // setExistingCalls((prev)=>{return{...prev, [id]:call}})
          call.on("stream", (remoteStream) => {
            setRemoteAudio((prev) => ({ ...prev, [id]: remoteStream }));
          });

          call.on("close", () => {
            // Clean up when the call ends
            delete existingCalls[id];
            setRemoteAudio((prev) => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            });
          });
        }
      } catch (err) {
        console.error("Failed to handle peer join:", err);
      }
    };

    socket.off("peer-joined").on("peer-joined", handlePeerJoined);
    const handlePeerLeft = ({ id, peerId }) => {
      console.log(`${id} left`);
      if (id === socket.id || !existingCalls[id]) {
        return;
      } // Ignore self or existing calls
      console.log(id);
      try {
        const call = existingCalls[id];
        console.log(call);
        if (call) {
          call.close();
          console.log(call);
          setExistingCalls((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
          setRemoteAudio((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    socket.off("peer-left").on("peer-left", handlePeerLeft);
    // return () => {
    //   socket.off("peer-joined");
    //   Object.values(existingCalls).forEach((call) => call.close());
    // };
  }, [socket, players, audioStream, peerRef]);

  useEffect(() => console.log(remoteAudios), [remoteAudios]);
  const getAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
    } catch (error) {
      console.error("Failed to capture audio:", error);
    }
  };

  // const toggleMic = async () => {
  //   setMicOn((prev) => !prev);
  // };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/v1/user/logout");
      if (response.data.message === "Successfully logged out") {
        localStorage.clear();
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };



  return (
    <div className="font-sans w-screen h-screen bg-black">
      <div className="flex flex-col min-h-screen h-screen items-center justify-center">
        {/* Room Selection UI */}
        <div className="absolute top-0 left-0 w-full flex justify-center mt-4 z-50">
          <div className="flex space-x-4">
            {["main", "movieRoom", "movieRoom2"].map((Room) => (
              <button
                key={Room}
                className={`px-4 py-2 rounded ${
                  currentRoom === Room
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setCurrentRoom(Room)}
              >
                {Room}
              </button>
            ))}
          </div>
        </div>
        {/* 3D Room Canvas */}
        <Canvas camera={{ position: [10, 10, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight intensity={1} />
          <directionalLight position={[0, 10, 0]} intensity={1} />
          {currentRoom == "movieRoom" ? (
            <Room
              players={players}
              isScreenSharing={isScreenSharing}
              setIsScreenSharing={setIsScreenSharing}
              peers={peers}
              videoTexture={videoTexture}
              setVideoTexture={setVideoTexture}
            />
          ) : (
            <Gallery />
          )}
          {/* <Model /> */}
          {/* Render other players in the same Room */}
          {Object.keys(players)
            .filter(
              (playerId) =>
                playerId !== socket.id &&
                players[playerId]?.room == players[socket.id]?.room &&
                players[playerId]?.group ==players[socket.id]?.group
            )
            .map((playerId) => (
              <OtherCharacter
                receivedMessage={receivedMessage[playerId]}
                setReceivedMessage={setReceiverMessage}
                key={playerId}
                playerId={playerId}
                players={players}
                socket={socket}
                audio={remoteAudios[playerId] ? remoteAudios[playerId] : null}
                listener={audioListener}
                currentRoom={currentRoom}
                currentGroup={groupId}
              />
            ))}

          {/* Render the current player */}
          {/* <Televe players={players} isScreenSharing={isScreenSharing} setIsScreenSharing={setIsScreenSharing} peers={peers} videoTexture={videoTexture} setVideoTexture={setVideoTexture}/> */}
          {/* <Tv players={players} isScreenSharing={isScreenSharing} setIsScreenSharing={setIsScreenSharing} peers={peers} videoTexture={videoTexture} setVideoTexture={setVideoTexture}/> */}
          <Character
            isTyping={isTyping}
            playerId={socket.id}
            players={players}
            currentRoom={currentRoom}
            socket={socket}
            audioListener={audioListener}
          />
          <OrbitControls maxPolarAngle={Math.PI / 2} />
        </Canvas>
        {currentRoom == "movieRoom" && (
          <div className="flex fixed bottom-20 left-20 z-20">
            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className="bg-blue-500 text-white rounded-full p-4"
            >
              Share Screen
            </button>
          </div>
        )}
        <div className="flex fixed bottom-20 right-20 z-20">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white rounded-full p-4"
          >
            Logout
          </button>
        </div>
        <div className="fixed bottom-0 mb-4 mr-4 right-0 min-w-max flex">
          <input
            onFocus={() => setIsTyping(true)}
            onBlur={() => {
              setIsTyping(false);
            }}
            onChange={handleChange}
            value={message}
            className="min-w-max px-3 h-8 rounded-l-lg text-xl"
            placeholder="Enter message"
          ></input>
          <button
            onClick={sendMessage}
            className="bg-black rounded-r-lg px-4 h-8 right-0 text-white text-lg hover:bg-slate-600 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default HangoutRoom;
