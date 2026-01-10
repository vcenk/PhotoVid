import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Download, Save, Trash2, Plus, Layout } from 'lucide-react';
import { PromptInputNode } from './nodes/PromptInputNode';
import { ImageInputNode } from './nodes/ImageInputNode';
import { VideoInputNode } from './nodes/VideoInputNode';
import { AudioInputNode } from './nodes/AudioInputNode';
import { TextToImageNode } from './nodes/TextToImageNode';
import { ImageToVideoNode } from './nodes/ImageToVideoNode';
import { LipsyncNode } from './nodes/LipsyncNode';
import { UpscaleNode } from './nodes/UpscaleNode';
import { InpaintNode } from './nodes/InpaintNode';
import { PreviewNode } from './nodes/PreviewNode';
import { NodePalette } from './NodePalette';
import { TemplatePanel } from './TemplatePanel';
import { executeWorkflow } from '../../../lib/workflow/execution-engine';

// Register custom node types
const nodeTypes = {
  'input-prompt': PromptInputNode,
  'input-image': ImageInputNode,
  'input-video': VideoInputNode,
  'input-audio': AudioInputNode,
  'gen-text-to-image': TextToImageNode,
  'gen-image-to-video': ImageToVideoNode,
  'gen-upscale': UpscaleNode,
  'gen-inpaint': InpaintNode,
  'gen-lipsync': LipsyncNode,
  'output-preview': PreviewNode
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onExecute?: (nodes: Node[], edges: Edge[]) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onExecute
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isTemplatesPanelOpen, setIsTemplatesPanelOpen] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const handleAddNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: nodeType,
        parameters: {},
        status: 'idle',
        onChange: (params: any) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === newNode.id
                ? { ...node, data: { ...node.data, parameters: params } }
                : node
            )
          );
        }
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleClearCanvas = useCallback(() => {
    if (confirm('Clear all nodes? This cannot be undone.')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  const handleExecute = useCallback(async () => {
    setIsExecuting(true);

    try {
      // Execute the workflow
      await executeWorkflow(
        nodes,
        edges,
        (nodeId: string, status: string, output?: any, error?: string) => {
          // Update node status in real-time
          setNodes((nds) =>
            nds.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      status,
                      output,
                      error
                    }
                  }
                : node
            )
          );
        }
      );

      // Call the parent onExecute callback if provided
      if (onExecute) {
        await onExecute(nodes, edges);
      }

      console.log('Workflow execution completed successfully!');
    } catch (error: any) {
      console.error('Workflow execution failed:', error);
      alert(`Workflow execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, onExecute, setNodes]);

  const handleLoadTemplate = useCallback((templateNodes: Node[], templateEdges: Edge[]) => {
    setNodes(templateNodes);
    setEdges(templateEdges);
  }, [setNodes, setEdges]);

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#09090b] relative">
      {/* Node Palette Sidebar */}
      {isPaletteOpen && (
        <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-950">
          <NodePalette onAddNode={handleAddNode} />
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zinc-100 dark:bg-zinc-900"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 }
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="bg-zinc-100 dark:bg-zinc-900"
            color="#a1a1aa"
          />
          <Controls
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg"
            showInteractive={false}
          />
          <MiniMap
            nodeClassName="dark:fill-zinc-700"
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl"
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* Top Toolbar */}
          <Panel position="top-left" className="flex items-center gap-2">
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              {isPaletteOpen ? 'Hide' : 'Show'} Nodes
            </button>

            <button
              onClick={() => setIsTemplatesPanelOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white border border-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Layout size={16} />
              Templates
            </button>
          </Panel>

          {/* Right Toolbar */}
          <Panel position="top-right" className="flex items-center gap-2">
            <button
              onClick={handleClearCanvas}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-red-600"
              disabled={nodes.length === 0}
            >
              <Trash2 size={16} />
              Clear
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
              disabled={nodes.length === 0}
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={handleExecute}
              disabled={nodes.length === 0 || isExecuting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Execute
                </>
              )}
            </button>
          </Panel>

          {/* Empty State */}
          {nodes.length === 0 && (
            <Panel position="top-center" className="pointer-events-none">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-xl max-w-md mt-20">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mx-auto mb-4">
                  <Plus size={32} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Start Building Your Workflow
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Drag nodes from the palette on the left and connect them to create your AI workflow
                </p>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Template Panel */}
      <TemplatePanel
        isOpen={isTemplatesPanelOpen}
        onClose={() => setIsTemplatesPanelOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />
    </div>
  );
};
