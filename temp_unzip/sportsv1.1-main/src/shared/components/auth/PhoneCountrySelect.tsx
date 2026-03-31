import React from 'react';

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

const COUNTRIES: CountryOption[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
];

export type PhoneCountryValue = {
  code: string;
  dialCode: string;
};

type Props = {
  value: PhoneCountryValue;
  onChange: (val: PhoneCountryValue) => void;
  id?: string;
  disabled?: boolean;
};

export const PhoneCountrySelect: React.FC<Props> = ({ value, onChange, id = 'country', disabled }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">Country</label>
      <select
        id={id}
        className="flex-1 h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        value={value.code}
        onChange={(e) => {
          const next = COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0];
          onChange({ code: next.code, dialCode: next.dialCode });
        }}
        disabled={disabled}
        title="Select country"
      >
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name} ({c.dialCode})
          </option>
        ))}
      </select>
      <div className="h-11 px-3 flex items-center rounded-md border border-slate-300 bg-slate-50 text-sm font-medium text-slate-700">
        {value.dialCode}
      </div>
    </div>
  );
};
