import dayjs, { Dayjs } from 'dayjs';
import { Theme, TypographyProps } from '@mui/material';
import _ from 'lodash';

export function generateDayLabels(
  week: Dayjs,
  theme: Theme,
): TypographyProps[] {
  const now = dayjs();

  return _.times(7, (index) => {
    const day = week.day(index);
    const startDay = day.startOf('day');
    const endDay = day.endOf('day');
    if (now.isBetween(startDay, endDay)) {
      return {
        color: theme.palette.primary.main,
      };
    }
    return {};
  });
}
