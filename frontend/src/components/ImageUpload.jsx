import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

export default function ImageUpload({ imagePreview, onImageSelect, onClear }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result.split(',')[1]; // strip data:...;base64,
            onImageSelect(base64, ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {imagePreview ? (
                <div className="relative inline-block">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-dark-500"
                    />
                    <button
                        onClick={onClear}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
                    >
                        <X size={10} className="text-white" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-dark-400 hover:text-accent-400 hover:bg-dark-700 rounded-lg transition-all duration-200"
                    title="Upload image"
                >
                    <ImagePlus size={20} />
                </button>
            )}
        </>
    );
}
