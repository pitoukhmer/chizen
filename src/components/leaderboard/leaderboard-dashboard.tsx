'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Flame, 
  Zap, 
  Target,
  TrendingUp,
  Users,
  Calendar,
  Star
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  totalXP: number;
  currentStreak: number;
  level: number;
  totalSessions: number;
  isCurrentUser?: boolean;
  badges?: string[];
}

interface LeaderboardDashboardProps {
  currentUser?: {
    id: string;
    username: string;
  };
}

export const LeaderboardDashboard: React.FC<LeaderboardDashboardProps> = ({ 
  currentUser 
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [category, setCategory] = useState<'xp' | 'streak' | 'sessions'>('xp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe, category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    
    // Mock leaderboard data - replace with API call
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user1',
        username: 'ZenMaster2024',
        totalXP: 2450,
        currentStreak: 45,
        level: 25,
        totalSessions: 87,
        badges: ['🏆', '🔥', '⭐']
      },
      {
        rank: 2,
        userId: 'user2',
        username: 'MindfulWarrior',
        totalXP: 2280,
        currentStreak: 31,
        level: 23,
        totalSessions: 76,
        badges: ['🥋', '🌟']
      },
      {
        rank: 3,
        userId: 'user3',
        username: 'TaiChiTiger',
        totalXP: 2100,
        currentStreak: 28,
        level: 21,
        totalSessions: 71,
        badges: ['⚖️', '💎']
      },
      {
        rank: 4,
        userId: 'user4',
        username: 'BalanceSeeker',
        totalXP: 1890,
        currentStreak: 22,
        level: 19,
        totalSessions: 63,
        badges: ['🌱']
      },
      {
        rank: 5,
        userId: 'demo-user',
        username: 'You',
        totalXP: 1650,
        currentStreak: 15,
        level: 17,
        totalSessions: 55,
        isCurrentUser: true,
        badges: ['🚀', '✨']
      },
      {
        rank: 6,
        userId: 'user6',
        username: 'FlowState',
        totalXP: 1520,
        currentStreak: 19,
        level: 16,
        totalSessions: 51,
        badges: ['🌊']
      },
      {
        rank: 7,
        userId: 'user7',
        username: 'InnerPeace',
        totalXP: 1400,
        currentStreak: 12,
        level: 14,
        totalSessions: 47,
        badges: ['🧘', '💫']
      },
      {
        rank: 8,
        userId: 'user8',
        username: 'WellnessJourney',
        totalXP: 1280,
        currentStreak: 18,
        level: 13,
        totalSessions: 43,
        badges: ['🎯']
      },
      {
        rank: 9,
        userId: 'user9',
        username: 'MorningMover',
        totalXP: 1150,
        currentStreak: 8,
        level: 12,
        totalSessions: 39,
        badges: ['🌅']
      },
      {
        rank: 10,
        userId: 'user10',
        username: 'BreathMaster',
        totalXP: 1020,
        currentStreak: 14,
        level: 11,
        totalSessions: 35,
        badges: ['💨', '🎈']
      }
    ];

    // Sort based on category
    const sortedData = mockData.sort((a, b) => {
      switch (category) {
        case 'xp':
          return b.totalXP - a.totalXP;
        case 'streak':
          return b.currentStreak - a.currentStreak;
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        default:
          return b.totalXP - a.totalXP;
      }
    });

    // Update ranks
    sortedData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboardData(sortedData);
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Award className="text-amber-600" size={24} />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number, isCurrentUser: boolean = false) => {
    if (isCurrentUser) {
      return 'bg-blue-50 border-blue-200 shadow-md';
    }
    
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default: return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'xp': return <Zap className="text-blue-500" size={16} />;
      case 'streak': return <Flame className="text-orange-500" size={16} />;
      case 'sessions': return <Target className="text-green-500" size={16} />;
      default: return <Trophy className="text-purple-500" size={16} />;
    }
  };

  const getCategoryValue = (entry: LeaderboardEntry, cat: string) => {
    switch (cat) {
      case 'xp': return `${entry.totalXP.toLocaleString()} XP`;
      case 'streak': return `${entry.currentStreak} days`;
      case 'sessions': return `${entry.totalSessions} sessions`;
      default: return `${entry.totalXP.toLocaleString()} XP`;
    }
  };

  const getAvatarInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h1>
        <p className="text-gray-600">
          See how you stack up against the ChiZen community
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Timeframe Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all-time', label: 'All Time' },
            { key: 'monthly', label: 'This Month' },
            { key: 'weekly', label: 'This Week' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeframe(key as any)}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                timeframe === key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'xp', label: 'XP', icon: <Zap size={14} /> },
            { key: 'streak', label: 'Streak', icon: <Flame size={14} /> },
            { key: 'sessions', label: 'Sessions', icon: <Target size={14} /> }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key as any)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-all ${
                category === key
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {leaderboardData.slice(0, 3).map((entry, index) => (
          <Card key={entry.userId} className={`text-center ${getRankBgColor(entry.rank, entry.isCurrentUser)}`}>
            <CardContent className="p-6">
              <div className="mb-4">
                {getRankIcon(entry.rank)}
              </div>
              
              <Avatar className="mx-auto mb-3 w-16 h-16">
                <AvatarFallback className="text-lg font-bold">
                  {getAvatarInitials(entry.username)}
                </AvatarFallback>
              </Avatar>
              
              <h3 className={`font-bold mb-1 ${entry.isCurrentUser ? 'text-blue-800' : 'text-gray-800'}`}>
                {entry.username}
                {entry.isCurrentUser && <span className="text-blue-600 ml-1">(You)</span>}
              </h3>
              
              <div className="flex items-center justify-center mb-2">
                {getCategoryIcon(category)}
                <span className="ml-1 font-semibold text-lg">
                  {getCategoryValue(entry, category)}
                </span>
              </div>
              
              <div className="flex justify-center space-x-1">
                {entry.badges?.slice(0, 3).map((badge, idx) => (
                  <span key={idx} className="text-sm">{badge}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="text-purple-600" size={24} />
            <span>Full Rankings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {leaderboardData.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-4 border-l-4 transition-all ${
                  entry.isCurrentUser
                    ? 'border-l-blue-500 bg-blue-50'
                    : entry.rank <= 3
                    ? 'border-l-yellow-500 bg-yellow-50'
                    : 'border-l-transparent hover:bg-gray-50'
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 flex justify-center">
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-sm font-semibold">
                      {getAvatarInitials(entry.username)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-semibold text-gray-800">
                      {entry.username}
                      {entry.isCurrentUser && (
                        <Badge variant="outline" className="ml-2 text-xs text-blue-600 border-blue-300">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Level {entry.level} • {entry.badges?.slice(0, 2).join(' ')}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center text-blue-600">
                      <Zap size={14} className="mr-1" />
                      <span className="font-semibold">{entry.totalXP.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center text-orange-600">
                      <Flame size={14} className="mr-1" />
                      <span className="font-semibold">{entry.currentStreak}</span>
                    </div>
                    <div className="text-xs text-gray-500">Streak</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center text-green-600">
                      <Target size={14} className="mr-1" />
                      <span className="font-semibold">{entry.totalSessions}</span>
                    </div>
                    <div className="text-xs text-gray-500">Sessions</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center text-blue-600 mb-2">
                <Users size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {leaderboardData.length}
              </div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center text-green-600 mb-2">
                <TrendingUp size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.round(leaderboardData.reduce((sum, entry) => sum + entry.totalXP, 0) / leaderboardData.length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Avg XP</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center text-orange-600 mb-2">
                <Flame size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.max(...leaderboardData.map(entry => entry.currentStreak))}
              </div>
              <div className="text-sm text-gray-600">Top Streak</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center text-purple-600 mb-2">
                <Star size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.round(leaderboardData.reduce((sum, entry) => sum + entry.totalSessions, 0) / leaderboardData.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardDashboard;