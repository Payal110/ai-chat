import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex gap-3 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 bg-accent-500/15 border border-accent-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-accent-400" />
                </div>
            )}

            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser
                    ? 'bg-accent-600/25 border border-accent-500/20 rounded-tr-sm'
                    : 'bg-dark-700 border border-dark-500/50 rounded-tl-sm'
                }`}>
                {message.image_url && (
                    <div className="mb-2 text-xs text-dark-300 flex items-center gap-1">
                        📎 Image attached
                    </div>
                )}

                {isUser ? (
                    <p className="text-dark-50 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="markdown-body text-sm text-dark-100">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeStr = String(children).replace(/\n$/, '');

                                    if (!inline && match) {
                                        return (
                                            <div className="relative group my-3">
                                                <div className="flex items-center justify-between bg-dark-800 border border-dark-500 rounded-t-lg px-3 py-1.5">
                                                    <span className="text-xs text-dark-400 font-mono">{match[1]}</span>
                                                    <button
                                                        onClick={() => copyCode(codeStr)}
                                                        className="text-dark-400 hover:text-dark-100 transition-colors"
                                                    >
                                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: 0,
                                                        borderTopLeftRadius: 0,
                                                        borderTopRightRadius: 0,
                                                        borderBottomLeftRadius: '0.5rem',
                                                        borderBottomRightRadius: '0.5rem',
                                                        background: '#161b22',
                                                        border: '1px solid #30363d',
                                                        borderTop: 'none',
                                                    }}
                                                    {...props}
                                                >
                                                    {codeStr}
                                                </SyntaxHighlighter>
                                            </div>
                                        );
                                    }
                                    return (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                <div className="mt-1.5 text-[10px] text-dark-400">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {isUser && (
                <div className="w-8 h-8 bg-dark-600 border border-dark-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-dark-200" />
                </div>
            )}
        </div>
    );
}
