// Common cities with their IANA timezone identifiers
export const TIMEZONES = [
  // Americas
  { city: 'New York', timezone: 'America/New_York', offset: 'UTC-5' },
  { city: 'Los Angeles', timezone: 'America/Los_Angeles', offset: 'UTC-8' },
  { city: 'Chicago', timezone: 'America/Chicago', offset: 'UTC-6' },
  { city: 'Denver', timezone: 'America/Denver', offset: 'UTC-7' },
  { city: 'Mexico City', timezone: 'America/Mexico_City', offset: 'UTC-6' },
  { city: 'Toronto', timezone: 'America/Toronto', offset: 'UTC-5' },
  { city: 'São Paulo', timezone: 'America/Sao_Paulo', offset: 'UTC-3' },
  { city: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', offset: 'UTC-3' },

  // Europe
  { city: 'London', timezone: 'Europe/London', offset: 'UTC+0' },
  { city: 'Paris', timezone: 'Europe/Paris', offset: 'UTC+1' },
  { city: 'Berlin', timezone: 'Europe/Berlin', offset: 'UTC+1' },
  { city: 'Madrid', timezone: 'Europe/Madrid', offset: 'UTC+1' },
  { city: 'Rome', timezone: 'Europe/Rome', offset: 'UTC+1' },
  { city: 'Amsterdam', timezone: 'Europe/Amsterdam', offset: 'UTC+1' },
  { city: 'Stockholm', timezone: 'Europe/Stockholm', offset: 'UTC+1' },
  { city: 'Moscow', timezone: 'Europe/Moscow', offset: 'UTC+3' },

  // Asia
  { city: 'Dubai', timezone: 'Asia/Dubai', offset: 'UTC+4' },
  { city: 'Mumbai', timezone: 'Asia/Kolkata', offset: 'UTC+5:30' },
  { city: 'Bangkok', timezone: 'Asia/Bangkok', offset: 'UTC+7' },
  { city: 'Singapore', timezone: 'Asia/Singapore', offset: 'UTC+8' },
  { city: 'Hong Kong', timezone: 'Asia/Hong_Kong', offset: 'UTC+8' },
  { city: 'Shanghai', timezone: 'Asia/Shanghai', offset: 'UTC+8' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 'UTC+9' },
  { city: 'Seoul', timezone: 'Asia/Seoul', offset: 'UTC+9' },

  // Oceania
  { city: 'Sydney', timezone: 'Australia/Sydney', offset: 'UTC+10' },
  { city: 'Melbourne', timezone: 'Australia/Melbourne', offset: 'UTC+10' },
  { city: 'Auckland', timezone: 'Pacific/Auckland', offset: 'UTC+12' },

  // Africa
  { city: 'Cairo', timezone: 'Africa/Cairo', offset: 'UTC+2' },
  { city: 'Johannesburg', timezone: 'Africa/Johannesburg', offset: 'UTC+2' },
  { city: 'Lagos', timezone: 'Africa/Lagos', offset: 'UTC+1' },
];

export function getCityTimezone(city: string): string | undefined {
  return TIMEZONES.find(tz => tz.city === city)?.timezone;
}

export function getTimezoneCity(timezone: string): string | undefined {
  return TIMEZONES.find(tz => tz.timezone === timezone)?.city;
}
