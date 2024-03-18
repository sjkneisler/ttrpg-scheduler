import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

const timezones = Intl.supportedValuesOf('timeZone');

export const TimezonePicker: React.FC<{
  timezone: string | null;
  setTimezone: (timezone: string) => void;
}> = ({ timezone, setTimezone }) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="timezone-select-label">Timezone</InputLabel>
      <Select
        value={timezone}
        onChange={(event) => setTimezone(event.target.value!)}
        labelId="timezone-select-label"
        label="Timezone"
      >
        {timezones.map((timezoneItem) => (
          <MenuItem value={timezoneItem}>{timezoneItem}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
