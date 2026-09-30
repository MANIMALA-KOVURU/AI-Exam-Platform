import { AppShell } from '../../../components/AppShell';
import { LanguageSelector } from '../../../components/LanguageSelector';

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '◫' },
  { label: 'Users', href: '/admin/users', icon: '◭' },
  { label: 'Students', href: '/admin/students', icon: '◉' },
  { label: 'Examiners', href: '/admin/examiners', icon: '◬' },
  { label: 'Question Bank', href: '/admin/questions', icon: '▤' },
  { label: 'Exams', href: '/admin/exams', icon: '▣' },
  { label: 'Results', href: '/admin/results', icon: '◍' },
  { label: 'Proctoring', href: '/admin/proctoring', icon: '◒' },
  { label: 'Reports', href: '/admin/reports', icon: '◫' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙' },
];

export default function AdminSettingsPage() {
  return (
    <AppShell title="Platform settings" subtitle="Configure institution-level preferences and security defaults." userName="Admin" role="Admin" navItems={adminNav}>
      <div className="dashboard-shell">
        <div className="content-grid dashboard-panels">
          <div className="list-card">
            <div className="list-card-header"><h3>System defaults</h3></div>
            <div className="summary-row"><span>Default language</span><LanguageSelector /></div>
            <div className="summary-row"><span>AI proctoring threshold</span><strong>75</strong></div>
            <div className="summary-row"><span>PWA install prompt</span><strong>Enabled</strong></div>
            <div className="summary-row"><span>Audit logging</span><strong>Enabled</strong></div>
          </div>
          <div className="summary-card">
            <div className="list-card-header"><h3>Security</h3></div>
            <div className="summary-row"><span>Password policy</span><strong>Strong</strong></div>
            <div className="summary-row"><span>Session timeout</span><strong>30 mins</strong></div>
            <div className="summary-row"><span>File upload limits</span><strong>10 MB</strong></div>
            <div className="summary-row"><span>Rate limiting</span><strong>Enabled</strong></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
