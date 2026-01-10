import React, { useState } from 'react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import { WorkflowCanvas } from '../studio/workflow/WorkflowCanvas';
import { Node, Edge } from '@xyflow/react';

export const WorkflowPage: React.FC = () => {
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

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
    <div className="h-screen flex bg-white dark:bg-[#09090b]">
      {/* Navigation Rail */}
      <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />

      {/* Flyout Panels */}
      <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

      {/* Main Content - Workflow Canvas (Full Height) */}
      <div className="flex-1 overflow-hidden ml-[72px]">
        <WorkflowCanvas
          onSave={handleSaveWorkflow}
          onExecute={handleExecuteWorkflow}
        />
      </div>
    </div>
  );
};
