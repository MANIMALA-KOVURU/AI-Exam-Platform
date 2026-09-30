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

export default function StudentPerformancePage() {
  const { t } = useLocale();
  return (
    <AppShell title="Performance Analytics" subtitle="Track your progress across subjects and assessments." userName="Asha K" role="Student" navItems={studentNav}>
      <div className="dashboard-shell">
        <div className="dashboard-grid">
          <div className="stat-card"><div className="stat-card-header"><span>{t('Correct Answers')}</span><span className="stat-icon">✓</span></div><strong>214</strong><small>{t('Across 6 tests')}</small></div>
          <div className="stat-card"><div className="stat-card-header"><span>{t('Incorrect')}</span><span className="stat-icon">✕</span></div><strong>26</strong><small>{t('7.8% error rate')}</small></div>
          <div className="stat-card"><div className="stat-card-header"><span>{t('Skipped')}</span><span className="stat-icon">↷</span></div><strong>18</strong><small>{t('2.7% skip rate')}</small></div>
          <div className="stat-card"><div className="stat-card-header"><span>{t('Improvement')}</span><span className="stat-icon">📈</span></div><strong>+12%</strong><small>{t('vs last month')}</small></div>
        </div>

        <div className="content-grid">
          <div className="list-card">
            <h3>{t('Subject Performance')}</h3>
            <div className="summary-row"><span>Algorithms</span><strong>91%</strong></div>
            <div className="summary-row"><span>Database</span><strong>87%</strong></div>
            <div className="summary-row"><span>Operating Systems</span><strong>78%</strong></div>
          </div>
          <div className="summary-card">
            <h3>{t('Performance Summary')}</h3>
            <div className="summary-row"><span>{t('Attempts')}</span><strong>14</strong></div>
            <div className="summary-row"><span>{t('Average Mark')}</span><strong>84/100</strong></div>
            <div className="summary-row"><span>{t('Trend')}</span><strong>{t('Upward')}</strong></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
