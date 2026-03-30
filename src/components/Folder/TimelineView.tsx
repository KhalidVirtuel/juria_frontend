import React, { useState, useEffect } from 'react';
import { TimelineEntry } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  EyeOff,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import { foldersAPI } from '@/lib/api';

interface TimelineViewProps {
  folderId: string;
  timeline: TimelineEntry[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ folderId, timeline }) => {
  const { 
    addTimelineEntry, 
    updateTimelineEntry, 
    removeTimelineEntry, 
    loadFolder,
    conversations 
  } = useChatStore();


  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const { activeConversationId } = useChatStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    type: 'event' as TimelineEntry['type'],
    date: new Date().toISOString().split('T')[0]
  });

  // États pour filtre et recherche
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [searchText, setSearchText] = useState('');

  // ✅ NOUVEAU : État pour les accordéons ouverts (par conversationId)
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());

  const conversationsForSelect = React.useMemo(() => {
    return conversations
      .filter(c => String(c.folderId) === String(folderId))
      .map(conv => ({
        id: conv.id,
        title: conv.title || 
              (conv.messages?.[0]?.content?.slice(0, 50) || 'Conversation sans titre')
      }));
  }, [conversations, folderId]);



  // Grouper les événements timeline par conversation
  const timelineByConversation = React.useMemo(() => {
    const grouped = new Map<string, TimelineEntry[]>();

    timeline.forEach(entry => {
      const convId = entry.conversationId || 'no-conversation';
      if (!grouped.has(convId)) {
        grouped.set(convId, []);
      }
      grouped.get(convId)!.push(entry);
    });
    console.log('🗂️ Grouping timeline entries by conversationId');
    console.log('📅 grouped :', grouped);
    return grouped;
  }, [timeline]);

  // Filtrer et rechercher dans les événements timeline
  const filteredTimeline = React.useMemo(() => {
    let result = timeline;
    console.log('🔍 Filtering timeline entries with filter:', filterText, 'and search:', searchText);
    console.log('📅 Original timeline entries:', timeline);
    if (filterText.trim()) {
      const filterLower = filterText.toLowerCase();
      const titleConversations = conversations.filter(c =>
        (c.title && c.title.toLowerCase().includes(filterLower)) ||
        (c.messages && c.messages.some(m => m.content.toLowerCase().includes(filterLower)))
      ).map(c => c.id);
      console.log('💬 Conversations matching filter:', titleConversations);
      result = result.filter(entry =>
        titleConversations.includes(entry.conversationId || '')
      );
      console.log('📅 Filtered timeline entries after filter:', result);
    }
    
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(entry => {
        if (entry.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        const textContent = entry.description.replace(/<[^>]*>/g, '').toLowerCase();
        return textContent.includes(searchLower);
      });
    }
    
    return result;
  }, [timeline, filterText, searchText]);

  // Recharger les données périodiquement
  useEffect(() => {
    const reloadDocuments = async () => {
      try {
        await loadFolder(folderId);
      } catch (error) {
        console.error('❌ Error reloading folder:', error);
      }
    };

    reloadDocuments();
    console.log('🔄 Setting up periodic folder reload for folder reloadDocuments:', reloadDocuments());
    const interval = setInterval(reloadDocuments, 5000);
    return () => clearInterval(interval);
  }, [folderId, loadFolder]);

  const toggleAccordion = (conversationId: string) => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

