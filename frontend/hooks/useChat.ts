import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

const useChat = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suicideRisk, setSuicideRisk] = useState<string | null>(null);
  const {user} = useUser();

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    setSuicideRisk(null);

    try {
      // Fetch bot response
      const chatResponse = await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!chatResponse.ok) throw new Error(`Server error: ${chatResponse.statusText}`);

      const chatData = await chatResponse.json();
      const botMessage: Message = { role: 'bot', content: chatData.response };
      setMessages(prev => [...prev, botMessage]);

      // Fetch suicide risk detection
      const suicideResponse = await fetch(`/api/chat/suicide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, // The message the user inputs
          userId: user?.id, // Make sure to include the userId from your app (e.g., from the authenticated user)
        }),
      });
      

      if (suicideResponse.ok) {
        const suicideData = await suicideResponse.json();
        console.log(suicideData)
        setSuicideRisk(suicideData.response); // Assuming response contains "Low Risk", "High Risk", etc.
      } else {
        console.error("Error fetching suicide detection:", suicideResponse.statusText);
      }

    } catch (error) {
      console.error("Error:", error);
      setError("There was an error connecting to the AI service.");
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    suicideRisk, // This can be used to display risk assessment in UI
    handleSend,
  };
};

export default useChat;
