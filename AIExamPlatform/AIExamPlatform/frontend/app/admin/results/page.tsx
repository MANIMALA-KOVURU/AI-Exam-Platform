import { AppShell } from '../../../components/AppShell';

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

export default function AdminResultsPage() {
  return (
    <AppShell title="Results" subtitle="Institution-wide exam outcomes and score distribution." userName="Admin" role="Admin" navItems={adminNav}>
      <div className="dashboard-shell">
        <div className="dashboard-grid dashboard-grid--stats">
          <div className="stat-card stat-card--blue"><div className="stat-card-header"><span>Pass rate</span><span className="stat-icon">✅</span></div><strong>88%</strong><small>Across all exams</small></div>
          <div className="stat-card stat-card--green"><div className="stat-card-header"><span>Average score</span><span className="stat-icon">📈</span></div><strong>81.4%</strong><small>+3.8% this month</small></div>
          <div className="stat-card stat-card--cyan"><div className="stat-card-header"><span>Total exams</span><span className="stat-icon">📝</span></div><strong>42</strong><small>7 published</small></div>
          <div className="stat-card stat-card--amber"><div className="stat-card-header"><span>Flagged review</span><span className="stat-icon">⚠️</span></div><strong>9</strong><small>Awaiting action</small></div>
        </div>
      </div>
    </AppShell>
  );
}
