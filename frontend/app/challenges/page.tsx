"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@clerk/nextjs"
import { startOfWeek, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"

type Challenge = {
  id: number
  name: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  reward: number
  progress: number
  total: number
  completed: boolean
}

type Reward = {
    id: number
    name: string
    description: string
    points: number
    progress: number
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

export default function Challenges() {
  const { user } = useUser()
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([])
  const [meditationChallenges, setMeditationChallenges] = useState<Challenge[]>([]);

  const [rewards] = useState<Reward[]>(mockRewards)

  useEffect(() => {
    if (user) {
      fetchChallenges(user.id)
      fetchMeditationData(user.id);
    }
  }, [user])

  const fetchChallenges = async (userId: string) => {
    try {
        const res = await fetch(`/api/check-in?userId=${userId}`)

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to fetch check-ins")

        const checkIns = data.checkIns.map((checkIn: any) => ({
            ...checkIn,
            createdAt: new Date(checkIn.createdAt + "T00:00:00Z"), // Normalize date to midnight UTC
          }))
          


      updateChallenges(checkIns)
    } catch (error) {
      console.error("Error fetching check-ins:", error)
    }
  }

  const updateMeditationChallenges = (meditationDays: Date[]) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    const meditatedToday = meditationDays.some((date) => isSameDay(date, today));
    const weeklyMeditationCount = meditationDays.filter((date) => date >= weekStart).length;

    setMeditationChallenges([
      {
        id: 7,
        name: "Daily Meditation",
        description: "Meditate at least once today",
        difficulty: "Easy",
        reward: 50,
        progress: meditatedToday ? 1 : 0,
        total: 1,
        completed: meditatedToday,
      },
      {
        id: 8,
        name: "Weekly Meditation Streak",
        description: "Meditate 5 times this week",
        difficulty: "Medium",
        reward: 150,
        progress: weeklyMeditationCount,
        total: 5,
        completed: weeklyMeditationCount >= 5,
      },
    ]);
  };

  const fetchMeditationData = async (userId: string) => {
    try {
      const res = await fetch(`/api/meditate?userId=${userId}`);
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || "Failed to fetch meditation data");
  
      const meditationDays = data.meditationDays.map((log: { date: string }) => new Date(log.date));
      
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const meditatedToday = meditationDays.some((date) => isSameDay(date, today));
      const weeklyMeditationCount = meditationDays.filter((date) => date >= weekStart).length;
  
      const dailyMeditationChallenge: Challenge = {
        id: 7,
        name: "Daily Meditation",
        description: "Meditate at least once today",
        difficulty: "Easy",
        reward: 50,
        progress: meditatedToday ? 1 : 0,
        total: 1,
        completed: meditatedToday,
      };
  
      const weeklyMeditationChallenge: Challenge = {
        id: 8,
        name: "Weekly Meditation Streak",
        description: "Meditate 5 times this week",
        difficulty: "Medium",
        reward: 150,
        progress: weeklyMeditationCount,
        total: 5,
        completed: weeklyMeditationCount >= 5,
      };
  
      // Append daily meditation challenge to dailyChallenges
      setDailyChallenges((prev) => [...prev, dailyMeditationChallenge]);
  
      // Append weekly meditation challenge to weeklyChallenges
      setWeeklyChallenges((prev) => [...prev, weeklyMeditationChallenge]);
    } catch (error) {
      console.error("Error fetching meditation data:", error);
    }
  };
  


  const completeChallenge = async (challenge: Challenge) => {
    if (!user) return;

  
    try {
      const response = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.fullName,
          challengeId: challenge.id,
          xpReward: challenge.reward,
          badge: challenge.completed ? null : challenge.name, // Assign badge when completing
        }),
      });
  
      const data = await response.json();
      console.log('Challenge completion response:', data);
  
      // Update local state to reflect completion
      setDailyChallenges((prev) =>
        prev.map((c) => (c.id === challenge.id ? { ...c, completed: true } : c))
      );
      setWeeklyChallenges((prev) =>
        prev.map((c) => (c.id === challenge.id ? { ...c, completed: true } : c))
      );
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };
  
  const updateChallenges = (checkIns: any[]) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday-starting week
  
    // Check-ins made today
    const todayCheckIns = checkIns.filter((entry) => isSameDay(entry.createdAt, today));
    const checkedInToday = todayCheckIns.length > 0;
  
    // Count weekly check-ins
    const weeklyCheckInCount = checkIns.filter((entry) => entry.createdAt >= weekStart).length;

    
  
    const daily = [
      {
        id: 1,
        name: "Daily Check-In",
        description: "Log your mood or activities today",
        difficulty: "Easy",
        reward: 50,
        progress: checkedInToday ? 1 : 0,
        total: 1,
        completed: checkedInToday,
      },
      {
        id: 2,
        name: "Gratitude Journal",
        description: "Write down 3 things you're grateful for",
        difficulty: "Easy",
        reward: 30,
        progress: 0,
        total: 1,
        completed: false,
      },
      {
        id: 3,
        name: "Mood Check-ins",
        description: "Log your mood 3 times today",
        difficulty: "Medium",
        reward: 60,
        progress: todayCheckIns.length, // Count only today's check-ins
        total: 3,
        completed: todayCheckIns.length >= 3,
      },
    ];
  
    const weekly = [
      {
        id: 4,
        name: "Weekly Reflection",
        description: "Check in at least 5 times this week",
        difficulty: "Medium",
        reward: 200,
        progress: weeklyCheckInCount,
        total: 5,
        completed: weeklyCheckInCount >= 5,
      },
      {
        id: 5,
        name: "Exercise Routine",
        description: "Exercise for 30 minutes 3 times this week",
        difficulty: "Medium",
        reward: 150,
        progress: 1,
        total: 3,
        completed: false,
      },
      {
        id: 6,
        name: "Social Connection",
        description: "Reach out to a friend or family member each day",
        difficulty: "Easy",
        reward: 100,
        progress: 4,
        total: 7,
        completed: false,
      },
    ];
  
    setDailyChallenges(daily);
    setWeeklyChallenges(weekly);
  };
  

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{challenge.name}</CardTitle>
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
        <Progress value={(challenge.progress / challenge.total) * 100} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Progress: {challenge.progress} / {challenge.total}
        </p>
        <p className="text-sm font-medium mt-2">Reward: {challenge.reward} XP</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => completeChallenge(challenge)} disabled={!challenge.completed}>
            {challenge.progress == challenge.total ? "Claim" : "Complete Challenge"}
        </Button>
        
       </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-6">
        {/* <h1 className="text-3xl font-bold">Rewards & Challenges</h1>
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
      </Card> */}
      <h1 className="text-3xl font-bold">Challenges</h1>
      <Tabs defaultValue="daily">
        <TabsList className="mb-10">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="daily">Daily Challenges</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
        <TabsContent value="daily">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {dailyChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="weekly">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {weeklyChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