const handleAddEntry = async () => {
  if (!newEntry.title.trim()) {
    toast({ title: "Erreur", description: "Le titre est requis", variant: "destructive" });
    return;
  }

  await addTimelineEntry(folderId, {
    ...newEntry,
    date: new Date(newEntry.date).getTime(),
    conversationId: selectedConversationId || activeConversationId || undefined // ✅ AJOUTER
  });
  
  setNewEntry({ title: '', description: '', type: 'hearing', date: new Date().toISOString().split('T')[0] });
  setSelectedConversationId(''); // Reset
  setIsAddDialogOpen(false);
};


  const handleUpdateEntry = async () => {
  if (!editingEntry) return;
  
  const { entry } = await foldersAPI.updateTimelineEntry(editingEntry.id, {
    title: newEntry.title,
    description: newEntry.description,
    type: newEntry.type,
    date: newEntry.date,
    conversationId: selectedConversationId || null,
  });
  
   setEditingEntry(null);
  setIsAddDialogOpen(false);
  setNewEntry({ title: '', description: '', type: 'hearing', date: new Date().toISOString().split('T')[0] });
  setSelectedConversationId('');
};

  const startEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      description: entry.description,
      type: entry.type,
      date: new Date(entry.date).toISOString().split('T')[0]
    });

      setSelectedConversationId(entry.conversationId || '');
      toast({ title: "Succès", description: "Chronologie mise à jour", variant: "default" });

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

  // Fonction pour rendre les événements d'une conversation
  const renderTimelineEvents = (events: TimelineEntry[]) => {
    const sortedEvents = [...events].sort((a, b) => a.date - b.date);




    return (
      <div className="relative pl-8 space-y-3">
        {/* Ligne verticale */}
        <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-mezin" />

        {sortedEvents.map((entry, index) => (
          <div key={entry.id} className="relative">
              <div className=
                "absolute -left-10 bg-white top-2 w-8 h-8 border-2 border-mezin-ciel rounded-full flex items-center justify-center font-normal text-mezin z-10"
             >
                {index + 1}
              </div>

            {/* Carte de l'événement */}
            <div className="border border-gray-200 bg-gray-50 overflow-hidden rounded-sm hover:bg-gray-100 cursor-pointer transition-colors group">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badge type + Titre */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-white border-0 shadow-sm text-xs font-normal", getTypeBadgeColor(entry.type))}>
                        {getTypeIcon(entry.type)}
                        <span className="ml-1.5 text-xs font-normal">{getTypeLabel(entry.type)}</span>
                      </Badge>
                      <h3 className="text-sm text-gray-900 truncate">
                        {entry.title}
                      </h3>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-mezin">
                      <Clock className="w-3.5 h-3.5" />
                      <span className='text-xs text-mezin'>
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   {/*  <Button
                      onClick={() => updateTimelineEntry(folderId, entry.id, {
                        showInCalendar: entry.showInCalendar === false ? true : false
                      })}
                      title={entry.showInCalendar === false ? "Afficher dans l'agenda" : "Masquer de l'agenda"}
                    >
                      {entry.showInCalendar === false
                        ? <EyeOff className="w-4 h-4 text-gray-400" />   // masqué → gris
                        : <Eye className="w-4 h-4 text-green-600" />      // visible → vert
                      }
                    </Button>
*/}
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
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      <CardHeader className="px-4 py-0 space-y-3 flex flex-row items-center justify-between mr-10">
        {/* Stats */}
        {timeline.length > 0 && (
          <div className="space-y-0 flex flex-row items-center justify-start gap-2">
            <div className="p-3">
              <div className="text-xs text-mezin-ciel font-medium mb-1">Durée</div>
              <div className="font-bold text-mezin">{stats.duration} jours</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-mezin-ciel font-medium mb-1">Étapes</div>
              <div className="font-bold text-mezin">{stats.steps}</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-mezin-ciel font-medium mb-1">Alertes</div>
              <div className="font-bold text-mezin">{stats.alerts}</div>
            </div>
          </div>
        )}

        {/* Boutons actions */}
        <div className="flex items-center gap-2">

          <Dialog open={isAddDialogOpen || !!editingEntry} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingEntry(null);
              setNewEntry({ title: '', description: '', type: 'event', date: new Date().toISOString().split('T')[0] });
            }
          }}>
          <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium border border-mezin transition-colors relative text-mezin bg-white hover:bg-mezin hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un événement
          </Button>

          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Modifier l\'événement' : 'Nouvel événement'}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Modifiez les informations de l\'événement' : 'Ajoutez un nouvel événement à la chronologie du dossier'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Ex: Dépôt de la plainte"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type d'événement</Label>
                    <Select value={newEntry.type} onValueChange={(value) => setNewEntry({ ...newEntry, type: value as TimelineEntry['type'] })}>
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

                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="conversation">Associer à une conversation</Label>
                  <Select 
                    value={selectedConversationId} 
                    onValueChange={setSelectedConversationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une conversation" />
                    </SelectTrigger>
                   <SelectContent>
                      {conversationsForSelect.map(conv => (
                        <SelectItem key={conv.id} value={conv.id}>
                          {conv.title}  
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <RichTextEditor
                    value={newEntry.description}
                    onChange={(value) => setNewEntry({ ...newEntry, description: value })}
                    placeholder="Décrivez l'événement en détail..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingEntry(null);
                    setNewEntry({ title: '', description: '', type: 'event', date: new Date().toISOString().split('T')[0] });
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={editingEntry ? handleUpdateEntry : handleAddEntry}
                  className="bg-mezin hover:bg-[#002855]"
                >
                  {editingEntry ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
          </DialogContent>
          </Dialog>

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
            {searchText && <span className="ml-2 text-xs">({filteredTimeline.length})</span>}
          </Button>
*/} 
          {(filterText || searchText) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterText('');
                setSearchText('');
              }}
              className="h-9 w-9 border border-mezin rounded-full transition-colors text-mezin hover:bg-mezin hover:text-white animate-in fade-in zoom-in duration-200"
              title="Afficher tous les événements"
            >
              <SearchX className="w-5 h-5 " />
            </Button>
          )}


        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {filteredTimeline.length > 0 ? (
          <div className="space-y-3">
            {/* Grouper par conversation avec accordéon */}
            {Array.from(timelineByConversation.entries()).map(([conversationId, events]) => {
              const conversation = conversations.find(c => c.id === conversationId);
              const isOpen = openAccordions.has(conversationId);
              const eventsCount = events.length;

              // Filtrer les événements de cette conversation
              const filteredEvents = events.filter(event => 
                filteredTimeline.some(fe => fe.id === event.id)
              );

              // Ne pas afficher si aucun événement ne correspond aux filtres
              if (filteredEvents.length === 0) return null;

              return (
                <div key={conversationId} className="border border-gray-200 overflow-hidden rounded-sm hover:bg-gray-50 cursor-pointer transition-colors">
                  {/* En-tête de l'accordéon */}
                  <button
                    onClick={() => toggleAccordion(conversationId)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}>
                        <ChevronRight className="w-5 h-5 text-mezin" />
                      </div>
                      <MessageSquare className="w-5 h-5 text-mezin-ciel" />
                      <div className="text-left">
                        <h3 className="font-medium text-sm">
                          {conversation?.title || 'Conversation sans titre'}
                        </h3>
                        <p className="text-xs text-mezin">
                          {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-mezin border-mezin">
                      {filteredEvents.length}
                    </Badge>
                  </button>

                  {/* Contenu de l'accordéon */}
                  {isOpen && (
                    <div className="px-6 py-2 bg-gray-50 animate-in slide-in-from-top-2 duration-200">
                      {renderTimelineEvents(filteredEvents)}
                    </div>
                  )}
                </div>
              );
            })}
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
                  Ajoutez des événements pour suivre l'évolution de ce dossier
                </p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className='bg-mezin hover:bg-[#002855] text-white'
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un événement
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* Popup Filtre */}
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
          <div className="space-y-3 py-4">
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
              <span className="text-muted-foreground">Résultats trouvés:</span>
              <span className="font-semibold text-mezin">{filteredTimeline.length} événement(s)</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterText('');
                  setShowFilterPopup(false);
                }}
                className="text-mezin border-mezin hover:bg-mezin hover:text-white"
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

      {/* Popup Recherche */}
      <Dialog open={showSearchPopup} onOpenChange={setShowSearchPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Rechercher dans le contenu
            </DialogTitle>
            <DialogDescription>
              Recherchez dans les titres et descriptions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
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
              <span className="text-muted-foreground">Résultats trouvés:</span>
              <span className="font-semibold text-purple-600">{filteredTimeline.length} événement(s)</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchText('');
                  setShowSearchPopup(false);
                }}
                className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => setShowSearchPopup(false)}
                className="bg-purple-600 hover:bg-purple-700"
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