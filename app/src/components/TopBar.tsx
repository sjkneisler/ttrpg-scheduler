/** @jsxImportSource @emotion/react */
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { css } from '@emotion/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useSchedule } from '../hooks/useSchedule';
import { useScheduleUser } from '../hooks/useScheduleUser';

export const TopBar: React.FC = () => {
  const schedule = useSchedule();
  const user = useScheduleUser();

  return (
    <AppBar
      position="relative"
      css={css`
        flex: 0 0 auto;
      `}
    >
      <Toolbar disableGutters>
        <Container maxWidth={false}>
          <Stack direction="row" justifyContent="space-between">
            <Stack
              direction="row"
              css={css`
                gap: 30px;
              `}
            >
              <ButtonBase component={Link} to="/">
                <Typography variant="h4">TTRPG Scheduler</Typography>
              </ButtonBase>
              {schedule && (
                <ButtonBase
                  component={Link}
                  to={`/schedule/${schedule?.inviteCode}`}
                >
                  <Typography variant="h5">
                    Schedule: {schedule.name}
                  </Typography>
                </ButtonBase>
              )}
              {schedule && user && (
                <ButtonBase
                  component={Link}
                  to={`/schedule/${schedule.inviteCode}/user/${user.id}`}
                >
                  <Typography variant="h5">User: {user.name}</Typography>
                </ButtonBase>
              )}
            </Stack>
            <Box alignContent="center">
              <ButtonBase component={Link} to="/attributions">
                <Typography variant="body2">Attributions</Typography>
              </ButtonBase>
            </Box>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
};
