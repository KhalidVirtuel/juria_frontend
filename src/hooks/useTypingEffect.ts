// src/hooks/useTypingEffect.ts
// ✅ Hook pour animation typing du texte transcrit

import { useState, useEffect, useRef } from 'react';

export const useTypingEffect = (
  text: string,
  speed: number = 30 // millisecondes par caractère
) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Réinitialiser
    indexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);

    // Fonction pour ajouter un caractère
    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timerRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
      }
    };

    // Démarrer l'animation
    typeNextChar();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, speed]);

  return { displayedText, isTyping };
};