import { createContext, useContext, ReactNode } from 'react';

// Define the available feature flags
export type FeatureFlag = 
  | 'SOCIAL_MEDIA_INTEGRATION'
  | 'FACIAL_RECOGNITION'
  | 'ADVANCED_VISUALIZATION'
  | 'EXPORT_REPORTS'
  | 'DARK_MODE_TOGGLE'
  | 'BATCH_PROCESSING'
  | 'AI_SUGGESTIONS';

// Define the feature flag settings
const featureFlags: Record<FeatureFlag, boolean> = {
  SOCIAL_MEDIA_INTEGRATION: true,
  FACIAL_RECOGNITION: process.env.NODE_ENV === 'production', // Only enable in production
  ADVANCED_VISUALIZATION: true,
  EXPORT_REPORTS: true,
  DARK_MODE_TOGGLE: true,
  BATCH_PROCESSING: false, // Feature in development
  AI_SUGGESTIONS: false, // Feature in development
};

// Verbose debugging as requested
if (process.env.NODE_ENV !== 'production') {
  console.info('Feature flags configuration:', featureFlags);
}

interface FeatureFlagContextType {
  isFeatureEnabled: (flag: FeatureFlag) => boolean;
  getEnabledFeatures: () => FeatureFlag[];
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    // Check if flag exists in our configuration
    if (!(flag in featureFlags)) {
      console.warn(`Feature flag "${flag}" is not defined in the configuration`);
      return false;
    }
    
    return featureFlags[flag];
  };

  const getEnabledFeatures = (): FeatureFlag[] => {
    return Object.entries(featureFlags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag as FeatureFlag);
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        isFeatureEnabled,
        getEnabledFeatures,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag() {
  const context = useContext(FeatureFlagContext);
  
  if (context === undefined) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  
  return context;
}

// Custom hook for checking a specific feature
export function useIsFeatureEnabled(flag: FeatureFlag): boolean {
  const { isFeatureEnabled } = useFeatureFlag();
  return isFeatureEnabled(flag);
} 