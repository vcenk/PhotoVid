import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Workflow, Template } from '../../types/studio';
import { uploadToR2 } from '../../api/r2';
import { checkStatus, getResult } from '../../api/fal';
import { createClient } from '../../database/client';
import { useAssets } from './AssetContext';

interface WizardContextType {
  currentStep: number;
  uploadedFiles: File[];
  configuration: WizardConfiguration;
  isGenerating: boolean;
  progress: number;
  result: string | null;
  error: string | null;
  activeTemplate: Template | null;
  setUploadedFiles: (files: File[]) => void;
  updateConfiguration: (key: string, value: any) => void;
  startGeneration: () => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;
}

interface WizardConfiguration {
  prompt: string;
  negativePrompt: string;
  motionStyle: string;
  stylePreset: string;
  duration: number;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
  workflow: Workflow;
  template?: Template | null;
}

export function WizardProvider({ children, workflow, template }: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(template || null);

  // Initialize configuration from template if provided
  const getInitialConfig = (): WizardConfiguration => {
    if (template) {
      return {
        prompt: template.prompt,
        negativePrompt: template.negativePrompt || '',
        motionStyle: template.motionStyle,
        stylePreset: template.stylePreset,
        duration: template.duration,
      };
    }
    return {
      prompt: 'Cinematic motion, high quality, 4K',
      negativePrompt: '',
      motionStyle: 'slow-zoom-in',
      stylePreset: 'cinematic',
      duration: 5,
    };
  };

  const [configuration, setConfiguration] = useState<WizardConfiguration>(getInitialConfig());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addAsset } = useAssets();

  // Update config when template changes
  useEffect(() => {
    if (template) {
      setActiveTemplate(template);
      setConfiguration({
        prompt: template.prompt,
        negativePrompt: template.negativePrompt || '',
        motionStyle: template.motionStyle,
        stylePreset: template.stylePreset,
        duration: template.duration,
      });
    }
  }, [template]);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const updateConfiguration = (key: string, value: any) => {
    setConfiguration(prev => ({ ...prev, [key]: value }));
  };

  const pollResult = async (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s * 60)

    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setError("Generation timed out. Please check your FAL dashboard.");
        setIsGenerating(false);
        return;
      }

      try {
        const status = await checkStatus(requestId);
        console.log("Polling Status:", status.status);

        if (status.status === 'COMPLETED') {
          clearInterval(interval);
          const finalResult = await getResult(requestId);
          if (finalResult.data && (finalResult.data as any).video) {
            const videoUrl = (finalResult.data as any).video.url;
            setResult(videoUrl);
            addAsset(videoUrl, 'video', `Generated - ${workflow.name}`);
            setIsGenerating(false);
            setProgress(100);
            nextStep();
          } else {
            throw new Error("No video URL in final result");
          }
        } else if (status.status === 'FAILED') {
          clearInterval(interval);
          throw new Error("FAL Generation Failed");
        } else {
          // Update progress based on queue status if available
          setProgress(Math.min(95, 30 + (attempts * 1)));
        }
      } catch (err: any) {
        clearInterval(interval);
        setError(err.message || "Polling failed");
        setIsGenerating(false);
      }
    }, 5000);
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      const supabase = createClient();

      if (!supabase) {
        console.warn("Supabase not connected, falling back to MOCK.");
        mockGeneration();
        return;
      }

      // 1. Upload to R2
      setProgress(10);
      const file = uploadedFiles[0];
      if (!file) throw new Error("No file uploaded");

      const imageUrl = await uploadToR2(file, 'user-uploads');
      addAsset(imageUrl, 'image', file.name); // Save upload to library
      setProgress(30);

      // 2. Call Edge Function (Secure)
      const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
        body: {
          imageUrl,
          prompt: `Style: ${configuration.motionStyle}. Professional cinematic.`,
          motionStyle: configuration.motionStyle
        }
      });

      if (fnError) throw new Error(fnError.message);

      // 3. Handle Async Job
      if (data.request_id) {
        await pollResult(data.request_id);
      } else if (data.video) {
        setResult(data.video.url);
        addAsset(data.video.url, 'video', `Generated - ${workflow.name}`);
        setIsGenerating(false);
        setProgress(100);
        nextStep();
      } else {
        throw new Error("Invalid response from generation service");
      }

    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "Something went wrong.");
      setIsGenerating(false);
    }
  };

  const mockGeneration = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsGenerating(false);
        setResult("https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4");
        nextStep();
      }
    }, 200);
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setUploadedFiles([]);
    setConfiguration({
      prompt: 'Cinematic motion, high quality, 4K',
      negativePrompt: '',
      motionStyle: 'slow-zoom-in',
      stylePreset: 'cinematic',
      duration: 5,
    });
    setActiveTemplate(null);
    setResult(null);
    setError(null);
    setIsGenerating(false);
  };

  return (
    <WizardContext.Provider value={{
      currentStep,
      uploadedFiles,
      configuration,
      isGenerating,
      progress,
      result,
      error,
      activeTemplate,
      setUploadedFiles,
      updateConfiguration,
      startGeneration,
      nextStep,
      prevStep,
      resetWizard
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}