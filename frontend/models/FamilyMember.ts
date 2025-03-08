import mongoose, { Document, Schema } from 'mongoose'

interface FamilyMember extends Document {
  userId: string
  familyEmails: string[]  // Correctly use string[] for an array of emails
}

const familyMemberSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  familyEmails: [{ type: String }]  // Array to store family member emails
})

const FamilyMemberModel = mongoose.models.FamilyMember || mongoose.model<FamilyMember>('FamilyMember', familyMemberSchema)

export default FamilyMemberModel
