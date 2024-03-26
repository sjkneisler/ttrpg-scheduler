/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';
import { ScheduleGranularity } from '@prisma/client';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { AggregateAvailability } from '../../../common/types/availability-state';

export const AggregateWeeklyCalendar: React.FC<{
  availability: AggregateAvailability;
  labels?: string[];
  granularity: ScheduleGranularity;
}> = ({
  availability,
  labels = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  granularity,
}) => (
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
      {_.times(7, (index) => (
        <DayView
          day={index}
          editable={false}
          availability={availability[index]}
          setDayTo={() => Promise.resolve()}
          label={labels[index]}
          granularity={granularity}
        />
      ))}
      <HoursGuide />
    </div>
  </div>
);
