import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '../components/DatePicker';
import { EmptyState } from '../components/EmptyState';
import {
  ProjectStatusBadge,
  ProjectTypeBadge,
} from '../components/StatusBadge';
import { useDashboard } from '../context/DashboardContext';
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ProjectStatus,
  type ProjectType,
} from '../types';

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ProjectEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const {
    getProject,
    getClient,
    clients,
    upsertProject,
    deleteProject,
  } = useDashboard();

  const project = getProject(id);
  const client = project ? getClient(project.clientId) : undefined;

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<ProjectType>('website');
  const [status, setStatus] = useState<ProjectStatus>('discovery');
  const [stack, setStack] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [goals, setGoals] = useState('');

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setClientId(project.clientId);
    setType(project.type);
    setStatus(project.status);
    setStack(project.stack);
    setLaunchDate(toDateInput(project.launchDate));
    setGoals(project.goals);
  }, [project]);

  if (!project) {
    return (
      <div className="page">
        <EmptyState message="Project not found" />
        <Link to="/projects" className="btn btn-ghost">
          Back to projects
        </Link>
      </div>
    );
  }

  const current = project;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !clientId) return;

    upsertProject({
      id: current.id,
      clientId,
      name: name.trim(),
      type,
      status,
      stack: stack.trim() || 'TBD',
      launchDate: launchDate || null,
      goals: goals.trim(),
    });

    navigate(`/clients/${clientId}`);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="mono-label" style={{ marginBottom: 8 }}>
            <Link to="/projects">Projects</Link>
            {client ? (
              <>
                {' / '}
                <Link to={`/clients/${client.id}`}>{client.name}</Link>
              </>
            ) : null}
            {' / '}
            {current.id}
          </div>
          <h1>Edit project</h1>
          <p>Update delivery details for this Neuroweb project.</p>
        </div>
        <div className="row">
          <ProjectTypeBadge type={current.type} />
          <ProjectStatusBadge status={current.status} />
          <Link to={`/clients/${current.clientId}`} className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <header className="card-header">Project details</header>
        <div className="card-body">
          <div className="form-grid">
            <label className="field full">
              <span className="field-label active">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Client</span>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <DatePicker
              label="Launch date"
              value={launchDate}
              onChange={setLaunchDate}
            />
            <label className="field full">
              <span className="field-label">Stack</span>
              <input
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                placeholder="React · Firebase · …"
              />
            </label>
            <label className="field full">
              <span className="field-label">Goals</span>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Results this project should drive…"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save project
            </button>
            <Link to={`/clients/${current.clientId}`} className="btn btn-quiet">
              Discard
            </Link>
          </div>

          <div className="danger-zone" style={{ marginTop: 24 }}>
            <span className="mono-label">Remove this project from local store</span>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (
                  window.confirm(`Delete project “${current.name}”?`)
                ) {
                  deleteProject(current.id);
                  navigate(`/clients/${current.clientId}`);
                }
              }}
            >
              Delete project
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
