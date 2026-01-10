# Project Restructure Guide

## New Folder Structure

```
components/
├── common/                          # Shared/reusable components
│   ├── AuthButton.tsx
│   └── ThemeProvider.tsx
├── dashboard/                       # Main dashboard
│   ├── home/                       # Home page components
│   │   ├── HeroComposer.tsx
│   │   ├── IndustryModelsStrip.tsx
│   │   ├── WorkflowLibrary.tsx
│   │   ├── RecentCreations.tsx
│   │   └── TemplateCarousels.tsx
│   ├── navigation/                 # Navigation components
│   │   ├── NavigationRail.tsx
│   │   ├── FlyoutPanels.tsx
│   │   └── DashboardTopbar.tsx
│   └── DashboardPage.tsx (in pages/)
├── studio/                         # Studio/creation workspace
│   ├── canvas/                    # Node-based workflow
│   │   ├── WorkflowCanvas.tsx
│   │   ├── CustomNode.tsx
│   │   └── NodePalette.tsx
│   ├── wizard/                    # Step-by-step wizard
│   │   ├── WizardContainer.tsx
│   │   ├── FileUploader.tsx
│   │   ├── ConfigurationPanel.tsx
│   │   ├── GenerationProgress.tsx
│   │   └── ResultViewer.tsx
│   ├── nodes/                     # Node canvas components
│   │   ├── CanvasEditor.tsx
│   │   ├── ImageInputNode.tsx
│   │   ├── OutputNode.tsx
│   │   └── ProcessingNode.tsx
│   ├── shared/                    # Shared studio components
│   │   ├── IndustrySelector.tsx
│   │   ├── WorkflowGrid.tsx
│   │   └── AssetLibrary.tsx
│   └── StudioPage.tsx (in pages/)
├── landing/                        # Landing page sections
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── UseCases.tsx
│   ├── WorkflowDemo.tsx
│   ├── TemplatePacks.tsx
│   ├── PricingSection.tsx
│   ├── FaqAndFinalCtaSection.tsx
│   ├── Footer.tsx
│   └── (other sections...)
├── layout/                         # Layout components
│   ├── Navbar.tsx
│   └── Background.tsx
└── pages/                          # Page components
    ├── LandingPage.tsx
    ├── DashboardPage.tsx
    └── StudioPage.tsx

lib/
├── api/                            # API integrations
│   ├── fal.ts
│   ├── openai.ts
│   └── r2.ts
├── database/                       # Database/Supabase
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── store/                          # State management
│   ├── dashboard.ts (was dashboard-store.ts)
│   └── contexts/
│       ├── StudioContext.tsx
│       ├── WizardContext.tsx
│       ├── ProjectContext.tsx
│       └── AssetContext.tsx
├── data/                           # Static data & configurations
│   ├── dashboard.ts (was dashboard-data.ts)
│   ├── workflows.ts
│   ├── style-presets.ts
│   └── workflow-nodes.ts
├── services/                       # Business logic services
│   └── unsplash.ts
├── types/                          # TypeScript types
│   └── studio.ts
└── utils.ts                        # Utility functions
```

## Import Path Changes

### From Root (App.tsx, etc.)
- `./components/theme/ThemeProvider` → `./components/common/ThemeProvider`

### From components/pages/
- `../dashboard/NavigationRail` → `../dashboard/navigation/NavigationRail`
- `../dashboard/FlyoutPanels` → `../dashboard/navigation/FlyoutPanels`
- `../dashboard/DashboardTopbar` → `../dashboard/navigation/DashboardTopbar`
- `../dashboard/HeroComposer` → `../dashboard/home/HeroComposer`
- `../dashboard/IndustryModelsStrip` → `../dashboard/home/IndustryModelsStrip`
- `../dashboard/WorkflowLibrary` → `../dashboard/home/WorkflowLibrary`
- `../dashboard/RecentCreations` → `../dashboard/home/RecentCreations`
- `../dashboard/TemplateCarousels` → `../dashboard/home/TemplateCarousels`

### From components/dashboard/home/
- `../../lib/utils` → `../../../lib/utils`
- `../../lib/dashboard-store` → `../../../lib/store/dashboard`
- `../../lib/dashboard-data` → `../../../lib/data/dashboard`
- `../../lib/unsplash` → `../../../lib/services/unsplash`

### From components/dashboard/navigation/
- `../../lib/utils` → `../../../lib/utils`
- `../theme/ThemeProvider` → `../../common/ThemeProvider`
- `../../lib/style-presets` → `../../../lib/data/style-presets`
- `../../lib/dashboard-store` → `../../../lib/store/dashboard`

### From components/studio/canvas/
- `../../lib/utils` → `../../../lib/utils`
- `../../lib/workflow-nodes` → `../../../lib/data/workflow-nodes`

### From components/studio/shared/
- `../../lib/utils` → `../../../lib/utils`
- `../../lib/dashboard-store` → `../../../lib/store/dashboard`

### From components/studio/wizard/
- `../../lib/fal` → `../../../lib/api/fal`
- `../../lib/r2` → `../../../lib/api/r2`
- `../../lib/supabase/client` → `../../../lib/database/client`
- `../contexts/` → `../../../lib/store/contexts/`

### From components/landing/
- `../theme/ThemeProvider` → `../common/ThemeProvider`
- `../layout/` → `../layout/` (no change)

### From lib/data/
- `./dashboard-store` → `../store/dashboard`
- `./unsplash` → `../services/unsplash`

## Files Removed
- ❌ `components/dashboard/DashboardSidebar.tsx` (replaced by NavigationRail)
- ❌ `components/theme/` folder (moved to common/)
- ❌ `components/sections/` folder (moved to landing/)
- ❌ `components/workflow/` folder (moved to studio/canvas/)
- ❌ `components/contexts/` folder (moved to lib/store/contexts/)
- ❌ `lib/supabase/` folder (moved to lib/database/)

## Key Benefits

1. **Better Organization**: Clear separation between dashboard, studio, and landing
2. **Logical Grouping**: Related components are co-located
3. **Easier Navigation**: Find components by feature, not type
4. **Scalability**: Easy to add new features without cluttering
5. **Clear Boundaries**: API, database, store, data, services are separated
6. **Type Safety**: All types centralized in lib/types/

## Migration Checklist

- [x] Remove old DashboardSidebar
- [x] Create new folder structure
- [x] Move dashboard components
- [x] Move studio components
- [x] Move landing components
- [x] Move lib files
- [ ] Update all imports (in progress)
- [ ] Test application
- [ ] Update documentation
