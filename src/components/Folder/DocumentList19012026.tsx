import React, { useState ,useEffect } from 'react';
import { GeneratedDocument } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Edit,
  Trash2,
  Download,
  Eye,
  Printer,
  MessageSquare,  
  Edit2,
  ChevronDown            
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';

import { useDocumentModal } from '@/hooks/useDocumentModal';



interface DocumentListProps {
  folderId: string;
  documents: GeneratedDocument[];
  onNavigateToConversations?: () => void; 

}

const DocumentList: React.FC<DocumentListProps> = ({ folderId, documents, onNavigateToConversations }) => {
  const { addDocument, updateDocument, removeDocument, loadFolder } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<GeneratedDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<GeneratedDocument | null>(null);
  const { openDocumentId, setOpenDocumentId } = useDocumentModal();
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'note' as GeneratedDocument['type'],
    content: ''
  });

  // ✅ Recharger les documents quand le composant monte ou devient visible
  useEffect(() => {
    const reloadDocuments = async () => {
      console.log('📄 [DOCUMENTS] Reloading folder data...');
      try {
        await loadFolder(folderId);
        console.log('✅ [DOCUMENTS] Folder reloaded successfully');
      } catch (error) {
        console.error('❌ [DOCUMENTS] Error reloading folder:', error);
      }
    };

    // Recharger immédiatement au montage
    reloadDocuments();

    // ✅ Recharger périodiquement toutes les 5 secondes
    const interval = setInterval(reloadDocuments, 5000);

    return () => clearInterval(interval);
  }, [folderId, loadFolder]);

  // ✅ Écouter les demandes d'ouverture depuis le chat
  useEffect(() => {
    if (openDocumentId) {
      const doc = documents.find(d => d.id === openDocumentId);
      if (doc) {
        console.log('📄 [DOCUMENTS] Opening document from chat:', doc.title);
        setViewingDocument(doc);
        setOpenDocumentId(null); // Reset
      }
    }
  }, [openDocumentId, documents, setOpenDocumentId]);

  const handleAddDocument = async () => {
    if (!newDocument.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }

    await addDocument(folderId, newDocument);
    setNewDocument({ title: '', type: 'note', content: '' });
    setIsAddDialogOpen(false);
    
    // ✅ Recharger immédiatement après ajout
    await loadFolder(folderId);
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument) return;

    await updateDocument(folderId, editingDocument.id, newDocument);
    setEditingDocument(null);
    setNewDocument({ title: '', type: 'note', content: '' });
    
    // ✅ Recharger immédiatement après modification
    await loadFolder(folderId);
  };

  const startEdit = (document: GeneratedDocument) => {
    setEditingDocument(document);
    setNewDocument({
      title: document.title,
      type: document.type,
      content: document.content
    });
  };

  const getTypeColor = (type: GeneratedDocument['type']) => {
    switch (type) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'conclusion': return 'bg-purple-100 text-purple-800';
      case 'note': return 'bg-green-100 text-green-800';
      case 'letter': return 'bg-orange-100 text-orange-800';
      case 'report': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: GeneratedDocument['type']) => {
    switch (type) {
      case 'contract': return 'Contrat';
      case 'conclusion': return 'Conclusion';
      case 'note': return 'Note';
      case 'letter': return 'Courrier';
      case 'report': return 'Rapport';
      default: return 'Document';
    }
  };

  // ✅ Fonction pour exporter en Word (optionnel)
  const handleExportToWord = (document: GeneratedDocument) => {
    const blob = new Blob([document.content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };


  const handlePrint = () => {
  // Créer une fenêtre d'impression avec le contenu du document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast({
      title: "Erreur",
      description: "Impossible d'ouvrir la fenêtre d'impression",
      variant: "destructive"
    });
    return;
  }

  const content = newDocument.content || '';
  const title = newDocument.title || 'Document sans titre';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          @page {
            margin: 2cm;
          }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #003878;
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          p {
            margin: 0.5em 0;
          }
          ul, ol {
            margin: 0.5em 0;
            padding-left: 2em;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <hr>
        ${content}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Attendre que le contenu soit chargé avant d'imprimer
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};


  return (
    <>
      <Card className="h-full flex flex-col border-none shadow-none">
        <CardHeader className="flex-row items-center justify-end space-y-0 pb-4">
          {/*<CardTitle className="text-lg">Documents générés</CardTitle>*/}
          <Dialog open={isAddDialogOpen || !!editingDocument} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingDocument(null);
              setNewDocument({ title: '', type: 'note', content: '' });
            }
            }}>
            {documents.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm" 
                    className="flex items-center gap-2 px-6 my-3 py-3 text-sm font-medium border border-mezin transition-colors relative text-mezin bg-white hover:bg-mezin hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4 mr-1"/>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau document
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-60">
                  {/* Option 1 : Avec conversation */}
                  <DropdownMenuItem 
                    onClick={() => {
                      if (onNavigateToConversations) {
                        onNavigateToConversations();
                      }
                    }}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-mezin">Avec conversation</div>
                      <div className="text-xs text-gray-500 mt-0.5">Créer via l'assistant IA</div>
                    </div>
                  </DropdownMenuItem>
                  
                  {/* Option 2 : Avec éditeur */}
                  <DropdownMenuItem 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-purple-50 focus:bg-purple-50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Edit2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-mezin">Avec éditeur</div>
                      <div className="text-xs text-gray-500 mt-0.5">Créer manuellement</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <DialogContent className="w-[calc(100vw-260px)] max-w-none h-[100vh] overflow-hidden fixed right-0 top-0 left-auto translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top">       
              
              <DialogHeader className="flex flex-row items-center justify-between px-10">
                <DialogTitle>
                  {editingDocument ? 'Modifier le document' : 'Nouveau document'}
                </DialogTitle>
                
                {/* Bouton Imprimer */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2 text-mezin border-mezin hover:bg-mezin hover:text-white transition-colors"
                  title="Imprimer le document"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </DialogHeader>

              <div className="space-y-4 overflow-auto max-h-[calc(90vh-120px)]  px-6">
                <div className="grid grid-cols-2 gap-4 px-2">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                      placeholder="Ex: Contrat de prestation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={newDocument.type} 
                      onValueChange={(value: GeneratedDocument['type']) => setNewDocument({ ...newDocument, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contrat</SelectItem>
                        <SelectItem value="conclusion">Conclusion</SelectItem>
                        <SelectItem value="note">Note interne</SelectItem>
                        <SelectItem value="letter">Courrier</SelectItem>
                        <SelectItem value="report">Rapport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* ✅ Éditeur WYSIWYG TinyMCE */}
                <div>
                  <Label htmlFor="content">Contenu</Label>
                  <div className="mt-2">
                    <RichTextEditor
                      value={newDocument.content}
                      onChange={(content) => setNewDocument({ ...newDocument, content })}
                      height={400}
                      placeholder="Rédigez votre document ici..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" className='border border-mezin-ciel' onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingDocument(null);
                  }}>
                    Annuler
                  </Button>
                  <Button variant="ghost" className='border border-mezin bg-mezin text-white' onClick={editingDocument ? handleUpdateDocument : handleAddDocument}>
                    {editingDocument ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-sm hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{document.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getTypeColor(document.type)}>
                          {getTypeLabel(document.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Créé le {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        {document.lastModified !== document.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            • Modifié le {new Date(document.lastModified).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setViewingDocument(document)}
                      title="Voir le document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => startEdit(document)}
                      title="Editer"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleExportToWord(document)}
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Supprimer"
                      onClick={() => removeDocument(folderId, document.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun document</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez des contrats, conclusions ou notes pour ce dossier
              </p>
              <Button  onClick={() => setIsAddDialogOpen(true)} className='bg-blue-950 hover:bg-blue-800 text-white shadow-sm hover:shadow-md pe-5'>
                <Plus className="w-4 h-4 mr-2" />
                Créer un document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Dialog - Affiche le HTML rendu */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
      <DialogContent className="w-[calc(100vw-260px)] max-w-none h-[100vh] overflow-hidden fixed right-0 top-0 left-auto translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top">       
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewingDocument?.title}
              <Badge variant="secondary" className={viewingDocument ? getTypeColor(viewingDocument.type) : ''}>
                {viewingDocument ? getTypeLabel(viewingDocument.type) : ''}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-180px)]">
            {/* ✅ Affiche le HTML formaté */}
            <div 
              className="prose prose-sm max-w-none p-6 bg-white rounded border"
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: '12pt',
                lineHeight: '1.6',
              }}
              dangerouslySetInnerHTML={{ __html: viewingDocument?.content || '' }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => viewingDocument && handleExportToWord(viewingDocument)}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="outline" onClick={() => setViewingDocument(null)}>
              Fermer
            </Button>
            {viewingDocument && (
              <Button onClick={() => {
                setViewingDocument(null);
                startEdit(viewingDocument);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentList;