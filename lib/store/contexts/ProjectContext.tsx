import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../../database/client';
import { Project } from '../../types/studio';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  saveProject: (name: string, mode: 'wizard' | 'canvas', data: any) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchProjects = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setProjects(data as Project[]);
    }
    setLoading(false);
  };

  const saveProject = async (name: string, mode: 'wizard' | 'canvas', data: any) => {
    if (!supabase) {
      // Fallback for demo without Supabase
      const mockProject: Project = {
        id: Math.random().toString(36).substring(7),
        name,
        mode,
        userId: 'demo-user',
        industryId: 'real-estate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProjects([mockProject, ...projects]);
      return mockProject;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data: project, error } = await supabase
      .from('projects')
      .upsert({
        name,
        mode,
        user_id: userData.user.id,
        workflow_data: data,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (!error && project) {
      fetchProjects();
      return project as Project;
    }
    return null;
  };

  const deleteProject = async (id: string) => {
    if (supabase) {
      await supabase.from('projects').delete().eq('id', id);
    }
    setProjects(projects.filter(p => p.id !== id));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
