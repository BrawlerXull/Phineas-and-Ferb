import mongoose, { Schema, Document } from "mongoose";

export interface IUserStats extends Document {
  userId: string;
  name?: string;
  xp: number;
  level: number;
  badges: string[];
}

const UserStatsSchema = new Schema<IUserStats>({
  userId: { type: String, required: true, unique: true },
  name: { type: String },
  xp: { type: Number, required: true, default: 0 },
  level: { type: Number, required: true, default: 1 },
  badges: { type: [String], default: [] },
});

export default mongoose.models.UserStats || mongoose.model<IUserStats>("UserStats", UserStatsSchema);
