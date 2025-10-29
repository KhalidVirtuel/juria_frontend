
import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, simulateAIResponse } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  conversationId: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addMessage, setIsTyping } = useChatStore();

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileNames = Array.from(files).map(file => file.name).join(', ');
    toast.success(`Fichier(s) sélectionné(s): ${fileNames}`);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim()) return;
    
    // Envoyer le message de l'utilisateur
    await addMessage(conversationId, 'user', message.trim());
    setMessage('');
    
    // Simuler la réponse de l'IA
    setIsTyping(true);
    
    try {
      const aiResponse = await simulateAIResponse(message);
      await addMessage(conversationId, 'assistant', aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Ajuster automatiquement la hauteur du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px'; // Hauteur minimale
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160 // Hauteur maximale
      )}px`;
    }
  }, [message]);

  return (
    <div className="p-4">
      <form 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto"
      >
        <div className="relative flex items-center bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[56px]">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFilesSelected}
          />
          <Button 
            type="button" 
            size="icon" 
            variant="ghost"
            onClick={handleFileUpload}
            className="ml-4 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-all duration-200 shrink-0"
            title="Uploader des documents"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question juridique..."
            className="flex-1 min-h-[56px] py-4 px-4 bg-transparent border-none resize-none overflow-hidden text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            className={`mr-4 h-10 w-10 rounded-xl transition-all duration-200 shrink-0 ${
              message.trim() 
                ? 'text-primary hover:text-primary hover:bg-primary/10' 
                : 'text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
