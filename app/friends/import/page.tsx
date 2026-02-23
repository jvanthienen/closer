"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { createFriend, createImportantDate } from '@/lib/db';
import { parsePhoneNumber } from 'libphonenumber-js';

type Contact = {
  name: string;
  phone: string;
  birthday?: { month: number; day: number };
  anniversary?: { month: number; day: number };
  customDates?: Array<{ label: string; month: number; day: number }>; // For kids' birthdays, etc.
  selected: boolean;
};

function ImportContactsPage() {
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'input' | 'review'>('input');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseVCard(text);

      if (parsed.length === 0) {
        alert('No contacts found in file. Please check the format.');
        return;
      }

      setContacts(parsed);
      setStep('review');
    } catch (err) {
      console.error('Failed to parse vCard:', err);
      alert('Failed to import contacts. Please try again.');
    }
  };

  const parseVCard = (vcfText: string): Contact[] => {
    const contacts: Contact[] = [];
    const vcards = vcfText.split('BEGIN:VCARD');

    for (const vcard of vcards) {
      if (!vcard.trim()) continue;

      let name = '';
      let phone = '';
      let birthday: { month: number; day: number } | undefined;
      let anniversary: { month: number; day: number } | undefined;
      const customDates: Array<{ label: string; month: number; day: number }> = [];

      // Extract FN (Full Name)
      const fnMatch = vcard.match(/FN[;:](.+)/);
      if (fnMatch) {
        name = fnMatch[1].trim().replace(/\r?\n/g, '');
      }

      // Extract TEL (Phone) - handle both formats
      const telMatch = vcard.match(/TEL[;:](.+)/);
      if (telMatch) {
        let telValue = telMatch[1].trim().replace(/\r?\n/g, '');

        // If it contains a colon, extract the part after it
        if (telValue.includes(':')) {
          telValue = telValue.split(':').pop()!.trim();
        }

        phone = telValue;
      }

      // Extract BDAY (Birthday) - format: YYYYMMDD or YYYY-MM-DD
      const bdayMatch = vcard.match(/BDAY[;:](.+)/);
      if (bdayMatch) {
        const bdayValue = bdayMatch[1].trim().replace(/\r?\n/g, '');
        const parsed = parseDateString(bdayValue);
        if (parsed) birthday = parsed;
      }

      // Extract ANNIVERSARY - format: YYYYMMDD or YYYY-MM-DD
      const annivMatch = vcard.match(/ANNIVERSARY[;:](.+)/);
      if (annivMatch) {
        const annivValue = annivMatch[1].trim().replace(/\r?\n/g, '');
        const parsed = parseDateString(annivValue);
        if (parsed) anniversary = parsed;
      }

      // Extract custom dates (e.g., kids' birthdays) - X-ABDATE fields
      // Format: item1.X-ABDATE:1604-01-29 and item1.X-ABLabel:Baby Casia
      const abDateRegex = /(item\d+)\.X-ABDATE[;:](.+)/g;
      const abLabelRegex = /(item\d+)\.X-ABLabel:(.+)/g;

      // Create maps of item -> date and item -> label
      const dateMap = new Map<string, string>();
      const labelMap = new Map<string, string>();

      let match;
      while ((match = abDateRegex.exec(vcard)) !== null) {
        const itemId = match[1];
        const dateValue = match[2].trim().replace(/\r?\n/g, '');
        dateMap.set(itemId, dateValue);
      }

      while ((match = abLabelRegex.exec(vcard)) !== null) {
        const itemId = match[1];
        const label = match[2].trim().replace(/\r?\n/g, '');
        labelMap.set(itemId, label);
      }

      // Match dates with labels
      for (const [itemId, dateValue] of dateMap.entries()) {
        const label = labelMap.get(itemId);
        if (label) {
          const parsed = parseDateString(dateValue);
          if (parsed) {
            customDates.push({
              label: label.trim(),
              month: parsed.month,
              day: parsed.day,
            });
          }
        }
      }

      if (name || phone) {
        contacts.push({
          name: name || 'Unknown',
          phone: phone,
          birthday,
          anniversary,
          customDates: customDates.length > 0 ? customDates : undefined,
          selected: true,
        });
      }
    }

    return contacts;
  };

  const parseDateString = (dateStr: string): { month: number; day: number } | null => {
    // Remove any non-digit/hyphen characters
    let cleaned = dateStr.trim().replace(/[^\d-]/g, '');

    // Handle --MMDD format (no year)
    if (cleaned.startsWith('--')) {
      cleaned = cleaned.substring(2);
      if (cleaned.length === 4) {
        return {
          month: parseInt(cleaned.substring(0, 2)),
          day: parseInt(cleaned.substring(2, 4)),
        };
      }
    }

    // Try YYYY-MM-DD format
    if (cleaned.includes('-')) {
      const parts = cleaned.split('-').filter(p => p);
      if (parts.length >= 2) {
        // Could be YYYY-MM-DD or --MM-DD or MM-DD
        const month = parts.length === 3 ? parseInt(parts[1]) : parseInt(parts[0]);
        const day = parts.length === 3 ? parseInt(parts[2]) : parseInt(parts[1]);
        return { month, day };
      }
    }

    // Try YYYYMMDD format
    if (cleaned.length === 8) {
      return {
        month: parseInt(cleaned.substring(4, 6)),
        day: parseInt(cleaned.substring(6, 8)),
      };
    }

    // Try MMDD format (4 digits, no year)
    if (cleaned.length === 4) {
      return {
        month: parseInt(cleaned.substring(0, 2)),
        day: parseInt(cleaned.substring(2, 4)),
      };
    }

    return null;
  };

  const inferCityFromPhone = (phone: string): { city: string | null; timezone: string } => {
    try {
      console.log('🔍 Parsing phone:', phone);

      // Try parsing without country hint first (for international format like +61...)
      let parsed = parsePhoneNumber(phone);
      console.log('📞 Parsed result (no hint):', parsed);

      // If that fails and the number doesn't start with +, try with US as default
      if (!parsed && !phone.trim().startsWith('+')) {
        console.log('🔍 Retrying with US as default country...');
        try {
          parsed = parsePhoneNumber(phone, 'US');
          console.log('📞 Parsed result (US hint):', parsed);
        } catch (e) {
          console.log('❌ Failed to parse even with US hint:', e);
        }
      }

      if (!parsed) {
        console.log('❌ No parsed result');
        return { city: null, timezone: 'America/New_York' };
      }

      const country = parsed.country;
      console.log('🌍 Country code:', country);

      if (!country) {
        console.log('❌ No country detected');
        return { city: null, timezone: 'America/New_York' };
      }

      // Map countries to default cities and timezones
      const countryDefaults: Record<string, { city: string; timezone: string }> = {
        'US': { city: 'New York', timezone: 'America/New_York' },
        'GB': { city: 'London', timezone: 'Europe/London' },
        'AU': { city: 'Sydney', timezone: 'Australia/Sydney' },
        'CA': { city: 'Toronto', timezone: 'America/Toronto' },
        'FR': { city: 'Paris', timezone: 'Europe/Paris' },
        'DE': { city: 'Berlin', timezone: 'Europe/Berlin' },
        'ES': { city: 'Madrid', timezone: 'Europe/Madrid' },
        'IT': { city: 'Rome', timezone: 'Europe/Rome' },
        'NL': { city: 'Amsterdam', timezone: 'Europe/Amsterdam' },
        'BE': { city: 'Brussels', timezone: 'Europe/Brussels' },
        'CH': { city: 'Zurich', timezone: 'Europe/Zurich' },
        'AT': { city: 'Vienna', timezone: 'Europe/Vienna' },
        'SE': { city: 'Stockholm', timezone: 'Europe/Stockholm' },
        'NO': { city: 'Oslo', timezone: 'Europe/Oslo' },
        'DK': { city: 'Copenhagen', timezone: 'Europe/Copenhagen' },
        'FI': { city: 'Helsinki', timezone: 'Europe/Helsinki' },
        'IE': { city: 'Dublin', timezone: 'Europe/Dublin' },
        'PT': { city: 'Lisbon', timezone: 'Europe/Lisbon' },
        'GR': { city: 'Athens', timezone: 'Europe/Athens' },
        'PL': { city: 'Warsaw', timezone: 'Europe/Warsaw' },
        'CZ': { city: 'Prague', timezone: 'Europe/Prague' },
        'HU': { city: 'Budapest', timezone: 'Europe/Budapest' },
        'RO': { city: 'Bucharest', timezone: 'Europe/Bucharest' },
        'BG': { city: 'Sofia', timezone: 'Europe/Sofia' },
        'HR': { city: 'Zagreb', timezone: 'Europe/Zagreb' },
        'SI': { city: 'Ljubljana', timezone: 'Europe/Ljubljana' },
        'SK': { city: 'Bratislava', timezone: 'Europe/Bratislava' },
        'LT': { city: 'Vilnius', timezone: 'Europe/Vilnius' },
        'LV': { city: 'Riga', timezone: 'Europe/Riga' },
        'EE': { city: 'Tallinn', timezone: 'Europe/Tallinn' },
        'JP': { city: 'Tokyo', timezone: 'Asia/Tokyo' },
        'CN': { city: 'Beijing', timezone: 'Asia/Shanghai' },
        'KR': { city: 'Seoul', timezone: 'Asia/Seoul' },
        'IN': { city: 'Mumbai', timezone: 'Asia/Kolkata' },
        'SG': { city: 'Singapore', timezone: 'Asia/Singapore' },
        'HK': { city: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
        'TW': { city: 'Taipei', timezone: 'Asia/Taipei' },
        'TH': { city: 'Bangkok', timezone: 'Asia/Bangkok' },
        'MY': { city: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur' },
        'ID': { city: 'Jakarta', timezone: 'Asia/Jakarta' },
        'PH': { city: 'Manila', timezone: 'Asia/Manila' },
        'VN': { city: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh' },
        'NZ': { city: 'Auckland', timezone: 'Pacific/Auckland' },
        'BR': { city: 'São Paulo', timezone: 'America/Sao_Paulo' },
        'MX': { city: 'Mexico City', timezone: 'America/Mexico_City' },
        'AR': { city: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
        'CL': { city: 'Santiago', timezone: 'America/Santiago' },
        'CO': { city: 'Bogotá', timezone: 'America/Bogota' },
        'PE': { city: 'Lima', timezone: 'America/Lima' },
        'VE': { city: 'Caracas', timezone: 'America/Caracas' },
        'CR': { city: 'San José', timezone: 'America/Costa_Rica' },
        'PA': { city: 'Panama City', timezone: 'America/Panama' },
        'GT': { city: 'Guatemala City', timezone: 'America/Guatemala' },
        'HN': { city: 'Tegucigalpa', timezone: 'America/Tegucigalpa' },
        'SV': { city: 'San Salvador', timezone: 'America/El_Salvador' },
        'NI': { city: 'Managua', timezone: 'America/Managua' },
        'BZ': { city: 'Belize City', timezone: 'America/Belize' },
        'ZA': { city: 'Johannesburg', timezone: 'Africa/Johannesburg' },
        'EG': { city: 'Cairo', timezone: 'Africa/Cairo' },
        'NG': { city: 'Lagos', timezone: 'Africa/Lagos' },
        'KE': { city: 'Nairobi', timezone: 'Africa/Nairobi' },
        'IL': { city: 'Tel Aviv', timezone: 'Asia/Jerusalem' },
        'AE': { city: 'Dubai', timezone: 'Asia/Dubai' },
        'SA': { city: 'Riyadh', timezone: 'Asia/Riyadh' },
        'TR': { city: 'Istanbul', timezone: 'Europe/Istanbul' },
        'RU': { city: 'Moscow', timezone: 'Europe/Moscow' },
        'UA': { city: 'Kyiv', timezone: 'Europe/Kiev' },
      };

      const result = countryDefaults[country] || { city: null, timezone: 'America/New_York' };
      console.log('✅ Inferred location:', result);
      return result;
    } catch (err) {
      console.log('❌ Error parsing phone:', err);
      return { city: null, timezone: 'America/New_York' };
    }
  };

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
        // Infer city and timezone from phone number
        const { city, timezone } = contact.phone ? inferCityFromPhone(contact.phone) : { city: null, timezone: 'America/New_York' };
        console.log(`📝 Creating friend "${contact.name}" with city: "${city}", timezone: "${timezone}"`);

        const friend = await createFriend({
          name: contact.name,
          phone: contact.phone || null,
          city: city,
          timezone: timezone,
          cadence: 'monthly',
          priority: 'high',
          weekday_start: '09:00',
          weekday_end: '17:00',
          weekend_start: '10:00',
          weekend_end: '20:00',
          last_called_at: null,
        });

        // Add birthday if present
        if (contact.birthday) {
          await createImportantDate({
            friend_id: friend.id,
            label: 'Birthday',
            month: contact.birthday.month,
            day: contact.birthday.day,
          });
        }

        // Add anniversary if present
        if (contact.anniversary) {
          await createImportantDate({
            friend_id: friend.id,
            label: 'Anniversary',
            month: contact.anniversary.month,
            day: contact.anniversary.day,
          });
        }

        // Add custom dates (kids' birthdays, etc.)
        if (contact.customDates) {
          for (const customDate of contact.customDates) {
            await createImportantDate({
              friend_id: friend.id,
              label: customDate.label,
              month: customDate.month,
              day: customDate.day,
            });
          }
        }

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

        {/* Upload vCard */}
        <div
          className="rounded-[24px] p-6 backdrop-blur-md border space-y-4"
          style={{
            background: 'rgba(232, 146, 100, 0.08)',
            borderColor: 'rgba(232, 146, 100, 0.2)',
            boxShadow: '0 4px 16px rgba(232, 146, 100, 0.08)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(232, 146, 100, 0.15) 0%, rgba(193, 123, 92, 0.1) 100%)',
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="#C17B5C"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-sans font-medium" style={{ color: '#5C4A3E' }}>
                Import from iPhone
              </h3>
              <p className="text-sm font-sans opacity-70" style={{ color: '#7A6F65' }}>
                1. Open Contacts app<br />
                2. Select contacts → Share → Save to Files<br />
                3. Upload the .vcf file below
              </p>
            </div>
          </div>

          <label className="block">
            <input
              type="file"
              accept=".vcf,.vcard"
              onChange={handleFileUpload}
              className="hidden"
              id="vcf-upload"
            />
            <div
              className="w-full px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer text-center"
              style={{
                background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
                color: '#FFFCF9',
                boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3)',
              }}
            >
              Choose vCard File (.vcf)
            </div>
          </label>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'rgba(193, 123, 92, 0.2)' }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-sm font-sans" style={{ background: '#FBF6F1', color: '#7A6F65' }}>
              or paste manually
            </span>
          </div>
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
            Paste contacts
          </h3>
          <p className="text-sm font-sans opacity-70" style={{ color: '#7A6F65' }}>
            One per line in this format:
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
                {(contact.birthday || contact.anniversary || (contact.customDates && contact.customDates.length > 0)) && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {contact.birthday && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(232, 146, 100, 0.15)',
                          color: '#C17B5C',
                        }}
                      >
                        🎂 {contact.birthday.month}/{contact.birthday.day}
                      </span>
                    )}
                    {contact.anniversary && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(232, 146, 100, 0.15)',
                          color: '#C17B5C',
                        }}
                      >
                        💍 {contact.anniversary.month}/{contact.anniversary.day}
                      </span>
                    )}
                    {contact.customDates && contact.customDates.map((customDate, dateIdx) => (
                      <span
                        key={dateIdx}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(139, 195, 74, 0.15)',
                          color: '#689F38',
                        }}
                      >
                        👶 {customDate.label}: {customDate.month}/{customDate.day}
                      </span>
                    ))}
                  </div>
                )}
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
