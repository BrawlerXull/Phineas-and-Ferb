"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";

type Community = {
  _id: string;
  name: string;
  description: string;
  members: number;
  events: Event[];
};
type Message = {
  _id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
};


type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  attendees: number;
};

export default function CommunityPage() {
  const { id } = useParams(); // ⚠️ `id` could be undefined
  const { user } = useUser(); // ✅ Get user from Clerk
  const [community, setCommunity] = useState<Community | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
const [newMessage, setNewMessage] = useState("");
const [loadingMessages, setLoadingMessages] = useState(true);


  useEffect(() => {
    fetch(`/api/communities/${id}`)
      .then((res) => res.json())
      .then((data) => setCommunity(data))
      .catch((err) => console.error("Error fetching community:", err));
  }, [id]);

  useEffect(() => {
    fetch(`/api/communities/${id}/messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoadingMessages(false);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || !user) return;

    const res = await fetch(`/api/communities/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id, // ✅ Use actual Clerk user ID
        userName: user.fullName || "Anonymous",
        userAvatar: user.imageUrl || "/avatar.jpg",
        text: newMessage,
      }),
    });

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };
  
  

  const handleCreateEvent = async () => {
    if (community && newEventTitle && newEventDescription && newEventDate) {
      const res = await fetch(`/api/communities/${community._id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEventTitle,
          description: newEventDescription,
          date: newEventDate,
        }),
      });

      if (res.ok) {
        const newEvent = await res.json();
        setCommunity({
          ...community,
          events: [...community.events, newEvent],
        });
        setNewEventTitle("");
        setNewEventDescription("");
        setNewEventDate("");
        setIsDialogOpen(false);
      }
    }
  };

  const handleEnroll = async (eventId: string) => {
    if (!community) return;

    const res = await fetch(
      `/api/communities/${community._id}/events/${eventId}/enroll`,
      {
        method: "POST",
      }
    );

    if (res.ok) {
      const updatedEvent = await res.json();
      setCommunity({
        ...community,
        events: community.events.map((event) =>
          event._id === eventId ? updatedEvent.event : event
        ),
      });
    }
  };

  if (!community)
    return <p className="text-center text-gray-500 text-lg">Loading...</p>;

  return (
    <div className="container mx-auto max-w-5xl py-10 px-6 space-y-8">
      {/* Community Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-bold text-primary">{community.name}</h1>
        <p className="text-lg text-gray-600">{community.description}</p>
        <p className="text-sm text-muted-foreground">{community.members} members</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <div className="flex justify-center">
          <TabsList className="bg-secondary p-2 rounded-lg">
            <TabsTrigger value="events" className="px-6 py-2">Events</TabsTrigger>
            <TabsTrigger value="forum" className="px-6 py-2">Discussion Forum</TabsTrigger>
          </TabsList>
        </div>

        {/* Events Tab */}
        <TabsContent value="events">
          <div className="space-y-6">
            {/* Create New Event Button */}
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create New Event</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md p-6">
                  <DialogHeader>
                    <DialogTitle>Create a New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Event Title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Event Description"
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                    />
                    <Input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleCreateEvent}>Create Event</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Events List */}
            <div className="grid gap-6 md:grid-cols-2">
              {community.events.map((event) => (
                <Card key={event._id} className="shadow-md rounded-lg border">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p className="flex items-center text-gray-600">
                      <Calendar className="mr-2 text-primary" /> {event.date}
                    </p>
                    <p>{event.attendees} attendees</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => handleEnroll(event._id)} className="w-full">
                      Enroll
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Forum Tab */}
        <TabsContent value="forum">
  {/* Chat Messages */}
  <ScrollArea className="h-[500px] space-y-4 p-4 border rounded-lg">
        {loadingMessages ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : (
          messages.map((msg) => (
            <Card key={msg._id} className="mb-4">
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={msg.userAvatar || "/placeholder.svg"} alt={msg.userName} />
                    <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sm">{msg.userName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{msg.text}</p>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollArea>

  {/* New Message Input */}
  <div className="mt-4 space-y-2">
    <Textarea
      placeholder="Type a message..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
    />
    <Button className="w-full" onClick={handleSendMessage}>Send</Button>
  </div>
</TabsContent>

      </Tabs>
    </div>
  );
}
