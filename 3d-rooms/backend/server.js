const express = require("express");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api/v1/user", userRouter);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store player states and room information
const players = {}; // Player states (position, rotation, etc.)
const rooms = {
  'global-main': new Set()
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Add the player to the default "main" room
  
  players[socket.id] = {
    position: { x:0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    room: "main",
    group: "global"
  };
  
  // Send the initial player state and room details to the connecting client
  socket.on('join-room', ({peerId, group, room})=>{
    Array.from(socket.rooms).forEach(room=>socket.leave(room))
    players[socket.id].peerId=peerId
    // console.log('joining room')
    players[socket.id].group=group
    players[socket.id].room=room
    // console.log(players[socket.id])
    // rooms.map(id=>{
      //   console.log(id)
      // })
      // Array.from(rooms).map(id=>{
        //   console.log(players[id])
        // })
        // console.log(`${peerId} joined main room`)
        
        const currentRoom=`${group}-${room}`
        if(!rooms[currentRoom]){
          rooms[currentRoom]=new Set()
        }
        rooms[currentRoom].add(socket.id);
        socket.join(currentRoom);
        console.log(socket.rooms)
    
    socket.emit("initial-data", { players, rooms });
    io.to(currentRoom).emit(
      "player-update",
      Array.from(rooms[currentRoom]).map((id) => players[id])
    );
    io.to(currentRoom).emit("peer-joined", {id:socket.id, peerId})
  })

  // Notify all players in the "main" room about the new player

  // Join the "main" room room

  socket.on("move", (data) => {
    if (
      data.position &&
      data.rotation &&
      typeof data.position.x === "number" &&
      typeof data.position.y === "number" &&
      typeof data.position.z === "number"
    ) {
      players[socket.id].position = data.position;
      players[socket.id].rotation = data.rotation;
      players[socket.id].isMoving=data.isMoving
      // Emit to the room the player belongs to
      const room = players[socket.id].room;
      const group=players[socket.id].group
      const currentRoom=`${group}-${room}`
      // console.log(rooms[currentRoom])
      if (rooms[currentRoom]) {

        io.to(currentRoom).emit(
          "player-update",
          Array.from(rooms[currentRoom]).reduce((acc, id) => {
            acc[id] = players[id];
            return acc;
          }, {})
        );
      }
    }
  });
  socket.on("change-room", ({ newroom, newGroup }) => {
    const room = players[socket.id]?.room;
    const group = players[socket.id]?.group;
    const currentRoom = `${group}-${room}`;
    Array.from(socket.rooms).forEach(room=>socket.leave(room))
    if (rooms[currentRoom]) {
      rooms[currentRoom].delete(socket.id);
      socket.leave(currentRoom);
      console.log("left")
    }
    const currentPlayers=rooms[currentRoom]
    players[socket.id].room = newroom;
    players[socket.id].group = newGroup;
  
    const roomJoined = `${newGroup}-${newroom}`;
    if (!rooms[roomJoined]) rooms[roomJoined] = new Set();
    rooms[roomJoined].add(socket.id);
    socket.join(roomJoined);
    console.log(socket.rooms)
    io.to(roomJoined).emit(
      "player-update",
      Array.from(rooms[roomJoined]).reduce((acc, id) => {
        acc[id] = players[id];
        return acc;
      }, {})
    );
    io.to(currentRoom).emit(
      "player-update",
      Array.from(currentPlayers?currentPlayers:[]).reduce((acc, id) => {
        acc[id] = players[id];
        return acc;
      }, {})
    );
  });
  socket.on('sendMessage', ({ message }) => {
    // console.log(message)
    io.to(`${players[socket.id].group}-${players[socket.id].room}`).emit('receiveMessage', { message, user:socket.id });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const room = players[socket.id]?.room;
    const group = players[socket.id]?.group;
    const currentRoom=`${group}-${room}`
    // Remove the player from their room and data structures
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(socket.id);
      io.to(currentRoom).emit(
        "player-update",
        Array.from(rooms[currentRoom]).map((id) => players[id])
      );
    }
    delete players[socket.id];

    console.log(`User disconnected: ${socket.id}`);
    io.emit("player-update", players);
  });
});

io.listen(3000);

const port = 4000;
async function main() {
  try {
    const mongourl = process.env.MONGO_URL;
    await mongoose.connect(mongourl);
    console.log("connected to MongoDb Server");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process if the DB connection fails
  }
}
main();
