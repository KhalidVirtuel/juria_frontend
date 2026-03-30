import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface DocumentListProps {
  folderId: string;
  documents: GeneratedDocument[];
}

const DocumentList: React.FC<DocumentListProps> = ({ folderId, documents }) => {
  const { addDocument, updateDocument, removeDocument } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<GeneratedDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<GeneratedDocument | null>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'note' as GeneratedDocument['type'],
    content: ''
  });

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
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument) return;

    await updateDocument(folderId, editingDocument.id, newDocument);
    setEditingDocument(null);
    setNewDocument({ title: '', type: 'note', content: '' });
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

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Documents générés</CardTitle>
          <Dialog open={isAddDialogOpen || !!editingDocument} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingDocument(null);
              setNewDocument({ title: '', type: 'note', content: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingDocument ? 'Modifier le document' : 'Nouveau document'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                <div>
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea
                    id="content"
                    value={newDocument.content}
                    onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                    placeholder="Contenu du document..."
                    rows={8}
                    className="min-h-32"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingDocument(null);
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={editingDocument ? handleUpdateDocument : handleAddDocument}>
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
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
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
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => startEdit(document)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
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
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewingDocument?.title}
              <Badge variant="secondary" className={viewingDocument ? getTypeColor(viewingDocument.type) : ''}>
                {viewingDocument ? getTypeLabel(viewingDocument.type) : ''}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-96">
            <div className="whitespace-pre-wrap text-sm p-4 bg-muted/50 rounded border">
              {viewingDocument?.content}
            </div>
          </div>
          <div className="flex justify-end gap-2">
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