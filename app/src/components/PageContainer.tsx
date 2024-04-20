/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { TopBar } from './TopBar';

export const PageContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Box
      css={css`
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <TopBar />
      <Box
        css={css`
          flex: 1 1 auto;
          margin: 20px;
        `}
      >
        {children}
      </Box>
    </Box>
  );
};
