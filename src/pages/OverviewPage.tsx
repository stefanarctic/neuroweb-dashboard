import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { FollowUpDate } from '../components/FollowUpDate';
import { Meter } from '../components/Meter';
import {
  ActivityTypeBadge,
  ClientHealthBadge,
  ClientStatusBadge,
} from '../components/StatusBadge';
import { useDashboard } from '../context/DashboardContext';
import { isFollowUpDue, isFollowUpToday, toDateKey } from '../lib/dates';
import {
  clientStatusLabel,
  formatRelative,
} from '../lib/labels';
import type { ClientStatus } from '../types';
import { CLIENT_STATUSES } from '../types';

export function OverviewPage() {
  const { clients, projects, activities, getClient } = useDashboard();

  const activeCount = clients.filter((c) =>
    c.status === 'active' || c.status === 'retainer',
  ).length;
  const atRisk = clients.filter(
    (c) => c.health === 'at_risk' || c.health === 'critical',
  );
  const followUpsDue = clients
    .filter((c) => isFollowUpDue(c.nextFollowUp))
    .sort((a, b) =>
      (toDateKey(a.nextFollowUp) ?? '').localeCompare(
        toDateKey(b.nextFollowUp) ?? '',
      ),
    );
  const liveProjects = projects.filter((p) => p.status === 'live').length;
  const inFlight = projects.filter((p) =>
    ['discovery', 'design', 'build', 'launch'].includes(p.status),
  ).length;

  const pipeline = CLIENT_STATUSES.map((status) => ({
    status,
    count: clients.filter((c) => c.status === status).length,
  }));
  const maxPipeline = Math.max(...pipeline.map((p) => p.count), 1);

  const recent = [...activities]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Ops overview</h1>
          <p>
            Pipeline health for Neuroweb clients — sites and systems that get
            results.
          </p>
        </div>
        <Link to="/clients/new" className="btn btn-primary">
          New client
        </Link>
      </div>

      <div className="stats-grid">
        <Link to="/clients" className="card stat-card stat-card-link">
          <div className="card-body">
            <div className="stat-value">{clients.length}</div>
            <div className="mono-label stat-label">Total clients</div>
            <div className="stat-hint">{activeCount} active / retainer</div>
          </div>
        </Link>
        <Link
          to="/clients?health=attention"
          className="card stat-card stat-card-link"
        >
          <div className="card-body">
            <div className="stat-value">{atRisk.length}</div>
            <div className="mono-label stat-label">At risk</div>
            <div className="stat-hint">Needs attention this week</div>
          </div>
        </Link>
        <Link
          to="/clients?followUp=due"
          className="card stat-card stat-card-link"
        >
          <div className="card-body">
            <div className="stat-value">{followUpsDue.length}</div>
            <div className="mono-label stat-label">Follow-ups due</div>
            <div className="stat-hint">Including overdue</div>
          </div>
        </Link>
        <Link
          to="/projects?scope=inflight"
          className="card stat-card stat-card-link"
        >
          <div className="card-body">
            <div className="stat-value">{inFlight}</div>
            <div className="mono-label stat-label">Projects in flight</div>
            <div className="stat-hint">{liveProjects} live</div>
          </div>
        </Link>
      </div>

      <div className="panel-grid">
        <div className="card">
          <header className="card-header">Pipeline by status</header>
          <div className="card-body col">
            {pipeline.map(({ status, count }) => (
              <div key={status}>
                <div
                  className="row"
                  style={{ justifyContent: 'space-between', marginBottom: 6 }}
                >
                  <span className="mono-label">
                    {clientStatusLabel[status as ClientStatus]}
                  </span>
                  <span style={{ color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {count}
                  </span>
                </div>
                <Meter value={(count / maxPipeline) * 100} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <header className="card-header">
            Follow-ups due
            <Link to="/clients?followUp=due" className="mono-label">
              View all
            </Link>
          </header>
          <div className="card-body">
            {followUpsDue.length === 0 ? (
              <EmptyState message="No follow-ups due" />
            ) : (
              <div className="activity-list">
                {followUpsDue.slice(0, 5).map((client) => {
                  const today = isFollowUpToday(client.nextFollowUp);
                  return (
                    <div
                      key={client.id}
                      className={`activity-item${today ? ' follow-up-today' : ' follow-up-overdue'}`}
                    >
                      <header>
                        <Link to={`/clients/${client.id}`} className="row-link">
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {client.name}
                          </strong>
                        </Link>
                        {today ? (
                          <span className="badge badge-online">
                            <span className="dot" />
                            Today
                          </span>
                        ) : (
                          <span className="badge badge-warn">Overdue</span>
                        )}
                      </header>
                      <p>
                        Due{' '}
                        <FollowUpDate value={client.nextFollowUp} />
                        {' · '}
                        {client.contact.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="card">
          <header className="card-header">At-risk clients</header>
          <div className="card-body">
            {atRisk.length === 0 ? (
              <EmptyState message="All clients healthy" />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Health</th>
                      <th>Status</th>
                      <th>Follow-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atRisk.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <Link
                            className="row-link"
                            to={`/clients/${client.id}`}
                          >
                            {client.name}
                          </Link>
                        </td>
                        <td>
                          <ClientHealthBadge health={client.health} />
                        </td>
                        <td>
                          <ClientStatusBadge status={client.status} />
                        </td>
                        <td>
                          <FollowUpDate value={client.nextFollowUp} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <header className="card-header">Recent activity</header>
          <div className="card-body">
            {recent.length === 0 ? (
              <EmptyState message="No activity yet" />
            ) : (
              <div className="activity-list">
                {recent.map((item) => {
                  const client = getClient(item.clientId);
                  return (
                    <div key={item.id} className="activity-item">
                      <header>
                        <div className="row" style={{ gap: 8 }}>
                          <ActivityTypeBadge type={item.type} />
                          {client ? (
                            <Link to={`/clients/${client.id}`}>
                              {client.name}
                            </Link>
                          ) : (
                            <span className="mono-label">Unknown</span>
                          )}
                        </div>
                        <span className="mono-label">
                          {formatRelative(item.createdAt)}
                        </span>
                      </header>
                      <p>{item.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
