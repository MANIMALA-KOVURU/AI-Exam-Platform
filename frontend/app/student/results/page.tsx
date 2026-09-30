import { AppShell } from '../../../components/AppShell';

const studentNav = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '◫' },
  { label: 'Exams', href: '/student/exams', icon: '▣' },
  { label: 'Results', href: '/student/results', icon: '◍' },
  { label: 'Performance', href: '/student/performance', icon: '◔' },
  { label: 'Profile', href: '/student/profile', icon: '⚙' },
];

export default function StudentResultsPage() {
  return (
    <AppShell title="Exam Results" subtitle="Review your recent assessment performance." userName="Asha K" role="Student" navItems={studentNav}>
      <div className="dashboard-shell">
        <div className="dashboard-grid">
          <div className="stat-card"><div className="stat-card-header"><span>Total Attempts</span><span className="stat-icon">📝</span></div><strong>14</strong><small>Across 5 subjects</small></div>
          <div className="stat-card"><div className="stat-card-header"><span>Average Score</span><span className="stat-icon">📈</span></div><strong>84%</strong><small>+4.1% this term</small></div>
          <div className="stat-card"><div className="stat-card-header"><span>Highest Score</span><span className="stat-icon">🏆</span></div><strong>96%</strong><small>Algorithms</small></div>
          <div className="stat-card"><div className="stat-card-header"><span>Pass Rate</span><span className="stat-icon">✔</span></div><strong>92%</strong><small>11 passed</small></div>
        </div>

        <div className="table-card" style={{ marginTop: 22 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Asha K</td>
                  <td>Data Structures</td>
                  <td>Computer Science</td>
                  <td>92/100</td>
                  <td>92%</td>
                  <td><span className="badge badge--active">Pass</span></td>
                  <td>2026-09-14</td>
                  <td><button className="action-btn">View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
