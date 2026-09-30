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

export default function AdminExamsPage() {
  return (
    <AppShell title="Exam administration" subtitle="Review exam health, slots, and scheduling across the platform." userName="Admin" role="Admin" navItems={adminNav}>
      <div className="dashboard-shell">
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Exam</th><th>Subject</th><th>Status</th><th>Scheduled</th><th>Students</th></tr>
              </thead>
              <tbody>
                <tr><td>Data Structures Midterm</td><td>Computer Science</td><td><span className="badge badge--active">Live</span></td><td>2026-09-29</td><td>140</td></tr>
                <tr><td>Web Fundamentals</td><td>Information Tech</td><td><span className="badge badge--scheduled">Scheduled</span></td><td>2026-09-30</td><td>92</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
