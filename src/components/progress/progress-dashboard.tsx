'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  Star,
  Clock
} from 'lucide-react';

interface ProgressData {
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  total_sessions: number;
  completion_rate: number;
  last_7_days: boolean[];
  monthly_stats: {
    total_sessions: number;
    avg_duration: number;
    favorite_focus: string;
    total_xp_earned: number;
  };
  level: number;
  next_level_xp: number;
}

interface ProgressDashboardProps {
  data: ProgressData;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ data }) => {
  // Generate mock weekly data for trend chart
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      completed: data.last_7_days[i] ? 1 : 0,
      xp: data.last_7_days[i] ? Math.floor(Math.random() * 50) + 30 : 0,
    };
  });

  // Generate mock monthly trend data
  const monthlyTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const hasActivity = Math.random() > 0.3; // 70% chance of activity
    return {
      date: date.getDate(),
      sessions: hasActivity ? Math.floor(Math.random() * 3) + 1 : 0,
      xp: hasActivity ? Math.floor(Math.random() * 80) + 20 : 0,
    };
  });

  // Focus area distribution data
  const focusData = [
    { name: 'Move (Tai Chi)', value: 40, color: '#10b981' },
    { name: 'Mind (Breathwork)', value: 35, color: '#3b82f6' },
    { name: 'Core (Strength)', value: 25, color: '#8b5cf6' },
  ];

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1;
  };

  const getNextLevelXP = (xp: number) => {
    const currentLevel = calculateLevel(xp);
    return currentLevel * 100 - xp;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-red-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '🌟';
    return '✨';
  };

  const currentLevel = calculateLevel(data.total_xp);
  const nextLevelXP = getNextLevelXP(data.total_xp);
  const levelProgress = ((data.total_xp % 100) / 100) * 100;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Streak */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className={`h-4 w-4 ${getStreakColor(data.current_streak)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStreakColor(data.current_streak)}`}>
              {getStreakEmoji(data.current_streak)} {data.current_streak} days
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {data.longest_streak} days
            </p>
          </CardContent>
        </Card>

        {/* Total XP & Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level & XP</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              Level {currentLevel}
            </div>
            <div className="mt-2">
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {nextLevelXP} XP to Level {currentLevel + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.total_sessions}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.completion_rate}% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.monthly_stats.total_sessions}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.monthly_stats.avg_duration} min avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>7-Day Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-all duration-300 ${
                    day.completed
                      ? 'bg-green-100 border-2 border-green-400 text-green-800'
                      : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {day.completed ? '✅' : '○'}
                </div>
                <div className="text-xs font-medium text-gray-600">
                  {day.day}
                </div>
                <div className="text-xs text-gray-500">
                  {day.date}
                </div>
                {day.completed && (
                  <div className="text-xs font-bold text-green-600 mt-1">
                    +{day.xp} XP
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className="text-green-600">
              {data.last_7_days.filter(Boolean).length} / 7 days completed
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>30-Day Progress Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => `Day ${value}`}
                  formatter={(value: any, name: string) => [
                    name === 'xp' ? `${value} XP` : `${value} sessions`,
                    name === 'xp' ? 'XP Earned' : 'Sessions'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Focus Area Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Focus Area Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={focusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {focusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Distribution']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Week */}
            {data.current_streak >= 7 && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl">🔥</div>
                <div>
                  <h4 className="font-semibold text-red-800">Week Warrior</h4>
                  <p className="text-sm text-red-600">7-day streak achieved!</p>
                </div>
              </div>
            )}

            {/* Level Up */}
            {currentLevel >= 2 && (
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl">⭐</div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Level Up!</h4>
                  <p className="text-sm text-yellow-600">Reached Level {currentLevel}</p>
                </div>
              </div>
            )}

            {/* Sessions Milestone */}
            {data.total_sessions >= 10 && (
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl">🌱</div>
                <div>
                  <h4 className="font-semibold text-green-800">Getting Started</h4>
                  <p className="text-sm text-green-600">10+ sessions completed</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>This Week's Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {weeklyData.reduce((sum, day) => sum + day.completed, 0)}
              </div>
              <p className="text-sm text-gray-600">Days Active</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {weeklyData.reduce((sum, day) => sum + day.xp, 0)}
              </div>
              <p className="text-sm text-gray-600">XP Earned</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((weeklyData.filter(day => day.completed).length / 7) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Consistency</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {data.monthly_stats.favorite_focus}
              </div>
              <p className="text-sm text-gray-600 capitalize">Focus Area</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;