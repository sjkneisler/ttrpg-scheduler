/** @jsxImportSource @emotion/react */
import {
  AppBar,
  Box,
  ButtonBase,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { css } from '@emotion/react';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ScheduleContext } from '../contexts/ScheduleContainer';
import { ScheduleUserContext } from '../contexts/ScheduleUserContainer';

export const TopBar: React.FC = () => {
  const [schedule] = useContext(ScheduleContext);
  const [user] = useContext(ScheduleUserContext);

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
            <Box alignContent="center" justifyContent="center">
              <ButtonBase
                component={Link}
                to="/attributions"
                style={{
                  height: '100%',
                }}
              >
                <Typography variant="body2">Attributions</Typography>
              </ButtonBase>
            </Box>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
};
