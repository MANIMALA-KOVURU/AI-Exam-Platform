'use client';

import { AppShell } from '../../../components/AppShell';
import { useLocale } from '../../../components/LocaleProvider';

const studentNav = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '◫' },
  { label: 'Exams', href: '/student/exams', icon: '▣' },
  { label: 'Results', href: '/student/results', icon: '◍' },
  { label: 'Performance', href: '/student/performance', icon: '◔' },
  { label: 'Profile', href: '/student/profile', icon: '⚙' },
];

const statCards = [
  { label: 'Total Exams', value: '12', change: '+8% vs last term', accent: 'blue', icon: '📚' },
  { label: 'Upcoming Exams', value: '3', change: 'Next in 2 days', accent: 'cyan', icon: '🗓️' },
  { label: 'Completed', value: '8', change: '2 pending review', accent: 'green', icon: '✅' },
  { label: 'Average Score', value: '84%', change: '+5.2% improvement', accent: 'amber', icon: '📈' },
];

const upcomingExams = [
  { title: 'Data Structures Midterm', subject: 'Computer Science', duration: '90 min', questions: 40, date: 'Tue, 10:00 AM', status: 'Scheduled', tone: 'scheduled' },
  { title: 'Operating Systems Quiz', subject: 'System Design', duration: '45 min', questions: 20, date: 'Wed, 2:30 PM', status: 'Active', tone: 'active' },
  { title: 'Database Fundamentals', subject: 'Database Systems', duration: '75 min', questions: 35, date: 'Thu, 9:15 AM', status: 'Draft', tone: 'draft' },
];

const recentResults = [
  { name: 'Algorithms Exam', score: '92%' },
  { name: 'Database Quiz', score: '88%' },
  { name: 'Web Fundamentals', score: '81%' },
];

export default function StudentDashboardPage() {
  const { t } = useLocale();
  return (
    <AppShell
      title="Welcome back, Asha"
      subtitle="Here’s what’s happening with your examinations."
      userName="Asha K"
      role="Student"
      navItems={studentNav}
    >
      <div className="dashboard-shell dashboard-shell--student">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">{t('Overview')}</p>
            <h2 className="section-heading">{t('Student dashboard')}</h2>
          </div>
          <button className="primary-btn btn-sm">{t('View calendar')}</button>
        </div>

        <div className="dashboard-grid dashboard-grid--stats">
          {statCards.map((card) => (
            <div key={card.label} className={`stat-card stat-card--${card.accent}`}>
              <div className="stat-card-header">
                <span>{t(card.label)}</span>
                <span className="stat-icon">{card.icon}</span>
              </div>
              <strong>{card.value}</strong>
              <small>{t(card.change)}</small>
            </div>
          ))}
        </div>

        <div className="content-grid dashboard-panels">
          <div className="list-card">
            <div className="list-card-header">
              <h3>{t('Upcoming exams')}</h3>
              <button className="action-btn">{t('View all')}</button>
            </div>

            <div className="exam-list">
              {upcomingExams.map((exam) => (
                <div key={exam.title} className="exam-item">
                  <div className="exam-meta">
                    <strong>{exam.title}</strong>
                    <span>{exam.subject} • {exam.duration}</span>
                  </div>
                  <div>
                    <div className="meta-label">{t('Questions')}</div>
                    <strong>{exam.questions}</strong>
                  </div>
                  <div>
                    <div className="meta-label">{t('Date')}</div>
                    <strong>{exam.date}</strong>
                  </div>
                  <span className={`badge badge--${exam.tone}`}>{exam.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-card">
            <div className="list-card-header">
              <h3>{t('Recent results')}</h3>
              <button className="action-btn">{t('See all')}</button>
            </div>

            {recentResults.map((result) => (
              <div key={result.name} className="summary-row">
                <span>{result.name}</span>
                <strong>{result.score}</strong>
              </div>
            ))}

            <div className="mini-chart">
              <div className="chart-bar chart-bar--one" style={{ height: '48%' }} />
              <div className="chart-bar chart-bar--two" style={{ height: '72%' }} />
              <div className="chart-bar chart-bar--three" style={{ height: '64%' }} />
              <div className="chart-bar chart-bar--four" style={{ height: '88%' }} />
              <div className="chart-bar chart-bar--five" style={{ height: '56%' }} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
