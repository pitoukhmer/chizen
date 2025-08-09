'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { VoicePlayer } from '@/components/voice/voice-player'

interface RoutineBlock {
  type: 'move' | 'mind' | 'core'
  name: string
  duration_seconds: number
  instructions: string[]
  difficulty: number
  audio_cue?: string
  benefits?: string[]
}

interface RoutineData {
  routine_id: string
  title: string
  total_duration: number
  focus_area: string
  difficulty_level: number
  blocks: RoutineBlock[]
  completion_xp: number
  daily_wisdom: string
}

interface RoutineCardProps {
  routine?: RoutineData | null
  isLoading: boolean
  onGenerate: () => void
  onStart: () => void
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'move': return 'bg-green-100 text-green-800'
    case 'mind': return 'bg-blue-100 text-blue-800'
    case 'core': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'move': return '🧘'
    case 'mind': return '🫁'
    case 'core': return '💪'
    default: return '✨'
  }
}

export function RoutineCard({ routine, isLoading, onGenerate, onStart }: RoutineCardProps) {
  const [currentBlock] = useState(0)
  const [isPlaying] = useState(false)
  const [timeRemaining] = useState(0)

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800">Generating Your Routine...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!routine) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800">Ready for Your Daily Practice?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧘</div>
            <h3 className="text-xl font-semibold mb-2">Generate Today&apos;s Routine</h3>
            <p className="text-gray-600 mb-6">
              AI will create a personalized wellness session just for you
            </p>
            <Button 
              onClick={onGenerate}
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
            >
              Generate My Routine
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-green-800">{routine.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{routine.total_duration} min</Badge>
              <Badge variant="secondary">Level {routine.difficulty_level}</Badge>
              <Badge variant="secondary">{routine.focus_area}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{routine.completion_xp}</div>
            <div className="text-sm text-gray-600">XP</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wisdom Quote */}
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-green-800 italic">&quot;{routine.daily_wisdom}&quot;</p>
          <p className="text-green-600 text-sm mt-1">— Master Lee</p>
        </div>

        {/* Routine Blocks */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Today&apos;s Flow</h4>
          {routine.blocks.map((block, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentBlock === index ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeEmoji(block.type)}</span>
                  <div>
                    <h5 className="font-semibold">{block.name}</h5>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(block.type)}>
                        ChiZen {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {Math.floor(block.duration_seconds / 60)}:{String(block.duration_seconds % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < block.difficulty ? 'text-orange-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              {currentBlock === index && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm text-gray-700">
                    <strong>Instructions:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {block.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                  {block.audio_cue && (
                    <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded space-y-2">
                      <div><strong>Master Lee says:</strong> {block.audio_cue}</div>
                      <VoicePlayer 
                        text={block.audio_cue} 
                        voiceId="master-lee"
                        className="justify-start"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={onStart}
            size="lg" 
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isPlaying ? 'Continue Practice' : 'Start Practice'}
          </Button>
          <Button 
            onClick={onGenerate}
            variant="outline" 
            size="lg"
          >
            New Routine
          </Button>
        </div>

        {isPlaying && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Block {currentBlock + 1} of {routine.blocks.length}</span>
              <span>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</span>
            </div>
            <Progress 
              value={(1 - timeRemaining / routine.blocks[currentBlock]?.duration_seconds) * 100} 
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}