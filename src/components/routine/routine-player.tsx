'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ExerciseTimer from './exercise-timer';
import { 
  Play, 
  Clock, 
  Star, 
  BookOpen, 
  Volume2, 
  Trophy,
  Zap,
  Heart
} from 'lucide-react';

interface RoutineBlock {
  type: 'move' | 'mind' | 'core';
  name: string;
  duration_seconds: number;
  instructions: string[];
  difficulty: number;
  audio_cue: string;
  benefits: string[];
}

interface Routine {
  routine_id: string;
  title: string;
  total_duration: number;
  focus_area: string;
  difficulty_level: number;
  blocks: RoutineBlock[];
  completion_xp: number;
  daily_wisdom: string;
  generated_at?: string;
  user_preferences?: any;
}

interface RoutinePlayerProps {
  routine: Routine;
  onComplete?: (routineId: string, stats: { duration: number; completed: boolean }) => void;
  className?: string;
}

export const RoutinePlayer: React.FC<RoutinePlayerProps> = ({ 
  routine, 
  onComplete, 
  className = '' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [completionStats, setCompletionStats] = useState<{ duration: number; completed: boolean } | null>(null);
  
  const totalDuration = routine.blocks.reduce((sum, block) => sum + block.duration_seconds, 0);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}m`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'move': return 'bg-green-100 text-green-800 border-green-200';
      case 'mind': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'core': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getDifficultyColor = (level: number) => {
    if (level >= 4) return 'text-red-500';
    if (level >= 3) return 'text-orange-500';
    if (level >= 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleComplete = () => {
    const stats = {
      duration: totalDuration,
      completed: true
    };
    setCompletionStats(stats);
    onComplete?.(routine.routine_id, stats);
    setIsPlaying(false);
  };

  const handleStartRoutine = () => {
    setIsPlaying(true);
  };

  const handleCloseTimer = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Routine Card */}
      <Card className="overflow-hidden shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                {routine.title}
              </CardTitle>
              <Badge 
                variant="outline" 
                className="mb-3 border-2 font-semibold px-3 py-1"
              >
                {routine.focus_area}
              </Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-1">
                <Clock size={16} className="mr-1" />
                <span className="text-lg font-semibold">{formatTime(totalDuration)}</span>
              </div>
              <div className="flex items-center justify-end">
                <Star size={14} className={getDifficultyColor(routine.difficulty_level)} />
                <span className="ml-1 text-sm text-gray-600">
                  Difficulty {routine.difficulty_level}/5
                </span>
              </div>
            </div>
          </div>

          {/* XP and Quick Stats */}
          <div className="flex items-center justify-between bg-white/50 rounded-lg p-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-yellow-600">
                <Trophy size={18} />
                <span className="ml-1 font-semibold">+{routine.completion_xp} XP</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Zap size={18} />
                <span className="ml-1 font-semibold">{routine.blocks.length} exercises</span>
              </div>
            </div>
            
            {/* Start Button */}
            <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  onClick={handleStartRoutine}
                >
                  <Play size={20} className="mr-2" />
                  Start Routine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    {routine.title}
                  </DialogTitle>
                </DialogHeader>
                <ExerciseTimer
                  blocks={routine.blocks}
                  onComplete={handleComplete}
                  onClose={handleCloseTimer}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Daily Wisdom */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🧘‍♂️</div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Master Lee's Wisdom</h4>
                <p className="text-amber-700 italic">"{routine.daily_wisdom}"</p>
              </div>
            </div>
          </div>

          {/* Exercise Blocks Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BookOpen size={20} className="mr-2 text-blue-600" />
              Today's Practice
            </h3>
            
            <div className="grid gap-4">
              {routine.blocks.map((block, index) => (
                <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getTypeColor(block.type)} border font-medium`}>
                          {getTypeEmoji(block.type)} ChiZen {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                        </Badge>
                        <h4 className="font-semibold text-gray-800">{block.name}</h4>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock size={14} className="mr-1" />
                        <span className="text-sm">{formatTime(block.duration_seconds)}</span>
                      </div>
                    </div>

                    {/* Instructions Preview */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Instructions:</p>
                      <ul className="space-y-1">
                        {block.instructions.slice(0, 2).map((instruction, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2 mt-1 text-xs">•</span>
                            {instruction}
                          </li>
                        ))}
                        {block.instructions.length > 2 && (
                          <li className="text-sm text-gray-400 italic">
                            ...and {block.instructions.length - 2} more steps
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {block.benefits.slice(0, 3).map((benefit, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-green-200 text-green-700">
                          <Heart size={10} className="mr-1" />
                          {benefit}
                        </Badge>
                      ))}
                    </div>

                    {/* Audio Cue Preview */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-start space-x-2">
                        <Volume2 size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                          "{block.audio_cue.slice(0, 80)}..."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mobile-Optimized Call to Action */}
          <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-2">Ready to Begin?</h4>
              <p className="text-sm text-gray-600 mb-4">
                {formatTime(totalDuration)} of mindful movement awaits you. 
                Earn +{routine.completion_xp} XP and strengthen your practice.
              </p>
              
              <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    onClick={handleStartRoutine}
                  >
                    <Play size={20} className="mr-2" />
                    Start Your Practice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      {routine.title}
                    </DialogTitle>
                  </DialogHeader>
                  <ExerciseTimer
                    blocks={routine.blocks}
                    onComplete={handleComplete}
                    onClose={handleCloseTimer}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Success Message */}
      {completionStats && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Practice Complete!
            </h3>
            <p className="text-green-700 mb-4">
              You've earned <span className="font-bold">+{routine.completion_xp} XP</span> and 
              completed {formatTime(completionStats.duration)} of mindful movement.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge className="bg-green-200 text-green-800">
                ✨ Streak Continued
              </Badge>
              <Badge className="bg-yellow-200 text-yellow-800">
                🏆 XP Earned
              </Badge>
              <Badge className="bg-blue-200 text-blue-800">
                🧘 Mindfulness Practiced
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoutinePlayer;