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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    type: 'document' as Attachment['type'],
    url: '',
    size: 0
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Vérifier le type de fichier - SEULEMENT PNG, JPG, PDF
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension || '')) {
      toast({
        title: "Format non supporté",
        description: "Seuls les fichiers PNG, JPG et PDF sont acceptés",
        variant: "destructive"
      });
      e.target.value = ''; // Reset input
      return;
    }

    // ✅ Limite de taille : 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10MB",
        variant: "destructive"
      });
      e.target.value = ''; // Reset input
      return;
    }

    setSelectedFile(file);
    setNewAttachment({
      ...newAttachment,
      name: file.name,
      size: file.size
    });
  };

  const handleAddAttachment = async () => {
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive"
      });
      return;
    }

    if (!newAttachment.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du fichier est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      // ✅ UPLOAD RÉEL vers le serveur
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', newAttachment.name);
      formData.append('type', newAttachment.type);

      // Récupère le token d'authentification
      const token = localStorage.getItem('token');
       const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

       const response = await fetch(`${apiUrl}/folders/${folderId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      
      // Rafraîchit la liste (le store va recharger depuis le serveur)
      // ou ajoute directement si ton store gère ça
      
      // Reset
      setSelectedFile(null);
      setNewAttachment({ name: '', type: 'document', url: '', size: 0 });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Fichier uploadé avec succès"
      });

      // Force le rechargement des attachments
      window.location.reload(); // Simple mais efficace

    } catch (error: any) {
      console.error('[UPLOAD ERROR]', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Une erreur est survenue lors de l'upload",
        variant: "destructive"
      });
    }
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
    <Card className="h-full flex flex-col border-none shadow-none">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
           {attachments.length > 0 ? (
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-950 hover:bg-blue-800 text-white shadow-sm hover:shadow-md pe-5">
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </DialogTrigger>
          ) : null}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une pièce jointe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 ">
              {/* ✅ INPUT FILE avec validation PNG, JPG, PDF */}
              <div>
                <Label htmlFor="file">Fichier (PNG, JPG, PDF uniquement)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Fichier sélectionné: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

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
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" className='border border-mezin-ciel' onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="ghost" className='border border-mezin bg-mezin text-white' onClick={handleAddAttachment}>
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
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-sm hover:bg-gray-50 cursor-pointer transition-colors">
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
            <Button onClick={() => setIsAddDialogOpen(true)} className='bg-blue-950 hover:bg-blue-800 text-white shadow-sm hover:shadow-md'>
              <Upload className="w-4 h-4 mr-2 " />
              Ajouter un fichier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttachmentList;