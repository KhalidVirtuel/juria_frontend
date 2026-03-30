// src/components/DocumentViewerModal.tsx
import React, { useEffect, useState } from 'react';
import { useDocumentModal } from '@/hooks/useDocumentModal';
import { useChatStore } from '@/store/chatStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, FileText } from 'lucide-react';

const DocumentViewerModal: React.FC = () => {
  const { openDocumentId, setOpenDocumentId } = useDocumentModal();
  const { conversations } = useChatStore();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openDocumentId) {
      loadDocument(openDocumentId);
    } else {
      setDocument(null);
    }
  }, [openDocumentId]);

const loadDocument = async (docId: string) => {
  setLoading(true);
  console.log('📄 [MODAL] Loading document ID:', docId);
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat/documents/${docId}`,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('📄 [MODAL] Response status:', response.status);
    
    if (response.ok) {
      const doc = await response.json();
      console.log('✅ [MODAL] Document loaded:', doc.title);
      setDocument(doc);
    } else {
      const error = await response.json();
      console.error('❌ [MODAL] Error:', error);
    }
  } catch (error) {
    console.error('❌ [MODAL] Fetch error:', error);
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setOpenDocumentId(null);
    setDocument(null);
  };

  const handleDownload = () => {
    if (!document) return;
    
    const blob = new Blob([document.content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'conclusion': return 'bg-purple-100 text-purple-800';
      case 'note': return 'bg-green-100 text-green-800';
      case 'letter': return 'bg-orange-100 text-orange-800';
      case 'report': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'contract': return 'Contrat';
      case 'conclusion': return 'Conclusion';
      case 'note': return 'Note';
      case 'letter': return 'Courrier';
      case 'report': return 'Rapport';
      default: return 'Document';
    }
  };

  return (
    <Dialog open={!!openDocumentId} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {loading ? 'Chargement...' : document?.title || 'Document'}
            {document && (
              <Badge variant="secondary" className={getTypeColor(document.type)}>
                {getTypeLabel(document.type)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : document ? (
          <>
            <div className="overflow-auto max-h-[calc(90vh-180px)]">
              <div 
                className="prose prose-sm max-w-none p-6 bg-white rounded border"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '12pt',
                  lineHeight: '1.6',
                }}
                dangerouslySetInnerHTML={{ __html: document.content }}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Fermer
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Document non trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Le document n'a pas pu être chargé.
            </p>
            <Button onClick={handleClose}>Fermer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerModal;
