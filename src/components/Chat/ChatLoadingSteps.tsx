import React from 'react';
import { Check, Loader } from 'lucide-react';

export interface LoadingStep {
  id: string;
  icon: React.ReactNode;
  message: string;
  status: 'pending' | 'loading' | 'complete';
  details?: string;
}

interface ChatLoadingStepsProps {
  steps: LoadingStep[];
}

const ChatLoadingSteps: React.FC<ChatLoadingStepsProps> = ({ steps }) => {
  console.log('🎨 Rendering ChatLoadingSteps with', steps.length, 'steps'); // ✅ Debug
  
  return (
    <div className="flex justify-start px-8 mb-4">
      <div className="rounded-2xl p-5 max-w-md w-full">
        <div className="space-y-4">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`flex items-start gap-3 transition-all duration-1000 ${
                step.status === 'pending' ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'complete' ? (
                  <div className="relative">
                    <Check className="w-3 h-3 text-gray-600" />
                    <div className="absolute inset-0 bg-gray-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                ) : step.status === 'loading' ? (
                  <div className="relative">
                    <Loader className="w-3 h-3 text-gray-100 animate-spin" />
                    <div className="absolute inset-0 bg-gray-400 rounded-full animate-pulse opacity-20"></div>
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm  transition-colors ${
                  step.status === 'complete' 
                    ? 'text-gray-500' 
                    : step.status === 'loading'
                    ? 'text-gray-500 animate-pulse'
                    : 'text-gray-400'
                }`}>
                  {step.message}
                </p>
                
                {step.details && step.status !== 'pending' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingSteps;