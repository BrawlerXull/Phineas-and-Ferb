"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type Reward = {
  id: number
  name: string
  description: string
  points: number
  progress: number
}

type Challenge = {
  id: number
  name: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  reward: number
  completed: boolean
}

const mockRewards: Reward[] = [
  {
    id: 1,
    name: "Consistency King",
    description: "Complete check-ins for 7 consecutive days",
    points: 100,
    progress: 70,
  },
  { id: 2, name: "Meditation Master", description: "Meditate for a total of 5 hours", points: 200, progress: 40 },
  { id: 3, name: "Gratitude Guru", description: "Write 50 things you're grateful for", points: 150, progress: 90 },
]

const mockChallenges: Challenge[] = [
  {
    id: 1,
    name: "Morning Mindfulness",
    description: "Meditate for 10 minutes every morning for a week",
    difficulty: "Easy",
    reward: 50,
    completed: false,
  },
  {
    id: 2,
    name: "Positivity Challenge",
    description: "Write down 3 positive things each day for 2 weeks",
    difficulty: "Medium",
    reward: 100,
    completed: false,
  },
  {
    id: 3,
    name: "30-Day Mood Boost",
    description: "Complete all daily challenges for 30 days straight",
    difficulty: "Hard",
    reward: 500,
    completed: false,
  },
]

export default function Rewards() {
  const [rewards] = useState<Reward[]>(mockRewards)
  const [challenges] = useState<Challenge[]>(mockChallenges)
  const [xp] = useState(1250)
  const [level] = useState(5)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Rewards & Challenges</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            Level {level} - {xp} XP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(xp % 1000) / 10} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">{1000 - (xp % 1000)} XP to next level</p>
        </CardContent>
      </Card>
      <Tabs defaultValue="rewards">
        <TabsList>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        <TabsContent value="rewards">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader>
                  <CardTitle>{reward.name}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={reward.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">{reward.progress}% complete</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm font-medium">{reward.points} XP</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="challenges">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{challenge.name}</CardTitle>
                    <Badge
                      variant={
                        challenge.difficulty === "Easy"
                          ? "secondary"
                          : challenge.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Reward: {challenge.reward} XP</p>
                </CardContent>
                <CardFooter>
                  <Button disabled={challenge.completed}>
                    {challenge.completed ? "Completed" : "Start Challenge"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

