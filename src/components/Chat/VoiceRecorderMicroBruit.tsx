// src/components/Chat/VoiceRecorder.tsx
// ✅ Détection silence AMÉLIORÉE avec calibration

import React, { useState, useRef } from 'react';
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ✅ Paramètres optimisés
  const SILENCE_THRESHOLD = 0.01; // Seuil plus élevé pour ignorer bruit ambiant
  const SILENCE_DURATION = 3000; // 3 secondes
  const SPEAKING_THRESHOLD = 0.04; // Seuil pour détecter la parole

  const startRecording = async () => {
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
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      // ✅ Détection de silence
      setupSilenceDetection(stream);

      mediaRecorder.start();
      setIsRecording(true);
      console.log('🎤 Recording started with auto-stop (3s silence)');
      toast.info('Enregistrement... Le micro s\'arrêtera après 3s de silence');

    } catch (error) {
      console.error('❌ Error starting recording:', error);
      toast.error('Erreur : Impossible d\'accéder au microphone');
    }
  };

  const setupSilenceDetection = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let lastSpeakTime = Date.now();

    const detectSilence = () => {
      if (!analyserRef.current || !isRecording) return;

      analyser.getByteTimeDomainData(dataArray);

      // Calculer le volume RMS
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);

      const now = Date.now();

      // ✅ Détection de parole (volume élevé)
      if (rms > SPEAKING_THRESHOLD) {
        lastSpeakTime = now;
        
        // Annuler le timer de silence si parole détectée
        if (silenceTimeoutRef.current) {
          console.log('🔊 Parole détectée (RMS:', rms.toFixed(4), ') - Annulation timer');
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
      }
      // ✅ Silence prolongé (pas de parole depuis 3s)
      else if (rms < SILENCE_THRESHOLD) {
        const silenceDuration = now - lastSpeakTime;
        
        if (silenceDuration >= SILENCE_DURATION && !silenceTimeoutRef.current) {
          console.log('🔇 Silence de 3s détecté (RMS:', rms.toFixed(4), ') - Arrêt automatique');
          stopRecording();
          return; // Sortir pour éviter les appels multiples
        }
      }

      // Continuer la détection
      animationFrameRef.current = requestAnimationFrame(detectSilence);
    };

    detectSilence();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Stopping recording...');

      // Cleanup
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

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
      console.log('✅ Transcription:', data.text);
      
      onTranscript(data.text);
      toast.success('Audio transcrit avec succès');

    } catch (error: any) {
      console.error('❌ Transcription error:', error);
      toast.error('Erreur lors de la transcription');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={handleClick}
      disabled={disabled || isTranscribing}
      className={`h-10 w-10 flex-shrink-0 self-end ${
        isRecording 
          ? 'text-red-500 hover:text-red-600 animate-pulse' 
          : 'text-foreground hover:text-primary'
      }`}
      title={isRecording ? 'Arrêter l\'enregistrement (ou attendre 3s de silence)' : 'Enregistrer un message vocal'}
    >
      {isTranscribing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};