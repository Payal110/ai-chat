import { useState, useEffect } from 'react';
import { getModels } from '../api/client';
import { ChevronDown } from 'lucide-react';

export default function ModelSelector({ selectedModel, onSelect }) {
    const [models, setModels] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        getModels()
            .then((res) => setModels(res.data))
            .catch(() => {
                // Fallback models if backend is unreachable
                setModels([
                    { id: 'gpt-4o', name: 'gpt-4o', vision: true },
                    { id: 'gpt-4o-mini', name: 'gpt-4o-mini', vision: true },
                    { id: 'deepseek-chat', name: 'deepseek-chat', vision: false },
                ]);
            });
    }, []);

    const current = models.find((m) => m.id === selectedModel) || models[0];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-sm text-dark-200 hover:border-accent-500/30 hover:text-dark-100 transition-all duration-300"
            >
                <span className="font-medium">{current?.name || 'Select Model'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute bottom-full mb-2 left-0 w-52 bg-dark-800 border border-dark-500 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50 animate-fade-in">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => { onSelect(model.id); setOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-dark-700 transition-colors ${model.id === selectedModel ? 'text-accent-400 bg-accent-500/5' : 'text-dark-200'
                                }`}
                        >
                            <span>{model.name}</span>
                            {model.vision && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-accent-500/10 text-accent-400 rounded-md">vision</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
