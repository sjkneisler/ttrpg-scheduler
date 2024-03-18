import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

const timezones = Intl.supportedValuesOf('timeZone');

export const TimezonePicker: React.FC<{
  timezone: string | null;
  setTimezone: (timezone: string) => void;
  label?: string;
}> = ({ timezone, setTimezone, label = 'Timezone' }) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="timezone-select-label">{label}</InputLabel>
      <Select
        value={timezone}
        onChange={(event) => setTimezone(event.target.value!)}
        labelId="timezone-select-label"
        label={label}
      >
        {timezones.map((timezoneItem) => (
          <MenuItem value={timezoneItem}>{timezoneItem}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
