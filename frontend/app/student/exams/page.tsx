import { AppShell } from '../../../components/AppShell';

const studentNav = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '◫' },
  { label: 'Exams', href: '/student/exams', icon: '▣' },
  { label: 'Results', href: '/student/results', icon: '◍' },
  { label: 'Performance', href: '/student/performance', icon: '◔' },
  { label: 'Profile', href: '/student/profile', icon: '⚙' },
];

export default function StudentExamsPage() {
  return (
    <AppShell title="My Exams" subtitle="View and manage your scheduled and upcoming examinations." userName="Asha K" role="Student" navItems={studentNav}>
      <div className="dashboard-shell">
        <div className="tool-bar">
          <div className="search-box"><input aria-label="Search exams" placeholder="Search exams" /></div>
          <div className="filter-group">
            <select className="filter-select" aria-label="Status filter"><option>Status</option></select>
            <select className="filter-select" aria-label="Subject filter"><option>Subject</option></select>
            <button className="primary-btn">Create Exam</button>
          </div>
        </div>
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Exam Number</th>
                  <th>Duration</th>
                  <th>Total Marks</th>
                  <th>Start Date & Time</th>
                  <th>End Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Data Structures Midterm</td>
                  <td>EX-204</td>
                  <td>90 min</td>
                  <td>100</td>
                  <td>2026-09-29 10:00</td>
                  <td>2026-09-29 11:30</td>
                  <td><span className="badge badge--scheduled">Scheduled</span></td>
                  <td><button className="action-btn">Start</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
