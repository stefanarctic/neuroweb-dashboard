import { toDateKey } from './dates';
import type { Client, DashboardData, Project } from '../types';
import { seedData } from '../data/seed';

const STORAGE_KEY = 'neuroweb.dashboard.v2';

function emptyData(): DashboardData {
  return seedData();
}

/** Drop legacy contact.email and normalize date-only fields. */
function normalizeClients(clients: Client[]): Client[] {
  return clients.map((client) => {
    const raw = client.contact as Client['contact'] & { email?: string };
    return {
      ...client,
      nextFollowUp: toDateKey(client.nextFollowUp),
      contact: {
        name: raw.name ?? '',
        role: raw.role ?? '',
        phone: raw.phone ?? '',
      },
    };
  });
}

function normalizeProjects(projects: Project[]): Project[] {
  return projects.map((project) => ({
    ...project,
    launchDate: toDateKey(project.launchDate),
  }));
}

export function loadDashboard(): DashboardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = emptyData();
      saveDashboard(data);
      return data;
    }
    const parsed = JSON.parse(raw) as DashboardData;
    const data: DashboardData = {
      clients: normalizeClients(parsed.clients ?? []),
      projects: normalizeProjects(parsed.projects ?? []),
      activities: parsed.activities ?? [],
    };
    saveDashboard(data);
    return data;
  } catch {
    const data = emptyData();
    saveDashboard(data);
    return data;
  }
}

export function saveDashboard(data: DashboardData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDashboard(): DashboardData {
  const data = emptyData();
  saveDashboard(data);
  return data;
}

export function clearDashboard(): DashboardData {
  return resetDashboard();
}
