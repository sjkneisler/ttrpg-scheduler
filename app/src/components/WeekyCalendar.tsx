/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';

enum Day {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

const times: string[] = [
  '12:00 AM',
  '1:00 AM',
  '2:00 AM',
  '3:00 AM',
  '4:00 AM',
  '5:00 AM',
  '6:00 AM',
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
  '11:00 PM',
];

function getDayText(day: Day): string {
  switch (day) {
    case Day.Sunday:
      return 'Sunday';
    case Day.Monday:
      return 'Monday';
    case Day.Tuesday:
      return 'Tuesday';
    case Day.Wednesday:
      return 'Wednesday';
    case Day.Thursday:
      return 'Thursday';
    case Day.Friday:
      return 'Friday';
    case Day.Saturday:
      return 'Saturday';
    default:
      throw new Error("shouldn't get here!");
  }
}

const DayView: React.FC<{ day: Day }> = ({ day }) => {
  const availability: { color: string, key: number }[] = _.times<{ color: string, key: number }>(
    24,
    (num) => ({
      key: num,
      color: '#FF0000',
    }),
  );
  return (
    <div>
      <div css={css`
                text-align: center;
                margin: 10px 0;
            `}
      >
        {getDayText(day)}
      </div>
      <div css={css`
                flex: 0 0 auto;
                display: flex;
                flex-direction: column;
            `}
      >
        {availability.map((item) => (
          <div
            key={item.key}
            css={css`
                            background-color: ${item.color};
                            border: 1px solid #b60505;
                            display: flex;
                            flex-direction: column;
                        `}
          >
            {_.times(
              4,
              (num) => (
                <div
                  key={num}
                  css={css`
                                        flex: 1 1 auto;
                                        width: 100px;
                                        height: 8px;
                                        border: 1px solid #9d0505;
                                    `}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Guide: React.FC = () => (
  <div css={css`
        padding: 30px 5px 0 5px;
        text-align: right;
        color: #777777;
    `}
  >
    {times.map((time) => (
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

export const WeeklyCalendar: React.FC = () => (
  <div css={css`
        display: flex;
        flex-direction: row;
    `}
  >
    <Guide />
    <DayView day={Day.Sunday} />
    <DayView day={Day.Monday} />
    <DayView day={Day.Tuesday} />
    <DayView day={Day.Wednesday} />
    <DayView day={Day.Thursday} />
    <DayView day={Day.Friday} />
    <DayView day={Day.Saturday} />
    <Guide />
  </div>
);
