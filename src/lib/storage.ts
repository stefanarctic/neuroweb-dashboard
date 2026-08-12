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

function normalizeDashboard(data: DashboardData): DashboardData {
  return {
    clients: normalizeClients(data.clients ?? []),
    projects: normalizeProjects(data.projects ?? []),
    activities: data.activities ?? [],
  };
}

function isDashboardShape(value: unknown): value is DashboardData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DashboardData>;
  return (
    Array.isArray(candidate.clients) &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.activities)
  );
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
    const data = normalizeDashboard(parsed);
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

export function serializeDashboard(data: DashboardData): string {
  return JSON.stringify(data, null, 2);
}

/** Parse a dashboard JSON export (raw DashboardData or `{ data: DashboardData }`). */
export function parseDashboardImport(raw: string): DashboardData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('File is not valid JSON');
  }

  const wrapped =
    parsed &&
    typeof parsed === 'object' &&
    'data' in parsed &&
    isDashboardShape((parsed as { data: unknown }).data)
      ? (parsed as { data: DashboardData }).data
      : parsed;

  if (!isDashboardShape(wrapped)) {
    throw new Error(
      'Invalid export: expected clients, projects, and activities arrays',
    );
  }

  return normalizeDashboard(wrapped);
}

export function replaceDashboard(data: DashboardData): DashboardData {
  const normalized = normalizeDashboard(data);
  saveDashboard(normalized);
  return normalized;
}
