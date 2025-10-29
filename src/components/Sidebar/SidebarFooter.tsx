
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import KnowledgeBaseDialog from "../Knowledge/KnowledgeBaseDialog";

const SidebarFooter = () => {
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-3">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal hover:text-white [&>svg]:hover:text-white"
        onClick={() => setKnowledgeBaseOpen(true)}
      >
        <Database className="mr-2 h-4 w-4" />
        Base de connaissances
      </Button>

      <KnowledgeBaseDialog open={knowledgeBaseOpen} onOpenChange={setKnowledgeBaseOpen} />
    </div>
  );
};

export default SidebarFooter;
