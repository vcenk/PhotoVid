import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/common/ThemeProvider';
import { CreditsProvider } from './lib/store/contexts/CreditsContext';
import { LandingPage } from './components/pages/LandingPage';
import { StudioPage } from './components/pages/StudioPage';
import { LipsyncPage } from './components/pages/LipsyncPage';
import { ImagePage } from './components/pages/ImagePage';
import { AppsPage } from './components/pages/AppsPage';
import { WorkflowPage } from './components/pages/WorkflowPage';
import { IndustryPage } from './components/industry/IndustryPage';
import { VirtualStagingTool } from './components/tools/real-estate/VirtualStagingTool';
import { ItemRemovalTool } from './components/tools/real-estate/ItemRemovalTool';
import { PhotoEnhancementTool } from './components/tools/real-estate/PhotoEnhancementTool';
import { SkyReplacementTool } from './components/tools/real-estate/SkyReplacementTool';
import { TwilightTool } from './components/tools/real-estate/TwilightTool';
import { LawnEnhancementTool } from './components/tools/real-estate/LawnEnhancementTool';
import { RoomTourTool } from './components/tools/real-estate/RoomTourTool';
import { DeclutterTool } from './components/tools/real-estate/DeclutterTool';
import { VirtualRenovationTool } from './components/tools/real-estate/VirtualRenovationTool';
import { WallColorTool } from './components/tools/real-estate/WallColorTool';
import { FloorReplacementTool } from './components/tools/real-estate/FloorReplacementTool';
import { RainToShineTool } from './components/tools/real-estate/RainToShineTool';
import { NightToDayTool } from './components/tools/real-estate/NightToDayTool';
import { ChangingSeasonsTool } from './components/tools/real-estate/ChangingSeasonsTool';
import { PoolEnhancementTool } from './components/tools/real-estate/PoolEnhancementTool';
import { WatermarkRemovalTool } from './components/tools/real-estate/WatermarkRemovalTool';
import { HeadshotRetouchingTool } from './components/tools/real-estate/HeadshotRetouchingTool';
// Auto Dealership Tools
import { BackgroundSwapTool } from './components/tools/auto/BackgroundSwapTool';
import { AutoEnhanceTool } from './components/tools/auto/AutoEnhanceTool';
import { BlemishRemovalTool } from './components/tools/auto/BlemishRemovalTool';
import { ReflectionFixTool } from './components/tools/auto/ReflectionFixTool';
import { InteriorEnhanceTool } from './components/tools/auto/InteriorEnhanceTool';
import { LicenseBlurTool } from './components/tools/auto/LicenseBlurTool';
import { Vehicle360Tool } from './components/tools/auto/Vehicle360Tool';
import { WindowTintTool } from './components/tools/auto/WindowTintTool';
import { SpotRemovalTool } from './components/tools/auto/SpotRemovalTool';
import { ShadowEnhancementTool } from './components/tools/auto/ShadowEnhancementTool';
import { NumberPlateMaskTool } from './components/tools/auto/NumberPlateMaskTool';
import { DealerBrandingTool } from './components/tools/auto/DealerBrandingTool';
import { PaintColorTool } from './components/tools/auto/PaintColorTool';
import { WheelCustomizerTool } from './components/tools/auto/WheelCustomizerTool';
import { VehicleWalkthroughTool } from './components/tools/auto/VehicleWalkthroughTool';
import { SocialClipsTool } from './components/tools/auto/SocialClipsTool';
import { DamageDetectionTool } from './components/tools/auto/DamageDetectionTool';
import { AutoStoryboardPage } from './components/pages/AutoStoryboardPage';
import { StoryboardPage } from './components/pages/StoryboardPage';
import { TextToVideoPage } from './components/pages/TextToVideoPage';
import { VideoEditorPage } from './components/video-editor/VideoEditorPage';
import { ExteriorPaintTool } from './components/tools/real-estate/ExteriorPaintTool';
import { LandscapeDesignTool } from './components/tools/real-estate/LandscapeDesignTool';
import { AutoDeclutterTool } from './components/tools/real-estate/AutoDeclutterTool';
import { RealEstatePageV2 } from './components/pages/RealEstatePageV2';
import { AuthPage } from './components/pages/AuthPage';
import { AuthCallbackPage } from './components/pages/AuthCallbackPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/pages/TermsOfServicePage';
import { CreditsPage } from './components/pages/CreditsPage';
import { MyLibraryPage } from './components/pages/MyLibraryPage';
import { VideoPage } from './components/pages/VideoPage';
import { EditPage } from './components/pages/EditPage';
import { PropertiesPage } from './components/pages/PropertiesPage';
import { ListingPage } from './components/pages/ListingPage';
import { AuthProvider } from './lib/store/contexts/AuthContext';

