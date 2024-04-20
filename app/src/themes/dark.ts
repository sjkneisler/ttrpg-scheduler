import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    text: {
      primary: '#EEEEEE',
    },
    mode: 'dark',
    background: {
      paper: '#222',
      default: '#1A1A1A',
    },
  },
});
