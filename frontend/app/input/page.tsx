"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from '@/hooks/useForm';
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function InputForm() {
  const { user } = useUser();  
  const [userId, setUserId] = useState<string | null>(null);  

  useEffect(() => {
    if (user) {
      setUserId(user.id);  
    }
  }, [user]);


  const { formData, handleInputChange, handleSubmit, loading, error } = useForm(userId || ""); 

  if (!userId) {
    return <div>Please log in to submit your check-in.</div>;  
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Daily Check-In</CardTitle>
        <CardDescription>Share your thoughts and feelings to get personalized support.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="mood">How are you feeling today?</Label>
            <Select
              value={formData.mood}
              onValueChange={(value) => handleInputChange({ target: { name: 'mood', value } } as React.ChangeEvent<HTMLSelectElement>)}
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
            <Label htmlFor="activities">What activities have you done today?</Label>
            <Input
              id="activities"
              name="activities"
              value={formData.activities}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thoughts">Any thoughts you&apos;d like to share?</Label>
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
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
