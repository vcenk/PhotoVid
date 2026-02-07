import React, { useState } from 'react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { WorkflowCanvas } from '../studio/workflow/WorkflowCanvas';
import { Node, Edge } from '@xyflow/react';

export const WorkflowPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSaveWorkflow = (nodes: Node[], edges: Edge[]) => {
    console.log('Saving workflow:', { nodes, edges });
    // TODO: Implement save to database/storage
    alert('Workflow saved! (This is a placeholder)');
  };

  const handleExecuteWorkflow = async (nodes: Node[], edges: Edge[]) => {
    console.log('Executing workflow:', { nodes, edges });
    // TODO: Implement workflow execution engine
    alert('Workflow execution started! (This is a placeholder)');
  };

  return (
    <div className="h-screen flex bg-white dark:bg-[#09090b] font-[Space_Grotesk]">
      {/* Navigation Rail */}
      <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Flyout Panels */}
{/* Main Content - Workflow Canvas (Full Height) */}
      <div className="flex-1 overflow-hidden ml-0 lg:ml-16">
        <WorkflowCanvas
          onSave={handleSaveWorkflow}
          onExecute={handleExecuteWorkflow}
        />
      </div>
    </div>
  );
};
