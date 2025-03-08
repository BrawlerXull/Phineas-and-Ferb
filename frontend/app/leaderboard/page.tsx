"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

type LeaderboardEntry = {
  id: number
  name: string
  avatar: string
  score: number
  streak: number
  topBadge: string
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: 1,
    name: "Alice",
    avatar: "/placeholder.svg?height=32&width=32",
    score: 1200,
    streak: 15,
    topBadge: "Consistency King",
  },
  {
    id: 2,
    name: "Bob",
    avatar: "/placeholder.svg?height=32&width=32",
    score: 1150,
    streak: 12,
    topBadge: "Meditation Master",
  },
  {
    id: 3,
    name: "Charlie",
    avatar: "/placeholder.svg?height=32&width=32",
    score: 1100,
    streak: 10,
    topBadge: "Gratitude Guru",
  },
  {
    id: 4,
    name: "David",
    avatar: "/placeholder.svg?height=32&width=32",
    score: 1050,
    streak: 8,
    topBadge: "Mood Tracker",
  },
  {
    id: 5,
    name: "Eve",
    avatar: "/placeholder.svg?height=32&width=32",
    score: 1000,
    streak: 7,
    topBadge: "Exercise Enthusiast",
  },
]

export default function Leaderboard() {
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {rank}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>
      <Tabs defaultValue="weekly">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
              <CardDescription>Top performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                  <div className="flex-shrink-0 w-8">{getRankIcon(index + 1)}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar} alt={entry.name} />
                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{entry.name}</p>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {entry.score} points | {entry.streak} day streak
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {entry.topBadge}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Leaderboard</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>{/* Similar content to weekly, but with monthly data */}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alltime">
          <Card>
            <CardHeader>
              <CardTitle>All Time Leaderboard</CardTitle>
              <CardDescription>Top performers of all time</CardDescription>
            </CardHeader>
            <CardContent>{/* Similar content to weekly, but with all-time data */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

