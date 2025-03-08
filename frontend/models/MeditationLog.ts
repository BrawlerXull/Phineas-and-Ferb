import mongoose, { Schema, Document } from "mongoose"

interface IMeditationLog extends Document {
  userId: string
  date: Date
  duration: number
  createdAt: Date
}

const MeditationLogSchema = new Schema<IMeditationLog>({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true, default: 0.1 }, 
  createdAt: { type: Date, default: Date.now },
})

const MeditationLog =
  mongoose.models.MeditationLog ||
  mongoose.model<IMeditationLog>("MeditationLog", MeditationLogSchema)

export default MeditationLog
