import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';

import Dashboard from './pages/Dashboard';

// Placeholder components - will be created in next steps
const Login = () => <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h1 className="text-3xl font-bold text-gray-900">Login Page</h1><p className="mt-2 text-gray-600">Login component will be implemented</p></div></div>;
const Register = () => <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h1 className="text-3xl font-bold text-gray-900">Register Page</h1><p className="mt-2 text-gray-600">Register component will be implemented</p></div></div>;

// Protected Route Component
interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    // TODO: Temporary bypass for development - remove this when Auth is fully ready
    // if (!isAuthenticated) {
    //     return <Navigate to="/login" replace />;
    // }

    return <>{children}</>;
};

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default App;
