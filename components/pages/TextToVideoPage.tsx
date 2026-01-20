import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import { StoryboardProvider } from '@/lib/store/contexts/StoryboardContext';
import { TextToVideoWizard } from '../storyboard/TextToVideoWizard';

export const TextToVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

  const handleComplete = (storyboardId: string) => {
    navigate('/studio/apps/real-estate/storyboard');
  };

  const handleCancel = () => {
    navigate('/studio/apps/real-estate');
  };

  return (
    <StoryboardProvider>
      <div className="h-screen flex bg-[#0a0a0b]">
        <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
        <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

        <div className="flex-1 flex flex-col ml-56">
          <TextToVideoWizard
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </StoryboardProvider>
  );
};
