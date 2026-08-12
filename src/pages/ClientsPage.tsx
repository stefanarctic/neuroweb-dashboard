import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { FollowUpDate } from '../components/FollowUpDate';
import {
  ClientHealthBadge,
  ClientStatusBadge,
} from '../components/StatusBadge';
import { useDashboard } from '../context/DashboardContext';
import { isFollowUpDue } from '../lib/dates';
import { formatCurrency } from '../lib/labels';
import {
  CLIENT_HEALTHS,
  CLIENT_STATUSES,
  type ClientHealth,
  type ClientStatus,
} from '../types';

type HealthFilter = ClientHealth | 'all' | 'attention';
type FollowUpFilter = 'all' | 'due';

export function ClientsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clients } = useDashboard();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ClientStatus | 'all'>('all');
  const [health, setHealth] = useState<HealthFilter>('all');
  const [followUp, setFollowUp] = useState<FollowUpFilter>('all');
  const [tag, setTag] = useState('all');

  useEffect(() => {
    const healthParam = searchParams.get('health');
    const followUpParam = searchParams.get('followUp');

    if (
      healthParam === 'attention' ||
      healthParam === 'healthy' ||
      healthParam === 'at_risk' ||
      healthParam === 'critical'
    ) {
      setHealth(healthParam);
    } else {
      setHealth('all');
    }

    if (followUpParam === 'due') {
      setFollowUp('due');
    } else {
      setFollowUp('all');
    }
  }, [searchParams]);

  function updateHealth(next: HealthFilter) {
    setHealth(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('health');
    else params.set('health', next);
    setSearchParams(params, { replace: true });
  }

  function updateFollowUp(next: FollowUpFilter) {
    setFollowUp(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('followUp');
    else params.set('followUp', next);
    setSearchParams(params, { replace: true });
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients
      .filter((c) => {
        if (status !== 'all' && c.status !== status) return false;
        if (health === 'attention') {
          if (c.health !== 'at_risk' && c.health !== 'critical') return false;
        } else if (health !== 'all' && c.health !== health) {
          return false;
        }
        if (followUp === 'due' && !isFollowUpDue(c.nextFollowUp)) return false;
        if (tag !== 'all' && !c.tags.includes(tag)) return false;
        if (!q) return true;
        const hay = [
          c.name,
          c.industry,
          c.website,
          c.contact.name,
          c.contact.phone,
          ...c.tags,
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, query, status, health, followUp, tag]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Directory of Neuroweb accounts across pipeline stages.</p>
        </div>
        <Link to="/clients/new" className="btn btn-primary">
          New client
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filters">
            <label className="field search">
              <span className="field-label">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, contact, tag…"
              />
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ClientStatus | 'all')
                }
              >
                <option value="all">All</option>
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
                value={health}
                onChange={(e) => updateHealth(e.target.value as HealthFilter)}
              >
                <option value="all">All</option>
                <option value="attention">At risk / critical</option>
                {CLIENT_HEALTHS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Follow-up</span>
              <select
                value={followUp}
                onChange={(e) =>
                  updateFollowUp(e.target.value as FollowUpFilter)
                }
              >
                <option value="all">All</option>
                <option value="due">Due / overdue</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Tag</span>
              <select value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="all">All</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <header className="card-header">
          {filtered.length} client{filtered.length === 1 ? '' : 's'}
        </header>
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 16 }}>
              <EmptyState message="No clients match these filters" />
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Health</th>
                    <th>Contact</th>
                    <th>Retainer</th>
                    <th>Follow-up</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="clickable-row"
                      tabIndex={0}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/clients/${client.id}`);
                        }
                      }}
                    >
                      <td>
                        <div className="row-title">{client.name}</div>
                        <div className="mono-label" style={{ marginTop: 4 }}>
                          {client.industry}
                        </div>
                      </td>
                      <td>
                        <ClientStatusBadge status={client.status} />
                      </td>
                      <td>
                        <ClientHealthBadge health={client.health} />
                      </td>
                      <td>
                        <div>{client.contact.name}</div>
                        <div className="mono-label" style={{ marginTop: 4 }}>
                          {client.contact.phone || '—'}
                        </div>
                      </td>
                      <td>{formatCurrency(client.monthlyRetainer)}</td>
                      <td>
                        <FollowUpDate value={client.nextFollowUp} />
                      </td>
                      <td>
                        <div className="tag-row">
                          {client.tags.map((t) => (
                            <span key={t} className="chip-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
