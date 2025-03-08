"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Community = {
  _id: string;
  name: string;
  description: string;
  members: number;
  events: Event[];
};

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  attendees: number;
};

export default function Communities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/communities")
      .then((res) => res.json())
      .then((data) => setCommunities(data))
      .catch((error) => console.error("Error fetching communities:", error));
  }, []);

  const handleCreateCommunity = async () => {
    if (!newCommunityName || !newCommunityDescription) return;

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCommunityName,
          description: newCommunityDescription,
        }),
      });

      if (res.ok) {
        const newCommunity = await res.json();
        setCommunities((prev) => [...prev, newCommunity]);
        setNewCommunityName("");
        setNewCommunityDescription("");
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-primary">Communities</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Community</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="Enter community name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCommunityDescription}
                  onChange={(e) => setNewCommunityDescription(e.target.value)}
                  placeholder="Enter community description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCommunity}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Communities List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => (
          <Card
            key={community._id}
            className="cursor-pointer hover:bg-accent transition-all shadow-md rounded-lg"
            onClick={() => router.push(`/communities/${community._id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{community.name}</CardTitle>
              <CardDescription>{community.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{community.members} members</p>
              <p>{community.events.length} events</p>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
