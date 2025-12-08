import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="flex-1 gap-4">
                <Link to="/dashboard" className="btn btn-ghost text-xl">DocuWare Integration</Link>

                {user && (
                    <div className="flex gap-2">
                        <Link
                            to="/dashboard"
                            className={`btn btn-sm ${location.pathname === '/dashboard' ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/analytics"
                            className={`btn btn-sm ${location.pathname === '/analytics' ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            Analytics
                        </Link>
                        {(!localStorage.getItem(`docuware_control_visible_${user.username}`) || localStorage.getItem(`docuware_control_visible_${user.username}`) !== 'false') && (
                            <Link
                                to="/semaforos"
                                className={`btn btn-sm ${location.pathname === '/semaforos' ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                Controle Documental
                            </Link>
                        )}
                    </div>
                )}
            </div>
            <div className="flex-none">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm">Hello, {user.username}</span>
                        <button onClick={logout} className="btn btn-sm btn-error">Logout</button>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500">Not Logged In</span>
                )}
            </div>
        </div>
    );
};

export default Navbar;
