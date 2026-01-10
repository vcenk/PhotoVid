import { Node, Edge } from '@xyflow/react';
import { fal } from "@fal-ai/client";

// Configure FAL client
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

// Topological sort to determine execution order
export function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph
  edges.forEach(edge => {
    adjacencyList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Kahn's algorithm
  const queue: string[] = [];
  const result: Node[] = [];

  // Start with nodes that have no dependencies
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      result.push(node);
    }

    adjacencyList.get(nodeId)?.forEach(neighborId => {
      const degree = inDegree.get(neighborId)! - 1;
      inDegree.set(neighborId, degree);
      if (degree === 0) {
        queue.push(neighborId);
      }
    });
  }

  // Check for cycles
  if (result.length !== nodes.length) {
    throw new Error('Workflow contains cycles! Cannot execute.');
  }

  return result;
}

// Get inputs for a node from connected edges
export function getNodeInputs(
  nodeId: string,
  edges: Edge[],
  executedNodes: Map<string, any>
): Record<string, any> {
  const inputs: Record<string, any> = {};

  // Find all edges that connect TO this node
  const incomingEdges = edges.filter(edge => edge.target === nodeId);

  incomingEdges.forEach(edge => {
    const sourceNode = executedNodes.get(edge.source);
    if (sourceNode && sourceNode.output) {
      // Get the output from source node's handle
      const outputValue = sourceNode.output[edge.sourceHandle || 'output'];
      // Store it in the target handle name
      inputs[edge.targetHandle || 'input'] = outputValue;
    }
  });

  return inputs;
}

// Execute a single node
export async function executeNode(
  node: Node,
  inputs: Record<string, any>,
  onStatusUpdate: (nodeId: string, status: string, output?: any, error?: string) => void
): Promise<any> {
  try {
    onStatusUpdate(node.id, 'running');

    const nodeType = node.type;
    const parameters = node.data.parameters || {};

    let output: any = {};

    // Execute based on node type
    switch (nodeType) {
      case 'input-prompt':
        // Prompt input just passes through the text
        output = {
          prompt: parameters.text || ''
        };
        break;

      case 'input-image':
        // Image input passes through the image URL
        output = {
          image: parameters.imageUrl || null
        };
        break;

      case 'input-video':
        // Video input passes through the video URL
        output = {
          video: parameters.videoUrl || null
        };
        break;

      case 'input-audio':
        // Audio input passes through the audio URL
        output = {
          audio: parameters.audioUrl || null
        };
        break;

      case 'gen-text-to-image':
        // Text-to-Image generation
        if (!inputs.prompt) {
          throw new Error('Prompt is required for text-to-image generation');
        }
        output = await executeTextToImage(inputs.prompt, parameters);
        break;

      case 'gen-image-to-video':
        // Image-to-Video generation
        if (!inputs.image) {
          throw new Error('Image is required for image-to-video generation');
        }
        output = await executeImageToVideo(inputs.image, inputs.prompt || '', parameters);
        break;

      case 'gen-upscale':
        // Image upscaling
        if (!inputs.image) {
          throw new Error('Image is required for upscaling');
        }
        output = await executeUpscale(inputs.image, parameters);
        break;

      case 'gen-inpaint':
        // Image inpainting
        if (!inputs.image) {
          throw new Error('Image is required for inpainting');
        }
        output = await executeInpaint(inputs.image, inputs.prompt || '', parameters);
        break;

      case 'gen-lipsync':
        // Lipsync generation
        if (!inputs.audio) {
          throw new Error('Audio is required for lipsync');
        }
        if (!inputs.image && !inputs.video) {
          throw new Error('Image or video is required for lipsync');
        }
        output = await executeLipsync(inputs.image, inputs.video, inputs.audio, parameters);
        break;

      case 'output-preview':
        // Preview node just collects inputs
        output = inputs;
        break;

      default:
        console.warn(`Unknown node type: ${nodeType}`);
        output = inputs; // Pass through
    }

    onStatusUpdate(node.id, 'completed', output);
    return output;

  } catch (error: any) {
    console.error(`Error executing node ${node.id}:`, error);
    onStatusUpdate(node.id, 'error', undefined, error.message);
    throw error;
  }
}

