'use client'

import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJoke } from "@/hooks/useJoke"  

export function JokeOfTheDay() {
  const { joke, isVisible, setIsVisible } = useJoke() 

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Joke of the Day</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription>{joke}</CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
