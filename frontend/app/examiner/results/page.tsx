import Link from 'next/link';
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

const results = [
  { student: 'Asha K', exam: 'Data Structures Midterm', score: '94%', status: 'Pass', average: '88%', date: '2026-09-19' },
  { student: 'Rahul S', exam: 'Web Fundamentals', score: '89%', status: 'Pass', average: '86%', date: '2026-09-18' },
  { student: 'Priya N', exam: 'Operating Systems Quiz', score: '76%', status: 'Pass', average: '79%', date: '2026-09-17' },
  { student: 'Farhan M', exam: 'Database Fundamentals', score: '68%', status: 'Needs Review', average: '72%', date: '2026-09-16' },
];

export default function ExaminerResultsPage() {
  return (
    <AppShell
      title="Results"
      subtitle="Track student performance and publication status for each assessment."
      userName="Manimala"
      role="Examiner"
      navItems={examinerNav}
    >
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Assessment analytics</p>
            <h2 className="section-heading">Published results</h2>
          </div>
          <button className="primary-btn btn-sm">Export summary</button>
        </div>

        <div className="dashboard-grid dashboard-grid--stats">
          <div className="stat-card stat-card--blue">
            <div className="stat-card-header"><span>Total attempts</span><span className="stat-icon">📝</span></div>
            <strong>542</strong>
            <small>Across 28 exams</small>
          </div>
          <div className="stat-card stat-card--green">
            <div className="stat-card-header"><span>Pass rate</span><span className="stat-icon">✅</span></div>
            <strong>88%</strong>
            <small>+4.2% this term</small>
          </div>
          <div className="stat-card stat-card--cyan">
            <div className="stat-card-header"><span>Average score</span><span className="stat-icon">📈</span></div>
            <strong>81.4%</strong>
            <small>Strong consistency</small>
          </div>
          <div className="stat-card stat-card--amber">
            <div className="stat-card-header"><span>Needs review</span><span className="stat-icon">⚠️</span></div>
            <strong>8</strong>
            <small>2 flagged by AI</small>
          </div>
        </div>

        <div className="tool-bar">
          <div className="search-box"><input aria-label="Search results" placeholder="Search student or exam" /></div>
          <div className="filter-group">
            <select className="filter-select" aria-label="Exam filter"><option>All exams</option></select>
            <select className="filter-select" aria-label="Status filter"><option>All statuses</option></select>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Average</th>
                  <th>Published</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={`${result.student}-${result.exam}`}>
                    <td>{result.student}</td>
                    <td>{result.exam}</td>
                    <td>{result.score}</td>
                    <td><span className={result.status === 'Needs Review' ? 'badge badge--pending' : 'badge badge--active'}>{result.status}</span></td>
                    <td>{result.average}</td>
                    <td>{result.date}</td>
                    <td><Link href="/examiner/results" className="action-btn">Open</Link></td>
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
