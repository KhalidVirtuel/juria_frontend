// frontend/src/components/DocumentPreviewModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    content: string;
    type: string;
  } | null;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ 
  open, 
  onClose, 
  document 
}) => {
  if (!document) return null;

  const handleDownload = () => {
    // Créer un blob HTML
    const blob = new Blob([document.content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{document.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-auto max-h-[calc(90vh-180px)] border rounded-lg p-6 bg-white">
          {/* Affichage du document HTML */}
          <div 
            className="prose prose-sm max-w-none"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: '12pt',
              lineHeight: '1.6',
            }}
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={handleDownload} className="bg-blue-950 hover:bg-blue-800">
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;