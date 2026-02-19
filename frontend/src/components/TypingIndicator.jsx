export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-4 py-3">
            <div className="w-2 h-2 bg-accent-400 rounded-full typing-dot" />
            <div className="w-2 h-2 bg-accent-400 rounded-full typing-dot" />
            <div className="w-2 h-2 bg-accent-400 rounded-full typing-dot" />
        </div>
    );
}
