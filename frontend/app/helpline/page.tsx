import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Heart, Dumbbell, BookOpen, Users } from 'lucide-react'
import { ExternalLink } from 'lucide-react'

const helplines = [
    {
      title: "Mental Health Support India",
      description: "24/7 free and confidential mental health support for people in distress.",
      contact: "9152987821",
      website: "https://www.suicidepreventionindia.org",
    },
    {
      title: "iCALL Helpline",
      description: "Free, confidential support via phone, chat, and email, available 9 AM to 9 PM.",
      contact: "9152987821",
      website: "https://www.icallhelpline.org",
    },
    {
      title: "National Mental Health Rehabilitation Helpline",
      description: "A helpline for mental health issues, available 24/7.",
      contact: "91-22-27721150 / 91-22-27721151",
      website: "https://www.nimhans.ac.in",
    },
    {
      title: "Vandrevala Foundation Helpline",
      description: "24/7 emotional support and mental health care service.",
      contact: "9152987821 / 1860 266 2345",
      website: "https://www.vandrevalafoundation.com",
    },
    {
      title: "The Life Boat",
      description: "A confidential helpline for emotional support and mental health crisis intervention.",
      contact: "91-9820466726",
      website: "https://www.thelifeboat.in",
    },
    {
      title: "SNEH Foundation Helpline",
      description: "Support for mental health concerns, counseling, and emotional well-being.",
      contact: "91-22-27721393",
      website: "https://www.snehfoundationindia.org",
    }
]

const strategies = [
  {
    title: "Deep Breathing",
    description: "Practice deep breathing exercises to help calm your mind and reduce stress.",
    icon: Brain,
  },
  {
    title: "Mindfulness Meditation",
    description: "Engage in mindfulness meditation to increase awareness and reduce anxiety.",
    icon: Heart,
  },
  {
    title: "Physical Exercise",
    description: "Regular physical activity can help improve mood and reduce symptoms of depression and anxiety.",
    icon: Dumbbell,
  },
  {
    title: "Journaling",
    description: "Write down your thoughts and feelings to help process emotions and gain clarity.",
    icon: BookOpen,
  },
  {
    title: "Social Connection",
    description: "Reach out to friends or family members for support and connection.",
    icon: Users,
  },
]

export default function Helpline() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Mental Health helplines</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {helplines.map((helpline, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{helpline.title}</CardTitle>
              <CardDescription>{helpline.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Contact: {helpline.contact}</p>
            </CardContent>
            <CardFooter>
              <a
                href={helpline.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline"
              >
                Visit Website
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-center">Coping Strategies</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy, index) => (
            <Card key={index}>
              <CardHeader>
                <strategy.icon className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>{strategy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{strategy.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/helpline">View Helpline</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

