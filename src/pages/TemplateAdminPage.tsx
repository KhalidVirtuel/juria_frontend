// Page d'administration des templates
// src/pages/TemplateAdminPage.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Upload, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  X,
  File,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'contract' | 'conclusion' | 'note' | 'letter' | 'report';
  subtype: string;
  filename: string;
  fileUrl: string;
  isDefault: boolean;
  uploadedAt: number;
  uploadedBy: string;
}
interface TemplateAdminPageProps {
  onClose?: () => void; 
}
const TemplateAdminPage: React.FC<TemplateAdminPageProps> = ({ onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    type: 'contract' as Template['type'],
    subtype: '',
    file: null as File | null,
    isDefault: false
  });

  const [filterType, setFilterType] = useState<string>('all');

  // Types de documents
  const documentTypes = [
    { value: 'contract', label: 'Contrats', icon: '📄', color: 'bg-blue-100 text-blue-800' },
    { value: 'conclusion', label: 'Conclusions', icon: '⚖️', color: 'bg-purple-100 text-purple-800' },
    { value: 'letter', label: 'Courriers', icon: '✉️', color: 'bg-green-100 text-green-800' },
    { value: 'note', label: 'Notes', icon: '📝', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'report', label: 'Rapports', icon: '📊', color: 'bg-red-100 text-red-800' }
  ];

  // Sous-types par type
  const subtypesByType: Record<string, string[]> = {
    contract: ['CDD', 'CDI', 'Bail Commercial', 'Bail d\'Habitation', 'Prestation de Services'],
    conclusion: ['Civiles', 'Commerciales', 'Pénales', 'Administratives'],
    letter: ['Mise en Demeure', 'Réclamation', 'Résiliation', 'Demande d\'Information'],
    note: ['Interne', 'Consultation', 'Synthèse', 'Compte-Rendu'],
    report: ['Audit', 'Conformité', 'Due Diligence', 'Analyse']
  };

  // Charger les templates depuis l'API
  useEffect(() => {
    loadTemplates();
  }, []);

const loadTemplates = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/templates`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // ✅ Vérifier le content-type
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ API returned HTML instead of JSON');
      toast({
        title: "Configuration backend requise",
        description: "Vérifiez que le serveur backend est démarré",
        variant: "default"
      });
      setTemplates([]);
      return;
    }
    
    if (response.ok) {
      const data = await response.json();
      setTemplates(data.templates || []);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les templates",
      variant: "destructive"
    });
    setTemplates([]);
  }
};

  // Upload template
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.subtype) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('name', uploadForm.name);
    formData.append('description', uploadForm.description);
    formData.append('type', uploadForm.type);
    formData.append('subtype', uploadForm.subtype);
    formData.append('isDefault', String(uploadForm.isDefault));

    try {
      console.log(`${import.meta.env.VITE_API_URL}/templates/upload`)
     const response = await fetch(`${import.meta.env.VITE_API_URL}/templates/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Template uploadé avec succès"
        });
        
        setIsUploadDialogOpen(false);
        setUploadForm({
          name: '',
          description: '',
          type: 'contract',
          subtype: '',
          file: null,
          isDefault: false
        });
        
        loadTemplates();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload",
        variant: "destructive"
      });
    }
  };

  // Supprimer template
  const handleDelete = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Template supprimé"
        });
        loadTemplates();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  // Définir comme défaut
  const handleSetDefault = async (templateId: string, type: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/templates/${templateId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Template défini par défaut"
        });
        loadTemplates();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive"
      });
    }
  };

  // Télécharger template
  const handleDownload = async (template: Template) => {
    try {
      const response = await fetch(template.fileUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = template.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement",
        variant: "destructive"
      });
    }
  };

  const getTypeInfo = (type: string) => {
    return documentTypes.find(t => t.value === type) || documentTypes[0];
  };

  const filteredTemplates = filterType === 'all' 
    ? templates 
    : templates.filter(t => t.type === filterType);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
      <Settings className="w-8 h-8 text-mezin" />
      Administration des Templates
    </h1>
    <p className="text-gray-600 mt-2">
      Gérer les modèles de documents pour l'application
    </p>
  </div>
  
  <div className="flex items-center gap-2">
    <Button 
      onClick={() => setIsUploadDialogOpen(true)}
      className="bg-mezin hover:bg-[#002855] text-white"
    >
      <Plus className="w-4 h-4 mr-2" />
      Nouveau Template
    </Button>
    
    {onClose && (
      <Button 
        variant="outline"
        onClick={onClose}
        className="border-gray-300"
      >
        <X className="w-4 h-4 mr-2" />
        Fermer
      </Button>
    )}
    

  </div>
