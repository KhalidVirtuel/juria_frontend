// Composant de sélection de template
// À créer dans : src/components/Document/TemplateSelector.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GeneratedDocument } from '@/store/types';
import { documentTemplates, DocumentTemplate, getTemplatesByType } from './documentTemplates';
import { FileText, File, Mail, ClipboardList, BarChart } from 'lucide-react';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: GeneratedDocument['type'];
  onSelectTemplate: (template: DocumentTemplate | null) => void;
}

const getTypeIcon = (type: GeneratedDocument['type']) => {
  switch (type) {
    case 'contract': return <FileText className="w-5 h-5" />;
    case 'conclusion': return <File className="w-5 h-5" />;
    case 'letter': return <Mail className="w-5 h-5" />;
    case 'note': return <ClipboardList className="w-5 h-5" />;
    case 'report': return <BarChart className="w-5 h-5" />;
  }
};

const getTypeLabel = (type: GeneratedDocument['type']) => {
  switch (type) {
    case 'contract': return 'Contrat';
    case 'conclusion': return 'Conclusions';
    case 'letter': return 'Courrier';
    case 'note': return 'Note';
    case 'report': return 'Rapport';
  }
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onOpenChange,
  documentType,
  onSelectTemplate
}) => {
  const templates = getTemplatesByType(documentType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(documentType)}
            Choisir un modèle de {getTypeLabel(documentType).toLowerCase()}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {/* Option : Document vierge */}
            <button
              onClick={() => onSelectTemplate(null)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-mezin hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-mezin group-hover:text-white transition-colors">
                  <File className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Document vierge
                  </h3>
                  <p className="text-sm text-gray-500">
                    Commencer avec un document vide
                  </p>
                </div>
              </div>
            </button>

            {/* Templates disponibles */}
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-mezin hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl group-hover:bg-mezin group-hover:text-white transition-colors">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {template.description}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {getTypeLabel(template.type)}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}

            {templates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun modèle disponible pour ce type de document.</p>
                <p className="text-sm mt-2">Vous pouvez commencer avec un document vierge.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
