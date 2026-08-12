import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '../components/DatePicker';
import { EmptyState } from '../components/EmptyState';
import { FollowUpDate } from '../components/FollowUpDate';
import {
  ActivityTypeBadge,
  ClientHealthBadge,
  ClientStatusBadge,
  ProjectStatusBadge,
  ProjectTypeBadge,
} from '../components/StatusBadge';
import { useDashboard } from '../context/DashboardContext';
import {
  formatCurrency,
  formatRelative,
} from '../lib/labels';
import {
  ACTIVITY_TYPES,
  CLIENT_HEALTHS,
  CLIENT_STATUSES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ActivityType,
  type ClientHealth,
  type ClientStatus,
  type ProjectStatus,
  type ProjectType,
} from '../types';

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ClientDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const {
    getClient,
    getClientProjects,
    getClientActivities,
    upsertClient,
    deleteClient,
    updateClientStatus,
    updateClientHealth,
    upsertProject,
    addActivity,
  } = useDashboard();

  const client = getClient(id);
  const projects = getClientProjects(id);
  const activities = getClientActivities(id);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [retainer, setRetainer] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  const [activityType, setActivityType] = useState<ActivityType>('note');
  const [activityBody, setActivityBody] = useState('');

  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('website');
  const [projectStatus, setProjectStatus] =
    useState<ProjectStatus>('discovery');
  const [projectStack, setProjectStack] = useState('');
  const [projectGoals, setProjectGoals] = useState('');

  useEffect(() => {
    if (!client) return;
    setName(client.name);
    setIndustry(client.industry);
    setWebsite(client.website);
    setContactName(client.contact.name);
    setContactPhone(client.contact.phone);
    setContactRole(client.contact.role);
    setRetainer(
      client.monthlyRetainer != null ? String(client.monthlyRetainer) : '',
    );
    setFollowUp(toDateInput(client.nextFollowUp));
    setTags(client.tags.join(', '));
    setNotes(client.notes);
  }, [client]);

  if (!client) {
    return (
      <div className="page">
        <EmptyState message="Client not found" />
        <Link to="/clients" className="btn btn-ghost">
          Back to clients
        </Link>
      </div>
    );
  }

  const current = client;

  function startEdit() {
    setEditing(true);
  }

  function saveEdit(e: FormEvent) {
    e.preventDefault();
    upsertClient({
      id: current.id,
      name: name.trim(),
      industry: industry.trim(),
      website: website.trim(),
      status: current.status,
      health: current.health,
      contact: {
        name: contactName.trim(),
        phone: contactPhone.trim(),
        role: contactRole.trim(),
      },
      monthlyRetainer: retainer ? Number(retainer) : null,
      nextFollowUp: followUp || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim(),
    });
    setEditing(false);
  }

  function onAddActivity(e: FormEvent) {
    e.preventDefault();
    if (!activityBody.trim()) return;
    addActivity(current.id, activityType, activityBody.trim());
    setActivityBody('');
  }

  function onAddProject(e: FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) return;
    upsertProject({
      clientId: current.id,
      name: projectName.trim(),
      type: projectType,
      status: projectStatus,
      stack: projectStack.trim() || 'TBD',
      launchDate: null,
      goals: projectGoals.trim(),
    });
    setProjectName('');
    setProjectStack('');
    setProjectGoals('');
    setProjectType('website');
    setProjectStatus('discovery');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="mono-label" style={{ marginBottom: 8 }}>
            <Link to="/clients">Clients</Link> / {client.id}
          </div>
          <h1>{client.name}</h1>
          <p>{client.notes || 'No notes yet for this account.'}</p>
        </div>
        <div className="row">
          <ClientStatusBadge status={client.status} />
          <ClientHealthBadge health={client.health} />
          {!editing && (
            <button type="button" className="btn btn-ghost" onClick={startEdit}>
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-stack">
          <div className="card">
            <header className="card-header">Profile</header>
            <div className="card-body">
              {editing ? (
                <form onSubmit={saveEdit} className="form-grid">
                  <label className="field">
                    <span className="field-label active">Name</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Industry</span>
                    <input
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </label>
                  <label className="field full">
                    <span className="field-label">Website</span>
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Contact</span>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Number</span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Role</span>
                    <input
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Retainer</span>
                    <input
                      type="number"
                      value={retainer}
                      onChange={(e) => setRetainer(e.target.value)}
                    />
                  </label>
                  <DatePicker
                    label="Follow-up"
                    value={followUp}
                    onChange={setFollowUp}
                  />
                  <label className="field full">
                    <span className="field-label">Tags</span>
                    <input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </label>
                  <label className="field full">
                    <span className="field-label">Notes</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                  <div className="form-actions full">
                    <button type="submit" className="btn btn-primary">
                      Save changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-quiet"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="kv-list">
                  <div className="kv-row">
                    <dt className="mono-label">Industry</dt>
                    <dd>{client.industry}</dd>
                  </div>
                  <div className="kv-row">
                    <dt className="mono-label">Website</dt>
                    <dd>
                      {client.website ? (
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {client.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div className="kv-row">
                    <dt className="mono-label">Contact</dt>
                    <dd>
                      {client.contact.name} · {client.contact.role}
                      <div className="mono-label" style={{ marginTop: 4 }}>
                        {client.contact.phone || '—'}
                      </div>
                    </dd>
                  </div>
                  <div className="kv-row">
                    <dt className="mono-label">Retainer</dt>
                    <dd>{formatCurrency(client.monthlyRetainer)}</dd>
                  </div>
                  <div className="kv-row">
                    <dt className="mono-label">Follow-up</dt>
                    <dd>
                      <FollowUpDate value={client.nextFollowUp} />
                    </dd>
                  </div>
                  <div className="kv-row">
                    <dt className="mono-label">Tags</dt>
                    <dd>
                      <div className="tag-row">
                        {client.tags.length === 0 ? (
                          '—'
                        ) : (
                          client.tags.map((t) => (
                            <span key={t} className="chip-tag">
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>

          <div className="card">
            <header className="card-header">Projects</header>
            <div className="card-body">
              {projects.length === 0 ? (
                <EmptyState message="No projects yet" />
              ) : (
                <div className="project-list">
                  {projects.map((project) => (
                    <div key={project.id} className="project-item">
                      <header>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {project.name}
                        </strong>
                        <div className="row" style={{ gap: 8 }}>
                          <ProjectTypeBadge type={project.type} />
                          <ProjectStatusBadge status={project.status} />
                        </div>
                      </header>
                      <p>{project.goals || 'No goals set.'}</p>
                      <div
                        className="row"
                        style={{ marginTop: 10, justifyContent: 'space-between' }}
                      >
                        <span className="mono-label">{project.stack}</span>
                        <Link
                          to={`/projects/${project.id}/edit`}
                          className="btn btn-ghost"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form className="inline-form" onSubmit={onAddProject}>
                <div className="mono-label">Add project</div>
                <div className="form-grid">
                  <label className="field full">
                    <span className="field-label">Name</span>
                    <input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Launch site / booking system"
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Type</span>
                    <select
                      value={projectType}
                      onChange={(e) =>
                        setProjectType(e.target.value as ProjectType)
                      }
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
                      value={projectStatus}
                      onChange={(e) =>
                        setProjectStatus(e.target.value as ProjectStatus)
                      }
                    >
                      {PROJECT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field full">
                    <span className="field-label">Stack</span>
                    <input
                      value={projectStack}
                      onChange={(e) => setProjectStack(e.target.value)}
                    />
                  </label>
                  <label className="field full">
                    <span className="field-label">Goals</span>
                    <input
                      value={projectGoals}
                      onChange={(e) => setProjectGoals(e.target.value)}
                    />
                  </label>
                </div>
                <button type="submit" className="btn btn-ghost">
                  Add project
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="detail-stack">
          <div className="card">
            <header className="card-header">Quick controls</header>
            <div className="card-body col">
              <label className="field">
                <span className="field-label">Pipeline status</span>
                <select
                  value={client.status}
                  onChange={(e) =>
                    updateClientStatus(
                      client.id,
                      e.target.value as ClientStatus,
                    )
                  }
                >
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Health</span>
                <select
                  value={client.health}
                  onChange={(e) =>
                    updateClientHealth(
                      client.id,
                      e.target.value as ClientHealth,
                    )
                  }
                >
                  {CLIENT_HEALTHS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <div className="danger-zone">
                <span className="mono-label">Remove account from local store</span>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete ${client.name} and related projects/activity?`,
                      )
                    ) {
                      deleteClient(client.id);
                      navigate('/clients');
                    }
                  }}
                >
                  Delete client
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <header className="card-header">Activity</header>
            <div className="card-body">
              {activities.length === 0 ? (
                <EmptyState message="No activity logged" />
              ) : (
                <div className="activity-list">
                  {activities.map((item) => (
                    <div key={item.id} className="activity-item">
                      <header>
                        <ActivityTypeBadge type={item.type} />
                        <span className="mono-label">
                          {formatRelative(item.createdAt)}
                        </span>
                      </header>
                      <p>{item.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <form className="inline-form" onSubmit={onAddActivity}>
                <div className="mono-label">Log activity</div>
                <label className="field">
                  <span className="field-label">Type</span>
                  <select
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(e.target.value as ActivityType)
                    }
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Details</span>
                  <textarea
                    value={activityBody}
                    onChange={(e) => setActivityBody(e.target.value)}
                    placeholder="Call notes, email summary, milestone…"
                  />
                </label>
                <button type="submit" className="btn btn-ghost">
                  Add activity
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
