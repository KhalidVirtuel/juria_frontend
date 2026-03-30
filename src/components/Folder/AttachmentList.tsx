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
  Upload,
  Filter,
  SearchX,
  X,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AttachmentListProps {
  folderId: string;
  attachments: Attachment[];
}

const AttachmentList: React.FC<AttachmentListProps> = ({ folderId, attachments }) => {
  const { addAttachment, removeAttachment, loadFolder } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    type: 'document' as Attachment['type'],
    url: '',
    size: 0
  });

  // 🆕 States pour drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  // 🆕 Fonction de validation de fichier réutilisable
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Vérifier le type de fichier
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension || '')) {
      return { 
        valid: false, 
        error: 'Seuls les fichiers PNG, JPG et PDF sont acceptés' 
      };
    }

    // Limite de taille : 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'La taille maximale est de 10MB' 
      };
    }

    return { valid: true };
  };

  // 🆕 Handlers pour drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragError(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier si on quitte vraiment la zone (pas un enfant)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
      setDragError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) {
      setDragError('Aucun fichier détecté');
      return;
    }

    if (files.length > 1) {
      setDragError('Veuillez déposer un seul fichier à la fois');
      return;
    }

    const file = files[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      setDragError(validation.error || 'Fichier invalide');
      toast({
        title: "Erreur",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    // Fichier valide, l'ajouter
    setSelectedFile(file);
    setNewAttachment({
      ...newAttachment,
      name: file.name,
      size: file.size
    });
    setIsAddDialogOpen(true);
    setDragError(null);
  };

  // 🆕 States pour filtre
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterText, setFilterText] = useState('');

  // 🆕 Filtrer les attachments par nom
  const filteredAttachments = React.useMemo(() => {
    if (!filterText.trim()) {
      return attachments;
    }
    
    const filterLower = filterText.toLowerCase();
    return attachments.filter(attachment => 
      attachment.name.toLowerCase().includes(filterLower)
    );
  }, [attachments, filterText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);

    if (!validation.valid) {
      toast({
        title: "Format non supporté",
        description: validation.error,
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
      
      // Reset
      setSelectedFile(null);
      setNewAttachment({ name: '', type: 'document', url: '', size: 0 });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Fichier uploadé avec succès"
      });

      // ✅ Recharger le dossier depuis l'API au lieu de recharger la page
      await loadFolder(folderId);

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

  // 🆕 Fonction pour construire l'URL de téléchargement via l'API
  const getFileUrl = (attachment: Attachment): string => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';
    
    // Si l'URL est déjà complète, la retourner telle quelle
    if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
      return attachment.url;
    }
    
    // Utiliser l'endpoint API pour télécharger le fichier
    return `${apiUrl}/folders/${folderId}/attachments/${attachment.id}/download`;
  };

  // 🆕 Fonction pour télécharger le fichier avec authentification
  const handleDownload = async (attachment: Attachment) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';
      
      const response = await fetch(`${apiUrl}/attachments/${folderId}/${attachment.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Succès",
        description: "Fichier téléchargé avec succès"
      });
    } catch (error) {
      console.error('[DOWNLOAD ERROR]', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier. Vérifiez que le fichier existe sur le serveur.",
        variant: "destructive"
      });
    }
  };

  // 🆕 Fonction pour prévisualiser le fichier
  const handlePreview = (attachment: Attachment) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';
    
    // Ouvrir avec le token dans l'URL pour l'authentification
    const url = `${apiUrl}/attachments/${folderId}/${attachment.id}/download?token=${token}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      <CardHeader className="flex-row items-center justify-end space-y-0 pb-4 mx-10 gap-2">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
           {attachments.length > 0 ? (
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2 px-6 my-3 py-3 text-sm font-medium border border-mezin transition-colors relative text-blue-950 bg-white hover:bg-mezin hover:text-white">
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
                {/* 🆕 Boutons Filtrer et Réinitialiser */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilterPopup(true)}
            className={cn(
                         "h-9 w-9 rounded-full transition-colors mr-1  border border-mezin",
                         filterText 
                           ? "bg-mezin text-white hover:bg-mezin" 
                           : "hover:bg-mezin"
                       )}           
            title="Filtrer par nom"
          >
            <Filter className="w-5 h-5" />
          </Button>
          {filterText && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFilterText('');
                toast({
                  title: "Filtre réinitialisé",
                  description: "Toutes les pièces jointes sont maintenant affichées"
                });
              }}
              className="h-9 w-9 border border-mezin rounded-full transition-colors text-mezin hover:bg-mezin hover:text-white animate-in fade-in zoom-in duration-200"
              title="Afficher toutes les pièces jointes"
            >
              <SearchX className="w-5 h-5" />
            </Button>
          )}
        </div>

      </CardHeader>
      <CardContent 
        className="flex-1 overflow-auto relative"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 🆕 Overlay de drag and drop */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-blue-50/90 border-4 border-dashed border-blue-500 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce" />
              <p className="text-lg font-semibold text-blue-900 mb-2">
                Déposez votre fichier ici
              </p>
              <p className="text-sm text-blue-700">
                PNG, JPG ou PDF (max 10MB)
              </p>
            </div>
          </div>
        )}

        {/* 🆕 Message d'erreur drag */}
        {dragError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {dragError}
          </div>
        )}

        {filteredAttachments.length > 0 ? (
          <div className="space-y-3">
            {filteredAttachments.map((attachment) => (
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
                    <>
                     {/*
                     
                     <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePreview(attachment)}
                        title="Prévisualiser"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                     */} 
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(attachment)}
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeAttachment(folderId, attachment.id)}
                    className="text-destructive hover:text-destructive"
                    title="Supprimer"
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
            {filterText ? (
              <>
                <h3 className="text-lg font-medium text-foreground mb-2">Aucune pièce jointe trouvée</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Aucune pièce jointe ne correspond à votre filtre
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setFilterText('')}
                  className="border-mezin text-mezin hover:bg-mezin hover:text-white"
                >
                  <SearchX className="w-4 h-4 mr-2" />
                  Réinitialiser le filtre
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-foreground mb-2">Aucune pièce jointe</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Glissez-déposez un fichier ici ou cliquez pour ajouter
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <Button onClick={() => setIsAddDialogOpen(true)} className='bg-blue-950 hover:bg-blue-800 text-white shadow-sm hover:shadow-md'>
                    <Upload className="w-4 h-4 mr-2 " />
                    Ajouter un fichier
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG ou PDF • Max 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* 🆕 Popup Filtre par nom */}
      <Dialog open={showFilterPopup} onOpenChange={setShowFilterPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-mezin" />
              Filtrer par nom
            </DialogTitle>
            <DialogDescription>
              Recherchez des pièces jointes par leur nom
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Entrez le nom du fichier..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pr-10"
                autoFocus
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Résultats trouvés:
              </span>
              <span className="font-semibold text-mezin">
                {filteredAttachments.length} pièce(s) jointe(s)
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterText('');
                  setShowFilterPopup(false);
                }}
              className="text-mezin border border-mezin bg-white  hover:text-white hover:bg-mezin"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => setShowFilterPopup(false)}
                className="bg-mezin-ciel hover:mezin"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AttachmentList;