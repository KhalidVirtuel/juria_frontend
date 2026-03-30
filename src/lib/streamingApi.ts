// src/lib/streamingApi.ts
// ✅ Fix parsing JSON avec buffer pour gérer les chunks multiples

export interface StreamStep {
  type: 'step' | 'complete' | 'error';
  step?: string;
  message?: string;
  details?: string;
  userMessage?: any;
  aiMessage?: any;
  metadata?: {
    documentGenerated?: boolean;
    hasAudio?: boolean;
    intention?: string;
  };
  audio?: {
    audio: string;
    mimeType: string;
    voice: string;
  } | null;
  timelineEvents?: any[];
  documents?: any[];
}

export async function sendMessageWithStreaming(
  conversationId: string,
  content: string,
  onStep: (step: StreamStep) => void,
  isVoiceInput: boolean = false
): Promise<{
  userMessage: any;
  aiMessage: any;
  timelineEvents: any[];
  documents: any[];
  audioData?: { audio: string; mimeType: string; voice: string } | null;
}> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/chat/conversations/${conversationId}/messages/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        content,
        isVoiceInput
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  let userMessage: any = null;
  let aiMessage: any = null;
  let timelineEvents: any[] = [];
  let documents: any[] = [];
  let audioData: any = null;

  // ✅ NOUVEAU : Buffer pour accumuler les chunks incomplets
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      
      // ✅ Ajouter au buffer
      buffer += chunk;

      // ✅ Traiter chaque ligne complète du buffer
      const lines = buffer.split('\n');
      
      // ✅ Garder la dernière ligne (potentiellement incomplète) dans le buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === 'step') {
              onStep(data);
            } else if (data.type === 'complete') {
              userMessage = data.userMessage;
              aiMessage = data.aiMessage;
              timelineEvents = data.timelineEvents || [];
              documents = data.documents || [];
              audioData = data.audio || null;
              onStep(data);
            } else if (data.type === 'error') {
              throw new Error(data.message || 'Unknown error');
            }
          } catch (parseError) {
            // ✅ Log l'erreur avec le contenu pour debug
            console.error('Failed to parse SSE data:', parseError);
            console.error('Problematic JSON string:', jsonStr.substring(0, 500) + '...');
          }
        }
      }
    }

    // ✅ Traiter le buffer restant à la fin
    if (buffer.trim()) {
      const lines = buffer.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'complete') {
              userMessage = data.userMessage;
              aiMessage = data.aiMessage;
              timelineEvents = data.timelineEvents || [];
              documents = data.documents || [];
              audioData = data.audio || null;
              onStep(data);
            }
          } catch (parseError) {
            console.error('Failed to parse final buffer:', parseError);
          }
        }
      }
    }

  } finally {
    reader.releaseLock();
  }

  return {
    userMessage,
    aiMessage,
    timelineEvents,
    documents,
    audioData,
  };
}