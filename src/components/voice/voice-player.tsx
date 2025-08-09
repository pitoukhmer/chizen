'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface VoicePlayerProps {
  text: string
  voiceId?: string
  className?: string
}

export function VoicePlayer({ text, voiceId = 'master-lee', className = '' }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const generateAndPlayAudio = async () => {
    setIsLoading(true)
    
    try {
      const response = await apiClient.generateVoice(text, voiceId)
      
      if (response.success && response.data?.audio_url) {
        setAudioUrl(response.data.audio_url)
        
        // Create audio element and play
        const audio = new Audio(response.data.audio_url)
        setIsPlaying(true)
        
        audio.onended = () => {
          setIsPlaying(false)
        }
        
        audio.onerror = () => {
          setIsPlaying(false)
          toast.error('Failed to play audio')
        }
        
        await audio.play()
      } else {
        // Fallback: Use browser's speech synthesis
        playWithSpeechSynthesis()
      }
    } catch (error) {
      console.error('Voice generation error:', error)
      // Fallback to speech synthesis
      playWithSpeechSynthesis()
    } finally {
      setIsLoading(false)
    }
  }

  const playWithSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true)
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 0.9
      utterance.volume = 0.8
      
      utterance.onend = () => {
        setIsPlaying(false)
      }
      
      utterance.onerror = () => {
        setIsPlaying(false)
        toast.error('Speech synthesis failed')
      }
      
      window.speechSynthesis.speak(utterance)
      toast.success('Using browser voice synthesis')
    } else {
      toast.error('Voice not supported in this browser')
    }
  }

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={isPlaying ? stopAudio : generateAndPlayAudio}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : isPlaying ? (
          <>
            <div className="w-4 h-4 bg-red-500 rounded-sm" />
            Stop
          </>
        ) : (
          <>
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            Play Audio
          </>
        )}
      </Button>
      
      {audioUrl && !isPlaying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const audio = new Audio(audioUrl)
            setIsPlaying(true)
            audio.onended = () => setIsPlaying(false)
            audio.play()
          }}
          className="text-green-600"
        >
          🔊 Replay
        </Button>
      )}
    </div>
  )
}

export default VoicePlayer