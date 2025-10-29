import React, { useState } from 'react';
import { Deadline } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DeadlineListProps {
  folderId: string;
  deadlines: Deadline[];
}

const DeadlineList: React.FC<DeadlineListProps> = ({ folderId, deadlines }) => {
  const { addDeadline, updateDeadline, removeDeadline } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as Deadline['priority'],
    status: 'pending' as Deadline['status']
  });

  const handleAddDeadline = async () => {
    if (!newDeadline.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }

    await addDeadline(folderId, {
      ...newDeadline,
      dueDate: new Date(newDeadline.dueDate).getTime()
    });
    
    setNewDeadline({ 
      title: '', 
      description: '', 
      dueDate: new Date().toISOString().split('T')[0], 
      priority: 'medium', 
      status: 'pending' 
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateDeadline = async () => {
    if (!editingDeadline) return;

    await updateDeadline(folderId, editingDeadline.id, {
      ...newDeadline,
      dueDate: new Date(newDeadline.dueDate).getTime()
    });
    
    setEditingDeadline(null);
    setNewDeadline({ 
      title: '', 
      description: '', 
      dueDate: new Date().toISOString().split('T')[0], 
      priority: 'medium', 
      status: 'pending' 
    });
  };

  const startEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setNewDeadline({
      title: deadline.title,
      description: deadline.description,
      dueDate: new Date(deadline.dueDate).toISOString().split('T')[0],
      priority: deadline.priority,
      status: deadline.status
    });
  };

  const toggleStatus = (deadline: Deadline) => {
    const newStatus = deadline.status === 'completed' ? 'pending' : 'completed';
    updateDeadline(folderId, deadline.id, { status: newStatus });
  };

  const getPriorityColor = (priority: Deadline['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Deadline['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityLabel = (priority: Deadline['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Moyenne';
    }
  };

  const getStatusLabel = (status: Deadline['status']) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'overdue': return 'En retard';
      default: return 'En cours';
    }
  };

  const isOverdue = (dueDate: number, status: Deadline['status']) => {
    return status !== 'completed' && dueDate < Date.now();
  };

  const getDaysUntilDue = (dueDate: number) => {
    const days = Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Échéancier automatique</CardTitle>
        <Dialog open={isAddDialogOpen || !!editingDeadline} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingDeadline(null);
            setNewDeadline({ 
              title: '', 
              description: '', 
              dueDate: new Date().toISOString().split('T')[0], 
              priority: 'medium', 
              status: 'pending' 
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle échéance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDeadline ? 'Modifier l\'échéance' : 'Nouvelle échéance'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                  placeholder="Ex: Dépôt des conclusions"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select 
                  value={newDeadline.priority} 
                  onValueChange={(value: Deadline['priority']) => setNewDeadline({ ...newDeadline, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={newDeadline.status} 
                  onValueChange={(value: Deadline['status']) => setNewDeadline({ ...newDeadline, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                  placeholder="Description de l'échéance..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingDeadline(null);
                }}>
                  Annuler
                </Button>
                <Button onClick={editingDeadline ? handleUpdateDeadline : handleAddDeadline}>
                  {editingDeadline ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {deadlines.length > 0 ? (
          <div className="space-y-3">
            {deadlines.map((deadline) => {
              const overdue = isOverdue(deadline.dueDate, deadline.status);
              const daysUntil = getDaysUntilDue(deadline.dueDate);
              
              return (
                <div 
                  key={deadline.id} 
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors",
                    overdue && "border-red-200 bg-red-50/50",
                    deadline.status === 'completed' && "opacity-75"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(deadline)}
                      className={cn(
                        "p-0 h-6 w-6",
                        deadline.status === 'completed' ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {deadline.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-medium text-sm",
                        deadline.status === 'completed' && "line-through text-muted-foreground"
                      )}>
                        {deadline.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className={getPriorityColor(deadline.priority)}>
                          {getPriorityLabel(deadline.priority)}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(deadline.status)}>
                          {getStatusLabel(deadline.status)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(deadline.dueDate).toLocaleDateString('fr-FR')}
                          {deadline.status !== 'completed' && (
                            <span className={cn(
                              "ml-1",
                              overdue ? "text-red-600 font-medium" : daysUntil <= 3 ? "text-orange-600 font-medium" : ""
                            )}>
                              ({overdue ? `${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''} de retard` : 
                                daysUntil === 0 ? "Aujourd'hui" :
                                daysUntil === 1 ? "Demain" :
                                `dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`})
                            </span>
                          )}
                        </div>
                      </div>
                      {deadline.description && (
                        <p className="text-sm text-muted-foreground mt-1">{deadline.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => startEdit(deadline)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeDeadline(folderId, deadline.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune échéance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des échéances pour suivre les délais importants
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une échéance
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadlineList;