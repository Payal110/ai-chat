import { Plus, Trash2, MessageSquare, LogOut, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ sessions, activeId, onSelect, onCreate, onDelete, collapsed }) {
    const { user, logout } = useAuth();

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 86400000) return 'Today';
        if (diff < 172800000) return 'Yesterday';
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    if (collapsed) return null;

    return (
        <div className="w-72 h-full bg-dark-800 border-r border-dark-600/60 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-dark-600/60">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-dark-50 text-sm">NexusAI</span>
                </div>
                <button
                    onClick={onCreate}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-200 text-sm hover:bg-dark-600 hover:border-accent-500/30 hover:text-dark-100 transition-all duration-300"
                >
                    <Plus size={16} />
                    New Chat
                </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {sessions.length === 0 && (
                    <p className="text-dark-400 text-sm text-center mt-8 px-4">
                        No conversations yet. Start a new chat!
                    </p>
                )}
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => onSelect(session.id)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${session.id === activeId
                                ? 'bg-dark-700 border border-dark-500/60'
                                : 'hover:bg-dark-700/50 border border-transparent'
                            }`}
                    >
                        <MessageSquare size={14} className={`shrink-0 ${session.id === activeId ? 'text-accent-400' : 'text-dark-400'}`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${session.id === activeId ? 'text-dark-50' : 'text-dark-200'}`}>
                                {session.title}
                            </p>
                            <p className="text-[11px] text-dark-400 mt-0.5">{formatDate(session.updated_at)}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-dark-400 hover:text-red-400 transition-all duration-200"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>

            {/* User */}
            <div className="p-3 border-t border-dark-600/60">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-dark-200">
                            {user?.display_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-100 truncate">{user?.display_name || 'User'}</p>
                        <p className="text-[11px] text-dark-400 truncate">{user?.email || ''}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 text-dark-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}
