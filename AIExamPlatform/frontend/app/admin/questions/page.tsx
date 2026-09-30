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

export default function AdminQuestionsPage() {
  return (
    <AppShell title="Question bank" subtitle="Monitor question quality, coverage, and subject balance across exams." userName="Admin" role="Admin" navItems={adminNav}>
      <div className="dashboard-shell">
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Question</th><th>Subject</th><th>Type</th><th>Difficulty</th><th>Marks</th></tr>
              </thead>
              <tbody>
                <tr><td>What is the time complexity of binary search?</td><td>Algorithms</td><td>MCQ</td><td>Medium</td><td>5</td></tr>
                <tr><td>Explain the working of a hash table.</td><td>Data Structures</td><td>Short answer</td><td>Hard</td><td>8</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
