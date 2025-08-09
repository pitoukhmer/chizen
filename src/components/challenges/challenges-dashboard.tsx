'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Flame, 
  Award,
  Clock,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  category: string;
  difficulty: number;
  xp_reward: number;
  icon: string;
  color: string;
  goals: string[];
  benefits: string[];
  status: 'available' | 'joined';
  participants_count?: number;
  progress?: {
    completed_days: number;
    total_days: number;
    percentage: number;
    current_streak: number;
    joined_date: string;
    is_completed: boolean;
  };
}

interface ChallengesDashboardProps {
  onJoinChallenge?: (challengeId: string) => void;
}

export const ChallengesDashboard: React.FC<ChallengesDashboardProps> = ({ 
  onJoinChallenge 
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'my-challenges'>('available');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      // Mock data for demonstration - replace with API call
      const mockChallenges: Challenge[] = [
        {
          id: '7-day-mindful-start',
          name: '7-Day Mindful Start',
          description: 'Begin your wellness journey with 7 days of consistent practice',
          duration_days: 7,
          category: 'beginner',
          difficulty: 1,
          xp_reward: 200,
          icon: '🌱',
          color: 'green',
          goals: [
            'Complete daily 15-minute routine',
            'Practice mindful breathing',
            'Build a consistent habit'
          ],
          benefits: ['Stress reduction', 'Better sleep', 'Increased focus'],
          status: 'available',
          participants_count: 1247
        },
        {
          id: '14-day-balance-builder',
          name: '14-Day Balance Builder',
          description: 'Strengthen your body and mind with 2 weeks of Tai Chi movements',
          duration_days: 14,
          category: 'intermediate',
          difficulty: 2,
          xp_reward: 500,
          icon: '⚖️',
          color: 'blue',
          goals: [
            'Master 5 Tai Chi movements',
            'Improve balance and coordination',
            'Complete longer 20-minute routines'
          ],
          benefits: ['Better balance', 'Core strength', 'Mental clarity'],
          status: 'joined',
          progress: {
            completed_days: 5,
            total_days: 14,
            percentage: 35.7,
            current_streak: 3,
            joined_date: '2025-08-01',
            is_completed: false
          }
        },
        {
          id: '30-day-wellness-warrior',
          name: '30-Day Wellness Warrior',
          description: 'Transform your life with a month-long commitment to holistic wellness',
          duration_days: 30,
          category: 'advanced',
          difficulty: 3,
          xp_reward: 1500,
          icon: '🏆',
          color: 'purple',
          goals: [
            'Complete 30 days of practice',
            'Achieve multiple difficulty levels',
            'Master mind-body connection'
          ],
          benefits: ['Life transformation', 'Peak performance', 'Inner mastery'],
          status: 'available',
          participants_count: 342
        },
        {
          id: 'weekend-warrior',
          name: 'Weekend Warrior',
          description: 'Perfect for busy schedules - practice only on weekends',
          duration_days: 8,
          category: 'flexible',
          difficulty: 1,
          xp_reward: 150,
          icon: '🗓️',
          color: 'orange',
          goals: [
            'Practice every Saturday and Sunday',
            'Maintain consistency over 4 weeks',
            'Build sustainable habits'
          ],
          benefits: ['Work-life balance', 'Stress relief', 'Weekend mindfulness'],
          status: 'available',
          participants_count: 896
        }
      ];

      const availableChallenges = mockChallenges.filter(c => c.status === 'available');
      const joinedChallenges = mockChallenges.filter(c => c.status === 'joined');

      setChallenges(availableChallenges);
      setMyChallenges(joinedChallenges);
      setLoading(false);
    } catch (error) {
      console.error('Error loading challenges:', error);
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      // Mock join challenge
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        const joinedChallenge = {
          ...challenge,
          status: 'joined' as const,
          progress: {
            completed_days: 0,
            total_days: challenge.duration_days,
            percentage: 0,
            current_streak: 0,
            joined_date: new Date().toISOString(),
            is_completed: false
          }
        };
        
        setMyChallenges(prev => [...prev, joinedChallenge]);
        setChallenges(prev => prev.filter(c => c.id !== challengeId));
        
        toast.success(`🎉 Successfully joined ${challenge.name}!`);
        onJoinChallenge?.(challengeId);
      }
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-50 border-green-200 text-green-800';
      case 'intermediate': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'advanced': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'flexible': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const renderChallengeCard = (challenge: Challenge, isJoined: boolean = false) => (
    <Card key={challenge.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className={`pb-4 ${getCategoryColor(challenge.category)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{challenge.icon}</span>
            <div>
              <CardTitle className="text-lg">{challenge.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {getDifficultyText(challenge.difficulty)}
                </Badge>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  +{challenge.xp_reward} XP
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar size={14} className="mr-1" />
              <span className="text-sm">{challenge.duration_days} days</span>
            </div>
            {!isJoined && challenge.participants_count && (
              <div className="flex items-center text-gray-500">
                <Users size={14} className="mr-1" />
                <span className="text-xs">{challenge.participants_count} joined</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Progress for joined challenges */}
        {isJoined && challenge.progress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm text-gray-500">
                {challenge.progress.completed_days}/{challenge.progress.total_days} days
              </span>
            </div>
            <Progress value={challenge.progress.percentage} className="h-3 mb-3" />
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center text-orange-600">
                  <Flame size={16} className="mr-1" />
                  <span className="font-bold">{challenge.progress.current_streak}</span>
                </div>
                <p className="text-xs text-gray-600">Current Streak</p>
              </div>
              <div>
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="font-bold">{challenge.progress.percentage.toFixed(0)}%</span>
                </div>
                <p className="text-xs text-gray-600">Complete</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

        {/* Goals */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <Target size={16} className="mr-1 text-blue-600" />
            Challenge Goals
          </h4>
          <ul className="space-y-1">
            {challenge.goals.slice(0, 2).map((goal, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-blue-500 mr-2 mt-1 text-xs">•</span>
                {goal}
              </li>
            ))}
            {challenge.goals.length > 2 && (
              <li className="text-sm text-gray-400 italic">
                ...and {challenge.goals.length - 2} more goals
              </li>
            )}
          </ul>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <Award size={16} className="mr-1 text-green-600" />
            Benefits
          </h4>
          <div className="flex flex-wrap gap-1">
            {challenge.benefits.map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t">
          {isJoined ? (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" className="flex-1 mr-2">
                <TrendingUp size={16} className="mr-1" />
                View Progress
              </Button>
              <Button variant="outline" size="sm" className="flex-1 ml-2">
                <Trophy size={16} className="mr-1" />
                Leaderboard
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => handleJoinChallenge(challenge.id)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Star size={16} className="mr-2" />
              Join Challenge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Wellness Challenges</h1>
        <p className="text-gray-600">
          Join community challenges to build lasting wellness habits
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'available'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Trophy size={18} />
          <span>Available Challenges</span>
        </button>
        
        <button
          onClick={() => setActiveTab('my-challenges')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'my-challenges'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Clock size={18} />
          <span>My Challenges ({myChallenges.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'available' ? (
          challenges.length > 0 ? (
            challenges.map(challenge => renderChallengeCard(challenge, false))
          ) : (
            <div className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Available Challenges
              </h3>
              <p className="text-gray-600">
                Check back later for new challenges to join!
              </p>
            </div>
          )
        ) : (
          myChallenges.length > 0 ? (
            myChallenges.map(challenge => renderChallengeCard(challenge, true))
          ) : (
            <div className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Active Challenges
              </h3>
              <p className="text-gray-600 mb-4">
                Join a challenge to start building consistent wellness habits!
              </p>
              <Button 
                onClick={() => setActiveTab('available')}
                className="bg-green-600 hover:bg-green-700"
              >
                Browse Challenges
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChallengesDashboard;