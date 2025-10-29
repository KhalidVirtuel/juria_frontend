import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter,
  FolderOpen,
  Calendar,
  Clock,
  Users,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CasesSection: React.FC = () => {
  const { folders, createFolder, setActiveFolderId } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) return;
    
    await createFolder(newFolder.name, newFolder.description, newFolder.color);
    setNewFolder({ name: '', description: '', color: '#3B82F6' });
    setIsCreateDialogOpen(false);
  };

  const getUpcomingDeadlines = (folder: any) => {
    return folder.deadlines?.filter((d: any) => d.status === 'pending').length || 0;
  };

  const getRecentActivity = (folder: any) => {
    const timeline = folder.timeline || [];
    const documents = folder.documents || [];
    return Math.max(timeline.length, documents.length);
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Gestion des dossiers</h1>
          <p className="text-muted-foreground">Vue d'ensemble de tous vos dossiers clients</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="premium-button text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau dossier
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card-premium border-white/30">
            <DialogHeader>
              <DialogTitle>Créer un nouveau dossier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du dossier</Label>
                <Input
                  id="name"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  placeholder="Ex: Affaire Dupont vs Martin"
                  className="glass-effect border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFolder.description}
                  onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                  placeholder="Description du dossier..."
                  rows={3}
                  className="glass-effect border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="color">Couleur</Label>
                <Select 
                  value={newFolder.color} 
                  onValueChange={(value) => setNewFolder({ ...newFolder, color: value })}
                >
                  <SelectTrigger className="glass-effect border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#3B82F6">Bleu</SelectItem>
                    <SelectItem value="#10B981">Vert</SelectItem>
                    <SelectItem value="#F59E0B">Orange</SelectItem>
                    <SelectItem value="#EF4444">Rouge</SelectItem>
                    <SelectItem value="#8B5CF6">Violet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateFolder} className="premium-button text-white">
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un dossier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-effect border-white/20"
          />
        </div>
        <Button variant="outline" className="glass-hover border-white/20">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total dossiers</p>
                <p className="text-2xl font-bold text-foreground">{folders.length}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Échéances cette semaine</p>
                <p className="text-2xl font-bold text-orange-600">
                  {folders.reduce((acc, folder) => acc + getUpcomingDeadlines(folder), 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activité récente</p>
                <p className="text-2xl font-bold text-green-600">
                  {folders.reduce((acc, folder) => acc + getRecentActivity(folder), 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents générés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {folders.reduce((acc, folder) => acc + (folder.documents?.length || 0), 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Folders grid */}
      <div className="flex-1 overflow-auto">
        {filteredFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.map((folder) => (
              <Card 
                key={folder.id} 
                className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveFolderId(folder.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: `linear-gradient(135deg, ${folder.color || '#3B82F6'}, ${folder.color || '#3B82F6'}dd)` }}
                    >
                      📁
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <FolderOpen className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {folder.name}
                    </CardTitle>
                    {folder.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conversations</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {/* Conversations in this folder would be counted here */}
                        0
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pièces jointes</span>
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                        {folder.attachments?.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Échéances</span>
                      <Badge 
                        variant="secondary" 
                        className={getUpcomingDeadlines(folder) > 0 ? "bg-orange-500/10 text-orange-600" : "bg-green-500/10 text-green-600"}
                      >
                        {getUpcomingDeadlines(folder)}
                      </Badge>
                    </div>
                    
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        Créé le {new Date(folder.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? 'Aucun dossier trouvé' : 'Aucun dossier'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? `Aucun dossier ne correspond à "${searchTerm}"`
                  : 'Créez votre premier dossier pour commencer à organiser vos affaires'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)} className="premium-button text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un dossier
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesSection;