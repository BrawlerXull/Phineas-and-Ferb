'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { useEvents } from "@/hooks/useEvents";

export default function Events() {
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState<Date | undefined>(new Date());

  const { events, loading, error, createEvent } = useEvents();

  const handleCreateEvent = () => {
    if (!newEventName || !newEventDescription || !newEventDate) {
      alert("Please fill out all fields.");
      return;
    }

    const event = {
      name: newEventName,
      description: newEventDescription,
      date: newEventDate.toISOString(),
    };

    createEvent(event);

    setNewEventName('');
    setNewEventDescription('');
    setNewEventDate(new Date());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>Join or create events to connect with others</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs>
          <TabsList>
            <TabsTrigger value="browse">Browse Events</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <ScrollArea className="h-[400px] w-full pr-4">
              {loading ? (
                <div>Loading events...</div>
              ) : error ? (
                <div>Error: {error}</div>
              ) : events.length === 0 ? (
                <div>No events available.</div>
              ) : (
                events.map((event) => (
                  <Card key={event._id} className="mb-4">
                    <CardHeader>
                      <CardTitle>{event.name}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Date: {new Date(event.date).toDateString()}</p>
                      {/* <p>{event.attendees} attendees</p> */}
                    </CardContent>
                    {/* <CardFooter>
                      <Button>Attend Event</Button>
                    </CardFooter> */}
                  </Card>
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
                <Input
                  id="name"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Enter event name"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <Input
                  id="description"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Enter event description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Calendar
                  mode="single"
                  selected={newEventDate}
                  onSelect={setNewEventDate}
                  className="rounded-md border"
                />
              </div>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
