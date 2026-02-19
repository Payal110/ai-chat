import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSessions, createSession, deleteSession, getMessages, sendMessage as apiSendMessage, uploadDocument } from '../api/client';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ModelSelector from '../components/ModelSelector';
import ImageUpload from '../components/ImageUpload';
import { Send, PanelLeftClose, PanelLeftOpen, Paperclip, FileText } from 'lucide-react';

export default function Chat() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [imageBase64, setImageBase64] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [attachedDoc, setAttachedDoc] = useState(null);

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsTyping(true);
        try {
            const res = await uploadDocument(file);
            setAttachedDoc({ name: file.name, content: res.data.content });
        } catch (err) {
            console.error('Failed to upload document', err);
            alert('Failed to process document. Please try again.');
        } finally {
            setIsTyping(false);
        }
    };

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    // Load messages when session changes
    useEffect(() => {
        if (activeSessionId) {
            loadMessages(activeSessionId);
        } else {
            setMessages([]);
        }
    }, [activeSessionId]);

    const loadSessions = async () => {
        try {
            const res = await getSessions();
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to load sessions', err);
        }
    };

    const loadMessages = async (sessionId) => {
        try {
            const res = await getMessages(sessionId);
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    };

    const handleCreateSession = async () => {
        try {
            const res = await createSession('New Chat');
            setSessions((prev) => [res.data, ...prev]);
            setActiveSessionId(res.data.id);
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        try {
            await deleteSession(sessionId);
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
            }
        } catch (err) {
            console.error('Failed to delete session', err);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() && !imageBase64 && !attachedDoc) return;

        // Auto-create session if none active
        let sessionId = activeSessionId;
        if (!sessionId) {
            try {
                const res = await createSession('New Chat');
                sessionId = res.data.id;
                setSessions((prev) => [res.data, ...prev]);
                setActiveSessionId(sessionId);
            } catch {
                return;
            }
        }

        let finalContent = input.trim();
        if (attachedDoc) {
            finalContent = `[User uploaded document: ${attachedDoc.name}]\n\nDocument Content:\n${attachedDoc.content}\n\n---\n\nUser Question: ${finalContent || "Please summarize or review this document."}`;
            setAttachedDoc(null);
        }

        const userContent = finalContent;
        setInput('');
        const sentImage = imageBase64;
        setImageBase64(null);
        setImagePreview(null);
        setIsTyping(true);

        // Optimistic update
        const tempUserMsg = {
            id: 'temp-user-' + Date.now(),
            session_id: sessionId,
            role: 'user',
            content: userContent,
            image_url: sentImage ? '[image]' : null,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMsg]);

        try {
            const res = await apiSendMessage(sessionId, userContent, selectedModel, sentImage);
            // Replace temp msg and add assistant msg
            setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
                return [...filtered, res.data.user_message, res.data.assistant_message];
            });
            // Refresh sessions to update title
            loadSessions();
        } catch (err) {
            const errorMsg = {
                id: 'error-' + Date.now(),
                session_id: sessionId,
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.',
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSelectPrompt = (prompt) => {
        setInput(prompt);
        // We use a small timeout to ensure state is updated before sending
        setTimeout(() => {
            const btn = document.querySelector('button[type="submit"]');
            btn?.click();
        }, 50);
    };

    const STARTER_PROMPTS = [
        'Explain quantum computing in simple terms',
        'Write a Python function for sorting',
        'Help me debug my React component',
        'Summarize the latest AI research trends',
    ];

    return (
        <div className="h-screen flex bg-dark-900">
            {/* Sidebar */}
            <Sidebar
                sessions={sessions}
                activeId={activeSessionId}
                onSelect={setActiveSessionId}
                onCreate={handleCreateSession}
                onDelete={handleDeleteSession}
                collapsed={sidebarCollapsed}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600/50 bg-dark-900/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-1.5 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-lg transition-all duration-200"
                        >
                            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                        </button>
                        <h2 className="text-sm font-medium text-dark-200 truncate">
                            {sessions.find((s) => s.id === activeSessionId)?.title || 'New Conversation'}
                        </h2>
                    </div>
                    <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
                </div>

                {/* Messages */}
                <ChatWindow
                    messages={messages}
                    isTyping={isTyping}
                    starterPrompts={STARTER_PROMPTS}
                    onSelectPrompt={handleSelectPrompt}
                />

                {/* Input Area */}
                <div className="p-4 border-t border-dark-600/50 bg-dark-900/80 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto">
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mb-3">
                                <ImageUpload
                                    imagePreview={imagePreview}
                                    onImageSelect={() => { }}
                                    onClear={() => { setImageBase64(null); setImagePreview(null); }}
                                />
                            </div>
                        )}

                        {/* Document Attachment Badge */}
                        {attachedDoc && (
                            <div className="mb-3 flex items-center gap-2 p-2 bg-accent-500/10 border border-accent-500/20 rounded-lg animate-fade-in">
                                <FileText size={16} className="text-accent-400" />
                                <span className="text-xs text-dark-100 truncate flex-1">{attachedDoc.name}</span>
                                <button
                                    onClick={() => setAttachedDoc(null)}
                                    className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-dark-100 leading-none"
                                >
                                    &times;
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                            <div className="flex gap-1">
                                {!imagePreview && (
                                    <ImageUpload
                                        imagePreview={null}
                                        onImageSelect={(base64, preview) => { setImageBase64(base64); setImagePreview(preview); }}
                                        onClear={() => { setImageBase64(null); setImagePreview(null); }}
                                    />
                                )}

                                {!attachedDoc && (
                                    <label className="p-2.5 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-xl transition-all duration-200 cursor-pointer">
                                        <Paperclip size={20} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleDocumentUpload}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="flex-1 relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="w-full px-4 py-3 bg-dark-800 border border-dark-500 rounded-xl text-dark-50 placeholder-dark-400 focus:outline-none focus:border-accent-500/40 focus:ring-1 focus:ring-accent-500/15 transition-all duration-300 resize-none text-sm"
                                    style={{ minHeight: '48px', maxHeight: '150px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={(!input.trim() && !imageBase64) || isTyping}
                                className="p-3 bg-accent-600 text-white rounded-xl hover:bg-accent-500 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent-500/15"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
