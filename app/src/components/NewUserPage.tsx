import React, { Suspense, useState } from 'react';
import {
  Button,
  Container,
  FormControl,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from './PageContainer';
import { useSchedule } from '../hooks/useSchedule';
import { createUser } from '../api/client';
import { getCurrentTimezone } from '../../../common/util/timezones';

export const NewUserPage: React.FC = () => {
  const [name, setName] = useState('');
  const schedule = useSchedule();
  const navigate = useNavigate();

  const onCreateUserClicked = async () => {
    if (!schedule) {
      return;
    }
    const user = await createUser(schedule.id, name, getCurrentTimezone());
    navigate(`/schedule/${schedule.inviteCode}/user/${user.id}`);
  };

  const onGoToScheduleClicked = () => {
    navigate(`/schedule/${schedule?.inviteCode}`);
  };

  if (!schedule) {
    return <Suspense />;
  }
  return (
    <PageContainer>
      <Container maxWidth="xs">
        <Stack direction="column" alignSelf="center">
          <Typography variant="h4" margin={3} align="center">
            Enter Name
          </Typography>
          <FormControl fullWidth>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputProps={{
                'data-lpignore': true,
              }}
            />
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button
              variant="outlined"
              onClick={onCreateUserClicked}
              disabled={!name}
            >
              Create Person
            </Button>
            <Typography variant="h6" margin={3} align="center">
              OR
            </Typography>
            <Button variant="outlined" onClick={onGoToScheduleClicked}>
              Go To Schedule
            </Button>
          </FormControl>
        </Stack>
      </Container>
    </PageContainer>
  );
};
