import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface TimelineViewProps {
  folderId: string;
  timeline: TimelineEntry[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ folderId, timeline }) => {
  const { addTimelineEntry, updateTimelineEntry, removeTimelineEntry } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    type: 'event' as TimelineEntry['type'],
    date: new Date().toISOString().split('T')[0]
  });

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
    
    setNewEntry({ title: '', description: '', type: 'event', date: new Date().toISOString().split('T')[0] });
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

  const getTypeColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'fact': return 'bg-blue-100 text-blue-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'hearing': return 'bg-orange-100 text-orange-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Chronologie automatique</CardTitle>
        <Dialog open={isAddDialogOpen || !!editingEntry} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingEntry(null);
            setNewEntry({ title: '', description: '', type: 'event', date: new Date().toISOString().split('T')[0] });
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un événement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Modifier l\'événement' : 'Ajouter un événement'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="Description détaillée de l'événement..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingEntry(null);
                }}>
                  Annuler
                </Button>
                <Button onClick={editingEntry ? handleUpdateEntry : handleAddEntry}>
                  {editingEntry ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {timeline.length > 0 ? (
          <div className="space-y-4">
            {timeline.map((entry, index) => (
              <div key={entry.id} className="relative">
                {index < timeline.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                )}
                <div className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {getTypeIcon(entry.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm mb-1">{entry.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className={getTypeColor(entry.type)}>
                            {getTypeLabel(entry.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEdit(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTimelineEntry(folderId, entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Clock className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Chronologie vide</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des événements pour suivre l'évolution de ce dossier
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un événement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineView;