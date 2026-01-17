// Batch Processing Utilities for Video Generation

export interface BatchJob<T = any> {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: T;
  output?: any;
  error?: string;
  progress?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface BatchProcessorOptions {
  concurrency?: number; // Number of parallel jobs
  retryCount?: number; // Number of retries on failure
  retryDelay?: number; // Delay between retries in ms
  onJobStart?: (jobId: string) => void;
  onJobComplete?: (jobId: string, result: any) => void;
  onJobError?: (jobId: string, error: Error) => void;
  onProgress?: (completed: number, total: number, currentJob?: string) => void;
}

export interface BatchResult<T = any> {
  successful: T[];
  failed: { jobId: string; error: string }[];
  totalTime: number;
}

/**
 * Process a batch of items with configurable concurrency
 */
export async function processBatch<TInput, TOutput>(
  items: TInput[],
  processor: (item: TInput, index: number) => Promise<TOutput>,
  options: BatchProcessorOptions = {}
): Promise<BatchResult<TOutput>> {
  const {
    concurrency = 3,
    retryCount = 1,
    retryDelay = 1000,
    onJobStart,
    onJobComplete,
    onJobError,
    onProgress,
  } = options;

  const startTime = Date.now();
  const results: TOutput[] = [];
  const errors: { jobId: string; error: string }[] = [];
  let completedCount = 0;

  // Create job queue
  const jobs: BatchJob<TInput>[] = items.map((item, index) => ({
    id: `job_${index}`,
    status: 'pending',
    input: item,
  }));

  // Process with concurrency limit
  const processJob = async (job: BatchJob<TInput>, index: number): Promise<void> => {
    job.status = 'processing';
    job.startedAt = new Date();
    onJobStart?.(job.id);

    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts <= retryCount) {
      try {
        const result = await processor(job.input, index);
        job.output = result;
        job.status = 'completed';
        job.completedAt = new Date();
        results.push(result);
        onJobComplete?.(job.id, result);
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;

        if (attempts <= retryCount) {
          await delay(retryDelay * attempts); // Exponential backoff
        }
      }
    }

    if (job.status !== 'completed') {
      job.status = 'failed';
      job.error = lastError?.message || 'Unknown error';
      job.completedAt = new Date();
      errors.push({ jobId: job.id, error: job.error });
      onJobError?.(job.id, lastError || new Error('Unknown error'));
    }

    completedCount++;
    onProgress?.(completedCount, items.length, job.id);
  };

  // Process in chunks based on concurrency
  for (let i = 0; i < jobs.length; i += concurrency) {
    const chunk = jobs.slice(i, i + concurrency);
    await Promise.all(chunk.map((job, idx) => processJob(job, i + idx)));
  }

  return {
    successful: results,
    failed: errors,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Create a batch processor with state management
 */
export function createBatchProcessor<TInput, TOutput>(
  processor: (item: TInput, index: number) => Promise<TOutput>,
  options: BatchProcessorOptions = {}
) {
  let jobs: BatchJob<TInput>[] = [];
  let isRunning = false;
  let isPaused = false;

  return {
    /**
     * Add items to the queue
     */
    addItems(items: TInput[]): void {
      const newJobs: BatchJob<TInput>[] = items.map((item, index) => ({
        id: `job_${Date.now()}_${jobs.length + index}`,
        status: 'pending',
        input: item,
      }));
      jobs = [...jobs, ...newJobs];
    },

    /**
     * Start processing the queue
     */
    async start(): Promise<BatchResult<TOutput>> {
      if (isRunning) {
        throw new Error('Batch processor is already running');
      }

      isRunning = true;
      isPaused = false;

      const pendingJobs = jobs.filter(j => j.status === 'pending');
      const result = await processBatch(
        pendingJobs.map(j => j.input),
        processor,
        {
          ...options,
          onJobStart: (jobId) => {
            const job = jobs.find(j => j.id === jobId);
            if (job) job.status = 'processing';
            options.onJobStart?.(jobId);
          },
          onJobComplete: (jobId, result) => {
            const job = jobs.find(j => j.id === jobId);
            if (job) {
              job.status = 'completed';
              job.output = result;
            }
            options.onJobComplete?.(jobId, result);
          },
          onJobError: (jobId, error) => {
            const job = jobs.find(j => j.id === jobId);
            if (job) {
              job.status = 'failed';
              job.error = error.message;
            }
            options.onJobError?.(jobId, error);
          },
        }
      );

      isRunning = false;
      return result;
    },

    /**
     * Pause processing
     */
    pause(): void {
      isPaused = true;
    },

    /**
     * Resume processing
     */
    resume(): void {
      isPaused = false;
    },

    /**
     * Get current status
     */
    getStatus() {
      return {
        isRunning,
        isPaused,
        pending: jobs.filter(j => j.status === 'pending').length,
        processing: jobs.filter(j => j.status === 'processing').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
        total: jobs.length,
      };
    },

    /**
     * Get all jobs
     */
    getJobs(): BatchJob<TInput>[] {
      return [...jobs];
    },

    /**
     * Clear completed jobs
     */
    clearCompleted(): void {
      jobs = jobs.filter(j => j.status !== 'completed');
    },

    /**
     * Reset all jobs to pending
     */
    reset(): void {
      jobs = jobs.map(j => ({ ...j, status: 'pending' as const, output: undefined, error: undefined }));
    },
  };
}

/**
 * Utility: Delay for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate videos for multiple scenes in batch
 */
export interface SceneVideoInput {
  sceneId: string;
  imageUrl: string;
  prompt: string;
  motionStyle: string;
  duration: number;
}

export interface SceneVideoOutput {
  sceneId: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export async function batchGenerateSceneVideos(
  scenes: SceneVideoInput[],
  generateFn: (input: SceneVideoInput) => Promise<SceneVideoOutput>,
  options: BatchProcessorOptions = {}
): Promise<BatchResult<SceneVideoOutput>> {
  return processBatch(scenes, generateFn, {
    concurrency: 2, // Limit to 2 concurrent video generations
    retryCount: 2,
    retryDelay: 2000,
    ...options,
  });
}

/**
 * Generate images for multiple scenes in batch
 */
export interface SceneImageInput {
  sceneId: string;
  prompt: string;
  style?: string;
}

export interface SceneImageOutput {
  sceneId: string;
  imageUrl: string;
}

export async function batchGenerateSceneImages(
  scenes: SceneImageInput[],
  generateFn: (input: SceneImageInput) => Promise<SceneImageOutput>,
  options: BatchProcessorOptions = {}
): Promise<BatchResult<SceneImageOutput>> {
  return processBatch(scenes, generateFn, {
    concurrency: 5, // Can do more concurrent image generations
    retryCount: 2,
    retryDelay: 1000,
    ...options,
  });
}

/**
 * Queue-based batch processor with persistent state
 */
export class BatchQueue<T = any> {
  private queue: BatchJob<T>[] = [];
  private processing: Map<string, BatchJob<T>> = new Map();
  private concurrency: number;
  private processor: (item: T) => Promise<any>;
  private onUpdate?: (queue: BatchJob<T>[]) => void;

  constructor(
    processor: (item: T) => Promise<any>,
    options: { concurrency?: number; onUpdate?: (queue: BatchJob<T>[]) => void } = {}
  ) {
    this.processor = processor;
    this.concurrency = options.concurrency || 3;
    this.onUpdate = options.onUpdate;
  }

  add(items: T[]): string[] {
    const ids = items.map((item, i) => {
      const id = `batch_${Date.now()}_${i}`;
      this.queue.push({
        id,
        status: 'pending',
        input: item,
      });
      return id;
    });
    this.notifyUpdate();
    this.processNext();
    return ids;
  }

  private async processNext(): Promise<void> {
    if (this.processing.size >= this.concurrency) return;

    const pendingJob = this.queue.find(j => j.status === 'pending');
    if (!pendingJob) return;

    pendingJob.status = 'processing';
    pendingJob.startedAt = new Date();
    this.processing.set(pendingJob.id, pendingJob);
    this.notifyUpdate();

    try {
      const result = await this.processor(pendingJob.input);
      pendingJob.status = 'completed';
      pendingJob.output = result;
      pendingJob.completedAt = new Date();
    } catch (error) {
      pendingJob.status = 'failed';
      pendingJob.error = error instanceof Error ? error.message : String(error);
      pendingJob.completedAt = new Date();
    }

    this.processing.delete(pendingJob.id);
    this.notifyUpdate();
    this.processNext();
  }

  private notifyUpdate(): void {
    this.onUpdate?.(this.getAll());
  }

  getAll(): BatchJob<T>[] {
    return [...this.queue];
  }

  getStatus() {
    return {
      pending: this.queue.filter(j => j.status === 'pending').length,
      processing: this.processing.size,
      completed: this.queue.filter(j => j.status === 'completed').length,
      failed: this.queue.filter(j => j.status === 'failed').length,
      total: this.queue.length,
    };
  }

  clear(): void {
    this.queue = [];
    this.processing.clear();
    this.notifyUpdate();
  }
}