// Execute entire workflow
export async function executeWorkflow(
  nodes: Node[],
  edges: Edge[],
  onNodeUpdate: (nodeId: string, status: string, output?: any, error?: string) => void
): Promise<Map<string, any>> {
  try {
    // Sort nodes in execution order
    const sortedNodes = topologicalSort(nodes, edges);

    // Track executed nodes and their outputs
    const executedNodes = new Map<string, any>();

    // Execute each node in order
    for (const node of sortedNodes) {
      const inputs = getNodeInputs(node.id, edges, executedNodes);

      const output = await executeNode(node, inputs, onNodeUpdate);

      executedNodes.set(node.id, { node, output });
    }

    return executedNodes;

  } catch (error: any) {
    console.error('Workflow execution failed:', error);
    throw error;
  }
}

// ===== FAL AI Integration Functions =====

async function executeTextToImage(
  prompt: string,
  parameters: any
): Promise<{ image: string }> {
  console.log('Executing Text-to-Image:', { prompt, parameters });

  try {
    const result: any = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        image_size: parameters.size || "landscape_16_9",
        num_inference_steps: parameters.steps || 28,
        num_images: 1,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Text-to-Image queue update:", update);
      },
    });

    return {
      image: result.data?.images?.[0]?.url || result.images?.[0]?.url
    };
  } catch (error) {
    console.error('Text-to-Image generation failed:', error);
    throw error;
  }
}

async function executeImageToVideo(
  imageUrl: string,
  motionPrompt: string,
  parameters: any
): Promise<{ video: string }> {
  console.log('Executing Image-to-Video:', { imageUrl, motionPrompt, parameters });

  try {
    const result: any = await fal.subscribe("fal-ai/kling-video/v1.5/pro/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: motionPrompt || "Cinematic motion, high quality, 4k",
        duration: parameters.duration || "5",
        aspect_ratio: parameters.aspect_ratio || "16:9",
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Image-to-Video queue update:", update);
      },
    });

    return {
      video: result.data?.video?.url || result.video?.url
    };
  } catch (error) {
    console.error('Image-to-Video generation failed:', error);
    throw error;
  }
}

async function executeUpscale(
  imageUrl: string,
  parameters: any
): Promise<{ image: string }> {
  console.log('Executing Upscale:', { imageUrl, parameters });

  try {
    const model = parameters.model === 'creative-upscaler'
      ? 'fal-ai/creative-upscaler'
      : 'fal-ai/clarity-upscaler';

    const input: any = {
      image_url: imageUrl,
      scale: parseInt(parameters.scale || '2'),
    };

    // Add creativity parameter for creative upscaler
    if (parameters.model === 'creative-upscaler') {
      input.creativity = parseFloat(parameters.creativity || '5') / 10; // Convert 0-10 to 0-1
    }

    const result: any = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Upscale queue update:", update);
      },
    });

    return {
      image: result.data?.image?.url || result.image?.url
    };
  } catch (error) {
    console.error('Upscale failed:', error);
    throw error;
  }
}

async function executeInpaint(
  imageUrl: string,
  prompt: string,
  parameters: any
): Promise<{ image: string }> {
  console.log('Executing Inpaint:', { imageUrl, prompt, parameters });

  try {
    const result: any = await fal.subscribe("fal-ai/flux/dev/inpainting", {
      input: {
        image_url: imageUrl,
        prompt: parameters.inpaint_prompt || prompt,
        strength: parameters.strength || 0.8,
        guidance_scale: parameters.guidance_scale || 7.5,
        num_inference_steps: 28,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Inpaint queue update:", update);
      },
    });

    return {
      image: result.data?.image?.url || result.image?.url
    };
  } catch (error) {
    console.error('Inpaint failed:', error);
    throw error;
  }
}

async function executeLipsync(
  imageUrl: string | null,
  videoUrl: string | null,
  audioUrl: string,
  parameters: any
): Promise<{ video: string }> {
  console.log('Executing Lipsync:', { imageUrl, videoUrl, audioUrl, parameters });

  try {
    const model = parameters.model === 'kling-lipsync'
      ? 'fal-ai/kling-video/v1/standard/lipsync'
      : 'fal-ai/sync-labs/2.0';

    const input: any = {
      audio_url: audioUrl,
    };

    // Use video OR image
    if (videoUrl) {
      input.video_url = videoUrl;
    } else if (imageUrl) {
      input.image_url = imageUrl;
    }

    const result: any = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Lipsync queue update:", update);
      },
    });

    return {
      video: result.data?.video?.url || result.video?.url
    };
  } catch (error) {
    console.error('Lipsync failed:', error);
    throw error;
  }
}
