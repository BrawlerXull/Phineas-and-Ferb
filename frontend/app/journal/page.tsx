"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useUser } from "@clerk/nextjs";
import { useForm } from "@/hooks/useForm";
import { useMoodCalendar } from "@/hooks/useMoodCalendar";


const moodColors: Record<string, string> = {
  happy: "bg-green-500",
  sad: "bg-blue-500",
  anxious: "bg-yellow-500",
  neutral: "bg-gray-500",
  angry: "bg-red-500",
};

export default function Journal() {
  const { user } = useUser();
  const [userId, setUserId] = useState<string | null>(null);

  const { setSelectedDate, selectedCheckIn, getDayMood, safeSelectedDate } =
    useMoodCalendar();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  const { formData, handleInputChange, handleSubmit, loading, error } = useForm(
    userId || ""
  );

  if (!userId) {
    return <div>Please log in to submit your check-in.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mood Journal</h1>
      <Tabs defaultValue="check-in">
        <TabsList className="mb-10">
          <TabsTrigger value="check-in">Daily Check-In</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="check-in">

          <Card className="">
            <CardHeader>
              <CardTitle>Daily Check-In</CardTitle>
              <CardDescription>
                Share your thoughts and feelings to get personalized support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="mood">How are you feeling today?</Label>
                  <Select
                    value={formData.mood}
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { name: "mood", value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    required
                  >
                    <SelectTrigger id="mood">
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="anxious">Anxious</SelectItem>
                      <SelectItem value="angry">Angry</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activities">
                    What activities have you done today?
                  </Label>
                  <Input
                    id="activities"
                    name="activities"
                    value={formData.activities}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thoughts">
                    Any thoughts you&apos;d like to share?
                  </Label>
                  <Textarea
                    id="thoughts"
                    name="thoughts"
                    value={formData.thoughts}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>

        </TabsContent>
        <TabsContent value="calendar">

          <Card className=" ">
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
                      setSelectedDate(date);
                    }
                  }}
                  className="rounded-md  p-4"
                  components={{
                    DayContent: ({ date }) => {
                      const mood = getDayMood(date);
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs dark:text-gray-200">
                            {date.getDate()}
                          </span>
                          {mood && (
                            <div
                              className={`w-2 h-2 rounded-full ${
                                moodColors[mood as string]
                              }`}
                            />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </div>
              <div className="w-1/2">
                {selectedCheckIn ? (
                  <>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      Details for {safeSelectedDate.toDateString()}
                    </h3>
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        <strong>Mood: </strong>
                        <span
                          className={`text-${moodColors[selectedCheckIn.mood]}`}
                        >
                          {selectedCheckIn.mood}
                        </span>
                      </p>
                      <p className="mt-2 text-gray-800 dark:text-gray-200">
                        <strong>Activities:</strong>{" "}
                        {selectedCheckIn.activities || "No activities recorded"}
                      </p>
                      <p className="mt-2 text-gray-800 dark:text-gray-200">
                        <strong>Thoughts:</strong>{" "}
                        {selectedCheckIn.thoughts || "No thoughts recorded"}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a date to see the details.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </TabsContent>

      </Tabs>
    </div>
  );
}
