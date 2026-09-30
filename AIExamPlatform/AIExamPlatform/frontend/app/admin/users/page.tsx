import Link from 'next/link';
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

const users = [
  { name: 'Asha K', email: 'asha.k@example.com', role: 'Student', status: 'Active' },
  { name: 'Nisha R', email: 'nisha.r@example.com', role: 'Examiner', status: 'Active' },
  { name: 'Vikram P', email: 'vikram.p@example.com', role: 'Admin', status: 'Active' },
  { name: 'Meera D', email: 'meera.d@example.com', role: 'Student', status: 'Disabled' },
];

export default function AdminUsersPage() {
  return (
    <AppShell
      title="User management"
      subtitle="Manage role-based access, incentives, and account health across the platform."
      userName="Admin"
      role="Admin"
      navItems={adminNav}
    >
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Access control</p>
            <h2 className="section-heading">Users</h2>
          </div>
          <button className="primary-btn btn-sm">Create user</button>
        </div>

        <div className="tool-bar">
          <div className="search-box"><input aria-label="Search users" placeholder="Search user" /></div>
          <div className="filter-group">
            <select className="filter-select" aria-label="Role filter"><option>All roles</option></select>
            <select className="filter-select" aria-label="Status filter"><option>All statuses</option></select>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td><span className={user.status === 'Disabled' ? 'badge badge--danger' : 'badge badge--active'}>{user.status}</span></td>
                    <td className="action-group">
                      <Link href="/admin/users" className="action-btn">Edit</Link>
                      <button className="action-btn action-btn--ghost">Reset password</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
