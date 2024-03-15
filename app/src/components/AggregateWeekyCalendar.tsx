/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { AggregateAvailability } from '../../../common/types/availability-state';

export const AggregateWeeklyCalendar: React.FC<{
  availability: AggregateAvailability;
}> = ({ availability }) => (
  <div
    css={css`
      display: flex;
      flex-direction: row;
    `}
  >
    <div
      css={css`
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: auto 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        flex-direction: row;
        //border: 1px solid #000000;
      `}
    >
      <HoursGuide />
      <DayView
        day={0}
        editable={false}
        availability={availability[0]}
        setDayTo={() => Promise.resolve()}
      />
      <DayView
        day={1}
        editable={false}
        availability={availability[1]}
        setDayTo={() => Promise.resolve()}
      />
      <DayView
        day={2}
        editable={false}
        availability={availability[2]}
        setDayTo={() => Promise.resolve()}
      />
      <DayView
        day={3}
        editable={false}
        availability={availability[3]}
        setDayTo={() => Promise.resolve()}
      />
      <DayView
        day={4}
        editable={false}
        availability={availability[4]}
        setDayTo={() => Promise.resolve()}
      />
      <DayView
        day={5}
        editable={false}
        availability={availability[5]}
        setDayTo={() => Promise.resolve()}
      />
      <DayView
        day={6}
        editable={false}
        availability={availability[6]}
        setDayTo={() => Promise.resolve()}
      />
      <HoursGuide />
    </div>
  </div>
);
