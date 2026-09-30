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

export default function ExaminerSettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Manage your exam preferences, notifications, and security preferences."
      userName="Manimala"
      role="Examiner"
      navItems={examinerNav}
    >
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Preferences</p>
            <h2 className="section-heading">Examiner settings</h2>
          </div>
          <button className="primary-btn btn-sm">Save changes</button>
        </div>

        <div className="content-grid dashboard-panels">
          <div className="list-card">
            <div className="list-card-header"><h3>General</h3></div>
            <div className="summary-row"><span>Language</span><strong>English</strong></div>
            <div className="summary-row"><span>Theme</span><strong>Light</strong></div>
            <div className="summary-row"><span>Notifications</span><strong>Enabled</strong></div>
            <div className="summary-row"><span>Security</span><strong>2FA enabled</strong></div>
          </div>

          <div className="summary-card">
            <div className="list-card-header"><h3>Exam defaults</h3></div>
            <div className="summary-row"><span>Default duration</span><strong>60 mins</strong></div>
            <div className="summary-row"><span>Auto-save</span><strong>On</strong></div>
            <div className="summary-row"><span>Proctoring</span><strong>Required</strong></div>
            <div className="summary-row"><span>AI grading</span><strong>Suggested</strong></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
