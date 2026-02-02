import { Node, Edge } from '@xyflow/react';
import { createClient } from "@/lib/database/client";

/**
 * Workflow Execution Engine (Secure)
 * All FAL API calls go through Supabase Edge Functions
 * NEVER exposes API keys to the browser
 */

// Get authentication token
async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Secure FAL API call via Edge Function
async function secureFalCall(params: {
  tool: string;
  imageUrl?: string;
  prompt?: string;
  options?: Record<string, any>;
}): Promise<any> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.functions.invoke('fal-generate', {
    body: params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    throw new Error(error.message || 'FAL API call failed');
  }

  // If we got immediate result
  if (data?.data) {
    return data.data;
  }

  // Otherwise poll for result
  const requestId = data?.requestId;
  if (!requestId) {
    return data;
  }

  // Poll for completion
  for (let i = 0; i < 120; i++) { // 6 minutes max
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: statusData, error: statusError } = await supabase.functions.invoke('fal-status', {
      body: {
        requestId,
        model: params.options?.model_endpoint || 'fal-ai/flux/dev',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (statusError) {
      throw new Error(statusError.message || 'Status check failed');
    }

    if (statusData.status === 'COMPLETED') {
      return statusData.data;
    }

    if (statusData.status === 'FAILED') {
      throw new Error('FAL generation failed');
    }
  }

  throw new Error('FAL generation timed out');
}

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

// ===== FAL AI Integration Functions (Secure via Edge Functions) =====

async function executeTextToImage(
  prompt: string,
  parameters: any
): Promise<{ image: string }> {
  console.log('Executing Text-to-Image:', { prompt, parameters });

  // Map width/height to image_size enum if possible, or fallback to default
  let imageSize = "landscape_16_9";
  const width = parseInt(parameters.width || "1024");
  const height = parseInt(parameters.height || "1024");

  if (width === height) imageSize = "square_hd";
  else if (width > height) imageSize = "landscape_16_9";
  else imageSize = "portrait_16_9";

  // Map model ID to endpoint
  const modelMap: Record<string, string> = {
    'flux-dev': 'fal-ai/flux/dev',
    'flux-pro': 'fal-ai/flux-pro',
    'flux-schnell': 'fal-ai/flux/schnell'
  };
  const modelEndpoint = modelMap[parameters.model] || 'fal-ai/flux/dev';

  try {
    const result = await secureFalCall({
      tool: 'text-to-image',
      prompt: prompt,
      options: {
        image_size: imageSize,
        num_inference_steps: parameters.steps || 28,
        guidance_scale: 3.5,
        num_images: 1,
        seed: parameters.seed,
        negative_prompt: parameters.negative_prompt,
        enable_safety_checker: true,
        model_endpoint: modelEndpoint,
      },
    });

    return {
      image: result?.images?.[0]?.url
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
    const result = await secureFalCall({
      tool: 'image-to-video',
      imageUrl: imageUrl,
      prompt: motionPrompt || "Cinematic motion, high quality, 4k",
      options: {
        duration: parameters.duration || "5",
        aspect_ratio: parameters.aspect_ratio || "16:9",
        negative_prompt: parameters.negative_prompt,
        model_endpoint: 'fal-ai/kling-video/v1.5/pro/image-to-video',
      },
    });

    return {
      video: result?.video?.url
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

    const options: any = {
      scale: parseInt(parameters.scale || '2'),
      model_endpoint: model,
    };

    // Add creativity parameter for creative upscaler
    if (parameters.model === 'creative-upscaler') {
      options.creativity = parseFloat(parameters.creativity || '5') / 10;
    }

    const result = await secureFalCall({
      tool: 'photo-enhancement',
      imageUrl: imageUrl,
      options,
    });

    return {
      image: result?.image?.url
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
    const result = await secureFalCall({
      tool: 'virtual-renovation',
      imageUrl: imageUrl,
      prompt: parameters.inpaint_prompt || prompt,
      options: {
        strength: parameters.strength || 0.8,
        guidance_scale: parameters.guidance_scale || 7.5,
        num_inference_steps: 28,
        negative_prompt: parameters.negative_prompt,
        model_endpoint: 'fal-ai/flux/dev/inpainting',
      },
    });

    return {
      image: result?.image?.url || result?.images?.[0]?.url
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

    const options: any = {
      audio_url: audioUrl,
      model_endpoint: model,
    };

    // Use video OR image
    if (videoUrl) {
      options.video_url = videoUrl;
    }

    const result = await secureFalCall({
      tool: 'lipsync',
      imageUrl: imageUrl || undefined,
      options,
    });

    return {
      video: result?.video?.url
    };
  } catch (error) {
    console.error('Lipsync failed:', error);
    throw error;
  }
}
