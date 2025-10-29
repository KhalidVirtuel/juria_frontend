import React, { useState } from 'react';
import { Attachment } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Paperclip, 
  FileText, 
  Download, 
  Trash2,
  Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AttachmentListProps {
  folderId: string;
  attachments: Attachment[];
}

const AttachmentList: React.FC<AttachmentListProps> = ({ folderId, attachments }) => {
  const { addAttachment, removeAttachment } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    type: 'document' as Attachment['type'],
    url: '',
    size: 0
  });

  const handleAddAttachment = async () => {
    if (!newAttachment.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du fichier est requis",
        variant: "destructive"
      });
      return;
    }

    await addAttachment(folderId, newAttachment);
    setNewAttachment({ name: '', type: 'document', url: '', size: 0 });
    setIsAddDialogOpen(false);
  };

  const getTypeColor = (type: Attachment['type']) => {
    switch (type) {
      case 'evidence': return 'bg-red-100 text-red-800';
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'document': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Attachment['type']) => {
    switch (type) {
      case 'evidence': return 'Preuve';
      case 'contract': return 'Contrat';
      case 'document': return 'Document';
      default: return 'Autre';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Pièces jointes</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une pièce jointe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du fichier</Label>
                <Input
                  id="name"
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                  placeholder="Ex: Contrat de vente.pdf"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newAttachment.type} 
                  onValueChange={(value: Attachment['type']) => setNewAttachment({ ...newAttachment, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evidence">Preuve</SelectItem>
                    <SelectItem value="contract">Contrat</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="url">URL du fichier (optionnel)</Label>
                <Input
                  id="url"
                  value={newAttachment.url}
                  onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddAttachment}>
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {attachments.length > 0 ? (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-sm">{attachment.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={getTypeColor(attachment.type)}>
                        {getTypeLabel(attachment.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(attachment.uploadedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {attachment.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeAttachment(folderId, attachment.id)}
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
            <Paperclip className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune pièce jointe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des preuves, contrats ou documents à ce dossier
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Ajouter un fichier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttachmentList;