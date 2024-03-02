/** @jsxImportSource @emotion/react */
import React, { useContext, useMemo, useState } from 'react';
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

const DragContext = React.createContext<{
  onDragStart:(pos: DragPosition) => void;
  onDragEnd: (pos: DragPosition) => void;
  onDrag: (pos: DragPosition) => void;
}>({
      onDragStart: () => null,
      onDragEnd: () => null,
      onDrag: () => null,
    });

enum AvailabilityState {
  GREEN,
  YELLOW,
  RED,
}

function getColorFromAvailabilityState(state: AvailabilityState): string {
  switch (state) {
    case AvailabilityState.YELLOW:
      return '#FFFF00';
    case AvailabilityState.RED:
      return '#FF0000';
    case AvailabilityState.GREEN:
      return '#00FF00';
    default:
      return '#FF00FF';
  }
}

const DayView: React.FC<{ day: Day, availability: DayAvailability }> = ({ day, availability }) => {
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

interface DragPosition {
  day: Day;
  time: number; // Time here represents an index of 15-minute blocks from 0 to 95
}

// TODO: Revisit these types to be better but still space efficient in the database
type DayAvailability = AvailabilityState[];
type WeekAvailability = DayAvailability[];

function generateInitialAvailabilities(): WeekAvailability {
  return _.times(7, () => _.times(96, () => AvailabilityState.GREEN));
}

function updateAvailabilityBox(
  week: WeekAvailability,
  start: DragPosition,
  end: DragPosition,
  newValue: AvailabilityState,
): WeekAvailability {
  return _.times(7, (day) => _.times(96, (time) => {
    if (day >= start.day && day <= end.day && time >= start.time && time <= end.time) {
      return newValue;
    }
    return week[day][time];
  }));
}

export const WeeklyCalendar: React.FC = () => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<DragPosition | null>(null);
  // const [dragEnd, setDragEnd] = useState<DragPosition | null>(null);

  const [states, setStates] = useState(generateInitialAvailabilities());

  const onDragStart = (pos: DragPosition) => {
    console.log(`Drag start ${pos}`);
    setDragging(true);
    setDragStart(pos);
    // setDragEnd(pos);
    const initialValue = states[pos!.day][pos!.time];
    const newValue = initialValue === AvailabilityState.RED
      ? AvailabilityState.GREEN
      : AvailabilityState.RED;
    setStates(updateAvailabilityBox(states, pos!, pos!, newValue));
  };
  const onDragEnd = (pos: DragPosition) => {
    console.log(`Drag end ${pos}`);
    // TODO: Why am I getting no dragStart here?  It's probably a state/useMemo issue
    console.log(`Drag end  - start ${dragStart}`);
    setDragging(false);
    setDragStart(null);
    // setDragEnd(null);
    // TODO: Update the availability state here
    const initialValue = states[dragStart!.day][dragStart!.time];
    const newValue = initialValue === AvailabilityState.RED
      ? AvailabilityState.GREEN
      : AvailabilityState.RED;
    setStates(updateAvailabilityBox(states, dragStart!, pos!, newValue));
  };
  const onDrag = (pos: DragPosition) => {
    console.log(`Drag ${pos}`);
    if (dragging) {
      const startPos = dragStart || pos;
      // setDragEnd(pos);
      const initialValue = states[startPos!.day][startPos!.time];
      const newValue = initialValue === AvailabilityState.RED
        ? AvailabilityState.GREEN
        : AvailabilityState.RED;
      setStates(updateAvailabilityBox(states, startPos!, pos!, newValue));
    }
  };

  const dragContextValue = useMemo(() => ({
    onDragStart,
    onDragEnd,
    onDrag,
  }), []);

  return (
    <DragContext.Provider value={dragContextValue}>

      <div css={css`
                display: flex;
                flex-direction: row;
            `}
      >
        <Guide />
        <DayView day={Day.Sunday} availability={states[0]} />
        <DayView day={Day.Monday} availability={states[1]} />
        <DayView day={Day.Tuesday} availability={states[2]} />
        <DayView day={Day.Wednesday} availability={states[3]} />
        <DayView day={Day.Thursday} availability={states[4]} />
        <DayView day={Day.Friday} availability={states[5]} />
        <DayView day={Day.Saturday} availability={states[6]} />
        <Guide />
      </div>
    </DragContext.Provider>
  );
};
