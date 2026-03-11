"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SendEmailPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ recipient: "", recipientEmail: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getSmsEmailLogs("?type=email")])
      .then(([cRes, lRes]) => { setCustomers(cRes.data || []); setLogs(lRes.data || []); })
      .catch(console.error);
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSelectCustomer = (e) => {
    const cust = customers.find((c) => c._id === e.target.value);
    if (cust) setForm((prev) => ({ ...prev, recipient: cust.name, recipientEmail: cust.email || "" }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await api.sendEmail(form);
      setResult({ type: "success", text: res.message });
      setLogs((prev) => [res.data, ...prev]);
      setForm({ recipient: "", recipientEmail: "", subject: "", message: "" });
    } catch (err) {
      setResult({ type: "error", text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Send Email</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSend} className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Compose Email</h2>
          {result && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${result.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {result.text}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer (optional)</label>
              <select onChange={handleSelectCustomer} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Choose customer —</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name} {c.email ? `(${c.email})` : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name *</label>
              <input name="recipient" required value={form.recipient} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Recipient name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input name="recipientEmail" type="email" required value={form.recipientEmail} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input name="subject" required value={form.subject} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email subject" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea name="message" required rows={5} value={form.message} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type your email content here..." />
            </div>
          </div>
          <button type="submit" disabled={sending} className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {sending ? "Sending..." : "Send Email"}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700 text-sm">Email History</div>
          <div className="overflow-y-auto max-h-96">
            {logs.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">No email logs yet</p>
            ) : logs.map((log) => (
              <div key={log._id} className="px-4 py-3 border-b last:border-0 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{log.recipient}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${log.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{log.status}</span>
                </div>
                <p className="text-xs text-gray-500">{log.recipientEmail}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{log.subject}</p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{log.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
