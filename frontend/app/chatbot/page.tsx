'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff } from "lucide-react"; 
import useChat from "@/hooks/useChat";

export default function Chatbot() {
  const { messages, input, setInput, loading, error, handleSend } = useChat([
    { role: 'bot', content: 'Hello! I\'m your MindAI, your mental health assistant. How can I help you today?' },
  ]);

  const [isListening, setIsListening] = useState(false);
  
  let recognition: SpeechRecognition | null = null;
  if (typeof window !== "undefined") {
    recognition = new ((window as Window & typeof globalThis).SpeechRecognition || (window as Window & typeof globalThis).webkitSpeechRecognition)();
  }

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Fix type of `event` here
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => `${prev} ${transcript}`);
    };
  }

  const handleMicClick = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  };

  return (
    
      <Card className="w-full max-w-2xl mx-auto">

      <CardHeader>
        <CardTitle>MindAI Health Assistant</CardTitle>
        <CardDescription>Chat with our AI for support and guidance</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[370px] w-full pr-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`rounded-lg p-2 max-w-[70%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full animate-bounce bg-gray-600"></div>
              <div className="w-4 h-4 rounded-full animate-bounce bg-gray-600"></div>
            </div>
          )}
          {error && (
            <div className="flex justify-start mb-4">
              <div className="rounded-lg p-2 max-w-[70%] bg-red-500 text-white">
                {error}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
          />
          <Button type="submit" disabled={loading}>Send</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleMicClick}
            className={`p-2 ${isListening ? "text-red-500" : ""}`}
          >
            {isListening ? <MicOff /> : <Mic />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}