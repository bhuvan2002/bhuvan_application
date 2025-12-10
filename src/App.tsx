import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TradingJournal from './pages/TradingJournal';
import Accounts from './pages/Accounts';
import TodoList from './pages/TodoList';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={user?.role === 'TRADER' ? <Dashboard /> : <Navigate to="/journal" replace />}
          />
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
