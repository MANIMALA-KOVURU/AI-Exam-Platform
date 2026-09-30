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

const proctoringAlerts = [
  { student: 'Asha K', exam: 'Data Structures Midterm', score: '82', event: 'Multiple faces detected', severity: 'High', status: 'Under review' },
  { student: 'Rahul S', exam: 'Web Fundamentals', score: '64', event: 'Tab switch', severity: 'Moderate', status: 'Flagged' },
  { student: 'Priya N', exam: 'Operating Systems Quiz', score: '42', event: 'Gaze warning', severity: 'Moderate', status: 'Reviewing' },
  { student: 'Farhan M', exam: 'Database Fundamentals', score: '91', event: 'Face absent', severity: 'High', status: 'Escalated' },
];

export default function ExaminerProctoringPage() {
  return (
    <AppShell
      title="Proctoring"
      subtitle="Review suspicious behavior and validate exam integrity decisions."
      userName="Manimala"
      role="Examiner"
      navItems={examinerNav}
    >
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Integrity overview</p>
            <h2 className="section-heading">Live proctoring alerts</h2>
          </div>
          <button className="primary-btn btn-sm">Download report</button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Event</th>
                  <th>Suspicion</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {proctoringAlerts.map((item) => (
                  <tr key={`${item.student}-${item.exam}`}>
                    <td>{item.student}</td>
                    <td>{item.exam}</td>
                    <td>{item.event}</td>
                    <td>{item.score}</td>
                    <td><span className={item.severity === 'High' ? 'badge badge--danger' : 'badge badge--pending'}>{item.severity}</span></td>
                    <td>{item.status}</td>
                    <td><button className="action-btn">Review</button></td>
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
