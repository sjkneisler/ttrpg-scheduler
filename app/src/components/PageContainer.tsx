/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { TopBar } from './TopBar';

export const PageContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <div
      css={css`
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <TopBar />
      <div
        css={css`
          flex: 1 1 auto;
          margin: 20px;
        `}
      >
        {children}
      </div>
    </div>
  );
};
