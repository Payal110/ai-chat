import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Bot, Sparkles } from 'lucide-react';

export default function ChatWindow({ messages, isTyping, starterPrompts, onSelectPrompt }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (messages.length === 0 && !isTyping) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-16 h-16 bg-accent-500/10 border border-accent-500/15 rounded-2xl flex items-center justify-center mb-5">
                    <Bot size={28} className="text-accent-400" />
                </div>
                <h2 className="text-xl font-semibold text-dark-100 mb-2">How can I help you today?</h2>
                <p className="text-dark-400 text-sm text-center max-w-md mb-8">
                    Start a conversation! I can answer questions, write code, analyze data, and much more.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                    {starterPrompts?.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => onSelectPrompt(prompt)}
                            className="text-left px-4 py-3 bg-dark-700/50 border border-dark-500/40 rounded-xl text-sm text-dark-200 hover:bg-dark-700 hover:border-accent-500/20 hover:text-dark-100 transition-all duration-300"
                        >
                            <Bot size={12} className="inline mr-2 text-accent-400 opacity-50" />
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-accent-500/15 border border-accent-500/20 rounded-full flex items-center justify-center shrink-0">
                            <Bot size={16} className="text-accent-400" />
                        </div>
                        <div className="bg-dark-700 border border-dark-500/50 rounded-2xl rounded-tl-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
