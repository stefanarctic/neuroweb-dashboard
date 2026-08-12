import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DatePicker } from '../components/DatePicker';
import { useDashboard } from '../context/DashboardContext';
import {
  CLIENT_HEALTHS,
  CLIENT_STATUSES,
  type ClientHealth,
  type ClientStatus,
} from '../types';

export function ClientFormPage() {
  const navigate = useNavigate();
  const { upsertClient } = useDashboard();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [health, setHealth] = useState<ClientHealth>('healthy');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [retainer, setRetainer] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const client = upsertClient({
      name: name.trim(),
      industry: industry.trim() || 'General',
      website: website.trim(),
      status,
      health,
      contact: {
        name: contactName.trim() || 'TBD',
        phone: contactPhone.trim(),
        role: contactRole.trim() || 'Contact',
      },
      monthlyRetainer: retainer ? Number(retainer) : null,
      nextFollowUp: followUp || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim(),
    });

    navigate(`/clients/${client.id}`);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>New client</h1>
          <p>Add an account to the Neuroweb pipeline.</p>
        </div>
        <Link to="/clients" className="btn btn-ghost">
          Cancel
        </Link>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <header className="card-header">Client profile</header>
        <div className="card-body">
          <div className="form-grid">
            <label className="field">
              <span className="field-label active">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Clinic"
              />
            </label>
            <label className="field">
              <span className="field-label">Industry</span>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Healthcare"
              />
            </label>
            <label className="field full">
              <span className="field-label">Website</span>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
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
                value={health}
                onChange={(e) => setHealth(e.target.value as ClientHealth)}
              >
                {CLIENT_HEALTHS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Contact name</span>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Contact number</span>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+40 7xx xxx xxx"
              />
            </label>
            <label className="field">
              <span className="field-label">Contact role</span>
              <input
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Monthly retainer</span>
              <input
                type="number"
                min="0"
                value={retainer}
                onChange={(e) => setRetainer(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <DatePicker
              label="Next follow-up"
              value={followUp}
              onChange={setFollowUp}
            />
            <label className="field full">
              <span className="field-label">Tags</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="booking, lead-gen, ecommerce"
              />
            </label>
            <label className="field full">
              <span className="field-label">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Goals, constraints, context…"
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create client
            </button>
            <Link to="/clients" className="btn btn-quiet">
              Discard
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
