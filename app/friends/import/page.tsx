"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { createFriend } from '@/lib/db';

type ImportContact = {
  name: string[];
  tel: string[];
  selected: boolean;
};

function ImportContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ImportContact[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load contacts from sessionStorage
    const stored = sessionStorage.getItem('importContacts');
    if (stored) {
      const parsed = JSON.parse(stored);
      setContacts(parsed.map((c: any) => ({ ...c, selected: true })));
      sessionStorage.removeItem('importContacts');
    } else {
      // No contacts to import, go back
      router.push('/friends');
    }
  }, [router]);

  const toggleContact = (index: number) => {
    setContacts(contacts.map((c, i) =>
      i === index ? { ...c, selected: !c.selected } : c
    ));
  };

  const handleImport = async () => {
    const selectedContacts = contacts.filter(c => c.selected);
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact to import');
      return;
    }

    setImporting(true);
    setProgress(0);

    let imported = 0;
    for (let i = 0; i < selectedContacts.length; i++) {
      const contact = selectedContacts[i];
      try {
        await createFriend({
          name: contact.name[0] || 'Unknown',
          phone: contact.tel[0] || null,
          city: null,
          timezone: 'America/New_York', // Default, they can edit later
          cadence: 'monthly',
          priority: 'high',
          weekday_start: '09:00',
          weekday_end: '17:00',
          weekend_start: '10:00',
          weekend_end: '20:00',
          last_called_at: null,
        });
        imported++;
        setProgress(Math.round((imported / selectedContacts.length) * 100));
      } catch (err) {
        console.error('Failed to import contact:', contact.name[0], err);
      }
    }

    setImporting(false);
    alert(`Imported ${imported} of ${selectedContacts.length} contacts!`);
    router.push('/friends');
  };

  if (contacts.length === 0) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          disabled={importing}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(193, 123, 92, 0.1)',
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="#C17B5C"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1>Import Contacts</h1>
      </div>

      {/* Info */}
      <div
        className="rounded-[20px] p-4 backdrop-blur-md border"
        style={{
          background: 'rgba(232, 146, 100, 0.08)',
          borderColor: 'rgba(232, 146, 100, 0.15)',
        }}
      >
        <p className="text-sm font-sans" style={{ color: '#7A6F65' }}>
          {contacts.filter(c => c.selected).length} of {contacts.length} selected • You can edit details after importing
        </p>
      </div>

      {/* Contacts List */}
      <div className="space-y-2">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            onClick={() => !importing && toggleContact(idx)}
            className="rounded-[20px] p-4 backdrop-blur-md border transition-all duration-200 cursor-pointer"
            style={{
              background: contact.selected
                ? 'rgba(232, 146, 100, 0.1)'
                : 'rgba(255, 252, 249, 0.5)',
              borderColor: contact.selected
                ? 'rgba(232, 146, 100, 0.3)'
                : 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: contact.selected ? '#C17B5C' : 'rgba(193, 123, 92, 0.3)',
                  background: contact.selected ? '#C17B5C' : 'transparent',
                }}
              >
                {contact.selected && (
                  <svg className="w-3 h-3" fill="none" stroke="#FFFCF9" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex-1">
                <p className="font-sans font-medium" style={{ color: '#5C4A3E' }}>
                  {contact.name[0] || 'Unknown'}
                </p>
                <p className="text-sm font-sans opacity-70" style={{ color: '#7A6F65' }}>
                  {contact.tel[0] || 'No phone number'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={importing || contacts.filter(c => c.selected).length === 0}
        className="w-full px-6 py-4 rounded-full font-sans font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
        style={{
          background: importing
            ? 'rgba(193, 123, 92, 0.5)'
            : 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
          color: '#FFFCF9',
          boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3)',
        }}
      >
        {importing ? `Importing... ${progress}%` : `Import ${contacts.filter(c => c.selected).length} Contact(s)`}
      </button>
    </div>
  );
}

export default function ImportContacts() {
  return (
    <AuthGuard>
      <ImportContactsPage />
    </AuthGuard>
  );
}
