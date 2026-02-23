"use client";

import { useEffect, useRef, useState } from 'react';

type CityAutocompleteProps = {
  value: string;
  onChange: (city: string, timezone: string) => void;
};

// Timezone mapping from Google Places timezone IDs to IANA
const getTimezoneFromPlace = (place: google.maps.places.PlaceResult): string => {
  // We'll use a simple mapping based on the place location
  // This is a fallback - ideally we'd use the Google Timezone API
  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();

  if (!lat || !lng) return 'America/New_York';

  // Simple timezone estimation based on longitude
  // This is approximate - for production you'd want the Timezone API
  const offset = Math.round(lng / 15);

  // Common timezone mappings
  const timezoneMap: { [key: number]: string } = {
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Halifax',
    '-3': 'America/Sao_Paulo',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Athens',
    '3': 'Europe/Moscow',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Singapore',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '12': 'Pacific/Auckland',
  };

  return timezoneMap[offset] || 'America/New_York';
};

export default function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      initAutocomplete();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      initAutocomplete();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['(cities)'],
      fields: ['name', 'geometry', 'address_components'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (place.name && place.geometry) {
        // Get the city name from address components
        let cityName = place.name;

        // Try to get a cleaner city name from address_components
        if (place.address_components) {
          const cityComponent = place.address_components.find(
            (component) => component.types.includes('locality')
          );
          if (cityComponent) {
            cityName = cityComponent.long_name;
          }
        }

        const timezone = getTimezoneFromPlace(place);
        setInputValue(cityName);
        onChange(cityName, timezone);
      }
    });
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Start typing a city..."
      className="w-full px-4 py-3 rounded-2xl font-sans text-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(193, 123, 92, 0.2)',
        color: '#3D2817',
      }}
    />
  );
}

// Extend window type for Google Maps
declare global {
  interface Window {
    google: any;
  }
}
