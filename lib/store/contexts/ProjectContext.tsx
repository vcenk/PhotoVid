import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '../../database/client';
import { Project } from '../../types/studio';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  saveProject: (name: string, mode: 'wizard' | 'canvas', data: any, id?: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Local storage for demo mode
const LOCAL_STORAGE_KEY = 'photovid_projects';

function getLocalProjects(): Project[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalProjects(projects: Project[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to save local projects:', e);
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // ============================================
  // Fetch projects (read-only, allowed via RLS)
  // ============================================
  const fetchProjects = useCallback(async () => {
    setLoading(true);

    if (!supabase) {
      setProjects(getLocalProjects());
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setProjects(getLocalProjects());
        setLoading(false);
        return;
      }

      // SELECT is allowed via RLS
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setProjects(data as Project[]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects(getLocalProjects());
    }

    setLoading(false);
  }, [supabase]);

  // ============================================
  // SECURE: Save project via Edge Function
  // ============================================
  const saveProject = useCallback(async (
    name: string,
    mode: 'wizard' | 'canvas',
    data: any,
    id?: string
  ): Promise<Project | null> => {
    if (!supabase) {
      // Fallback for demo without Supabase
      const mockProject: Project = {
        id: id || Math.random().toString(36).substring(7),
        name,
        mode,
        userId: 'demo-user',
        industryId: 'real-estate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const localProjects = getLocalProjects();
      const existingIndex = localProjects.findIndex(p => p.id === mockProject.id);

      if (existingIndex >= 0) {
        localProjects[existingIndex] = mockProject;
      } else {
        localProjects.unshift(mockProject);
      }

      saveLocalProjects(localProjects);
      setProjects(localProjects);
      return mockProject;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Not logged in, use local
        const mockProject: Project = {
          id: id || Math.random().toString(36).substring(7),
          name,
          mode,
          userId: 'demo-user',
          industryId: 'real-estate',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const localProjects = getLocalProjects();
        const existingIndex = localProjects.findIndex(p => p.id === mockProject.id);

        if (existingIndex >= 0) {
          localProjects[existingIndex] = mockProject;
        } else {
          localProjects.unshift(mockProject);
        }

        saveLocalProjects(localProjects);
        setProjects(localProjects);
        return mockProject;
      }

      // SECURE: Call Edge Function instead of direct database write
      const { data: response, error } = await supabase.functions.invoke('save-project', {
        body: {
          id,
          name,
          mode,
          workflowData: data,
        },
      });

      if (error) {
        console.error('Error saving project via Edge Function:', error);
        return null;
      }

      if (response?.error) {
        console.error('Edge Function error:', response.error);
        return null;
      }

      if (response?.success && response?.project) {
        // Refresh projects list
        fetchProjects();
        return response.project as Project;
      }

      return null;
    } catch (error) {
      console.error('Error saving project:', error);
      return null;
    }
  }, [supabase, fetchProjects]);

  // ============================================
  // SECURE: Delete project via Edge Function
  // ============================================
  const deleteProject = useCallback(async (id: string) => {
    if (!supabase) {
      const localProjects = getLocalProjects().filter(p => p.id !== id);
      saveLocalProjects(localProjects);
      setProjects(localProjects);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const localProjects = getLocalProjects().filter(p => p.id !== id);
        saveLocalProjects(localProjects);
        setProjects(localProjects);
        return;
      }

      // SECURE: Call Edge Function instead of direct database delete
      const { data: response, error } = await supabase.functions.invoke('delete-project', {
        body: { id },
      });

      if (error) {
        console.error('Error deleting project via Edge Function:', error);
        return;
      }

      if (response?.success) {
        // Update local state
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      saveProject,
      deleteProject,
      fetchProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
