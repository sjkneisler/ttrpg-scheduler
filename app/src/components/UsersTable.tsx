import {
  Button,
  Card,
  FormControl,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../api/client';
import { getCurrentTimezone } from '../../../common/util/timezones';
import { useSchedule } from '../hooks/useSchedule';

export const UsersTable: React.FC = () => {
  const [name, setName] = useState('');
  const schedule = useSchedule();
  const navigate = useNavigate();

  const onCreateUserClicked = async () => {
    if (!schedule) {
      return;
    }
    const user = await createUser(schedule.id, name, getCurrentTimezone());
    navigate(`/schedule/${schedule.id}/user/${user.id}`);
  };

  const goToUser = (userId: number) => {
    if (!schedule) {
      return;
    }
    navigate(`/schedule/${schedule.id}/user/${userId}`);
  };

  if (!schedule) {
    return <Suspense />;
  }

  return (
    <Card>
      <Stack spacing={2} padding={2}>
        <Typography variant="h4">People</Typography>
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
        </FormControl>
        {schedule.users.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            {schedule.users.map((user) => (
              <TableRow>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => goToUser(user.id)}>
                    See User
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Stack>
    </Card>
  );
};
