"use client";
import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '../config';

// API Base URL
// Ensure backend CORS is set for localhost:3000
const API_BASE = `${API_BASE_URL}/api/dashboard`;

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_queries: 0,
    unanswered: 0,
    kb_size: 0,
    ai_handled: 0,
    time_saved_mins: 0
  });
  const [escalations, setEscalations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const statsRes = await fetch(`${API_BASE}/stats`, { headers });
        if (statsRes.status === 401) throw new Error("Unauthorized");
        const statsData = await statsRes.json();
        setStats(statsData);

        const escRes = await fetch(`${API_BASE}/escalations`, { headers });
        const escData = await escRes.json();
        // Fallback for safety if still not an array
        setEscalations(Array.isArray(escData) ? escData : []);

        const histRes = await fetch(`${API_BASE}/history?limit=10`, { headers });
        const histData = await histRes.json();
        setHistory(Array.isArray(histData) ? histData : []);
      } catch (e) {
        console.error("Error fetching data", e);
        if ((e as Error).message === "Unauthorized") {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  }

  if (loading) return <div className="p-10 text-xl text-gray-800">Loading AI Front Desk...</div>;

  return (
    <div className="min-h-screen bg-violet-50/50 p-4 md:p-8 font-sans selection:bg-violet-200 selection:text-violet-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white text-xl font-mono font-bold shadow-lg shadow-violet-200">Z</span>
              Zopit Dashboard
            </h1>
            <div className="flex flex-wrap gap-3 items-center ml-1">
              <span className="text-gray-500 text-sm font-medium">Business Control Center</span>
              <a href="/kb" className="inline-flex items-center bg-white text-violet-700 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-violet-50 transition border border-violet-100 shadow-sm hover:shadow group">
                Manage Knowledge Base <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto bg-white/60 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/50">
            <div className="flex items-center gap-2 px-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-gray-700">System Online</span>
            </div>
            <div className="h-6 w-px bg-gray-200/50 mx-2 hidden md:block"></div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 text-sm font-semibold hover:bg-red-50 px-4 py-2 rounded-xl transition flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 hover:border-violet-100 transition group">
            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1 group-hover:text-violet-500 transition-colors">Total Queries</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_queries}</p>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-violet-200 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
            <h3 className="text-violet-100 text-xs uppercase font-bold tracking-widest mb-1 relative z-10">AI Handled</h3>
            <p className="text-3xl font-bold text-white relative z-10">{stats.ai_handled}</p>
            <p className="text-xs text-violet-200 mt-2 flex items-center gap-1 relative z-10 bg-white/10 w-fit px-2 py-1 rounded-lg">
              ⚡ Saved ~{stats.time_saved_mins} mins
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 hover:border-red-100 transition group">
            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1 group-hover:text-red-500 transition-colors">Pending Action</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.unanswered}</p>
            {stats.unanswered > 0 && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full mt-2 inline-block animate-pulse">Action Required</span>}
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 hover:border-emerald-100 transition group">
            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Knowledge Base</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.kb_size}</p>
            <p className="text-xs text-gray-400 mt-1">Data Points</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
              <h2 className="font-bold text-red-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Action Items
              </h2>
              <span className="text-xs bg-white text-red-600 border border-red-100 px-2 py-1 rounded-full font-bold shadow-sm">{escalations.length}</span>
            </div>
            <div className="p-0">
              {escalations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Check "WhatsApp" on your phone. No pending tickets here. 🎉</p>
                </div>
              ) : (
                <ul>
                  {escalations.map((esc: any) => (
                    <li key={esc.id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition">
                      <div className="flex justify-between mb-3">
                        <span className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">👤</div>
                          {esc.sender || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{new Date(esc.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm mb-4 leading-relaxed">"{esc.query}"</p>

                      <ReplyBox
                        escalationId={esc.id}
                        onReplySuccess={(id) => {
                          setEscalations(prev => prev.filter(e => e.id !== id));
                          setStats(prev => ({ ...prev, unanswered: prev.unanswered - 1, kb_size: prev.kb_size + 1 }));
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">Recent Activity</h2>
            </div>
            <ul className="divide-y">
              {history.map((msg: any) => (
                <li key={msg.id} className="p-4 hover:bg-gray-50 text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={`font-bold mb-1 text-xs uppercase tracking-wider ${msg.sender === 'bot' ? 'text-violet-600' : (msg.sender === 'owner' ? 'text-emerald-600' : 'text-gray-900')
                        }`}>
                        {msg.sender === 'bot' ? 'Zopit AI' : (msg.sender === 'owner' ? 'You' : 'Customer')}
                      </span>
                      <p className="text-gray-600">{msg.text}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyBox({ escalationId, onReplySuccess }: { escalationId: number, onReplySuccess: (id: number) => void }) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!reply.trim()) return;
    setSending(true);

    const token = localStorage.getItem('token');
    const formData = new URLSearchParams();
    formData.append('escalation_id', escalationId.toString());
    formData.append('reply_text', reply);

    try {
      const res = await fetch(`${API_BASE}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      if (res.ok) {
        onReplySuccess(escalationId);
      } else {
        alert("Failed to send reply");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-2 text-right">
      <textarea
        className="w-full border border-gray-200 p-3 rounded-xl text-sm text-gray-900 mb-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition shadow-sm resize-none"
        placeholder="Type your answer to resolve this..."
        rows={2}
        value={reply}
        onChange={e => setReply(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={sending || !reply.trim()}
          className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
        >
          {sending ? 'Sending...' : 'Reply & Verify'}
        </button>
      </div>
    </div>
  );
}
