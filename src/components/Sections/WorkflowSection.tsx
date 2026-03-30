import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText,
  Scale,
  Users,
  Briefcase,
  Home,
  Car,
  Building2,
  Heart,
  Gavel,
  ClipboardList,
  Clock,
  ArrowLeft,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Compass,
  PenTool,
  Handshake,
  CheckSquare,
  Play,
  Search,
  Filter
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { toast } from 'sonner';
import WorkflowDestinationPicker from '@/components/Workflow/WorkflowDestinationPicker';
import { 
  workflows as centralizedWorkflows, 
  Workflow, 
  taskTypeLabels, 
  TaskType,
  legalContextLabels,
  LegalContext
} from '@/data/workflows';

// Icon map for workflow icons
const iconMap: Record<string, React.ElementType> = {
  Brain,
  ShieldCheck,
  Gavel,
  AlertTriangle,
  Compass,
  PenTool,
  Handshake,
  CheckSquare,
  FileText,
  Heart,
  Building2,
  Briefcase,
  Home,
  Car,
  Users,
  Scale,
  Search,
  Clock,
  ClipboardList
};

// Task type categories for filtering
const taskTypeCategories: { id: TaskType | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tous', icon: Filter },
  { id: 'qualifier', label: 'Qualifier', icon: Brain },
  { id: 'verifier', label: 'Vérifier', icon: ShieldCheck },
  { id: 'analyser', label: 'Analyser', icon: Search },
  { id: 'preparer', label: 'Préparer', icon: ClipboardList },
  { id: 'structurer', label: 'Structurer', icon: Compass },
  { id: 'decider', label: 'Décider', icon: Scale },
];

interface WorkflowSectionProps {
  onNavigateToChat?: () => void;
}

const WorkflowSection: React.FC<WorkflowSectionProps> = ({ onNavigateToChat }) => {
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | 'all'>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { createConversation, setActiveConversationId, activateWorkflow } = useChatStore();

  // Filter workflows based on task type and search
  const filteredWorkflows = centralizedWorkflows.filter(w => {
    const matchesTaskType = selectedTaskType === 'all' || w.taskType === selectedTaskType;
    const matchesSearch = searchQuery === '' || 
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTaskType && matchesSearch;
  });

  const getTaskTypeBadgeColor = (taskType: TaskType) => {
    const colors: Record<TaskType, string> = {
      qualifier: 'bg-purple-100 text-purple-700 border-purple-200',
      verifier: 'bg-green-100 text-green-700 border-green-200',
      analyser: 'bg-blue-100 text-blue-700 border-blue-200',
      preparer: 'bg-orange-100 text-orange-700 border-orange-200',
      structurer: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      decider: 'bg-rose-100 text-rose-700 border-rose-200',
      calculer: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return colors[taskType];
  };

  const handleUseWorkflow = async (isNewConversation: boolean, conversationId?: string, folderId?: string) => {
    if (!selectedWorkflow) return;

    const workflowData = {
      id: selectedWorkflow.id,
      title: selectedWorkflow.title,
      shortTitle: selectedWorkflow.shortTitle,
      icon: selectedWorkflow.icon,
      category: taskTypeLabels[selectedWorkflow.taskType]
    };

    let targetConvId = conversationId;

    if (isNewConversation) {
      targetConvId = await createConversation(folderId || null);
    }

    if (targetConvId) {
      activateWorkflow(targetConvId, workflowData);
      setActiveConversationId(targetConvId);
      toast.success(`Workflow "${selectedWorkflow.shortTitle}" activé`);
      
      if (onNavigateToChat) {
        onNavigateToChat();
      }
    }
  };

  // Workflow Detail View
  if (selectedWorkflow) {
    const IconComponent = iconMap[selectedWorkflow.icon] || Brain;
    
    return (
      <div className="h-full flex flex-col p-6 bg-background">
        {/* Header with back button */}
        <div className="border-b border-border pb-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedWorkflow(null)}
            className="mb-3 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour aux workflows
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{selectedWorkflow.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{selectedWorkflow.description}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <Badge className={getTaskTypeBadgeColor(selectedWorkflow.taskType)}>
                    {taskTypeLabels[selectedWorkflow.taskType]}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ClipboardList className="w-3 h-3" />
                    {selectedWorkflow.steps.length} étapes
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {selectedWorkflow.estimatedTime}
                  </span>
                  {selectedWorkflow.legalContext.map(ctx => (
                    <Badge key={ctx} variant="outline" className="text-xs">
                      {legalContextLabels[ctx]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <WorkflowDestinationPicker
              onSelectNewConversation={(folderId) => handleUseWorkflow(true, undefined, folderId)}
              onSelectExistingConversation={(convId) => handleUseWorkflow(false, convId)}
            >
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <Play className="w-4 h-4 mr-2" />
                Utiliser ce workflow
              </Button>
            </WorkflowDestinationPicker>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {/* Inputs Section */}
            {selectedWorkflow.inputs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Données d'entrée requises
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedWorkflow.inputs.map((input) => (
                    <div 
                      key={input.id}
                      className="p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{input.label}</span>
                        {input.required && (
                          <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                            Requis
                          </Badge>
                        )}
                      </div>
                      {input.placeholder && (
                        <p className="text-xs text-muted-foreground mt-1">{input.placeholder}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps Section */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                Étapes du workflow
              </h2>
              <div className="space-y-3">
                {selectedWorkflow.steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className="flex gap-4 p-4 rounded-lg border border-border bg-white hover:border-primary/30 transition-colors"
                  >
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      {index < selectedWorkflow.steps.length - 1 && (
                        <div className="w-px h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      <p className="text-xs text-primary/80 mt-2 font-medium">
                        → {step.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs Section */}
            {selectedWorkflow.outputs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Résultats attendus
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedWorkflow.outputs.map((output) => (
                    <div 
                      key={output.id}
                      className="p-3 rounded-lg border border-primary/20 bg-primary/5"
                    >
                      <span className="text-sm font-medium text-foreground">{output.label}</span>
                      <p className="text-xs text-muted-foreground mt-1">{output.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Workflow List View
  return (
    <div className="h-full flex flex-col p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-1">Bibliothèque de workflows</h1>
        <p className="text-muted-foreground">Réflexes juridiques professionnels pour avancer concrètement</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un workflow..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Task Type Filter */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {taskTypeCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedTaskType === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTaskType(category.id)}
              className={selectedTaskType === category.id 
                ? "bg-mezin text-white" 
                : "border-border text-mezin hover:bg-muted"
              }
            >
              <CategoryIcon className="w-3.5 h-3.5 mr-1.5" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Workflow Grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            {filteredWorkflows.length} workflow{filteredWorkflows.length > 1 ? 's' : ''} disponible{filteredWorkflows.length > 1 ? 's' : ''}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => {
            const IconComponent = iconMap[workflow.icon] || Brain;
            return (
              <Card 
                key={workflow.id} 
                className="bg-white border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <Badge className={getTaskTypeBadgeColor(workflow.taskType)}>
                      {taskTypeLabels[workflow.taskType]}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors line-clamp-2">
                    {workflow.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {workflow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />
                      {workflow.steps.length} étapes
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {workflow.estimatedTime}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {workflow.legalContext.slice(0, 2).map(ctx => (
                      <Badge key={ctx} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                        {legalContextLabels[ctx]}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun workflow trouvé</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Essayez de modifier vos filtres</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSection;
