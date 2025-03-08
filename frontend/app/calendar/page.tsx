'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useMoodCalendar } from "@/hooks/useMoodCalendar"


const moodColors: Record<string, string> = {
  happy: 'bg-green-500',
  sad: 'bg-blue-500',
  anxious: 'bg-yellow-500',
  neutral: 'bg-gray-500',
  angry: 'bg-red-500'
}

export default function MoodCalendar() {
  const {
    setSelectedDate,
    selectedCheckIn,
    getDayMood,
    safeSelectedDate
  } = useMoodCalendar()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Mood Calendar</CardTitle>
        <CardDescription>Track your daily mood over time</CardDescription>
      </CardHeader>
      <CardContent className="flex space-x-4">
        <div className="w-1/2">
          <Calendar
            mode="single"
            selected={safeSelectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date)
              }
            }}
            className="rounded-md border p-4"
            components={{
              DayContent: ({ date }) => {
                const mood = getDayMood(date)
                return (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-gray-700 dark:text-gray-200">{date.getDate()}</span>
                    {mood && (
                      <div className={`w-2 h-2 rounded-full ${moodColors[mood as string]}`} />
                    )}
                  </div>
                )
              },
            }}
          />
        </div>
        <div className="w-1/2">
          {selectedCheckIn ? (
            <>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Details for {safeSelectedDate.toDateString()}</h3>
              <div className="mt-4">
                <p className="font-medium text-gray-700 dark:text-gray-300"><strong>Mood: </strong><span className={`text-${moodColors[selectedCheckIn.mood]}`}>{selectedCheckIn.mood}</span></p>
                <p className="mt-2 text-gray-800 dark:text-gray-200"><strong>Activities:</strong> {selectedCheckIn.activities || 'No activities recorded'}</p>
                <p className="mt-2 text-gray-800 dark:text-gray-200"><strong>Thoughts:</strong> {selectedCheckIn.thoughts || 'No thoughts recorded'}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Select a date to see the details.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
