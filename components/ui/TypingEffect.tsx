import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: any;
  isStreaming?: boolean;
}

export const TypingEffect = ({ text, speed = 30, onComplete, style, isStreaming = false }: TypingEffectProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef(text);
  const hasStreamedOnceRef = useRef(false);

  useEffect(() => {
    if (isStreaming) {
      hasStreamedOnceRef.current = true;

      setDisplayedText(text);
      setIsAnimating(false);
      setCurrentIndex(text.length);

      return;
    }

    if (hasStreamedOnceRef.current) {
      setDisplayedText(text);
      setIsAnimating(false);
      setCurrentIndex(text.length);
      return;
    }

    if (text !== lastTextRef.current && text.length > 0) {
      lastTextRef.current = text;
      setIsAnimating(true);
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [text, isStreaming]);

  useEffect(() => {
    if (isAnimating && currentIndex < text.length) {
      animationRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    } else if (isAnimating && currentIndex >= text.length) {
      setIsAnimating(false);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete, isAnimating]);

  return (
    <Text style={style}>
      {displayedText}
      {isAnimating && currentIndex < text.length && (
        <Text style={{ opacity: 0.5 }}>|</Text>
      )}
    </Text>
  );
};
