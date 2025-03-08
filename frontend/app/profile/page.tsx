"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type UserProfile = {
  name: string
  avatar: string
  level: number
  xp: number
  badges: string[]
}

type CheckInData = {
  createdAt: string
  mood: string
  activities: string
  thoughts: string
}

type MeditationData = {
  date: string
  startTime: string
  duration: number
}

export default function Profile() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [checkIns, setCheckIns] = useState<CheckInData[]>([])
  const [meditationHistory, setMeditationHistory] = useState<MeditationData[]>([])
  const [loading, setLoading] = useState(true)

  // State for family emails
  const [familyEmails, setFamilyEmails] = useState<string[]>([])
  const [newFamilyEmail, setNewFamilyEmail] = useState("")

  const handleAddFamilyEmail = async () => {
    if (newFamilyEmail) {
      try {
        // Ensure the user is authenticated
        if (!user?.id) {
          console.error('User is not authenticated.')
          return
        }

        // Send the family email and userId to the backend
        const res = await fetch('/api/family-members', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, email: newFamilyEmail }),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await res.json()
        if (res.ok) {
          setFamilyEmails([...familyEmails, newFamilyEmail]) // Update the local state with the new email
          setNewFamilyEmail('') // Clear the input field
        } else {
          console.error('Error saving email:', data.error)
        }
      } catch (error) {
        console.error('Error saving family email:', error)
      }
    }
  }

  useEffect(() => {
    if (!user) return

    const fetchUserStats = async () => {
      try {
        const res = await fetch(`/api/challenges/complete?userId=${user.id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch user stats")

        setProfile({
          name: user.fullName || "User",
          avatar: user.imageUrl || "/placeholder.svg",
          level: data.level,
          xp: data.xp,
          badges: data.badges || [],
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchCheckIns = async () => {
      try {
        const res = await fetch(`/api/check-in?userId=${user.id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch check-ins")

        setCheckIns(data.checkIns)
      } catch (error) {
        console.error("Error fetching check-ins:", error)
      }
    }

    const fetchMeditationHistory = async () => {
      try {
        const res = await fetch(`/api/meditate?userId=${user.id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch meditation history")

        setMeditationHistory(data.meditationDays)
      } catch (error) {
        console.error("Error fetching meditation history:", error)
      }
    }

    fetchUserStats()
    fetchCheckIns()
    fetchMeditationHistory()
  }, [user])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFamilyEmail(e.target.value)
  }

  if (loading) return <p>Loading...</p>
  if (!profile) return <p>Error loading profile</p>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile.name}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Level {profile.level}</p>
            <Progress value={(profile.xp % 1000) / 10} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {1000 - (profile.xp % 1000)} XP to next level
            </p>
          </CardContent>
        </Card>

        {/* Badges Card */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.badges.length > 0 ? (
                profile.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No badges earned yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in History */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in History</CardTitle>
        </CardHeader>
        <CardContent>
          {checkIns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Activities</TableHead>
                  <TableHead>Thoughts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn, index) => (
                  <TableRow key={index}>
                    <TableCell>{checkIn.createdAt}</TableCell>
                    <TableCell>
                      <Progress value={moodToProgress(checkIn.mood)} className="w-24" />
                    </TableCell>
                    <TableCell>{checkIn.activities}</TableCell>
                    <TableCell>{checkIn.thoughts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No check-ins available.</p>
          )}
        </CardContent>
      </Card>

      {/* Meditation History */}
      <Card>
        <CardHeader>
          <CardTitle>Meditation History</CardTitle>
        </CardHeader>
        <CardContent>
          {meditationHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meditationHistory.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(log.startTime).toLocaleTimeString()}</TableCell>
                    <TableCell>{Math.floor(log.duration / 60)} min {log.duration % 60} sec</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No meditation history available.</p>
          )}
        </CardContent>
      </Card>

      {/* Family Email Section */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Input
                type="email"
                placeholder="Enter family member's email"
                value={newFamilyEmail}
                onChange={handleEmailChange}
                className="input"
              />
              <Button
                onClick={handleAddFamilyEmail}
                className="btn mt-2"
              >
                Add Family Member
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Convert mood string to progress bar percentage
const moodToProgress = (mood: string) => {
  const moods = { happy: 100, neutral: 30, angry: 70, anxious: 50, sad: 20 }
  return moods[mood] || 50
}

// Calculate meditation streak
const meditationStreak = (history: MeditationData[]) => {
  return Math.min(history.length * 10, 100) // Example: Each session adds 10% progress
}
