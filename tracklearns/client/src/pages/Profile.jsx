import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/UI';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', avatar: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    userAPI.getProfile().then(res => {
      const u = res.data.user;
      setProfile(u);
      setForm({ name: u.name || '', bio: u.bio || '', avatar: u.avatar || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.user);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNew) return addToast('New passwords do not match', 'error');
    if (pwForm.newPassword.length < 6) return addToast('Password must be at least 6 characters', 'error');
    setChangingPw(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      addToast('Password changed successfully!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '28px' }}>Profile Settings</h1>

        {/* Profile Header */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="profile-avatar">
            {form.avatar ? <img src={form.avatar} alt="" /> : (profile?.name?.[0] || '?')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{profile?.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginTop: '2px' }}>{profile?.email}</div>
            <div style={{ marginTop: '6px' }}>
              <span className={`badge badge-${profile?.role === 'instructor' ? 'warning' : 'accent'}`}>{profile?.role}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            Member since<br />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : ''}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['profile', 'security'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'profile' ? '👤 Profile Info' : '🔒 Security'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSave} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Avatar URL</label>
                <input type="url" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://example.com/avatar.jpg" />
                <div className="form-hint">Enter a URL to your profile picture</div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." rows={4} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '14px', background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--warning)' }}>
                ⚠️ Choose a strong password with at least 6 characters.
              </div>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" value={pwForm.confirmNew} onChange={e => setPwForm({ ...pwForm, confirmNew: e.target.value })} placeholder="••••••••" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={changingPw}>
                  {changingPw ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
