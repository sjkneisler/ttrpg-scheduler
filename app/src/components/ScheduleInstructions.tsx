/** @jsxImportSource @emotion/react */
import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { css } from '@emotion/react';

export const ScheduleInstructions: React.FC<{
  exceptions: boolean;
}> = ({ exceptions }) => {
  return (
    <Card>
      <Stack spacing={2} margin={2}>
        <Typography variant="h6">How to use:</Typography>
        <Box>
          •{' '}
          <Typography
            css={css`
              color: #00ff00;
            `}
            display="inline"
          >
            Green
          </Typography>
          ,{' '}
          <Typography
            css={css`
              color: #cbcb00;
            `}
            display="inline"
          >
            Yellow
          </Typography>
          , and{' '}
          <Typography
            css={css`
              color: #ff0000;
            `}
            display="inline"
          >
            Red
          </Typography>{' '}
          are used to represent your Availability:{' '}
          <Typography
            css={css`
              color: #00ff00;
            `}
            display="inline"
          >
            Preferred
          </Typography>
          ,{' '}
          <Typography
            css={css`
              color: #cbcb00;
            `}
            display="inline"
          >
            Not Preferred
          </Typography>
          , and{' '}
          <Typography
            css={css`
              color: #ff0000;
            `}
            display="inline"
          >
            Unavailable
          </Typography>
          , respectively
        </Box>
        <Box>• Left click-and-drag to toggle an area between Green and Red</Box>
        <Box>• Right click-and-drag to set an area to Yellow</Box>
        <Box>• Use the buttons at the top to set a whole day</Box>
        {!exceptions && (
          <Box>
            • Use the button above for Date-Specific availabilities to create
            exceptions to your weekly schedule
          </Box>
        )}
        {exceptions && (
          <Box>• Use the week picker to change your selected date range</Box>
        )}
      </Stack>
    </Card>
  );
};
