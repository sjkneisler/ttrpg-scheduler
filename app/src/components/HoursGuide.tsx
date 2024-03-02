/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { hourTimes } from '../utils/hourTimes';

export const HoursGuide: React.FC = () => (
  <div css={css`
        padding: 30px 5px 0 5px;
        text-align: right;
        color: #777777;
    `}
  >
    {hourTimes.map((time) => (
      <div
        css={css`
                    height: 37.71px;
                `}
        key={time}
      >
        {time}
      </div>
    ))}
  </div>
);
