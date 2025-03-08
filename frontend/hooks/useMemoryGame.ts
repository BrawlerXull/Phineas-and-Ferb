import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

const emojis = ['🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🍀', '🍁'];

const useMemoryGame = () => {
  const { user } = useUser();
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
  };

  const handleClick = (index: number) => {
    if (disabled || flipped.includes(index) || solved.includes(index)) return;

    setFlipped((prev) => [...prev, index]);

    if (flipped.length === 1) {
      const firstIndex = flipped[0];
      const secondIndex = index;

      if (cards[firstIndex] === cards[secondIndex]) {
        setSolved((prev) => [...prev, firstIndex, secondIndex]);
        setFlipped([]);

        // Check if user has won
        if ([...solved, firstIndex, secondIndex].length === cards.length) {
          handleWin();
        }
      } else {
        setDisabled(true);
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  const handleWin = async () => {
    if (!user?.id) {
      toast.error('User not authenticated.');
      return;
    }

    toast.success('You won the game! 🎉');

    try {
      const response = await fetch('/api/mini-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }), // Sending userId from frontend
      });

      if (!response.ok) {
        throw new Error('Failed to update XP');
      }

      const data = await response.json();
      toast.success(`XP increased! You are now level ${data.level}.`);
    } catch (error) {
      console.error('Error updating XP:', error);
      toast.error('Could not update XP.');
    }
  };

  const isFlipped = (index: number) => flipped.includes(index) || solved.includes(index);

  return {
    cards,
    initializeGame,
    handleClick,
    isFlipped,
  };
};

export default useMemoryGame;
