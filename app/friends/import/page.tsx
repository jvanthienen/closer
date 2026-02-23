"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { createFriend } from '@/lib/db';

type Contact = {
  name: string;
  phone: string;
  selected: boolean;
};

function ImportContactsPage() {
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'input' | 'review'>('input');

  const parseContacts = () => {
    const lines = textInput.trim().split('\n');
    const parsed: Contact[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Try to parse "Name, Phone" or "Name Phone" format
      const parts = line.split(',').map(p => p.trim());

      if (parts.length >= 2) {
        // Format: "Name, Phone"
        parsed.push({
          name: parts[0],
          phone: parts[1],
          selected: true,
        });
      } else {
        // Try to extract phone number from the line
        const phoneMatch = line.match(/[\d\s\-\+\(\)]+/);
        const phone = phoneMatch ? phoneMatch[0].trim() : '';
        const name = line.replace(phone, '').trim();

        parsed.push({
          name: name || 'Unknown',
          phone: phone,
          selected: true,
        });
      }
    }

    if (parsed.length === 0) {
      alert('No contacts found. Please check the format.');
      return;
    }

    setContacts(parsed);
    setStep('review');
  };

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
          name: contact.name,
          phone: contact.phone || null,
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
        console.error('Failed to import contact:', contact.name, err);
      }
    }

    setImporting(false);
    alert(`Imported ${imported} of ${selectedContacts.length} contacts!`);
    router.push('/friends');
  };

  if (step === 'input') {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
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

        {/* Instructions */}
        <div
          className="rounded-[24px] p-6 backdrop-blur-md border space-y-3"
          style={{
            background: 'rgba(255, 252, 249, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 98, 74, 0.08)',
          }}
        >
          <h3 className="font-sans font-medium" style={{ color: '#5C4A3E' }}>
            How to import
          </h3>
          <p className="text-sm font-sans opacity-70" style={{ color: '#7A6F65' }}>
            Paste your contacts below, one per line:
          </p>
          <div
            className="rounded-xl p-3 font-mono text-xs"
            style={{
              background: 'rgba(193, 123, 92, 0.08)',
              color: '#7A6F65',
            }}
          >
            John Doe, +1 234 567 8900<br />
            Jane Smith, +1 098 765 4321<br />
            Bob Johnson, +44 20 1234 5678
          </div>
        </div>

        {/* Text Input */}
        <div>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste contacts here..."
            rows={12}
            className="w-full px-4 py-3 rounded-2xl font-sans text-sm resize-none"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(193, 123, 92, 0.2)',
              color: '#3D2817',
            }}
          />
        </div>

        {/* Parse Button */}
        <button
          onClick={parseContacts}
          disabled={!textInput.trim()}
          className="w-full px-6 py-4 rounded-full font-sans font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
            color: '#FFFCF9',
            boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3)',
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Review step
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep('input')}
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

        <h1>Review & Import</h1>
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
                  {contact.name}
                </p>
                <p className="text-sm font-sans opacity-70" style={{ color: '#7A6F65' }}>
                  {contact.phone || 'No phone number'}
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
