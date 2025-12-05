import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Features/LoginForm';

const LoginPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-base-200 flex flex-col justify-center">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold">DocuWare Integration</h1>
                <p className="py-6">Secure & Modular Web App</p>
            </div>
            <LoginForm />
        </div>
    );
};

export default LoginPage;
