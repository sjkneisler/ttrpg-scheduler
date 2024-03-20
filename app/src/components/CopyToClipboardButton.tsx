import { Button, Snackbar } from '@mui/material';
import React, { useState } from 'react';

export const CopyToClipboardButton: React.FC<{
  value: string;
  text: string;
  // eslint-disable-next-line react/prop-types
}> = ({ value, text }) => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
    // eslint-disable-next-line no-void
    void navigator.clipboard.writeText(value);
  };

  return (
    <>
      <Button onClick={handleClick} variant="contained">
        {text}
      </Button>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message="Copied to clipboard"
      />
    </>
  );
};
