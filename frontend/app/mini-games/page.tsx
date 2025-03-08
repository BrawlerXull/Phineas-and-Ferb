'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useMemoryGame from '@/hooks/useMemoryGame';

function MemoryGame() {
  const { cards, initializeGame, handleClick, isFlipped } = useMemoryGame();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Button
            key={index}
            onClick={() => handleClick(index)}
            className="h-16 text-2xl"
            variant={isFlipped(index) ? 'default' : 'outline'}
          >
            {isFlipped(index) ? card : '?'}
          </Button>
        ))}
      </div>
      <Button onClick={initializeGame}>New Game</Button>
    </div>
  );
}

export default function MiniGames() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Mini-Games</CardTitle>
        <CardDescription>Play games to relax and calm your mind</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="memory">
          <TabsList>
            <TabsTrigger value="memory">Memory Game</TabsTrigger>
          </TabsList>
          <TabsContent value="memory">
            <MemoryGame />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
