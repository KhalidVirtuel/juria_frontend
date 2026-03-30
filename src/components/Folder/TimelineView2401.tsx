import React, { useState,useEffect } from 'react';
import { TimelineEntry } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Clock, 
  Calendar,
  Gavel,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
  File,
  Filter,
  Search,
  SearchX,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  folderId: string;
  timeline: TimelineEntry[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ folderId, timeline }) => {
  const { addTimelineEntry, updateTimelineEntry, removeTimelineEntry, loadFolder } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    type: 'event' as TimelineEntry['type'],
    date: new Date().toISOString().split('T')[0]
  });

  // 🆕 States pour filtre et recherche
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [searchText, setSearchText] = useState('');

  // 🆕 Filtrer et rechercher dans les événements timeline
  const filteredTimeline = React.useMemo(() => {
    let result = timeline;
    
    // Filtre par titre uniquement
    if (filterText.trim()) {
      const filterLower = filterText.toLowerCase();
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(filterLower)
      );
    }
    
    // Recherche dans titre et description
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(entry => {
        // Rechercher dans le titre
        if (entry.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Rechercher dans la description (strip HTML tags first)
        const textContent = entry.description.replace(/<[^>]*>/g, '').toLowerCase();
        return textContent.includes(searchLower);
      });
    }
    
    return result;
  }, [timeline, filterText, searchText]);


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



  const handleAddEntry = async () => {
    if (!newEntry.title.trim()) {
      toast({
        title: "Erreur", 
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }

    await addTimelineEntry(folderId, {
      ...newEntry,
      date: new Date(newEntry.date).getTime()
    });
    
    setNewEntry({ title: '', description: '', type: 'hearing', date: new Date().toISOString().split('T')[0] });
    setIsAddDialogOpen(false);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    await updateTimelineEntry(folderId, editingEntry.id, {
      title: newEntry.title,
      description: newEntry.description,
      type: newEntry.type,
      date: new Date(newEntry.date).getTime()
    });
    
    setEditingEntry(null);
    setNewEntry({ title: '', description: '', type: 'event', date: new Date().toISOString().split('T')[0] });
  };

  const startEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      description: entry.description,
      type: entry.type,
      date: new Date(entry.date).toISOString().split('T')[0]
    });
  };

  const getTypeIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'fact': return <FileText className="w-4 h-4" />;
      case 'procedure': return <Gavel className="w-4 h-4" />;
      case 'hearing': return <Calendar className="w-4 h-4" />;
      case 'deadline': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'fact': return 'bg-blue-500 hover:bg-blue-600';
      case 'procedure': return 'bg-purple-500 hover:bg-purple-600';
      case 'hearing': return 'bg-cyan-500 hover:bg-cyan-600';
      case 'deadline': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getTypeLabel = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'fact': return 'Fait';
      case 'procedure': return 'Procédure';
      case 'hearing': return 'Audience';
      case 'deadline': return 'Échéance';
      default: return 'Événement';
    }
  };

  // Calculer les statistiques
  const stats = {
    duration: filteredTimeline.length > 0 
      ? Math.ceil((Math.max(...filteredTimeline.map(e => e.date)) - Math.min(...filteredTimeline.map(e => e.date))) / (1000 * 60 * 60 * 24))
      : 0,
    steps: filteredTimeline.length,
    alerts: filteredTimeline.filter(e => e.type === 'deadline').length
  };

  // Trier la timeline par date
  const sortedTimeline = [...filteredTimeline].sort((a, b) => a.date - b.date);

  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      <CardHeader className="space-y-0 pb-4 pt-0 flex flex-row items-center justify-between mb-4  mx-10">


        {/* Stats */}
        {timeline.length > 0 && (
          <div className="space-y-0 flex flex-row items-center justify-start gap-2">
            <div className="p-3">
              <div className="text-xs text-mezin-ciel font-medium mb-1">Durée</div>
              <div className="font-bolde  font-bold text-mezin">{stats.duration} jours</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-mezin-ciel font-medium mb-1">Étapes</div>
              <div className="font-bolde  font-bold text-mezin">{stats.steps}</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-mezin-ciel font-medium mb-1">Alertes</div>
              <div className="font-bold text-mezin">{stats.alerts}</div>
            </div>
          </div>
        )}

                {/* 🆕 Boutons Filtrer, Rechercher et Réinitialiser */}
        <div className="flex items-center gap-1">
                  <Dialog open={isAddDialogOpen || !!editingEntry} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingEntry(null);
              setNewEntry({ title: '', description: '', type: 'event', date: new Date().toISOString().split('T')[0] });
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                onClick={() => setIsAddDialogOpen(true)} 
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#003878] bg-white border border-[#003878] hover:bg-[#003878] hover:text-white transition-colors rounded-md'
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            
            <DialogContent className='max-w-5xl max-h-[90vh] overflow-hidden'>
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Modifier l\'événement' : 'Ajouter un événement'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-auto max-h-[calc(90vh-120px)] px-6">
                <div className="grid grid-cols-3 gap-4 px-2">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      placeholder="Ex: Signature du contrat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={newEntry.type} 
                      onValueChange={(value: TimelineEntry['type']) => setNewEntry({ ...newEntry, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fact">Fait</SelectItem>
                        <SelectItem value="procedure">Procédure</SelectItem>
                        <SelectItem value="hearing">Audience</SelectItem>
                        <SelectItem value="deadline">Échéance</SelectItem>
                        <SelectItem value="event">Événement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Description</Label>
                  <div className="mt-2">
                    <RichTextEditor
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e })}
                      placeholder="Description détaillée de l'événement..."
                      height={400}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mr-5">
                  <Button variant="outline" className='border border-mezin-ciel' onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingEntry(null);
                  }}>
                    Annuler
                  </Button>
                  <Button variant="ghost" className='border border-mezin bg-mezin text-white' onClick={editingEntry ? handleUpdateEntry : handleAddEntry}>
                    {editingEntry ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilterPopup(true)}
            className={cn(
              "h-9 w-9 rounded-full transition-colors",
              filterText 
                ? "bg-mezin text-white" 
                : " text-mezin border border-mezin hover:bg-mezin hover:text-white"
            )}
            title="Filtrer par titre"
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearchPopup(true)}
            className={cn(
              "h-9 w-9 rounded-full transition-colors",
              searchText 
                ? "bg-purple-100 text-purple-600 hover:bg-purple-200" 
                : " text-mezin border border-mezin hover:bg-mezin hover:text-white"
            )}
            title="Rechercher dans le contenu"
          >
            <Search className="w-5 h-5" />
          </Button>
          {(filterText || searchText) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFilterText('');
                setSearchText('');
                toast({
                  title: "Filtres réinitialisés",
                  description: "Tous les événements sont maintenant affichés"
                });
              }}
              className="h-9 w-9 border border-mezin rounded-full transition-colors text-mezin hover:bg-mezin hover:text-white animate-in fade-in zoom-in duration-200"
              title="Afficher tous les événements"
            >
              <SearchX className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {sortedTimeline.length > 0 ? (
          <div className="">
            {sortedTimeline.map((entry, index) => (
              <div key={entry.id} className="group relative">
                
                
                {/* Carte de l'événement */}
                <div className="relative ml-10 bg-white border-l-2 hover:bg-gray-50 transition-colors border-mezin-ciel">
                  {/* Numéro */}
                  <div className="absolute -left-5 top-0 w-10 h-10 bg-white border-2 border-mezin-ciel rounded-full flex items-center justify-center font-bold text-gray-700 z-10">
                    {index + 1}
                  </div>

                  <div className="pl-14 pr-4 py-4">
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-gray-900 mb-2">{entry.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTypeBadgeColor(entry.type)} text-white border-0 px-3 py-1 text-xs font-medium`}>
                            {getTypeLabel(entry.type)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Boutons d'action (visibles au hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEdit(entry)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTimelineEntry(folderId, entry.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    {entry.description && (
                      <div 
                        className="text-sm text-gray-700 leading-relaxed mt-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: entry.description }}
                      />
                    )}

                    {/* Documents associés */}
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                      <File className="w-3 h-3" />
                      <span>1 document</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mb-4" />
            {filterText || searchText ? (
              <>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  Aucun événement ne correspond à vos critères de recherche
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
                  Réinitialiser les filtres
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Chronologie vide</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  Ajoutez des événements pour suivre l'évolution de ce dossier et visualiser les étapes importantes
                </p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className='bg-[#003878] hover:bg-[#002855] text-white shadow-sm hover:shadow-md px-6 py-2'
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un événement
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* 🆕 Popup Filtre par titre */}
      <Dialog open={showFilterPopup} onOpenChange={setShowFilterPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-mezin" />
              Filtrer par titre
            </DialogTitle>
            <DialogDescription>
              Recherchez des événements par leur titre
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Entrez le titre de l'événement..."
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
                {filteredTimeline.length} événement(s)
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterText('');
                  setShowFilterPopup(false);
                }}
              className="text-mezin border-mezin bg-white  hover:text-white hover:bg-mezin"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => setShowFilterPopup(false)}
                className="hover:bg-mezin bg-accent"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🆕 Popup Recherche dans le contenu */}
      <Dialog open={showSearchPopup} onOpenChange={setShowSearchPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-mezin" />
              Rechercher dans le contenu
            </DialogTitle>
            <DialogDescription>
              Recherchez dans les titres et descriptions des événements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Entrez votre recherche..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pr-10"
                autoFocus
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
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
              <span className="font-semibold text-purple-600">
                {filteredTimeline.length} événement(s)
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchText('');
                  setShowSearchPopup(false);
                }}
              className="text-mezin border-mezin bg-white  hover:text-white hover:bg-mezin"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => setShowSearchPopup(false)}
                className="hover:bg-mezin bg-accent"
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

export default TimelineView;