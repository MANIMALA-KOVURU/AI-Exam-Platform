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

const gradingQueue = [
  { question: 'Explain the difference between DFS and BFS.', subject: 'Data Structures', student: 'Asha K', score: 'AI: 8/10', review: 'Pending' },
  { question: 'Compare static and dynamic memory allocation.', subject: 'Operating Systems', student: 'Rahul S', score: 'AI: 9/10', review: 'Pending' },
  { question: 'Discuss scalability in distributed systems.', subject: 'Database Systems', student: 'Priya N', score: 'AI: 7/10', review: 'Needs override' },
  { question: 'Explain indexing in SQL.', subject: 'Databases', student: 'Farhan M', score: 'AI: 6/10', review: 'Pending' },
];

export default function ExaminerGradingPage() {
  return (
    <AppShell
      title="Grading"
      subtitle="Review AI-assisted evaluations and finalize student scores."
      userName="Manimala"
      role="Examiner"
      navItems={examinerNav}
    >
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Review queue</p>
            <h2 className="section-heading">Pending grading</h2>
          </div>
          <button className="primary-btn btn-sm">Save draft</button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Subject</th>
                  <th>Student</th>
                  <th>AI score</th>
                  <th>Review status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {gradingQueue.map((item) => (
                  <tr key={`${item.student}-${item.question}`}>
                    <td>{item.question}</td>
                    <td>{item.subject}</td>
                    <td>{item.student}</td>
                    <td>{item.score}</td>
                    <td><span className={item.review === 'Needs override' ? 'badge badge--pending' : 'badge badge--scheduled'}>{item.review}</span></td>
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
