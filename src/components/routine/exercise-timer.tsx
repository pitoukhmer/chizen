'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, RotateCcw, Volume2 } from 'lucide-react';

interface ExerciseBlock {
  type: 'move' | 'mind' | 'core';
  name: string;
  duration_seconds: number;
  instructions: string[];
  difficulty: number;
  audio_cue: string;
  benefits: string[];
}

interface ExerciseTimerProps {
  blocks: ExerciseBlock[];
  onComplete?: () => void;
  onClose?: () => void;
}

export const ExerciseTimer: React.FC<ExerciseTimerProps> = ({ 
  blocks, 
  onComplete, 
  onClose 
}) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(blocks[0]?.duration_seconds || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);

  const currentBlock = blocks[currentBlockIndex];
  const totalDuration = blocks.reduce((sum, block) => sum + block.duration_seconds, 0);
  const elapsedTotal = blocks.slice(0, currentBlockIndex).reduce((sum, block) => sum + block.duration_seconds, 0) + (currentBlock?.duration_seconds - timeRemaining);
  const overallProgress = (elapsedTotal / totalDuration) * 100;

  // Audio cue handling
  const playAudioCue = useCallback(async (text: string) => {
    try {
      // Use browser speech synthesis as fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        utterance.volume = 0.7;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Audio cue error:', error);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Block completed
            setCompletedBlocks(completed => [...completed, currentBlockIndex]);
            
            if (currentBlockIndex < blocks.length - 1) {
              // Move to next block
              const nextIndex = currentBlockIndex + 1;
              setCurrentBlockIndex(nextIndex);
              setTimeRemaining(blocks[nextIndex].duration_seconds);
              
              // Play audio cue for next exercise
              setTimeout(() => {
                playAudioCue(blocks[nextIndex].audio_cue);
              }, 500);
              
              return blocks[nextIndex].duration_seconds;
            } else {
              // All blocks completed
              setIsPlaying(false);
              onComplete?.();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, currentBlockIndex, blocks, onComplete, playAudioCue]);

  const handlePlayPause = () => {
    if (!hasStarted) {
      setHasStarted(true);
      playAudioCue(currentBlock.audio_cue);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentBlockIndex < blocks.length - 1) {
      const nextIndex = currentBlockIndex + 1;
      setCurrentBlockIndex(nextIndex);
      setTimeRemaining(blocks[nextIndex].duration_seconds);
      playAudioCue(blocks[nextIndex].audio_cue);
    }
  };

  const handleRestart = () => {
    setCurrentBlockIndex(0);
    setTimeRemaining(blocks[0].duration_seconds);
    setIsPlaying(false);
    setHasStarted(false);
    setCompletedBlocks([]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'move': return 'bg-green-100 text-green-800';
      case 'mind': return 'bg-blue-100 text-blue-800';
      case 'core': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'move': return '🥋';
      case 'mind': return '🧘';
      case 'core': return '💪';
      default: return '🌟';
    }
  };

  if (!currentBlock) return null;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 text-center">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getTypeColor(currentBlock.type)}>
            {getTypeEmoji(currentBlock.type)} ChiZen {currentBlock.type.charAt(0).toUpperCase() + currentBlock.type.slice(1)}
          </Badge>
          <span className="text-sm text-gray-500">
            {currentBlockIndex + 1} of {blocks.length}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {currentBlock.name}
        </h3>
        <p className="text-sm text-gray-600">
          Difficulty: {Array.from({length: 5}).map((_, i) => (
            <span key={i} className={i < currentBlock.difficulty ? "text-orange-400" : "text-gray-300"}>
              ⭐
            </span>
          ))}
        </p>
      </div>

      {/* Progress Ring */}
      <div className="relative p-8 flex justify-center">
        <div className="relative w-48 h-48">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgb(229 231 235)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgb(34 197 94)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${overallProgress * 2.83} 283`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
            {/* Current Block Progress */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="rgb(59 130 246)"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={`${((currentBlock.duration_seconds - timeRemaining) / currentBlock.duration_seconds) * 220} 220`}
              strokeLinecap="round"
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(Math.floor(elapsedTotal))} / {formatTime(totalDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Instructions */}
      <div className="px-6 pb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
        <ul className="space-y-1">
          {currentBlock.instructions.map((instruction, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-green-500 mr-2 mt-1">•</span>
              {instruction}
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      <div className="px-6 pb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Benefits:</h4>
        <div className="flex flex-wrap gap-1">
          {currentBlock.benefits.map((benefit, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {benefit}
            </Badge>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-50 flex justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          className="flex items-center space-x-1"
        >
          <RotateCcw size={16} />
          <span>Restart</span>
        </Button>

        <Button
          onClick={handlePlayPause}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          <span>{isPlaying ? 'Pause' : hasStarted ? 'Resume' : 'Start'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentBlockIndex >= blocks.length - 1}
          className="flex items-center space-x-1"
        >
          <SkipForward size={16} />
          <span>Next</span>
        </Button>
      </div>

      {/* Audio Cue Button */}
      <div className="px-6 pb-6 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => playAudioCue(currentBlock.audio_cue)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Volume2 size={16} className="mr-1" />
          Repeat Guidance
        </Button>
      </div>

      {/* Progress Blocks Indicator */}
      <div className="px-6 pb-6">
        <div className="flex space-x-2">
          {blocks.map((block, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                completedBlocks.includes(index)
                  ? 'bg-green-400'
                  : index === currentBlockIndex
                  ? 'bg-blue-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>ChiZen Move</span>
          <span>ChiZen Mind</span>
          <span>ChiZen Core</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseTimer;