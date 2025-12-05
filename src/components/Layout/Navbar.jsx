import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">DocuWare Integration</a>
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
