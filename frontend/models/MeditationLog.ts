import mongoose, { Schema, Document } from 'mongoose';

export interface IMeditationLog extends Document {
  userId: string;
  date: Date;
}

const MeditationLogSchema = new Schema<IMeditationLog>({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
});

export default mongoose.models.MeditationLog || mongoose.model<IMeditationLog>('MeditationLog', MeditationLogSchema);
