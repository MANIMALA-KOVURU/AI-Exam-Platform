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

const submissions = [
  { student: 'Asha K', exam: 'Data Structures Midterm', submittedAt: '2026-09-19 10:42', status: 'Submitted', score: 'Pending' },
  { student: 'Rahul S', exam: 'Web Fundamentals', submittedAt: '2026-09-19 10:58', status: 'Auto-saved', score: 'Pending' },
  { student: 'Priya N', exam: 'Operating Systems Quiz', submittedAt: '2026-09-19 09:10', status: 'Flagged', score: 'Pending Review' },
  { student: 'Farhan M', exam: 'Database Fundamentals', submittedAt: '2026-09-19 08:34', status: 'Submitted', score: 'In Review' },
];

export default function ExaminerSubmissionsPage() {
  return (
    <AppShell
      title="Submissions"
      subtitle="Monitor answer submissions and automated review status."
      userName="Manimala"
      role="Examiner"
      navItems={examinerNav}
    >
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Recent activity</p>
            <h2 className="section-heading">Student submissions</h2>
          </div>
          <button className="primary-btn btn-sm">Refresh queue</button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Submitted at</th>
                  <th>Status</th>
                  <th>Evaluation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item) => (
                  <tr key={`${item.student}-${item.exam}`}>
                    <td>{item.student}</td>
                    <td>{item.exam}</td>
                    <td>{item.submittedAt}</td>
                    <td>
                      <span className={item.status === 'Flagged' ? 'badge badge--pending' : item.status === 'Auto-saved' ? 'badge badge--scheduled' : 'badge badge--active'}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.score}</td>
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
