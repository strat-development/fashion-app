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
  const prevStreamingRef = useRef(isStreaming); 

  useEffect(() => {
    if (isStreaming) {
      hasStreamedOnceRef.current = true;
      if (text !== displayedText) {
        setDisplayedText(text);
        setCurrentIndex(text.length);
      }
      setIsAnimating(false);
      
      return;
    }

    if (prevStreamingRef.current && !isStreaming && text && text.length > 0) {
      lastTextRef.current = text;
      setIsAnimating(true);
      setDisplayedText('');
      setCurrentIndex(0);
      prevStreamingRef.current = isStreaming;
      return;
    }

    prevStreamingRef.current = isStreaming;

    if (text !== lastTextRef.current && text.length > 0) {
      lastTextRef.current = text;
      setIsAnimating(true);
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [text, isStreaming]);

  useEffect(() => {
    if (isAnimating && currentIndex < text.length) {
      animationRef.current = (setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed)) as unknown as NodeJS.Timeout;

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
