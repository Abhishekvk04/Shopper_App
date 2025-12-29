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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">AI Front Desk</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-gray-500 text-sm">Business Control Center</span>
              <a href="/kb" className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-100 transition border border-blue-200">
                Manage Knowledge Base →
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto bg-white md:bg-transparent p-3 md:p-0 rounded-xl shadow-sm md:shadow-none border md:border-none border-gray-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">Online</span>
            </div>
            <div className="h-4 w-px bg-gray-200 mx-2 hidden md:block"></div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-xs md:text-sm uppercase font-semibold">Total Queries</h3>
            <p className="text-2xl md:text-4xl font-bold text-gray-800 mt-2">{stats.total_queries}</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-xs md:text-sm uppercase font-semibold">AI Handled</h3>
            <p className="text-2xl md:text-4xl font-bold text-purple-600 mt-2">{stats.ai_handled}</p>
            <p className="text-xs text-green-600 mt-1">Saved ~{stats.time_saved_mins} mins</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <h3 className="text-gray-500 text-xs md:text-sm uppercase font-semibold">Pending</h3>
            <p className="text-2xl md:text-4xl font-bold text-red-600 mt-2">{stats.unanswered}</p>
            {stats.unanswered > 0 && <span className="text-xs text-red-500 animate-pulse">Action Required</span>}
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-xs md:text-sm uppercase font-semibold">Knowledge Base</h3>
            <p className="text-2xl md:text-4xl font-bold text-gray-800 mt-2">{stats.kb_size}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
              <h2 className="font-bold text-red-800">🔴 Action Items (Escalations)</h2>
              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">{escalations.length}</span>
            </div>
            <div className="p-0">
              {escalations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Check "WhatsApp" on your phone. No pending tickets here. 🎉</p>
                </div>
              ) : (
                <ul>
                  {escalations.map((esc: any) => (
                    <li key={esc.id} className="p-6 border-b hover:bg-gray-50 transition">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-800">{esc.sender || "Unknown"}</span>
                        <span className="text-xs text-gray-400">{new Date(esc.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-600 bg-gray-100 p-3 rounded text-sm italic mb-4">"{esc.query}"</p>

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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">💬 Recent Activity</h2>
            </div>
            <ul className="divide-y">
              {history.map((msg: any) => (
                <li key={msg.id} className="p-4 hover:bg-gray-50 text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={`font-bold mb-1 ${msg.sender === 'bot' ? 'text-blue-600' : (msg.sender === 'owner' ? 'text-purple-600' : 'text-gray-800')}`}>
                        {msg.sender === 'bot' ? 'AI Bot' : (msg.sender === 'owner' ? 'Owner' : 'Customer')}
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
    <div className="mt-2">
      <textarea
        className="w-full border p-2 rounded text-sm text-gray-900 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Type your answer here..."
        rows={2}
        value={reply}
        onChange={e => setReply(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={sending || !reply.trim()}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {sending ? 'Sending...' : 'Reply & Verify'}
        </button>
      </div>
    </div>
  );
}
