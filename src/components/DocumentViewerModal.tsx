// src/components/DocumentViewerModal.tsx
import React, { useEffect, useState } from 'react';
import { useDocumentModal } from '@/hooks/useDocumentModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Save, X } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';

const DocumentViewerModal: React.FC = () => {
  const { openDocumentId, setOpenDocumentId } = useDocumentModal();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // États pour l'édition
  const [editedTitle, setEditedTitle] = useState('');
  const [editedType, setEditedType] = useState('');
  const [editedContent, setEditedContent] = useState('');

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
        
        // Initialiser les champs d'édition
        setEditedTitle(doc.title);
        setEditedType(doc.type);
        setEditedContent(doc.content);
      } else {
        const error = await response.json();
        console.error('❌ [MODAL] Error:', error);
        toast.error('Document non trouvé');
      }
    } catch (error) {
      console.error('❌ [MODAL] Fetch error:', error);
      toast.error('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document) return;
    
    if (!editedTitle.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    
    setSaving(true);
    console.log('💾 [MODAL] Saving document:', document.id);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/folders/${document.folderId}/documents/${document.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: editedTitle,
            type: editedType,
            content: editedContent
          })
        }
      );
      
      if (response.ok) {
        const updatedDoc = await response.json();
        console.log('✅ [MODAL] Document saved');
        
        setDocument(updatedDoc);
        
        toast.success('Document modifié avec succès !');
      } else {
        const error = await response.json();
        console.error('❌ [MODAL] Save error:', error);
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('❌ [MODAL] Save error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Vérifier s'il y a des modifications non sauvegardées
    const hasChanges = document && (
      editedTitle !== document.title ||
      editedType !== document.type ||
      editedContent !== document.content
    );

    if (hasChanges) {
      if (confirm('Voulez-vous quitter sans enregistrer les modifications ?')) {
        setOpenDocumentId(null);
        setDocument(null);
      }
    } else {
      setOpenDocumentId(null);
      setDocument(null);
    }
  };

  const handleDownload = () => {
    if (!document) return;
    
    // Télécharger le contenu ACTUEL (édité)
    const blob = new Blob([editedContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${editedTitle || document.title}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Document téléchargé !');
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
      <DialogContent className="w-[calc(100vw-260px)] max-w-none h-[100vh] overflow-hidden fixed right-0 top-0 left-auto translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top">       
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {loading ? 'Chargement...' : 'Modifier le document'}
            {document && (
              <Badge variant="secondary" className={getTypeColor(editedType || document.type)}>
                {getTypeLabel(editedType || document.type)}
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
            {/* ✅ MODE ÉDITION AVEC WYSIWYG */}
            <div className="space-y-4 overflow-auto max-h-[calc(90vh-180px)] px-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Titre</Label>
                  <Input
                    id="edit-title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Titre du document"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select 
                    value={editedType} 
                    onValueChange={setEditedType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTRACT">Contrat</SelectItem>
                      <SelectItem value="CONCLUSION">Conclusion</SelectItem>
                      <SelectItem value="NOTE">Note interne</SelectItem>
                      <SelectItem value="LETTER">Courrier</SelectItem>
                      <SelectItem value="REPORT">Rapport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-content">Contenu</Label>
                <div className="mt-2">
                  <RichTextEditor
                    value={editedContent}
                    onChange={setEditedContent}
                    height={window.innerHeight - 350}
                    placeholder="Rédigez votre document ici..."
                  />
                </div>
              </div>
            </div>
            
            {/* ✅ BOUTONS : Télécharger + Annuler + Enregistrer */}
            <div className="flex justify-between px-6 pb-4 border-t pt-4">
              <Button 
                variant="outline" 
                onClick={handleDownload}
                disabled={saving}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-950 hover:bg-blue-800"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
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