</div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg",
            filterType === 'all' && "ring-2 ring-mezin"
          )}
          onClick={() => setFilterType('all')}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>

        {documentTypes.map(type => (
          <Card 
            key={type.value}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              filterType === type.value && "ring-2 ring-mezin"
            )}
            onClick={() => setFilterType(type.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{type.icon}</span>
                <div className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.type === type.value).length}
                </div>
              </div>
              <div className="text-sm text-gray-600">{type.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table des templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Templates {filterType !== 'all' && `- ${getTypeInfo(filterType).label}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sous-type</TableHead>
                  <TableHead>Par défaut</TableHead>
                  <TableHead>Date d'upload</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => {
                  const typeInfo = getTypeInfo(template.type);
                  
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{template.name}</div>
                            {template.description && (
                              <div className="text-sm text-gray-500">{template.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeInfo.color}>
                          {typeInfo.icon} {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.subtype}</Badge>
                      </TableCell>
                      <TableCell>
                        {template.isDefault ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Défaut
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(template.id, template.type)}
                            className="text-xs"
                          >
                            Définir par défaut
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(template.uploadedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/*
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewTemplate(template)}
                            title="Aperçu"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(template)}
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template);
                              setIsEditDialogOpen(true);
                            }}
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filterType === 'all' 
                  ? "Aucun template disponible"
                  : `Aucun template de type "${getTypeInfo(filterType).label}"`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Upload */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-mezin" />
              Uploader un nouveau template
            </DialogTitle>
            <DialogDescription>
              Uploadez un fichier .docx qui servira de modèle pour les documents
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Fichier */}
            <div className="grid gap-2">
              <Label htmlFor="file">Fichier .docx *</Label>
              <Input
                id="file"
                type="file"
                accept=".docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadForm({ ...uploadForm, file });
                    // Auto-remplir le nom si vide
                    if (!uploadForm.name) {
                      setUploadForm({ 
                        ...uploadForm, 
                        file,
                        name: file.name.replace('.docx', '')
                      });
                    }
                  }
                }}
                className="cursor-pointer"
              />
              {uploadForm.file && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <File className="w-4 h-4" />
                  {uploadForm.file.name} ({(uploadForm.file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            {/* Nom */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du template *</Label>
              <Input
                id="name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Ex: Contrat CDD Standard"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Description courte du template"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="grid gap-2">
                <Label htmlFor="type">Type de document *</Label>
                <Select 
                  value={uploadForm.type} 
                  onValueChange={(value: Template['type']) => {
                    setUploadForm({ ...uploadForm, type: value, subtype: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sous-type */}
              <div className="grid gap-2">
                <Label htmlFor="subtype">Sous-type *</Label>
                <Select 
                  value={uploadForm.subtype} 
                  onValueChange={(value) => setUploadForm({ ...uploadForm, subtype: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subtypesByType[uploadForm.type]?.map(subtype => (
                      <SelectItem key={subtype} value={subtype}>
                        {subtype}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Par défaut */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={uploadForm.isDefault}
                onChange={(e) => setUploadForm({ ...uploadForm, isDefault: e.target.checked })}
                className="w-4 h-4 text-mezin"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Définir comme template par défaut pour ce type
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadForm.file || !uploadForm.name || !uploadForm.subtype}
              className="bg-mezin hover:bg-[#002855]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Uploader
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {/* ✅ Modal d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le template</DialogTitle>
            <DialogDescription>
              Modifiez les informations du template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={editingTemplate?.name || ''}
                onChange={(e) =>
                  setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)
                }
                placeholder="Ex: Contrat de travail CDI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editingTemplate?.description || ''}
                onChange={(e) =>
                  setEditingTemplate(prev => prev ? { ...prev, description: e.target.value } : null)
                }
                placeholder="Description du template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <select
                id="edit-type"
                value={editingTemplate?.type || 'contract'}
                onChange={(e) =>
                  setEditingTemplate(prev => prev ? { ...prev, type: e.target.value as any } : null)
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="contract">Contrat</option>
                <option value="conclusion">Conclusions</option>
                <option value="letter">Courrier</option>
                <option value="note">Note</option>
                <option value="report">Rapport</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subtype">Sous-type</Label>
              <Input
                id="edit-subtype"
                value={editingTemplate?.subtype || ''}
                onChange={(e) =>
                  setEditingTemplate(prev => prev ? { ...prev, subtype: e.target.value } : null)
                }
                placeholder="Ex: CDI, Compromis, Mise en demeure..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={async () => {
                if (!editingTemplate) return;
                try {
                  const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/templates/${editingTemplate.id}`,
                    {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        name: editingTemplate.name,
                        description: editingTemplate.description,
                        type: editingTemplate.type,
                        subtype: editingTemplate.subtype,
                      })
                    }
                  );

                  if (!response.ok) throw new Error('Update failed');

                  toast({
                    title: "Succès",
                    description: "Template mis à jour"
                  });
                  
                  setIsEditDialogOpen(false);
                  loadTemplates();
                } catch (error) {
                  console.error('Error updating template:', error);
                  toast({
                    title: "Erreur",
                    description: "Impossible de mettre à jour le template",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-mezin hover:bg-[#002855]"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Aperçu : téléchargement direct au lieu de Office Online */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu : {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Téléchargez le fichier pour l'ouvrir dans Word/LibreOffice
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center space-y-4">
            <div className="text-6xl">📄</div>
            <p className="text-lg font-medium">{previewTemplate?.filename}</p>
            <p className="text-sm text-muted-foreground">{previewTemplate?.description}</p>
            <Button
              onClick={() => {
                if (previewTemplate?.fileUrl) {
                  // ✅ Téléchargement direct
                  const link = document.createElement('a');
                  link.href = previewTemplate.fileUrl;
                  link.download = previewTemplate.filename;
                  link.click();
                }
              }}
              className="bg-mezin hover:bg-[#002855]"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateAdminPage;