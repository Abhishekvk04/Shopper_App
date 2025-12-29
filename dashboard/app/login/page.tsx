"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'recover_username' | 'recover_code'>('login');
  const [recoverPhone, setRecoverPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    auth_code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRecover(type: 'username' | 'code') {
    if (!recoverPhone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: recoverPhone, type: type })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Recovery failed');

      setSuccessMsg(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-black">shopper.</Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">
          {mode === 'login' ? 'Welcome back.' : 'Recovery'}
        </h1>
        <p className="text-gray-500 mb-8">
          {mode === 'login' ? 'Enter your details to access your shop.' : 'We will send details to your WhatsApp.'}
        </p>

        {error && <div className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-md">{error}</div>}
        {successMsg && <div className="text-green-600 text-sm mb-6 bg-green-50 p-3 rounded-md">{successMsg}</div>}

        {mode === 'login' ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  className="w-full border-b border-gray-300 py-3 text-lg bg-transparent outline-none focus:border-black transition placeholder:text-gray-400 text-black"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Access Code (6 digits)"
                  required
                  className="w-full border-b border-gray-300 py-3 text-lg bg-transparent outline-none focus:border-black transition placeholder:text-gray-400 text-black"
                  value={formData.auth_code}
                  onChange={e => setFormData({ ...formData, auth_code: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white mt-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Log in'}
              </button>
            </form>

            <div className="mt-8 flex flex-col gap-3 text-sm text-center">
              <button onClick={() => { setMode('recover_code'); setError(''); setSuccessMsg('') }} className="text-gray-500 hover:text-black transition">
                Forgot Access Code?
              </button>
              <button onClick={() => { setMode('recover_username'); setError(''); setSuccessMsg('') }} className="text-gray-500 hover:text-black transition">
                Forgot Username?
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have a shop? <a href="/signup" className="text-black font-semibold hover:underline">Sign up</a>
            </p>
          </>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              {mode === 'recover_username'
                ? 'Enter your registered phone number to recover your Username via WhatsApp.'
                : 'Enter your registered phone number. We will send a NEW Access Code to your WhatsApp.'}
            </p>
            <div>
              <input
                type="text"
                placeholder="Phone Number (WhatsApp)"
                className="w-full border-b border-gray-300 py-3 text-lg bg-transparent outline-none focus:border-black transition placeholder:text-gray-400 text-black"
                value={recoverPhone}
                onChange={e => setRecoverPhone(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleRecover(mode === 'recover_username' ? 'username' : 'code')}
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Recovery Info'}
            </button>

            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg('') }}
              className="w-full text-gray-500 text-sm hover:text-black transition"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
