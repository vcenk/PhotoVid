import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { StoryboardProvider } from '@/lib/store/contexts/StoryboardContext';
import { TextToVideoWizard } from '../storyboard/TextToVideoWizard';

export const TextToVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleComplete = (storyboardId: string) => {
    navigate('/studio/real-estate/storyboard');
  };

  const handleCancel = () => {
    navigate('/studio/real-estate');
  };

  return (
    <StoryboardProvider>
      <div className="h-screen flex bg-[#0a0a0b]">
        <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex flex-col ml-0 lg:ml-16">
          <TextToVideoWizard
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </StoryboardProvider>
  );
};
