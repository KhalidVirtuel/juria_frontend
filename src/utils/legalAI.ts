import { chatAPI } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const streamLegalChat = async ({
  conversationId,
  userMessage,
  onDelta,
  onDone,
  onError,
}: {
  conversationId: string;
  userMessage: string;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}) => {
  try {
    // Vérifier que l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      onError?.("Vous devez être connecté pour utiliser le chat.");
      return;
    }

    // Envoyer le message au backend
    const response = await chatAPI.sendMessage(conversationId, userMessage);

    // Simuler le streaming pour une meilleure UX
    // (Le backend ne fait pas de vrai streaming pour l'instant)
    const assistantContent = response.assistantMessage.content;
    const words = assistantContent.split(' ');

    // Envoyer mot par mot avec un petit délai
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      onDelta(word);
      // Petit délai pour simuler le streaming
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    onDone();
  } catch (error: any) {
    console.error('streamLegalChat error:', error);

    if (error.response?.status === 429) {
      onError?.("Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.");
    } else if (error.response?.status === 402) {
      onError?.("Crédit insuffisant. Veuillez recharger votre compte.");
    } else {
      onError?.(error.response?.data?.error || error.message || 'Erreur de communication avec l\'IA');
    }
  }
};
