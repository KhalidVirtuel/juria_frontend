import React, { useState, useEffect } from 'react';
import { GeneratedDocument } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TemplateAdminPage from '@/pages/TemplateAdminPage';

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
  ChevronDown,
  Filter,
  Search,
  SearchX,
  Loader2,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import { useDocumentModal } from '@/hooks/useDocumentModal';
import { convertDocxToHtml } from '@/utils/docxConverter';

// ✅ Interface pour les templates de l'API
interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  type: 'contract' | 'conclusion' | 'note' | 'letter' | 'report';
  subtype: string;
  filename: string;
  fileUrl: string;
  isDefault: boolean;
  uploadedAt: string;
}

interface DocumentListProps {
  folderId: string;
  documents: GeneratedDocument[];
  onNavigateToConversations?: () => void; 
}

const DocumentList: React.FC<DocumentListProps> = ({ folderId, documents, onNavigateToConversations }) => {
  const { addDocument, updateDocument, removeDocument, loadFolder } = useChatStore();
  const { openDocumentId, setOpenDocumentId } = useDocumentModal();
  const navigate = useNavigate();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<GeneratedDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<GeneratedDocument | null>(null);
  
  // ✅ Templates depuis l'API
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'contract' as GeneratedDocument['type'],
    content: '',
    selectedTemplateId: ''
  });

  // États pour filtre et recherche
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [searchText, setSearchText] = useState('');

  const [showTemplateAdmin, setShowTemplateAdmin] = useState(false);

  // ✅ Charger les templates depuis l'API au montage
  useEffect(() => {
    loadTemplates();
  }, []);

// Remplacer la fonction loadTemplates dans DocumentList.tsx (ligne 93-126)

