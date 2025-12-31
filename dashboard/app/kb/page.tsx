"use client";
import React, { useEffect, useState } from 'react';

const API_BASE = "http://localhost:8000/api";

export default function KnowledgeBase() {
    const [entries, setEntries] = useState<any[]>([]);
    const [docs, setDocs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState<{ name: string, content: string } | null>(null);
    const [newA, setNewA] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [lang, setLang] = useState("en-US");

    const languages = [
        { code: "en-US", name: "English" },
        { code: "hi-IN", name: "Hindi (हिंदी)" },
        { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)" },
        { code: "te-IN", name: "Telugu (తెలుగు)" },
        { code: "ta-IN", name: "Tamil (தமிழ்)" },
        { code: "ml-IN", name: "Malayalam (മലയാളം)" }
    ];

    function startListening() {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Your browser does not support voice input. Try Chrome!");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setNewA(prev => prev + (prev ? " " : "") + transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = "/login";
            return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const [kbRes, docsRes] = await Promise.all([
                fetch(`${API_BASE}/knowledge-base`, { headers }),
                fetch(`${API_BASE}/documents`, { headers })
            ]);

            if (kbRes.status === 401 || docsRes.status === 401) {
                window.location.href = "/login";
                return;
            }

            const kbData = await kbRes.json();
            const docsData = await docsRes.json();
            setEntries(Array.isArray(kbData) ? kbData : []);
            setDocs(Array.isArray(docsData) ? docsData : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handlePreview(filename: string) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Fix: Encode filename to handle spaces/special chars
            const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(filename)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setPreviewDoc({ name: data.filename, content: data.content });
        } catch (e) {
            console.error(e);
            alert("Could not load document content. Please try again.");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newA) return;

        // Use the upload endpoint logic but send as file or update api to accept text?
        // Let's send it as a FormData "file" named "manual_input.txt" to reuse the robust upload logic!
        const blob = new Blob([newA], { type: 'text/plain' });
        const formData = new FormData();
        formData.append("file", blob, "manual_input.txt");

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE}/knowledge-base/upload`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            alert("Text Learned! 🧠");
            setNewA("");
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Error adding text");
        }
    }

    return (
        <div className="min-h-screen bg-violet-50/50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage what your AI knows about your business.</p>
                    </div>
                    <a href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-black font-medium transition bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:border-gray-300">
                        <span>←</span> Back
                    </a>
                </header>

                {/* Upload Document Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm mb-8 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                        <span className="p-2 bg-violet-100 text-violet-600 rounded-lg">📄</span>
                        Upload Context
                    </h2>

                    {/* List of Uploaded Docs */}
                    {docs.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {docs.map((doc: string) => (
                                <div key={doc} className="flex items-center bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 gap-2 transition hover:shadow-sm">
                                    <button
                                        onClick={() => handlePreview(doc)}
                                        className="text-violet-700 text-xs font-semibold hover:underline flex items-center gap-1"
                                    >
                                        📄 {doc}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            console.log("Attempting to delete:", doc);
                                            if (!confirm(`Are you sure you want to permanently delete "${doc}"?`)) {
                                                console.log("Deletion processed cancelled by user.");
                                                return;
                                            }
                                            console.log("Sending DELETE request...");
                                            const token = localStorage.getItem('token');
                                            await fetch(`${API_BASE}/documents?filename=${encodeURIComponent(doc)}`, {
                                                method: 'DELETE',
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            console.log("Delete request sent. Refreshing list...");
                                            fetchData();
                                        }}
                                        className="text-gray-400 hover:text-red-600 font-bold ml-1 text-sm p-1"
                                        title="Delete Document"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Preview Modal/Box */}
                    {previewDoc && (
                        <div className="mb-6 p-4 bg-gray-100 rounded border text-sm relative">
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 font-bold"
                            >✕</button>
                            <h3 className="font-bold text-gray-700 mb-2 underline">{previewDoc.name}</h3>
                            <p className="whitespace-pre-wrap text-gray-600">
                                {previewDoc.content.length > 300
                                    ? previewDoc.content.slice(0, 300) + "... (truncated)"
                                    : previewDoc.content}
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-gray-500 mb-4">Upload your menu, services list, or policy document. The AI will read it and learn instantly.</p>
                    <div className="flex gap-4 items-center">
                        <input
                            type="file"
                            accept=".pdf,.txt"
                            onChange={async (e) => {
                                if (!e.target.files?.[0]) return;
                                const file = e.target.files[0];
                                const formData = new FormData();
                                formData.append("file", file);

                                setLoading(true);
                                try {
                                    const token = localStorage.getItem('token');
                                    await fetch(`${API_BASE}/knowledge-base/upload`, {
                                        method: "POST",
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData,
                                    });
                                    alert("Document Uploaded & Learned! 🧠");
                                    fetchData();
                                } catch (err) {
                                    alert("Upload failed");
                                    console.error(err);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">📝 Paste Text Content</h2>

                    {/* Voice Controls */}
                    <div className="flex gap-2 items-center mb-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            className="text-sm p-2 rounded-lg border border-gray-200 text-gray-700 outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                        </select>
                        <button
                            type="button"
                            onClick={startListening}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-black text-white hover:bg-gray-800'}`}
                        >
                            {isListening ? '🎤 Listening...' : '🎤 Speak'}
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Content (Paste text here)</label>
                            <textarea
                                value={newA}
                                onChange={e => setNewA(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm p-4 border text-gray-900 focus:ring-2 focus:ring-violet-500 outline-none transition"
                                placeholder="e.g. paste your entire menu or FAQ page text here..."
                                rows={6}
                            />
                        </div>
                        <button type="submit" className="bg-violet-600 text-white px-6 py-2.5 rounded-full hover:bg-violet-700 w-fit font-semibold shadow-lg shadow-violet-200 transition">
                            Add to Brain 🧠
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-700">📚 Existing Knowledge ({entries.length})</h2>
                    </div>
                    {loading ? <p className="p-6">Loading...</p> : (
                        <ul className="divide-y">
                            {entries.map((entry: any) => (
                                <li key={entry.id} className="p-6">
                                    <p className="font-medium text-gray-900">Q: {entry.question}</p>
                                    <p className="text-gray-600 mt-1">A: {entry.answer}</p>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Source: <span className={`uppercase font-bold tracking-wider ${entry.source === 'learned' ? 'text-violet-500' : 'text-emerald-500'}`}>{entry.source}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
