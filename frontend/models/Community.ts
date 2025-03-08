import mongoose, { Schema, Document } from "mongoose"

interface Message {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: Date;
}

interface Event {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  date: string
  attendees: number
}

interface Community extends Document {
  name: string;
  description: string;
  members: number;
  events: Event[];
  messages: Message[];
}

const EventSchema = new Schema<Event>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  attendees: { type: Number, default: 0 }
})

const MessageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 🔥 Changed from `ObjectId` to `String`
  userName: { type: String, required: true },
  userAvatar: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});



const CommunitySchema = new Schema<Community>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  members: { type: Number, default: 1 },
  events: [EventSchema],
  messages: [MessageSchema], // 👈 Add this
});

const CommunityModel = mongoose.models.Community || mongoose.model<Community>("Community", CommunitySchema)

export default CommunityModel
