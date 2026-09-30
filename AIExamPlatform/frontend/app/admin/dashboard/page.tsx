'use client';

import { AppShell } from '../../../components/AppShell';
import { useLocale } from '../../../components/LocaleProvider';

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

const statCards = [
  { label: 'Total Students', value: '542', change: '+48 this month', accent: 'blue', icon: '👨‍🎓' },
  { label: 'Total Examiners', value: '28', change: '3 new this week', accent: 'cyan', icon: '🧑‍🏫' },
  { label: 'Active Exams', value: '17', change: '5 start today', accent: 'green', icon: '📝' },
  { label: 'Flagged Sessions', value: '12', change: '4 need review', accent: 'amber', icon: '⚠️' },
];

const activityRows = [
  { name: 'Weekly exam throughput', percent: '84%' },
  { name: 'Pass rate', percent: '76%' },
  { name: 'Grading backlog', percent: '12%' },
];

export default function AdminDashboardPage() {
  const { t } = useLocale();
  return (
    <AppShell
      title="Admin dashboard"
      subtitle="Monitor platform health, exam activity, and governance across the institution."
      userName="Admin"
      role="Admin"
      navItems={adminNav}
    >
      <div className="dashboard-shell dashboard-shell--admin">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">{t('Operations')}</p>
            <h2 className="section-heading">{t('Platform overview')}</h2>
          </div>
          <button className="primary-btn btn-sm">{t('Generate report')}</button>
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
              <h3>{t('Recent activity')}</h3>
              <button className="action-btn">{t('Audit log')}</button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('Metric')}</th>
                    <th>{t('Current')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t('System health')}</td>
                    <td>98.4%</td>
                    <td><span className="badge badge--active">{t('Healthy')}</span></td>
                  </tr>
                  <tr>
                    <td>{t('Active attempts')}</td>
                    <td>86</td>
                    <td><span className="badge badge--scheduled">{t('Normal')}</span></td>
                  </tr>
                  <tr>
                    <td>{t('Pending grading')}</td>
                    <td>24</td>
                    <td><span className="badge badge--pending">{t('Review')}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="summary-card">
            <div className="list-card-header">
              <h3>{t('Performance')}</h3>
            </div>

            {activityRows.map((row) => (
              <div key={row.name} className="summary-row">
                <span>{row.name}</span>
                <strong>{row.percent}</strong>
              </div>
            ))}

            <div className="mini-chart mini-chart--admin">
              <div className="chart-bar chart-bar--one" style={{ height: '60%' }} />
              <div className="chart-bar chart-bar--two" style={{ height: '45%' }} />
              <div className="chart-bar chart-bar--three" style={{ height: '78%' }} />
              <div className="chart-bar chart-bar--four" style={{ height: '82%' }} />
              <div className="chart-bar chart-bar--five" style={{ height: '68%' }} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
