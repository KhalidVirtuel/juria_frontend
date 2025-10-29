import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Plus,
  MapPin,
  Users,
  Bell,
  Video,
  Phone,
  Briefcase
} from 'lucide-react';

// Mock data for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Audience Tribunal de Commerce',
    type: 'hearing',
    date: new Date(2024, 11, 28, 9, 0),
    duration: 120,
    location: 'Tribunal de Commerce de Paris',
    client: 'SAS TechnoServices',
    description: 'Audience de référé - Demande de provision',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Rendez-vous client - M. Dupont',
    type: 'meeting',
    date: new Date(2024, 11, 28, 14, 30),
    duration: 60,
    location: 'Bureau',
    client: 'Jean Dupont',
    description: 'Consultation divorce - Premier entretien',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Conférence téléphonique',
    type: 'call',
    date: new Date(2024, 11, 29, 10, 0),
    duration: 30,
    location: 'Visioconférence',
    client: 'Cabinet Associé Lyon',
    description: 'Coordination dossier inter-barreaux',
    priority: 'low'
  }
];

const CalendarSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

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
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hearing':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'meeting':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'call':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'video':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Agenda & Planning</h1>
          <p className="text-muted-foreground">Gérez vos audiences, rendez-vous et échéances</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/10 rounded-xl p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={viewMode === mode ? "premium-button text-white" : "text-muted-foreground hover:text-foreground"}
              >
                {mode === 'day' && 'Jour'}
                {mode === 'week' && 'Semaine'}
                {mode === 'month' && 'Mois'}
              </Button>
            ))}
          </div>
          
          <Button className="premium-button text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau RDV
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card className="glass-card-premium border-white/30 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Semaine du {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Calendar grid would go here - simplified for demo */}
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="text-center py-20 text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Vue calendrier détaillée</p>
                  <p className="text-sm mt-2">Fonctionnalité en développement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with events */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card className="glass-card-premium border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockEvents
                .filter(event => event.date.toDateString() === new Date().toDateString())
                .map((event) => (
                  <div key={event.id} className={`glass-hover rounded-xl p-4 border-l-4 ${getPriorityColor(event.priority)}`}>
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
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.duration} min
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="glass-card-premium border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Prochains RDV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockEvents
                .filter(event => event.date > new Date())
                .slice(0, 3)
                .map((event) => (
                  <div key={event.id} className="glass-hover rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getEventTypeIcon(event.type)}
                      <span className="font-medium text-sm">{event.title}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{event.client}</span>
                      <span>{event.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card-premium border-white/30">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start glass-hover border-white/20">
                <Users className="w-4 h-4 mr-2" />
                Nouveau rendez-vous client
              </Button>
              <Button variant="outline" className="w-full justify-start glass-hover border-white/20">
                <Briefcase className="w-4 h-4 mr-2" />
                Planifier une audience
              </Button>
              <Button variant="outline" className="w-full justify-start glass-hover border-white/20">
                <Bell className="w-4 h-4 mr-2" />
                Définir un rappel
              </Button>
              <Button variant="outline" className="w-full justify-start glass-hover border-white/20">
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