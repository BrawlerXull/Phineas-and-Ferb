import mongoose, { Schema, Document } from "mongoose"

interface Event {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  date: string
  attendees: number
}

interface Community extends Document {
  name: string
  description: string
  members: number
  events: Event[]
}

const EventSchema = new Schema<Event>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  attendees: { type: Number, default: 0 }
})

const CommunitySchema = new Schema<Community>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  members: { type: Number, default: 1 },
  events: [EventSchema] // 👈 Nested sub-document schema
})

const CommunityModel = mongoose.models.Community || mongoose.model<Community>("Community", CommunitySchema)

export default CommunityModel
