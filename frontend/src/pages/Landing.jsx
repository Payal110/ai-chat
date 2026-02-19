/*
 * ═══════════════════════════════════════════════════════════════
 * LANDING PAGE — Competition Customization Zone
 * ═══════════════════════════════════════════════════════════════
 * UPDATE THE CONFIG BELOW FOR EACH COMPETITION.
 * No other file changes needed for branding!
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Zap, Shield, ArrowRight, Bot, Brain, MessageSquare } from 'lucide-react';

// ╔═══════════════════════════════════════════════════════════╗
// ║  EDIT THIS SECTION FOR EACH COMPETITION                   ║
// ╚═══════════════════════════════════════════════════════════╝
const LANDING_CONFIG = {
    appName: 'NexusAI',
    tagline: 'Your Intelligent AI Assistant',
    description:
        'Experience the power of conversational AI with multi-model support, persistent memory, and a beautiful interface designed for productivity.',
    features: [
        {
            icon: Brain,
            title: 'What This App Does',
            description:
                'NexusAI is an advanced conversational assistant that understands context, remembers your preferences, and provides intelligent responses across multiple AI models.',
        },
        {
            icon: Zap,
            title: 'Why It\'s Useful',
            description:
                'Switch between GPT-4o, GPT-Mini, and DeepSeek models seamlessly. The app remembers your conversations and learns your preferences over time.',
        },
        {
            icon: Shield,
            title: 'How It Works',
            description:
                'Simply log in, choose your preferred AI model, and start chatting. Your conversations are saved securely, and the AI adapts to your needs with built-in memory.',
        },
    ],
    ctaText: 'Get Started',
    stats: [
        { label: 'AI Models', value: '4+' },
        { label: 'Response Time', value: '<2s' },
        { label: 'Uptime', value: '99.9%' },
    ],
};
// ╔═══════════════════════════════════════════════════════════╗
// ║  END OF COMPETITION CUSTOMIZATION ZONE                    ║
// ╚═══════════════════════════════════════════════════════════╝

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGetStarted = () => {
        if (user) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/6 rounded-full blur-[140px]" />
                <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-accent-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20">
                        <Bot size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-dark-50">{LANDING_CONFIG.appName}</span>
                </div>
                <button
                    onClick={handleGetStarted}
                    className="px-5 py-2 text-sm font-medium text-dark-50 bg-dark-700 border border-dark-500 rounded-xl hover:bg-dark-600 hover:border-accent-500/50 transition-all duration-300"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 md:pt-28 md:pb-20">
                <div className="animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-sm font-medium">
                        <Sparkles size={14} />
                        Powered by Multiple AI Models
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-dark-50">Meet </span>
                        <span className="gradient-text">{LANDING_CONFIG.appName}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-dark-200 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {LANDING_CONFIG.description}
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-500 text-white font-semibold text-lg rounded-2xl shadow-xl shadow-accent-500/25 hover:shadow-accent-500/40 hover:from-accent-500 hover:to-purple-500 transition-all duration-500 transform hover:scale-[1.03]"
                    >
                        {LANDING_CONFIG.ctaText}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>

                {/* Stats */}
                <div className="flex gap-8 md:gap-16 mt-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {LANDING_CONFIG.stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                            <div className="text-sm text-dark-300 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 px-6 md:px-12 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-dark-50 mb-4">
                        Everything You Need
                    </h2>
                    <p className="text-center text-dark-300 mb-14 max-w-xl mx-auto">
                        A complete AI assistant platform built for speed, intelligence, and reliability.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {LANDING_CONFIG.features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={i}
                                    className="glass rounded-2xl p-8 hover:border-accent-500/40 transition-all duration-500 group animate-fade-in-up"
                                    style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                                >
                                    <div className="w-12 h-12 bg-accent-500/10 border border-accent-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-accent-500/20 group-hover:border-accent-500/40 transition-all duration-300">
                                        <Icon size={22} className="text-accent-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-dark-50 mb-3">{feature.title}</h3>
                                    <p className="text-dark-200 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Chat Preview */}
            <section className="relative z-10 px-6 md:px-12 py-12 md:py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            <span className="ml-4 text-sm text-dark-300">{LANDING_CONFIG.appName} Chat</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <MessageSquare size={14} className="text-accent-400" />
                                </div>
                                <div className="bg-dark-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                                    <p className="text-dark-100 text-sm">Hello! How can I help you today? I can answer questions, write code, analyze data, and much more.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                <div className="bg-accent-600/30 border border-accent-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
                                    <p className="text-dark-100 text-sm">Can you explain how neural networks work?</p>
                                </div>
                                <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-xs text-dark-200 font-medium">U</span>
                                </div>
                            </div>
                            <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                                <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <MessageSquare size={14} className="text-accent-400" />
                                </div>
                                <div className="bg-dark-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                                    <p className="text-dark-100 text-sm">Of course! Neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes that process information...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 text-center py-8 border-t border-dark-600/50">
                <p className="text-dark-400 text-sm">
                    Built with ❤️ · Powered by FastAPI & React · {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
