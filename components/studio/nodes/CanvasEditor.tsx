import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  Connection,
  Panel,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ImageInputNode } from './ImageInputNode';
import { ProcessingNode } from './ProcessingNode';
import { OutputNode } from './OutputNode';
import { Play, Plus, Trash2, Save, Wand2 } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { checkStatus, getResult } from '../../../lib/fal';

const nodeTypes = {
  imageInput: ImageInputNode,
  processing: ProcessingNode,
  output: OutputNode,
};

export const CanvasEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Helper to update node data from within the node
  const onDataChange = useCallback((id: string, newData: any) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    }));
  }, [setNodes]);

  // Initial setup
  useEffect(() => {
    const initialNodes: Node[] = [
      { 
        id: 'node_1', 
        type: 'imageInput', 
        position: { x: 100, y: 150 }, 
        data: { label: 'Input Image', status: 'idle', onDataChange } 
      },
      { 
        id: 'node_2', 
        type: 'processing', 
        position: { x: 450, y: 150 }, 
        data: { label: 'FAL Image-to-Video', status: 'idle', onDataChange, promptSuffix: 'Cinematic' } 
      },
      { 
        id: 'node_3', 
        type: 'output', 
        position: { x: 800, y: 150 }, 
        data: { label: 'Final Video', status: 'idle', result: null } 
      },
    ];

    const initialEdges: Edge[] = [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: false },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: false },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const addNode = (type: string) => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type,
      position: { x: 400, y: 300 },
      data: { label: `New ${type}`, status: 'idle', onDataChange },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const pollCanvasNode = async (requestId: string, processorId: string, outputId: string) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 60) {
          clearInterval(interval);
          reject(new Error("Timeout"));
        }

        try {
          const status = await checkStatus(requestId);
          if (status.status === 'COMPLETED') {
            clearInterval(interval);
            const finalResult = await getResult(requestId);
            const videoUrl = (finalResult.data as any).video.url;
            
            setNodes(nds => nds.map(n => {
              if (n.id === processorId) return { ...n, data: { ...n.data, status: 'completed' } };
              if (n.id === outputId) return { ...n, data: { ...n.data, status: 'completed', result: videoUrl } };
              return n;
            }));
            resolve(videoUrl);
          } else if (status.status === 'FAILED') {
            clearInterval(interval);
            reject(new Error("FAL Job Failed"));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 5000);
    });
  };

  const executeNode = async (node: Node, supabase: any, nodeResults: Map<string, any>) => {
    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'processing' } } : n));
    
    try {
      if (node.type === 'imageInput') {
        if (!node.data.url) throw new Error("Image input missing");
        nodeResults.set(node.id, node.data.url);
      } 
      
      else if (node.type === 'processing') {
        // Find input from incoming edges
        const incomingEdges = edges.filter(e => e.target === node.id);
        const sourceNodeId = incomingEdges[0]?.source;
        const inputUrl = nodeResults.get(sourceNodeId);

        if (!inputUrl) throw new Error("No input data for processor");

        if (supabase) {
          const { data, error } = await supabase.functions.invoke('generate-video', {
            body: {
              imageUrl: inputUrl,
              prompt: node.data.promptSuffix,
              motionStyle: 'smooth-pan'
            }
          });
          if (error) throw error;
          
          if (data.request_id) {
            // Find output node connected to this processor
            const outgoingEdges = edges.filter(e => e.source === node.id);
            const outputNodeId = outgoingEdges[0]?.target;
            
            const videoUrl = await pollCanvasNode(data.request_id, node.id, outputNodeId || "");
            nodeResults.set(node.id, videoUrl);
          }
        }
      }

      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'completed' } } : n));
    } catch (err) {
      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'error' } } : n));
      throw err;
    }
  };

  const runGraph = async () => {
    setIsRunning(true);
    const supabase = createClient();
    const nodeResults = new Map<string, any>();

    try {
      // 1. Simple Topological Sort (Kahn's Algorithm simplified for Small Graphs)
      const sortedNodes: Node[] = [];
      const visited = new Set<string>();
      
      const visit = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        // Visit incoming nodes first
        const incoming = edges.filter(e => e.target === nodeId).map(e => e.source);
        incoming.forEach(visit);
        
        visited.add(nodeId);
        sortedNodes.push(node);
      };

      // Start visiting from outputs
      const outputs = nodes.filter(n => n.type === 'output');
      outputs.forEach(o => visit(o.id));

      // 2. Execute in order
      for (const node of sortedNodes) {
        await executeNode(node, supabase, nodeResults);
      }

    } catch (err: any) {
      console.error("Graph execution failed", err);
      alert("Error: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full w-full bg-zinc-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#e5e7eb" gap={24} size={1} />
        <Controls />
        <MiniMap 
          style={{ height: 120 }} 
          zoomable 
          pannable 
          maskColor="rgba(244, 244, 245, 0.7)"
          className="border border-zinc-200 rounded-xl overflow-hidden shadow-lg"
        />
        
        <Panel position="top-right" className="flex gap-2">
           <button 
             onClick={runGraph}
             disabled={isRunning}
             className={`
               flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-xl transition-all
               ${isRunning 
                ? 'bg-zinc-100 text-zinc-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-200'}
             `}
           >
             <Wand2 size={16} /> {isRunning ? 'Executing...' : 'Run Workflow'}
           </button>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm">
             <Save size={16} /> Save Graph
           </button>
        </Panel>

        <Panel position="left" className="bg-white/90 backdrop-blur-md border border-zinc-200 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 ml-4 mt-4">
           <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 py-1.5 border-b border-zinc-100 mb-1">
             Components
           </div>
           <button onClick={() => addNode('imageInput')} className="p-3 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors flex items-center gap-3 group">
             <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
               <Plus size={16} />
             </div>
             <span className="text-xs font-bold uppercase tracking-tight">Source Image</span>
           </button>
           <button onClick={() => addNode('processing')} className="p-3 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors flex items-center gap-3 group">
             <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
               <Plus size={16} />
             </div>
             <span className="text-xs font-bold uppercase tracking-tight">AI Processor</span>
           </button>
           <button onClick={() => addNode('output')} className="p-3 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors flex items-center gap-3 group">
             <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
               <Plus size={16} />
             </div>
             <span className="text-xs font-bold uppercase tracking-tight">Final Video</span>
           </button>
           <div className="border-t border-zinc-100 my-1.5"></div>
           <button 
             onClick={() => window.location.reload()}
             className="p-3 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-3"
           >
             <Trash2 size={16} /> <span className="text-xs font-bold uppercase tracking-tight">Reset Editor</span>
           </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
