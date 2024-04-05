import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import _ from 'lodash';
import dayjs from 'dayjs';
import { Availability } from '../../../common/types/availability-state';
import { DragPosition } from './HoverContext';

export const TimeDetailOverlay: React.FC<{
  startTime: DragPosition;
  userAvailabilities: Record<Availability, string[]>;
}> = ({ startTime, userAvailabilities }) => {
  const startTimeFormatted = dayjs()
    .startOf('day')
    .add(15 * startTime.time, 'minutes')
    .format('h:mmA');

  const maxAvailabilityCount = _.max(
    _.values(userAvailabilities).map(
      (availabilityList) => availabilityList.length,
    ),
  );

  return (
    <div>
      <Typography>{startTimeFormatted}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Green</TableCell>
            <TableCell>Yellow</TableCell>
            <TableCell>Red</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.times(maxAvailabilityCount!, (i) => (
            <TableRow>
              <TableCell>{userAvailabilities[Availability.Green][i]}</TableCell>
              <TableCell>
                {userAvailabilities[Availability.Yellow][i]}
              </TableCell>
              <TableCell>{userAvailabilities[Availability.Red][i]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
