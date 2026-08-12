import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createId } from '../lib/id';
import { loadDashboard, resetDashboard, saveDashboard } from '../lib/storage';
import type {
  Activity,
  ActivityType,
  Client,
  ClientHealth,
  ClientStatus,
  DashboardData,
  Project,
  ProjectStatus,
  ProjectType,
} from '../types';

export type ClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export type ProjectInput = Omit<Project, 'id'> & { id?: string };

interface DashboardContextValue {
  data: DashboardData;
  clients: Client[];
  projects: Project[];
  activities: Activity[];
  getClient: (id: string) => Client | undefined;
  getProject: (id: string) => Project | undefined;
  getClientProjects: (clientId: string) => Project[];
  getClientActivities: (clientId: string) => Activity[];
  upsertClient: (input: ClientInput) => Client;
  deleteClient: (id: string) => void;
  updateClientStatus: (id: string, status: ClientStatus) => void;
  updateClientHealth: (id: string, health: ClientHealth) => void;
  upsertProject: (input: ProjectInput) => Project;
  deleteProject: (id: string) => void;
  addActivity: (
    clientId: string,
    type: ActivityType,
    body: string,
  ) => Activity;
  resetToSeed: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function persist(next: DashboardData) {
  saveDashboard(next);
  return next;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(() => loadDashboard());

  const update = useCallback((updater: (prev: DashboardData) => DashboardData) => {
    setData((prev) => persist(updater(prev)));
  }, []);

  const getClient = useCallback(
    (id: string) => data.clients.find((c) => c.id === id),
    [data.clients],
  );

  const getProject = useCallback(
    (id: string) => data.projects.find((p) => p.id === id),
    [data.projects],
  );

  const getClientProjects = useCallback(
    (clientId: string) =>
      data.projects.filter((p) => p.clientId === clientId),
    [data.projects],
  );

  const getClientActivities = useCallback(
    (clientId: string) =>
      data.activities
        .filter((a) => a.clientId === clientId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [data.activities],
  );

  const upsertClient = useCallback(
    (input: ClientInput): Client => {
      const now = new Date().toISOString();
      let saved!: Client;
      update((prev) => {
        if (input.id) {
          const clients = prev.clients.map((c) => {
            if (c.id !== input.id) return c;
            saved = {
              ...c,
              ...input,
              id: c.id,
              createdAt: c.createdAt,
              updatedAt: now,
            };
            return saved;
          });
          return { ...prev, clients };
        }
        saved = {
          ...input,
          id: createId('cli'),
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, clients: [saved, ...prev.clients] };
      });
      return saved;
    },
    [update],
  );

  const deleteClient = useCallback(
    (id: string) => {
      update((prev) => ({
        clients: prev.clients.filter((c) => c.id !== id),
        projects: prev.projects.filter((p) => p.clientId !== id),
        activities: prev.activities.filter((a) => a.clientId !== id),
      }));
    },
    [update],
  );

  const updateClientStatus = useCallback(
    (id: string, status: ClientStatus) => {
      update((prev) => ({
        ...prev,
        clients: prev.clients.map((c) =>
          c.id === id
            ? { ...c, status, updatedAt: new Date().toISOString() }
            : c,
        ),
      }));
    },
    [update],
  );

  const updateClientHealth = useCallback(
    (id: string, health: ClientHealth) => {
      update((prev) => ({
        ...prev,
        clients: prev.clients.map((c) =>
          c.id === id
            ? { ...c, health, updatedAt: new Date().toISOString() }
            : c,
        ),
      }));
    },
    [update],
  );

  const upsertProject = useCallback(
    (input: ProjectInput): Project => {
      let saved!: Project;
      update((prev) => {
        if (input.id) {
          const projects = prev.projects.map((p) => {
            if (p.id !== input.id) return p;
            saved = { ...p, ...input, id: p.id };
            return saved;
          });
          return { ...prev, projects };
        }
        saved = { ...input, id: createId('prj') };
        return { ...prev, projects: [saved, ...prev.projects] };
      });
      return saved;
    },
    [update],
  );

  const deleteProject = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    },
    [update],
  );

  const addActivity = useCallback(
    (clientId: string, type: ActivityType, body: string): Activity => {
      const activity: Activity = {
        id: createId('act'),
        clientId,
        type,
        body,
        createdAt: new Date().toISOString(),
      };
      update((prev) => ({
        ...prev,
        activities: [activity, ...prev.activities],
        clients: prev.clients.map((c) =>
          c.id === clientId
            ? { ...c, updatedAt: new Date().toISOString() }
            : c,
        ),
      }));
      return activity;
    },
    [update],
  );

  const resetToSeed = useCallback(() => {
    setData(resetDashboard());
  }, []);

  const value = useMemo<DashboardContextValue>(
    () => ({
      data,
      clients: data.clients,
      projects: data.projects,
      activities: data.activities,
      getClient,
      getProject,
      getClientProjects,
      getClientActivities,
      upsertClient,
      deleteClient,
      updateClientStatus,
      updateClientHealth,
      upsertProject,
      deleteProject,
      addActivity,
      resetToSeed,
    }),
    [
      data,
      getClient,
      getProject,
      getClientProjects,
      getClientActivities,
      upsertClient,
      deleteClient,
      updateClientStatus,
      updateClientHealth,
      upsertProject,
      deleteProject,
      addActivity,
      resetToSeed,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return ctx;
}

export type { ProjectStatus, ProjectType };
