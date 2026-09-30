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

export default function AdminProctoringPage() {
  return (
    <AppShell title="Proctoring" subtitle="Track suspicious activity, session integrity, and policy decisions." userName="Admin" role="Admin" navItems={adminNav}>
      <div className="dashboard-shell">
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Signal</th>
                  <th>Suspicion</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Asha K</td><td>Data Structures Midterm</td><td>Multiple faces</td><td>82</td><td><span className="badge badge--danger">High</span></td><td><button className="action-btn">Review</button></td></tr>
                <tr><td>Rahul S</td><td>Web Fundamentals</td><td>Tab switch</td><td>64</td><td><span className="badge badge--pending">Moderate</span></td><td><button className="action-btn">Review</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
