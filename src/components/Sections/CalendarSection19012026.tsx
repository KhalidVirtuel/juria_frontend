import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
  ChevronRight
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock data for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Audience Tribunal de Commerce',
    type: 'hearing',
    date: new Date(),
    duration: 120,
    location: 'Tribunal de Commerce de Casablanca',
    client: 'SAS TechnoServices',
    description: 'Audience de référé - Demande de provision',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Rendez-vous client - M. Benali',
    type: 'meeting',
    date: new Date(),
    duration: 60,
    location: 'Bureau',
    client: 'Ahmed Benali',
    description: 'Consultation divorce - Premier entretien',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Conférence téléphonique',
    type: 'call',
    date: new Date(Date.now() + 86400000),
    duration: 30,
    location: 'Visioconférence',
    client: 'Cabinet Associé Rabat',
    description: 'Coordination dossier inter-barreaux',
    priority: 'low'
  },
  {
    id: '4',
    title: 'Dépôt conclusions',
    type: 'deadline',
    date: new Date(Date.now() + 86400000 * 3),
    duration: 0,
    location: 'Tribunal Administratif',
    client: 'Société Immobilière Atlas',
    description: 'Date limite dépôt conclusions en réplique',
    priority: 'high'
  },
  {
    id: '5',
    title: 'Médiation commerciale',
    type: 'meeting',
    date: new Date(Date.now() + 86400000 * 5),
    duration: 180,
    location: 'Centre de médiation',
    client: 'SARL Distribution Maroc',
    description: 'Séance de médiation - Litige commercial',
    priority: 'medium'
  }
];

const CalendarSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'hearing':
        return <Briefcase className="w-4 h-4" />;
      case 'meeting':
        return <Users className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'deadline':
        return <Bell className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hearing':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'meeting':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'call':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'video':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'deadline':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-border';
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: fr });
  };

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => isSameDay(event.date, date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  // Get dates with events for the current month
  const datesWithEvents = mockEvents.map(event => event.date);

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
        
        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-lg p-1 border border-border">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
              >
                {mode === 'day' && 'Jour'}
                {mode === 'week' && 'Semaine'}
                {mode === 'month' && 'Mois'}
              </Button>
            ))}
          </div>
          
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                                className={`w-1.5 h-1.5 rounded-full ${
                                  event.priority === 'high' ? 'bg-destructive' :
                                  event.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                                }`}
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
            <CardContent className="space-y-3 pt-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div key={event.id} className={`rounded-lg p-4 border border-border border-l-4 hover:bg-muted/50 transition cursor-pointer ${getPriorityColor(event.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.type)}
                        <span className="font-medium text-sm">{event.title}</span>
                      </div>
                      <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                        {formatTime(event.date)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.client}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                      {event.duration > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.duration} min
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun événement ce jour</p>
                  <Button variant="link" size="sm" className="mt-2 text-primary">
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter un événement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-card border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Prochains événements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {mockEvents
                .filter(event => event.date >= new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 4)
                .map((event) => (
                  <div 
                    key={event.id} 
                    className="rounded-lg p-3 border border-border hover:bg-muted/50 transition cursor-pointer"
                    onClick={() => setSelectedDate(event.date)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded ${getEventTypeColor(event.type)}`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate">{event.title}</span>
                        <span className="text-xs text-muted-foreground">{event.client}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {format(event.date, 'EEE d MMM', { locale: fr })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.date)}
                      </span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <Button variant="outline" className="w-full justify-start border-border hover:bg-muted">
                <Users className="w-4 h-4 mr-2" />
                Nouveau rendez-vous client
              </Button>
              <Button variant="outline" className="w-full justify-start border-border hover:bg-muted">
                <Briefcase className="w-4 h-4 mr-2" />
                Planifier une audience
              </Button>
              <Button variant="outline" className="w-full justify-start border-border hover:bg-muted">
                <Bell className="w-4 h-4 mr-2" />
                Définir un rappel
              </Button>
              <Button variant="outline" className="w-full justify-start border-border hover:bg-muted">
                <Video className="w-4 h-4 mr-2" />
                Planifier une visio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;