"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"


type LeaderboardEntry = {
  userId: string
  name: string
  avatar: string
  xp: number
  level: number
  badges: string[]
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    async function fetchLeaderboard() {
      const response = await fetch("/api/leaderboard")
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    }

    fetchLeaderboard()
  }, [])

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
      <Card>
        <CardHeader>
          <CardTitle>Top Players</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div key={entry.userId} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                <div className="flex-shrink-0 w-8">{getRankIcon(index + 1)}</div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
                  <AvatarFallback>{entry.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{entry.name}</p>
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                    {entry.xp} XP | Level {entry.level}
                  </p>
                </div>
                {entry.badges.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {entry.badges[0]}
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
