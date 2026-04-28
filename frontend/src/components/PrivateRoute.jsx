import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;