import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../Common/ErrorMessage';
import LoadingSpinner from '../Common/LoadingSpinner';

const LoginForm = () => {
    const { login } = useAuth();
    const [url, setUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(url, username, password);
        } catch (err) {
            setError('Login failed. Please check your credentials and URL.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card w-96 bg-base-100 shadow-xl mx-auto mt-10">
            <div className="card-body">
                <h2 className="card-title justify-center">DocuWare Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Platform URL</span>
                        </label>
                        <input
                            type="text"
                            placeholder="https://example.docuware.cloud"
                            className="input input-bordered"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Username</span>
                        </label>
                        <input
                            type="text"
                            placeholder="username"
                            className="input input-bordered"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            placeholder="password"
                            className="input input-bordered"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <ErrorMessage message={error} />

                    <div className="form-control mt-6">
                        {loading ? (
                            <LoadingSpinner />
                        ) : (
                            <button className="btn btn-primary">Login</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
