'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

type AppShellProps = {
  title: string;
  subtitle?: string;
  userName: string;
  role: string;
  navItems: NavItem[];
  children: ReactNode;
};

export function AppShell({ title, subtitle, userName, role, navItems, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark--small">A</div>
          <div>
            <div className="brand-name">AI Exam</div>
            <div className="brand-subtitle">Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={active ? 'nav-item nav-item--active' : 'nav-item'}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="secondary-btn secondary-btn--dark">Logout</button>
        </div>
      </aside>

      <div className="main-panel">
        <header className="top-header">
          <div>
            <p className="eyebrow eyebrow--dark">{role}</p>
            <h1 className="page-title">{title}</h1>
            {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
          </div>

          <div className="header-user">
            <button className="icon-btn" aria-label="Notifications">🔔</button>
            <div className="user-pill">
              <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="user-name">{userName}</div>
                <div className="user-role">{role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-body">{children}</div>
      </div>
    </main>
  );
}