// Simple Error Boundary to catch crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-4">Please check the console for more details.</p>
          <pre className="text-left bg-white p-4 rounded border border-red-200 overflow-auto max-w-2xl text-sm">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CreditsProvider>
            <Router>
              <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/studio/library" element={<MyLibraryPage />} />
            <Route path="/studio/properties" element={<PropertiesPage />} />
            <Route path="/studio/real-estate" element={<RealEstatePageV2 />} />
            <Route path="/studio/real-estate/virtual-staging" element={<VirtualStagingTool />} />
            <Route path="/studio/real-estate/item-removal" element={<ItemRemovalTool />} />
            <Route path="/studio/real-estate/photo-enhancement" element={<PhotoEnhancementTool />} />
            <Route path="/studio/real-estate/sky-replacement" element={<SkyReplacementTool />} />
            <Route path="/studio/real-estate/twilight" element={<TwilightTool />} />
            <Route path="/studio/real-estate/lawn-enhancement" element={<LawnEnhancementTool />} />
            <Route path="/studio/real-estate/room-tour" element={<RoomTourTool />} />
            <Route path="/studio/real-estate/declutter" element={<DeclutterTool />} />
            <Route path="/studio/real-estate/virtual-renovation" element={<VirtualRenovationTool />} />
            <Route path="/studio/real-estate/wall-color" element={<WallColorTool />} />
            <Route path="/studio/real-estate/exterior-paint" element={<ExteriorPaintTool />} />
            <Route path="/studio/real-estate/landscape-design" element={<LandscapeDesignTool />} />
            <Route path="/studio/real-estate/auto-declutter" element={<AutoDeclutterTool />} />
            <Route path="/studio/real-estate/floor-replacement" element={<FloorReplacementTool />} />
            <Route path="/studio/real-estate/rain-to-shine" element={<RainToShineTool />} />
            <Route path="/studio/real-estate/night-to-day" element={<NightToDayTool />} />
            <Route path="/studio/real-estate/changing-seasons" element={<ChangingSeasonsTool />} />
            <Route path="/studio/real-estate/pool-enhancement" element={<PoolEnhancementTool />} />
            <Route path="/studio/edit/headshot-retouching" element={<HeadshotRetouchingTool />} />
            <Route path="/studio/real-estate/storyboard" element={<StoryboardPage />} />
            <Route path="/studio/real-estate/video-builder" element={<VideoEditorPage />} />
            <Route path="/studio/real-estate/text-to-video" element={<TextToVideoPage />} />
            <Route path="/studio/apps/auto" element={<IndustryPage industryId="auto" />} />
            <Route path="/studio/apps/auto/background-swap" element={<BackgroundSwapTool />} />
            <Route path="/studio/apps/auto/auto-enhance" element={<AutoEnhanceTool />} />
            <Route path="/studio/apps/auto/blemish-removal" element={<BlemishRemovalTool />} />
            <Route path="/studio/apps/auto/reflection-fix" element={<ReflectionFixTool />} />
            <Route path="/studio/apps/auto/interior-enhance" element={<InteriorEnhanceTool />} />
            <Route path="/studio/apps/auto/license-blur" element={<LicenseBlurTool />} />
            <Route path="/studio/apps/auto/vehicle-360" element={<Vehicle360Tool />} />
            <Route path="/studio/apps/auto/window-tint" element={<WindowTintTool />} />
            <Route path="/studio/apps/auto/spot-removal" element={<SpotRemovalTool />} />
            <Route path="/studio/apps/auto/shadow-enhancement" element={<ShadowEnhancementTool />} />
            <Route path="/studio/apps/auto/number-plate-mask" element={<NumberPlateMaskTool />} />
            <Route path="/studio/apps/auto/dealer-branding" element={<DealerBrandingTool />} />
            <Route path="/studio/apps/auto/paint-color" element={<PaintColorTool />} />
            <Route path="/studio/apps/auto/wheel-customizer" element={<WheelCustomizerTool />} />
            <Route path="/studio/apps/auto/vehicle-walkthrough" element={<VehicleWalkthroughTool />} />
            <Route path="/studio/apps/auto/social-clips" element={<SocialClipsTool />} />
            <Route path="/studio/apps/auto/damage-detection" element={<DamageDetectionTool />} />
            <Route path="/studio/apps/auto/storyboard" element={<AutoStoryboardPage />} />
            <Route path="/studio/listing" element={<ListingPage />} />
            <Route path="/studio/lipsync" element={<LipsyncPage />} />
            <Route path="/studio/image" element={<ImagePage />} />
            <Route path="/studio/edit" element={<EditPage />} />
            <Route path="/studio/edit/watermark-removal" element={<WatermarkRemovalTool />} />
            <Route path="/studio/video" element={<VideoPage />} />
            <Route path="/studio/workflow" element={<WorkflowPage />} />
            <Route path="/studio/credits" element={<CreditsPage />} />
            {/* Redirect old dashboard routes to studio */}
            <Route path="/dashboard" element={<Navigate to="/studio" replace />} />
            <Route path="/dashboard/lipsync" element={<Navigate to="/studio/lipsync" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/studio" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            </Routes>
            </Router>
          </CreditsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
