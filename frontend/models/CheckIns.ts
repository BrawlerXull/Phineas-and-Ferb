import mongoose, { Schema, Document } from 'mongoose';

interface ICheckIn extends Document {
  userId: string;
  mood: string;
  activities: string;
  thoughts: string;
  createdAt: Date;
}

const checkInSchema = new Schema<ICheckIn>({
  userId: { type: String, required: true },
  mood: { type: String, required: true },
  activities: { type: String, required: true },
  thoughts: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CheckIn = mongoose.models.CheckIn || mongoose.model<ICheckIn>('CheckIn', checkInSchema);

export default CheckIn;
