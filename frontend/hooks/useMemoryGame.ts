import { useState, useEffect } from 'react';

const emojis = ['🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🍀', '🍁'];

const useMemoryGame = () => {
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
      } else {
        setDisabled(true);
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
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
