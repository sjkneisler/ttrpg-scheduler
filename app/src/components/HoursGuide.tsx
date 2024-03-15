/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { hourTimes } from '../utils/hourTimes';

export const HoursGuide: React.FC = () => (
  <>
    <div />
    {hourTimes.map((time) => (
      <div
        css={css`
          text-align: right;
          color: #777777;
          margin-top: -10px;
          width: 80px;
          padding: 0 5px;
        `}
        key={time}
      >
        {time}
      </div>
    ))}
  </>
);
