import {
  clientHealthLabel,
  clientStatusLabel,
  projectStatusLabel,
  projectTypeLabel,
  activityTypeLabel,
} from '../lib/labels';
import type {
  ActivityType,
  ClientHealth,
  ClientStatus,
  ProjectStatus,
  ProjectType,
} from '../types';

function statusClass(status: ClientStatus): string {
  switch (status) {
    case 'active':
    case 'retainer':
      return 'badge-online';
    case 'proposal':
    case 'lead':
      return 'badge-ok';
    case 'paused':
      return 'badge-warn';
    case 'churned':
      return 'badge-danger';
    default:
      return 'badge-muted';
  }
}

function healthClass(health: ClientHealth): string {
  switch (health) {
    case 'healthy':
      return 'badge-ok';
    case 'at_risk':
      return 'badge-warn';
    case 'critical':
      return 'badge-danger';
    default:
      return 'badge-muted';
  }
}

function projectClass(status: ProjectStatus): string {
  switch (status) {
    case 'live':
      return 'badge-online';
    case 'launch':
      return 'badge-ok';
    case 'build':
    case 'design':
      return 'badge-warn';
    case 'on_hold':
      return 'badge-muted';
    case 'discovery':
      return 'badge-alert';
    default:
      return 'badge-muted';
  }
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`badge ${statusClass(status)}`}>
      {(status === 'active' || status === 'retainer') && (
        <span className="dot" />
      )}
      {clientStatusLabel[status]}
    </span>
  );
}

export function ClientHealthBadge({ health }: { health: ClientHealth }) {
  return (
    <span className={`badge ${healthClass(health)}`}>
      {clientHealthLabel[health]}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`badge ${projectClass(status)}`}>
      {status === 'live' && <span className="dot" />}
      {projectStatusLabel[status]}
    </span>
  );
}

export function ProjectTypeBadge({ type }: { type: ProjectType }) {
  return <span className="badge badge-muted">{projectTypeLabel[type]}</span>;
}

export function ActivityTypeBadge({ type }: { type: ActivityType }) {
  return <span className="badge badge-muted">{activityTypeLabel[type]}</span>;
}
