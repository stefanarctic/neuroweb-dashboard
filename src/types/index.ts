export type ClientStatus =
  | 'lead'
  | 'proposal'
  | 'active'
  | 'retainer'
  | 'paused'
  | 'churned';

export type ClientHealth = 'healthy' | 'at_risk' | 'critical';

export type ProjectType = 'website' | 'redesign' | 'system' | 'maintenance';

export type ProjectStatus =
  | 'discovery'
  | 'design'
  | 'build'
  | 'launch'
  | 'live'
  | 'on_hold';

export type ActivityType = 'note' | 'call' | 'email' | 'milestone';

export interface Contact {
  name: string;
  phone: string;
  role: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  website: string;
  status: ClientStatus;
  health: ClientHealth;
  contact: Contact;
  monthlyRetainer: number | null;
  nextFollowUp: string | null;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  stack: string;
  launchDate: string | null;
  goals: string;
}

export interface Activity {
  id: string;
  clientId: string;
  type: ActivityType;
  body: string;
  createdAt: string;
}

export interface DashboardData {
  clients: Client[];
  projects: Project[];
  activities: Activity[];
}

export const CLIENT_STATUSES: ClientStatus[] = [
  'lead',
  'proposal',
  'active',
  'retainer',
  'paused',
  'churned',
];

export const CLIENT_HEALTHS: ClientHealth[] = ['healthy', 'at_risk', 'critical'];

export const PROJECT_TYPES: ProjectType[] = [
  'website',
  'redesign',
  'system',
  'maintenance',
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  'discovery',
  'design',
  'build',
  'launch',
  'live',
  'on_hold',
];

export const ACTIVITY_TYPES: ActivityType[] = [
  'note',
  'call',
  'email',
  'milestone',
];
