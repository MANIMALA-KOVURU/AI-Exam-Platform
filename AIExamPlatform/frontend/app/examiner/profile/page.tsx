import { AppShell } from '../../../components/AppShell';

const examinerNav = [
  { label: 'Dashboard', href: '/examiner/dashboard', icon: '◫' },
  { label: 'Exams', href: '/examiner/exams', icon: '▣' },
  { label: 'Question Bank', href: '/examiner/questions', icon: '▤' },
  { label: 'Results', href: '/examiner/results', icon: '◍' },
  { label: 'Submissions', href: '/examiner/submissions', icon: '◌' },
  { label: 'Grading', href: '/examiner/grading', icon: '◐' },
  { label: 'Proctoring', href: '/examiner/proctoring', icon: '◒' },
  { label: 'Profile', href: '/examiner/profile', icon: '⚙' },
  { label: 'Settings', href: '/examiner/settings', icon: '⚙' },
];

export default function ExaminerProfilePage() {
  return (
    <AppShell
      title="Profile"
      subtitle="Manage your account information and assessment activity."
      userName="Manimala"
      role="Examiner"
      navItems={examinerNav}
    >
      <div className="dashboard-shell">
        <div className="profile-card">
          <div className="profile-banner">
            <div className="profile-avatar">M</div>
            <div>
              <h3>Manimala</h3>
              <p>Examiner</p>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-row"><span>Name</span><strong>Manimala</strong></div>
            <div className="summary-row"><span>Role</span><strong>Examiner</strong></div>
            <div className="summary-row"><span>Email</span><strong>manimala@example.com</strong></div>
            <div className="summary-row"><span>Department</span><strong>Assessment</strong></div>
            <div className="summary-row"><span>Exams authored</span><strong>32</strong></div>
            <div className="summary-row"><span>Last login</span><strong>Today, 09:42 AM</strong></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
