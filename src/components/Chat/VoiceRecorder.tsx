// src/components/Chat/VoiceRecorder.tsx
// ✅ Gère les transcriptions vides (silence/bruit)

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscript, 
  disabled = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ✅ Gestion clavier : e.ctrlKey pour PTT (Push-to-Talk)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si focus dans un input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Touche e.ctrlKey (code 'ControlLeft')
      if (e.code === 'ControlLeft' && !isRecording && !isTranscribing && !disabled) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.code === 'ControlLeft' && isRecording) {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, isTranscribing, disabled]);

  // ✅ Fonction réutilisable pour démarrer l'enregistrement
  const startRecording = async () => {
    if (disabled || isTranscribing || isRecording) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('🎤 Recording started (PTT mode)');
      toast.info('🎤 Enregistrement... Relâchez pour arrêter');

    } catch (error) {
      console.error('❌ Error starting recording:', error);
      toast.error('Erreur : Impossible d\'accéder au microphone');
    }
  };

  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    await startRecording();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isRecording) return;
    e.preventDefault();
    stopRecording();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!isRecording) return;
    e.preventDefault();
    stopRecording();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Stopping recording (PTT released)');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      console.log('📦 Audio blob size:', audioBlob.size, 'bytes');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/transcribe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Transcription response:', data);
      
      // ✅ NOUVEAU : Vérifier si la transcription a été ignorée
      if (data.ignored) {
        console.log('⚠️ Transcription ignorée:', data.reason);
        // Ne rien faire, pas de toast d'erreur
        return;
      }

      // ✅ Vérifier si le texte est vide
      if (!data.text || data.text.trim().length === 0) {
        console.log('⚠️ Transcription vide, rien à afficher');
        return;
      }

      console.log('📝 Texte transcrit:', data.text);
      onTranscript(data.text);
      toast.success('📝 Texte transcrit avec succès');

    } catch (error: any) {
      console.error('❌ Transcription error:', error);
      toast.error('Erreur lors de la transcription');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || isTranscribing}
      className={`h-8 w-8 flex-shrink-0 self-center text-foreground hover:text-white hover:bg-mezin select-none ${
        isRecording 
          ? 'text-red-500 hover:text-red-600 bg-red-100 animate-pulse' 
          : 'text-foreground hover:text-white hover:bg-mezin'
      }`}
      title={
        isRecording 
          ? 'Relâchez pour arrêter l\'enregistrement' 
          : 'Maintenez enfoncé pour parler'
      }
    >
      {isTranscribing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5 animate-pulse" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};