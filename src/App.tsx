import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TradingJournal from './pages/TradingJournal';
import Accounts from './pages/Accounts';
import TodoList from './pages/TodoList';
import Planner from './pages/Planner';
// import { useAuth } from './context/AuthContext';

function App() {
  // const { user } = useAuth(); // Not needed here anymore, handled in ProtectedRoute

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<Layout />}>
        {/* Dashboard: Trader Only */}
        <Route element={<ProtectedRoute allowedRoles={['TRADER']} />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        {/* Planner: Trader Only */}
        <Route element={<ProtectedRoute allowedRoles={['TRADER']} />}>
          <Route path="/planner" element={<Planner />} />
        </Route>

        {/* Shared Routes: Trader & Parent */}
        <Route element={<ProtectedRoute allowedRoles={['TRADER', 'PARENT']} />}>
          <Route path="/journal" element={<TradingJournal />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/todo" element={<TodoList />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