const loadTemplates = async () => {
  console.log({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
  setLoadingTemplates(true);
  try {
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/templates`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // ✅ AJOUTÉ - Vérifier le content-type
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ Templates API not configured - using empty state');
      setTemplates([]);
      setLoadingTemplates(false);
      return;
    }

    if (response.ok) {
      const data = await response.json();
      setTemplates(data.templates || []);
      
      // ✅ Initialiser avec le premier template "contract" par défaut
      const defaultContractTemplate = data.templates.find(
        (t: ApiTemplate) => t.type === 'contract' && t.isDefault
      ) || data.templates.find((t: ApiTemplate) => t.type === 'contract');
      
      if (defaultContractTemplate) {
        await loadTemplateContent(defaultContractTemplate);
      }
    } else if (response.status === 404) {
      // Route pas créée → Mode dégradé
      console.warn('⚠️ Templates API (404) - Using empty state');
      setTemplates([]);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Error loading templates:', error);
    
    // Mode dégradé sans crash
    setTemplates([]);
    
    // Initialiser avec document vierge
    setNewDocument({
      title: '',
      type: 'contract',
      content: '',
      selectedTemplateId: ''
    });
  } finally {
    setLoadingTemplates(false);
  }
};

  // ✅ Charger le contenu d'un template (convertir DOCX -> HTML)
  const loadTemplateContent = async (template: ApiTemplate) => {
    setLoadingTemplate(true);
    try {
      // Convertir le fichier .docx en HTML
      const htmlContent = await convertDocxToHtml(template.fileUrl);
      
      setNewDocument({
        title: template.name,
        type: template.type,
        content: htmlContent,
        selectedTemplateId: template.id
      });

     /* toast({
        title: "Template chargé",
        description: `${template.name} chargé avec succès`
      });*/
    } catch (error) {
      console.error('Error loading template content:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu du template",
        variant: "destructive"
      });
      
      // Fallback: document vierge
      setNewDocument({
        title: template.name,
        type: template.type,
        content: '',
        selectedTemplateId: template.id
      });
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ✅ Grouper les templates par type
  const getTemplatesByType = (type: string): ApiTemplate[] => {
    return templates.filter(t => t.type === type);
  };

  // ✅ Obtenir un template par ID
  const getTemplateById = (id: string): ApiTemplate | undefined => {
    return templates.find(t => t.id === id);
  };

  // ✅ Obtenir le template par défaut d'un type
  const getDefaultTemplateByType = (type: string): ApiTemplate | undefined => {
    return templates.find(t => t.type === type && t.isDefault) ||
           templates.find(t => t.type === type);
  };

  // Filtrer et rechercher dans les documents
  const filteredDocuments = React.useMemo(() => {
    let result = documents;
    
    if (filterText.trim()) {
      const filterLower = filterText.toLowerCase();
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(filterLower)
      );
    }
    
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(doc => {
        if (doc.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        const textContent = doc.content.replace(/<[^>]*>/g, '').toLowerCase();
        return textContent.includes(searchLower);
      });
    }
    
    return result;
  }, [documents, filterText, searchText]);

  // Recharger les documents périodiquement
  useEffect(() => {
    const reloadDocuments = async () => {
      try {
        await loadFolder(folderId);
      } catch (error) {
        console.error('Error reloading folder:', error);
      }
    };

    reloadDocuments();
    const interval = setInterval(reloadDocuments, 5000);
    return () => clearInterval(interval);
  }, [folderId, loadFolder]);

  // Gérer l'ouverture automatique d'un document
  useEffect(() => {
    if (openDocumentId && documents.length > 0) {
      const doc = documents.find(d => d.id === openDocumentId);
      if (doc) {
        setViewingDocument(doc);
        setOpenDocumentId(null);
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

    await addDocument(folderId, {
      title: newDocument.title,
      type: newDocument.type,
      content: newDocument.content
    });
    
    setNewDocument({ title: '', type: 'contract', content: '', selectedTemplateId: '' });
    setIsAddDialogOpen(false);
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument) return;

    await updateDocument(folderId, editingDocument.id, {
      title: newDocument.title,
      content: newDocument.content,
      type: newDocument.type
    });
    
    setEditingDocument(null);
    setNewDocument({ title: '', type: 'contract', content: '', selectedTemplateId: '' });
  };

  const startEdit = (doc: GeneratedDocument) => {
    setEditingDocument(doc);
    setNewDocument({
      title: doc.title,
      type: doc.type,
      content: doc.content,
      selectedTemplateId: ''
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const { title, content } = newDocument;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px;
              line-height: 1.6;
            }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 20px; margin-top: 20px; }
            h3 { font-size: 16px; margin-top: 15px; }
            p { margin: 10px 0; }
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
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const downloadDocument = (doc: GeneratedDocument) => {
    const blob = new Blob([doc.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeLabel = (type: GeneratedDocument['type']) => {
    switch (type) {
      case 'contract': return 'Contrat';
      case 'conclusion': return 'Conclusions';
      case 'letter': return 'Courrier';
      case 'note': return 'Note';
      case 'report': return 'Rapport';
    }
  };

  const getTypeBadgeColor = (type: GeneratedDocument['type']) => {
    switch (type) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'conclusion': return 'bg-purple-100 text-purple-800';
      case 'letter': return 'bg-green-100 text-green-800';
      case 'note': return 'bg-yellow-100 text-yellow-800';
      case 'report': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col border-none shadow-none">
        <CardHeader className="flex-row items-center justify-end space-y-0 pb-4 mr-10">
          <CardTitle className="text-lg flex items-center gap-2">
            <Dialog open={isAddDialogOpen || !!editingDocument} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingDocument(null);
                setNewDocument({ title: '', type: 'contract', content: '', selectedTemplateId: '' });
              }
            }}>
              {documents.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      className="flex items-center gap-2 px-6 py-3 text-sm font-medium border border-mezin transition-colors relative text-mezin bg-white hover:bg-mezin hover:text-white"
                    >
                      <ChevronDown className="w-4 h-4 mr-1"/>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau document
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-60">
                    {/* Avec conversation */}
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
                    
                    {/* Avec éditeur */}
                    <DropdownMenuItem 
                      onClick={async () => {
                        // ✅ Charger le template par défaut "contract"
                        const defaultTemplate = getDefaultTemplateByType('contract');
                        if (defaultTemplate) {
                          await loadTemplateContent(defaultTemplate);
                        }
                        setIsAddDialogOpen(true);
                      }}
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
                {/* ✅ Bouton Templates - Ouvre Dialog */}
                <Button 
                  size="sm"
                  onClick={() => setShowTemplateAdmin(true)}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium border border-mezin transition-colors relative text-mezin bg-white hover:bg-mezin hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Templates
                </Button>

              {/* Dialog Éditeur */}
              <DialogContent className="w-[calc(100vw-260px)] max-w-none h-[100vh] overflow-hidden fixed right-0 top-0 left-auto translate-x-0 translate-y-0">
                <DialogHeader className="flex flex-row items-center justify-between px-10">
                  <DialogTitle>
                    {editingDocument ? 'Modifier le document' : 'Nouveau document'}
                  </DialogTitle>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="flex items-center gap-2 text-mezin border-mezin hover:bg-mezin hover:text-white"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </Button>
                </DialogHeader>

                <div className="space-y-4 overflow-auto max-h-[calc(90vh-120px)] px-6">
                  <div className="grid grid-cols-2 gap-4 px-2">
                    {/* Titre */}
                    <div>
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                        placeholder="Ex: Contrat de prestation"
                        className="mt-2 border-mezin border"
                      />
                    </div>

                    {/* Type avec templates */}
                    <div>
                      <Label htmlFor="type">Type de document</Label>
                      <Select 
                        value={newDocument.selectedTemplateId || newDocument.type}
                        onValueChange={async (value) => {
                          const template = getTemplateById(value);
                          
                          if (template) {
                            // Template spécifique sélectionné
                            await loadTemplateContent(template);
                          } else {
                            // Type sélectionné - charger template par défaut
                            const defaultTemplate = getDefaultTemplateByType(value);
                            if (defaultTemplate) {
                              await loadTemplateContent(defaultTemplate);
                            } else {
                              // Pas de template - document vierge
                              setNewDocument({
                                ...newDocument,
                                type: value as any,
                                content: '',
                                selectedTemplateId: ''
                              });
                            }
                          }
                        }}
                        disabled={loadingTemplate}
                      >
                        <SelectTrigger className="border-mezin border mt-2">
                          <SelectValue className="text-mezin">
                            {loadingTemplate && (
                              <span className="flex items-center gap-2 border-mezin border">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Chargement...
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {/* Contrats */}
                          <SelectItem value="contract" disabled className="font-semibold text-mezin pl-6">
                            📄 Contrats
                          </SelectItem>
                          {getTemplatesByType('contract').map(t => (
                            <SelectItem key={t.id} value={t.id} className="pl-12">
                              {t.subtype} {t.isDefault}
                            </SelectItem>
                          ))}
                          
                          {/* Conclusions */}
                          <SelectItem value="conclusion" disabled className="font-semibold text-mezin mt-2  pl-6">
                            ⚖️ Conclusions
                          </SelectItem>
                          {getTemplatesByType('conclusion').map(t => (
                            <SelectItem key={t.id} value={t.id} className="pl-12">
                              {t.subtype} {t.isDefault }
                            </SelectItem>
                          ))}
                          
                          {/* Courriers */}
                          <SelectItem value="letter" disabled className="font-semibold text-mezin  pl-6 mt-2">
                            ✉️ Courriers
                          </SelectItem>
                          {getTemplatesByType('letter').map(t => (
                            <SelectItem key={t.id} value={t.id} className="pl-12">
                              {t.subtype} {t.isDefault }
                            </SelectItem>
                          ))}
                          
                          {/* Notes */}
                          <SelectItem value="note" disabled className="font-semibold text-mezin mt-2 pl-6">
                            📝 Notes
                          </SelectItem>
                          {getTemplatesByType('note').map(t => (
                            <SelectItem key={t.id} value={t.id} className="pl-12">
                              {t.subtype} {t.isDefault }
                            </SelectItem>
                          ))}
                          
                          {/* Rapports */}
                          <SelectItem value="report" disabled className="font-semibold text-mezin mt-2 pl-6">
                            📊 Rapports
                          </SelectItem>
                          {getTemplatesByType('report').map(t => (
                            <SelectItem key={t.id} value={t.id} className="pl-12">
                              {t.subtype} {t.isDefault }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Éditeur */}
                  <div>
                    <Label htmlFor="content">Contenu</Label>
                    <div className="mt-2">
                      {loadingTemplate ? (
                        <div className="flex items-center justify-center h-[400px] border rounded-lg">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-mezin" />
                            <p className="text-sm text-gray-600">Chargement du template...</p>
                          </div>
                        </div>
                      ) : (
                        <RichTextEditor
                          value={newDocument.content}
                          onChange={(content) => setNewDocument({ ...newDocument, content })}
                          height={400}
                          placeholder="Rédigez votre document ici..."
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="border border-mezin-ciel" 
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingDocument(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="border border-mezin bg-mezin text-white" 
                      onClick={editingDocument ? handleUpdateDocument : handleAddDocument}
                      disabled={loadingTemplate}
                    >
                      {editingDocument ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Filtres et recherche */}
            {documents.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterPopup(true)}
                 className={cn(
                               "border-mezin text-mezin hover:bg-mezin hover:text-white",
                               filterText && "bg-mezin text-white"
                )}
                >
                   <Filter className="w-5 h-5" />
                </Button>

               {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearchPopup(true)}
                  className={cn(
                    "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
                    searchText && "bg-purple-600 text-white"
                  )}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button> */} 

                {(filterText || searchText) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterText('');
                      setSearchText('');
                    }}
                    className="h-9 w-9 border border-mezin rounded-full transition-colors text-mezin hover:bg-mezin hover:text-white animate-in fade-in zoom-in duration-200"
                  >
                    <SearchX className="w-5 h-5 " />
                  </Button>
                )}
              </>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          {filteredDocuments.length > 0 ? (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                      <Badge className={getTypeBadgeColor(doc.type)}>
                        {getTypeLabel(doc.type)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Créé le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setViewingDocument(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => startEdit(doc)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeDocument(folderId, doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              {filterText || searchText ? (
                <>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Aucun document ne correspond à vos critères
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setFilterText('');
                      setSearchText('');
                    }}
                    className="border-mezin text-mezin hover:bg-mezin hover:text-white"
                  >
                    <SearchX className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun document</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Commencez par créer votre premier document
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-mezin hover:bg-[#002855] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Créer un document
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onNavigateToConversations?.()}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Avec conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => {
                        const defaultTemplate = getDefaultTemplateByType('contract');
                        if (defaultTemplate) {
                          await loadTemplateContent(defaultTemplate);
                        }
                        setIsAddDialogOpen(true);
                      }}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Avec éditeur
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Preview */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] p-6 border rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: viewingDocument?.content || '' }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Popups Filter & Search */}
      <Dialog open={showFilterPopup} onOpenChange={setShowFilterPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrer par titre</DialogTitle>
            <DialogDescription>
              Recherchez des documents par leur titre
           </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Entrez le titre..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setFilterText(''); setShowFilterPopup(false); }}>
                Réinitialiser
              </Button>
              <Button onClick={() => setShowFilterPopup(false)} className="bg-mezin">
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSearchPopup} onOpenChange={setShowSearchPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechercher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Rechercher..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setSearchText(''); setShowSearchPopup(false); }}>
                Réinitialiser
              </Button>
              <Button onClick={() => setShowSearchPopup(false)} className="bg-purple-600">
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Dialog Template Administration */}
      <Dialog open={showTemplateAdmin} onOpenChange={setShowTemplateAdmin}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0">
          <div className="h-full overflow-hidden">
            <TemplateAdminPage onClose={() => setShowTemplateAdmin(false)} />
          </div>
        </DialogContent>
      </Dialog>
      

    </>
  );
};

export default DocumentList;