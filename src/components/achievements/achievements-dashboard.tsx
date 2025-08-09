'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Calendar,
  Zap,
  Crown,
  Medal,
  Sparkles,
  Lock
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'sessions' | 'xp' | 'challenges' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  unlockedDate?: string;
  xpReward: number;
  requirements: string[];
}

interface AchievementsDashboardProps {
  userStats?: {
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    totalXP: number;
    challengesCompleted: number;
  };
}

export const AchievementsDashboard: React.FC<AchievementsDashboardProps> = ({ 
  userStats = {
    totalSessions: 15,
    currentStreak: 3,
    longestStreak: 7,
    totalXP: 450,
    challengesCompleted: 1
  }
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    generateAchievements();
  }, [userStats]);

  const generateAchievements = () => {
    const allAchievements: Achievement[] = [
      // Streak Achievements
      {
        id: 'first-step',
        title: 'First Steps',
        description: 'Complete your very first routine',
        icon: '🌱',
        category: 'sessions',
        rarity: 'common',
        unlocked: userStats.totalSessions >= 1,
        unlockedDate: userStats.totalSessions >= 1 ? '2025-08-01' : undefined,
        xpReward: 25,
        requirements: ['Complete 1 routine']
      },
      {
        id: 'week-warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day practice streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'rare',
        unlocked: userStats.currentStreak >= 7 || userStats.longestStreak >= 7,
        progress: userStats.currentStreak < 7 ? {
          current: userStats.currentStreak,
          target: 7,
          percentage: (userStats.currentStreak / 7) * 100
        } : undefined,
        unlockedDate: userStats.longestStreak >= 7 ? '2025-08-05' : undefined,
        xpReward: 100,
        requirements: ['Maintain 7-day streak']
      },
      {
        id: 'month-master',
        title: 'Month Master',
        description: 'Complete 30 consecutive days of practice',
        icon: '👑',
        category: 'streak',
        rarity: 'epic',
        unlocked: userStats.longestStreak >= 30,
        progress: userStats.longestStreak < 30 ? {
          current: userStats.longestStreak,
          target: 30,
          percentage: (userStats.longestStreak / 30) * 100
        } : undefined,
        xpReward: 500,
        requirements: ['Maintain 30-day streak']
      },
      {
        id: 'century-sage',
        title: 'Century Sage',
        description: 'Achieve a legendary 100-day streak',
        icon: '🏆',
        category: 'streak',
        rarity: 'legendary',
        unlocked: userStats.longestStreak >= 100,
        progress: userStats.longestStreak < 100 ? {
          current: userStats.longestStreak,
          target: 100,
          percentage: (userStats.longestStreak / 100) * 100
        } : undefined,
        xpReward: 2000,
        requirements: ['Maintain 100-day streak']
      },

      // Session Count Achievements
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Complete 10 practice sessions',
        icon: '✨',
        category: 'sessions',
        rarity: 'common',
        unlocked: userStats.totalSessions >= 10,
        progress: userStats.totalSessions < 10 ? {
          current: userStats.totalSessions,
          target: 10,
          percentage: (userStats.totalSessions / 10) * 100
        } : undefined,
        unlockedDate: userStats.totalSessions >= 10 ? '2025-08-03' : undefined,
        xpReward: 50,
        requirements: ['Complete 10 sessions']
      },
      {
        id: 'dedicated-practitioner',
        title: 'Dedicated Practitioner',
        description: 'Complete 50 practice sessions',
        icon: '🥋',
        category: 'sessions',
        rarity: 'rare',
        unlocked: userStats.totalSessions >= 50,
        progress: userStats.totalSessions < 50 ? {
          current: userStats.totalSessions,
          target: 50,
          percentage: (userStats.totalSessions / 50) * 100
        } : undefined,
        xpReward: 200,
        requirements: ['Complete 50 sessions']
      },
      {
        id: 'wellness-master',
        title: 'Wellness Master',
        description: 'Complete 100 practice sessions',
        icon: '🎯',
        category: 'sessions',
        rarity: 'epic',
        unlocked: userStats.totalSessions >= 100,
        progress: userStats.totalSessions < 100 ? {
          current: userStats.totalSessions,
          target: 100,
          percentage: (userStats.totalSessions / 100) * 100
        } : undefined,
        xpReward: 750,
        requirements: ['Complete 100 sessions']
      },

      // XP Achievements
      {
        id: 'xp-collector',
        title: 'XP Collector',
        description: 'Earn 1,000 total XP',
        icon: '💎',
        category: 'xp',
        rarity: 'rare',
        unlocked: userStats.totalXP >= 1000,
        progress: userStats.totalXP < 1000 ? {
          current: userStats.totalXP,
          target: 1000,
          percentage: (userStats.totalXP / 1000) * 100
        } : undefined,
        xpReward: 150,
        requirements: ['Earn 1,000 XP']
      },
      {
        id: 'xp-millionaire',
        title: 'XP Millionaire',
        description: 'Earn 10,000 total XP',
        icon: '💰',
        category: 'xp',
        rarity: 'legendary',
        unlocked: userStats.totalXP >= 10000,
        progress: userStats.totalXP < 10000 ? {
          current: userStats.totalXP,
          target: 10000,
          percentage: (userStats.totalXP / 10000) * 100
        } : undefined,
        xpReward: 1000,
        requirements: ['Earn 10,000 XP']
      },

      // Challenge Achievements
      {
        id: 'challenge-accepted',
        title: 'Challenge Accepted',
        description: 'Complete your first challenge',
        icon: '🎖️',
        category: 'challenges',
        rarity: 'rare',
        unlocked: userStats.challengesCompleted >= 1,
        progress: userStats.challengesCompleted < 1 ? {
          current: userStats.challengesCompleted,
          target: 1,
          percentage: (userStats.challengesCompleted / 1) * 100
        } : undefined,
        unlockedDate: userStats.challengesCompleted >= 1 ? '2025-08-07' : undefined,
        xpReward: 200,
        requirements: ['Complete 1 challenge']
      },
      {
        id: 'challenge-champion',
        title: 'Challenge Champion',
        description: 'Complete 5 different challenges',
        icon: '🏅',
        category: 'challenges',
        rarity: 'epic',
        unlocked: userStats.challengesCompleted >= 5,
        progress: userStats.challengesCompleted < 5 ? {
          current: userStats.challengesCompleted,
          target: 5,
          percentage: (userStats.challengesCompleted / 5) * 100
        } : undefined,
        xpReward: 500,
        requirements: ['Complete 5 challenges']
      },

      // Special Achievements
      {
        id: 'early-adopter',
        title: 'Early Adopter',
        description: 'Join the ChiZen community in its early days',
        icon: '🚀',
        category: 'special',
        rarity: 'epic',
        unlocked: true,
        unlockedDate: '2025-08-01',
        xpReward: 100,
        requirements: ['Join ChiZen during launch period']
      },
      {
        id: 'mindful-morning',
        title: 'Mindful Morning',
        description: 'Complete 10 morning routines before 9 AM',
        icon: '🌅',
        category: 'special',
        rarity: 'rare',
        unlocked: false,
        progress: {
          current: 3,
          target: 10,
          percentage: 30
        },
        xpReward: 150,
        requirements: ['Complete 10 routines before 9 AM']
      }
    ];

    setAchievements(allAchievements);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak': return 'text-orange-600';
      case 'sessions': return 'text-green-600';
      case 'xp': return 'text-blue-600';
      case 'challenges': return 'text-purple-600';
      case 'special': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak': return <Flame size={16} />;
      case 'sessions': return <Target size={16} />;
      case 'xp': return <Zap size={16} />;
      case 'challenges': return <Trophy size={16} />;
      case 'special': return <Sparkles size={16} />;
      default: return <Award size={16} />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const statusMatch = filter === 'all' || 
                       (filter === 'unlocked' && achievement.unlocked) ||
                       (filter === 'locked' && !achievement.unlocked);
    
    const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Achievements</h1>
        <p className="text-gray-600 mb-4">
          Track your wellness journey milestones
        </p>
        
        {/* Overall Progress */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{unlockedCount}/{totalCount}</span>
            </div>
            <Progress value={(unlockedCount / totalCount) * 100} className="mb-2" />
            <p className="text-xs text-gray-600">
              {((unlockedCount / totalCount) * 100).toFixed(0)}% complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { key: 'locked', label: `Locked (${totalCount - unlockedCount})` }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                filter === key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Categories' },
            { key: 'streak', label: 'Streak' },
            { key: 'sessions', label: 'Sessions' },
            { key: 'xp', label: 'XP' },
            { key: 'challenges', label: 'Challenges' },
            { key: 'special', label: 'Special' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                categoryFilter === key
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <Card 
            key={achievement.id} 
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              achievement.unlocked ? 'ring-2 ring-green-200' : 'opacity-75'
            }`}
          >
            {/* Rarity Banner */}
            <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-medium rounded-bl-lg ${getRarityColor(achievement.rarity)}`}>
              {achievement.rarity.toUpperCase()}
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-start space-x-3">
                <div className={`text-3xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <CardTitle className={`text-lg ${!achievement.unlocked && 'text-gray-500'}`}>
                    {achievement.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`flex items-center ${getCategoryColor(achievement.category)}`}>
                      {getCategoryIcon(achievement.category)}
                      <span className="ml-1 text-xs capitalize">{achievement.category}</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      +{achievement.xpReward} XP
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className={`text-sm mb-4 ${!achievement.unlocked && 'text-gray-500'}`}>
                {achievement.description}
              </p>

              {/* Progress for locked achievements */}
              {!achievement.unlocked && achievement.progress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Progress</span>
                    <span className="text-xs text-gray-500">
                      {achievement.progress.current}/{achievement.progress.target}
                    </span>
                  </div>
                  <Progress value={achievement.progress.percentage} className="h-2" />
                </div>
              )}

              {/* Requirements */}
              <div className="mb-4">
                <h5 className="text-xs font-semibold text-gray-700 mb-1">Requirements:</h5>
                <ul className="space-y-1">
                  {achievement.requirements.map((req, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unlock date for completed achievements */}
              {achievement.unlocked && achievement.unlockedDate && (
                <div className="pt-3 border-t">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={12} className="mr-1" />
                    Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No achievements found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or keep practicing to unlock more achievements!
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsDashboard;