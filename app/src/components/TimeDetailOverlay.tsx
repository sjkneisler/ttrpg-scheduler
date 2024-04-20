/** @jsxImportSource @emotion/react */
import React from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import _ from 'lodash';
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { Availability } from '../../../common/types/availability-state';
import { DragPosition } from './HoverContext';
import { getColorFromAvailabilityState } from '../utils/availbility-states';

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
    <Box>
      <Card>
        <Box
          padding={2}
          css={css`
            color: #eeeeee;
          `}
        >
          <Typography>{startTimeFormatted}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  css={css`
                    color: ${getColorFromAvailabilityState(Availability.Green)};
                  `}
                >
                  Green
                </TableCell>
                <TableCell
                  css={css`
                    color: ${getColorFromAvailabilityState(
                      Availability.Yellow,
                    )};
                  `}
                >
                  Yellow
                </TableCell>
                <TableCell
                  css={css`
                    color: ${getColorFromAvailabilityState(Availability.Red)};
                  `}
                >
                  Red
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.times(maxAvailabilityCount!, (i) => (
                <TableRow>
                  <TableCell>
                    {userAvailabilities[Availability.Green][i]}
                  </TableCell>
                  <TableCell>
                    {userAvailabilities[Availability.Yellow][i]}
                  </TableCell>
                  <TableCell>
                    {userAvailabilities[Availability.Red][i]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};
