/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { AggregateAvailability } from '../../../common/types/availability-state';

export const AggregateWeeklyCalendar: React.FC<{
  availability: AggregateAvailability,
}> = ({ availability }) => (
  <div
    css={css`
                  display: flex;
                  flex-direction: row;
              `}
  >
    <HoursGuide editable={false} />
    <div
      css={css`
                      display: flex;
                      flex-direction: row;
                      //border: 1px solid #000000;
                  `}
    >
      <DayView day={0} editable={false} availability={availability[0]} setDayTo={() => null} />
      <DayView day={1} editable={false} availability={availability[1]} setDayTo={() => null} />
      <DayView day={2} editable={false} availability={availability[2]} setDayTo={() => null} />
      <DayView day={3} editable={false} availability={availability[3]} setDayTo={() => null} />
      <DayView day={4} editable={false} availability={availability[4]} setDayTo={() => null} />
      <DayView day={5} editable={false} availability={availability[5]} setDayTo={() => null} />
      <DayView day={6} editable={false} availability={availability[6]} setDayTo={() => null} />
    </div>
    <HoursGuide editable={false} />
  </div>
);