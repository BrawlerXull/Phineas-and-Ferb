import mongoose, { Schema, Document } from 'mongoose';

interface IEvent extends Document {
  name: string;
  description: string;
  date: Date;
  attendees: number;
}

const eventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  attendees: { type: Number, default: 0 },
});

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
