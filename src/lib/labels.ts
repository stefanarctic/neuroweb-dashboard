import type {
  ActivityType,
  ClientHealth,
  ClientStatus,
  ProjectStatus,
  ProjectType,
} from '../types';

export const clientStatusLabel: Record<ClientStatus, string> = {
  lead: 'Lead',
  proposal: 'Proposal',
  active: 'Active',
  retainer: 'Retainer',
  paused: 'Paused',
  churned: 'Churned',
};

export const clientHealthLabel: Record<ClientHealth, string> = {
  healthy: 'Healthy',
  at_risk: 'At risk',
  critical: 'Critical',
};

export const projectTypeLabel: Record<ProjectType, string> = {
  website: 'Website',
  redesign: 'Redesign',
  system: 'System',
  maintenance: 'Maintenance',
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  discovery: 'Discovery',
  design: 'Design',
  build: 'Build',
  launch: 'Launch',
  live: 'Live',
  on_hold: 'On hold',
};

export const activityTypeLabel: Record<ActivityType, string> = {
  note: 'Note',
  call: 'Call',
  email: 'Email',
  milestone: 'Milestone',
};

export function formatCurrency(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}
