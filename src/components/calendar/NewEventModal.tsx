// src/components/calendar/NewEventModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useChatStore } from '@/store/chatStore';
import { FileText, Gavel, Briefcase, AlertCircle, Clock, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
}

// ✅ Plus de useChatStore() ici - supprimé

const EVENT_TYPES = [
  { value: 'FACT',      label: 'Fait',       icon: FileText,    color: 'text-blue-600' },
  { value: 'PROCEDURE', label: 'Procédure',  icon: Gavel,       color: 'text-purple-600' },
  { value: 'HEARING',   label: 'Audience',   icon: Briefcase,   color: 'text-cyan-600' },
  { value: 'DEADLINE',  label: 'Échéance',   icon: AlertCircle, color: 'text-red-600' },
  { value: 'EVENT',     label: 'Événement',  icon: Clock,       color: 'text-gray-600' },
];

const NewEventModal: React.FC<NewEventModalProps> = ({ open, onClose, defaultDate }) => {
  // ✅ Hook appelé ICI, dans le corps du composant
  const { folders, addTimelineEntry } = useChatStore();

  const [title, setTitle]               = useState('');
  const [type, setType]                 = useState('EVENT');
  const [description, setDescription]   = useState('');
  const [folderId, setFolderId]         = useState('');
  const [date, setDate]                 = useState(
    defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [showInCalendar, setShowInCalendar] = useState(true);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const reset = () => {
    setTitle(''); setType('EVENT'); setDescription('');
    setFolderId(''); setDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setShowInCalendar(true); setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!title.trim()) return setError('Le titre est requis.');
    if (!folderId)     return setError('Veuillez sélectionner un dossier.');
    if (!date)         return setError('La date est requise.');

    setLoading(true);
    setError('');

    try {
      await addTimelineEntry(folderId, {
        title:         title.trim(),
        type:          type.toLowerCase() as any,
        description:   description.trim(),
        date:          new Date(date).getTime(),
        showInCalendar,
      });

      handleClose();
    } catch (e: any) {
      setError(e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="w-5 h-5 text-primary" />
            Nouveau rendez-vous / événement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Dossier */}
          <div className="space-y-1.5">
            <Label htmlFor="folder" className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> Dossier <span className="text-red-500">*</span>
            </Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="folder" className="w-full">
                <SelectValue placeholder="Sélectionner un dossier…" />
              </SelectTrigger>
              <SelectContent>
                {folders.map(f => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: f.color || '#3b82f6' }}
                      />
                      {f.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="Ex: Audience de plaidoirie…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Type + Date en ligne */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                          {t.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date & heure <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Notes, détails de l'événement…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Afficher dans l'agenda */}
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-muted/30">
            <div>
              <p className="text-sm font-medium">Afficher dans l'agenda</p>
              <p className="text-xs text-muted-foreground">Visible sur la vue calendrier</p>
            </div>
            <Switch checked={showInCalendar} onCheckedChange={setShowInCalendar} />
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création…
              </span>
            ) : (
              "Créer l'événement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewEventModal;