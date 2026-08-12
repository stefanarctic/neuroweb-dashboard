import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import {
  ProjectStatusBadge,
  ProjectTypeBadge,
} from '../components/StatusBadge';
import { useDashboard } from '../context/DashboardContext';
import { projectStatusLabel } from '../lib/labels';
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ProjectStatus,
  type ProjectType,
} from '../types';

const BOARD_COLUMNS: ProjectStatus[][] = [
  ['discovery', 'design'],
  ['build', 'launch'],
  ['live', 'on_hold'],
];

const IN_FLIGHT: ProjectStatus[] = [
  'discovery',
  'design',
  'build',
  'launch',
];

type ScopeFilter = 'all' | 'inflight';

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, getClient } = useDashboard();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<ProjectType | 'all'>('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [scope, setScope] = useState<ScopeFilter>('all');
  const [view, setView] = useState<'board' | 'list'>('board');

  useEffect(() => {
    setScope(searchParams.get('scope') === 'inflight' ? 'inflight' : 'all');
  }, [searchParams]);

  function updateScope(next: ScopeFilter) {
    setScope(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('scope');
    else params.set('scope', next);
    setSearchParams(params, { replace: true });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (type !== 'all' && p.type !== type) return false;
      if (scope === 'inflight' && !IN_FLIGHT.includes(p.status)) return false;
      if (status !== 'all' && p.status !== status) return false;
      if (!q) return true;
      const client = getClient(p.clientId);
      const hay = [p.name, p.stack, p.goals, client?.name ?? '']
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query, type, status, scope, getClient]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Cross-client delivery board for websites and systems.</p>
        </div>
        <div className="row">
          <button
            type="button"
            className={`btn ${view === 'board' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('board')}
          >
            Board
          </button>
          <button
            type="button"
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('list')}
          >
            List
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <label className="field search">
              <span className="field-label">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Project, client, stack…"
              />
            </label>
            <label className="field">
              <span className="field-label">Type</span>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as ProjectType | 'all')
                }
              >
                <option value="all">All</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Scope</span>
              <select
                value={scope}
                onChange={(e) => updateScope(e.target.value as ScopeFilter)}
              >
                <option value="all">All</option>
                <option value="inflight">In flight</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ProjectStatus | 'all')
                }
              >
                <option value="all">All</option>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No projects match these filters" />
      ) : view === 'board' ? (
        <div className="project-board">
          {BOARD_COLUMNS.map((statuses) => {
            const items = filtered.filter((p) =>
              statuses.includes(p.status),
            );
            const title = statuses
              .map((s) => projectStatusLabel[s])
              .join(' · ');
            return (
              <div key={title} className="card board-col">
                <header className="card-header">
                  {title}
                  <span>{items.length}</span>
                </header>
                <div className="card-body">
                  {items.length === 0 ? (
                    <EmptyState message="Empty lane" />
                  ) : (
                    items.map((project) => {
                      const client = getClient(project.clientId);
                      return (
                        <Link
                          key={project.id}
                          to={`/projects/${project.id}/edit`}
                          className="board-card"
                        >
                          <strong>{project.name}</strong>
                          <span className="mono-label">
                            {client?.name ?? 'Unknown client'}
                          </span>
                          <div className="row" style={{ gap: 8 }}>
                            <ProjectTypeBadge type={project.type} />
                            <ProjectStatusBadge status={project.status} />
                          </div>
                          <span className="mono-label">{project.stack}</span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <header className="card-header">
            {filtered.length} project{filtered.length === 1 ? '' : 's'}
          </header>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Stack</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => {
                    const client = getClient(project.clientId);
                    return (
                      <tr key={project.id}>
                        <td>
                          <Link
                            className="row-link"
                            to={`/projects/${project.id}/edit`}
                          >
                            {project.name}
                          </Link>
                          <div className="mono-label" style={{ marginTop: 4 }}>
                            {project.goals}
                          </div>
                        </td>
                        <td>
                          <Link to={`/clients/${project.clientId}`}>
                            {client?.name ?? '—'}
                          </Link>
                        </td>
                        <td>
                          <ProjectTypeBadge type={project.type} />
                        </td>
                        <td>
                          <ProjectStatusBadge status={project.status} />
                        </td>
                        <td className="mono-label">{project.stack}</td>
                        <td>
                          <Link
                            to={`/projects/${project.id}/edit`}
                            className="btn btn-ghost"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
