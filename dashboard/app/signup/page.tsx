"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '../config';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    company_name: '',
    phone_number: '',
    category: 'Bakery',
    address: '',
    latitude: 0,
    longitude: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const router = useRouter();

  function getLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      return;
    }
    setLocationStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationStatus("Location Acquired ✅");
      },
      () => {
        setLocationStatus("Unable to retrieve location");
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.latitude === 0) {
      setError("Please capture your location.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');

      if (data.code) {
        setAccessCode(data.code);
      } else {
        alert("Account created! Check your WhatsApp/Console for the code.");
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-black flex items-center justify-center gap-2">
            <span className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-lg font-mono font-bold">Z</span>
            Zopit.
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">
          Create Account
        </h1>
        <p className="text-gray-500 mb-8">
          Join thousands of local businesses growing with AI.
        </p>

        {error && <div className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-md">{error}</div>}

        {!accessCode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full border-b border-gray-300 py-3 text-lg bg-transparent outline-none focus:border-violet-600 transition placeholder:text-gray-400 text-black"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Business Name"
                required
                className="w-full border-b border-gray-300 py-3 text-lg bg-transparent outline-none focus:border-violet-600 transition placeholder:text-gray-400 text-black"
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="WhatsApp Number"
                required
                className="w-full border-b border-gray-300 py-3 text-lg bg-transparent outline-none focus:border-violet-600 transition placeholder:text-gray-400 text-black"
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1 block">Category</label>
              <select
                className="w-full border-b border-gray-300 py-2 text-lg bg-transparent outline-none focus:border-violet-600 transition text-black"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Bakery">Bakery</option>
                <option value="Clinic">Clinic</option>
                <option value="Salon">Salon</option>
                <option value="Grocery">Grocery</option>
                <option value="Restaurant">Restaurant</option>
              </select>
            </div>

            <div className="pt-2">
              <textarea
                placeholder="Full Address"
                required
                className="w-full border-b border-gray-300 py-3 text-lg bg-transparent outline-none focus:border-violet-600 transition placeholder:text-gray-400 text-black resize-none"
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="pt-4 pb-2">
              <button
                type="button"
                onClick={getLocation}
                className={`w-full py-3 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 border ${locationStatus.includes("✅") ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
              >
                {locationStatus ? locationStatus : "📍 Capture Shop Location"}
              </button>
              {formData.latitude !== 0 && (
                <p className="text-xs text-center text-gray-400 mt-2 font-mono">{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3.5 rounded-full font-medium hover:bg-violet-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? 'Creating...' : 'Get Access Code'}
            </button>
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account? <a href="/login" className="text-black font-semibold hover:underline">Log in</a>
            </p>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl">
              <p className="font-bold text-xl mb-4 text-black">🎉 You're in.</p>
              <p className="text-sm text-gray-500 mb-4">Here is your secret access code:</p>
              <div className="bg-white px-4 py-4 rounded border border-gray-300 font-mono text-3xl font-bold tracking-widest select-all text-black mb-4">
                {accessCode}
              </div>
              <p className="text-xs text-gray-400">Keep this safe. You'll need it to log in.</p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full border border-gray-300 text-black py-3 rounded-full font-medium hover:bg-gray-50 transition"
            >
              Copy Code
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-violet-600 text-white py-3 rounded-full font-medium hover:bg-violet-700 transition"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div >
  );
}
