import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useChatStore } from '@/store/chatStore';
import { TimelineEntry } from '@/store/types';
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  MapPin,
  Users,
  Bell,
  Video,
  Phone,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gavel,
  AlertCircle,
  Folder as FolderIcon
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import NewEventModal from '@/components/calendar/NewEventModal';

// Interface étendue pour les événements avec info du dossier
interface CalendarEvent extends TimelineEntry {
  folderName: string;
  folderColor: string;
}



const CalendarSection: React.FC = () => {
  const { folders } = useChatStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
const [showNewEventModal, setShowNewEventModal] = useState(false);

  // 🆕 Extraire tous les événements timeline de tous les dossiers
  const allEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    folders.forEach(folder => {
      if (folder.timeline && folder.timeline.length > 0) {
        folder.timeline.forEach(entry => {
          // ✅ Exclure les entrées masquées de l'agenda
          if (entry.showInCalendar === false) return;
          events.push({
            ...entry,
            folderName: folder.name,
            folderColor: folder.color || '#3b82f6'
          });
        });
      }
    });
    
    // Trier par date
    return events.sort((a, b) => a.date - b.date);
  }, [folders]);

  const getEventTypeIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'fact':
        return <FileText className="w-4 h-4" />;
      case 'procedure':
        return <Gavel className="w-4 h-4" />;
      case 'hearing':
        return <Briefcase className="w-4 h-4" />;
      case 'deadline':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'fact':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'procedure':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'hearing':
        return 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30';
      case 'deadline':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
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

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm', { locale: fr });
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return allEvents.filter(event => isSameDay(new Date(event.date), date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Agenda & Planning</h1>
          <p className="text-muted-foreground">Gérez vos audiences, rendez-vous et échéances</p>
        </div>
        
        <div className="flex items-center gap-3 mr-24">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 mr-24"
            onClick={() => setShowNewEventModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau RDV
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-auto">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border h-full">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handlePreviousMonth} className="h-8 w-8">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}>
                    Aujourd'hui
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={fr}
                className="w-full pointer-events-auto"
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-4",
                  caption: "hidden",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground rounded-md w-full font-medium text-sm py-2",
                  row: "flex w-full mt-1",
                  cell: "relative w-full p-0 text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 rounded-lg",
                  day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-lg transition-colors",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground font-semibold",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dayEvents = getEventsForDate(date);
                    const hasEvents = dayEvents.length > 0;
                    return (
                      <div className="flex flex-col items-center justify-center h-full w-full py-1">
                        <span className="text-sm">{format(date, 'd')}</span>
                        {hasEvents && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((event, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: event.folderColor }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with events */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card className="bg-card border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 max-h-[600px] overflow-y-auto">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="rounded-lg p-4 border hover:bg-muted/50 transition cursor-pointer"
                    style={{ borderLeftWidth: '4px', borderLeftColor: event.folderColor }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.type)}
                        <span className="font-medium text-sm">{event.title}</span>
                      </div>
                      <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                        {getTypeLabel(event.type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <FolderIcon className="w-3 h-3" />
                        <span className="font-medium" style={{ color: event.folderColor }}>
                          {event.folderName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(event.date), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    </div>
                    
                    {event.description && (
                      <div 
                        className="text-xs text-muted-foreground mt-2 prose prose-sm max-w-none line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun événement ce jour</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


      <NewEventModal
  open={showNewEventModal}
  onClose={() => setShowNewEventModal(false)}
  defaultDate={selectedDate}
/>

    </div>
    
  );
};

export default CalendarSection;