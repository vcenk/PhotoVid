#!/bin/bash

# Update imports in dashboard home components
echo "Updating dashboard home components..."
find components/dashboard/home -name "*.tsx" -exec sed -i "s|from '../../lib/utils'|from '../../../lib/utils'|g" {} \;
find components/dashboard/home -name "*.tsx" -exec sed -i "s|from '../../lib/dashboard-store'|from '../../../lib/store/dashboard'|g" {} \;
find components/dashboard/home -name "*.tsx" -exec sed -i "s|from '../../lib/dashboard-data'|from '../../../lib/data/dashboard'|g" {} \;
find components/dashboard/home -name "*.tsx" -exec sed -i "s|from '../../lib/unsplash'|from '../../../lib/services/unsplash'|g" {} \;
find components/dashboard/home -name "*.tsx" -exec sed -i "s|from '../workflow/WorkflowCanvas'|from '../../studio/canvas/WorkflowCanvas'|g" {} \;

# Update imports in dashboard navigation components
echo "Updating dashboard navigation components..."
find components/dashboard/navigation -name "*.tsx" -exec sed -i "s|from '../../lib/utils'|from '../../../lib/utils'|g" {} \;
find components/dashboard/navigation -name "*.tsx" -exec sed -i "s|from '../theme/ThemeProvider'|from '../../common/ThemeProvider'|g" {} \;

# Update imports in studio components
echo "Updating studio components..."
find components/studio -name "*.tsx" -exec sed -i "s|from '../../lib/utils'|from '../../../lib/utils'|g" {} \;
find components/studio -name "*.tsx" -exec sed -i "s|from '../../lib/fal'|from '../../../lib/api/fal'|g" {} \;
find components/studio -name "*.tsx" -exec sed -i "s|from '../../lib/r2'|from '../../../lib/api/r2'|g" {} \;
find components/studio -name "*.tsx" -exec sed -i "s|from '../../lib/supabase/client'|from '../../../lib/database/client'|g" {} \;
find components/studio -name "*.tsx" -exec sed -i "s|from '../contexts/'|from '../../../lib/store/contexts/'|g" {} \;

# Update imports in studio canvas
echo "Updating studio canvas components..."
find components/studio/canvas -name "*.tsx" -exec sed -i "s|from '../../lib/utils'|from '../../../lib/utils'|g" {} \;
find components/studio/canvas -name "*.tsx" -exec sed -i "s|from '../../lib/workflow-nodes'|from '../../../lib/data/workflow-nodes'|g" {} \;

# Update imports in landing components
echo "Updating landing components..."
find components/landing -name "*.tsx" -exec sed -i "s|from '../theme/ThemeProvider'|from '../common/ThemeProvider'|g" {} \;
find components/landing -name "*.tsx" -exec sed -i "s|from '../layout/'|from '../layout/'|g" {} \;

# Update lib internal imports
echo "Updating lib internal imports..."
sed -i "s|from './dashboard-store'|from './store/dashboard'|g" lib/data/dashboard.ts 2>/dev/null || true
sed -i "s|from './unsplash'|from './services/unsplash'|g" lib/data/dashboard.ts 2>/dev/null || true

echo "Import updates complete!"
