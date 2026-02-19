import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, LogIn, Mail, User } from 'lucide-react';

export default function Login() {
    const { loginDemo } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('demo@example.com');
    const [name, setName] = useState('Demo User');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDemoLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loginDemo(email, name);
            navigate('/chat');
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMicrosoftLogin = () => {
        window.location.href = '/api/auth/login';
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-30%] right-[-20%] w-[500px] h-[500px] bg-purple-500/6 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-accent-500/20 mb-4">
                        <Bot size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-50">Welcome Back</h1>
                    <p className="text-dark-300 mt-1">Sign in to continue to NexusAI</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8">
                    {/* Microsoft Login */}
                    <button
                        onClick={handleMicrosoftLogin}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-50 font-medium hover:bg-dark-600 hover:border-accent-500/30 transition-all duration-300 mb-6"
                    >
                        <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                        </svg>
                        Sign in with Microsoft
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-dark-500" />
                        <span className="text-sm text-dark-400">or use demo account</span>
                        <div className="flex-1 h-px bg-dark-500" />
                    </div>

                    {/* Demo Form */}
                    <form onSubmit={handleDemoLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">
                                <Mail size={14} className="inline mr-1.5" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-500 rounded-xl text-dark-50 placeholder-dark-400 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all duration-300"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-1.5">
                                <User size={14} className="inline mr-1.5" />
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-500 rounded-xl text-dark-50 placeholder-dark-400 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all duration-300"
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 hover:from-accent-500 hover:to-purple-500 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <LogIn size={18} />
                            {loading ? 'Signing in...' : 'Sign in (Demo)'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
