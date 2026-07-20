import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import LogWorkout from './pages/LogWorkout';
import EditWorkout from './pages/EditWorkout';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⚡' },
  { to: '/log', label: 'Log Workout', icon: '✚' },
  { to: '/history', label: 'History', icon: '📋' },
];

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          WORKOUT<span>TRACK</span>
        </div>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span>{n.icon}</span> {n.label}
          </NavLink>
        ))}
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/edit/:id" element={<EditWorkout />} />
        </Routes>
      </main>
    </div>
  );
}
