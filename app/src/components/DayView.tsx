/** @jsxImportSource @emotion/react */
import React, { useContext } from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';
import { DayAvailability } from '../../../common/types/availability-state';
import { Day } from '../../../common/types/day';
import { getColorFromAvailabilityState } from '../utils/availbility-states';
import { DragContext } from './DragContext';
import { getDayText } from '../utils/day';

export const DayView: React.FC<{ day: Day, availability: DayAvailability }> = ({
  day,
  availability,
}) => {
  const {
    onDragStart,
    onDragEnd,
    onDrag,
  } = useContext(DragContext);
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
        {_.times(24, (hourCount) => (
          <div
            key={hourCount}
            css={css`
                            border: 1px solid #00000055;
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
                                        border: 1px solid #00000055;
                                        background-color: ${getColorFromAvailabilityState(availability[hourCount * 4 + num])};
                                    `}
                  onMouseMove={() => onDrag({ day, time: hourCount * 4 + num })}
                  onMouseDown={() => onDragStart({ day, time: hourCount * 4 + num })}
                  onMouseUp={() => onDragEnd({ day, time: hourCount * 4 + num })}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
