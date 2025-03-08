import FamilyMemberModel from '@/models/FamilyMember'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    console.log('Received request to save family email')
    const { userId, email } = await req.json()
    console.log('Extracted data:', userId, email)

    // Find the family member by userId
    let familyMember = await FamilyMemberModel.findOne({ userId })
    
    // If family member doesn't exist, create a new one
    if (!familyMember) {
      console.log('Family member not found, creating new record...')
      familyMember = new FamilyMemberModel({
        userId,
        familyEmails: [email] // Initialize familyEmails as an array with the first email
      })
      await familyMember.save()
      console.log('New family member record created with email:', email)
    } else {
      // Ensure familyEmails is initialized as an array
      if (!Array.isArray(familyMember.familyEmails)) {
        familyMember.familyEmails = []
      }

      // If family member exists, push the new email to the array
      if (!familyMember.familyEmails.includes(email)) {
        familyMember.familyEmails.push(email)
        await familyMember.save()
        console.log('Added new email to existing family member record:', email)
      } else {
        console.log('Email already exists for this family member.')
      }
    }

    return NextResponse.json({ message: 'Family email saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json({ error: 'Failed to save family email' }, { status: 500 })
  }
}
