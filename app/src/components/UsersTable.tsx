import {
  Button,
  Card,
  Checkbox,
  FormControl,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { Suspense, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { sortBy } from 'lodash';
import { createUser, updateSchedule, updateUser } from '../api/client';
import { getCurrentTimezone } from '../../../common/util/timezones';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { ScheduleContext } from '../contexts/ScheduleContainer';

export const UsersTable: React.FC = () => {
  const [name, setName] = useState('');
  const [schedule, setSchedule, forceScheduleRefresh] =
    useContext(ScheduleContext);
  const navigate = useNavigate();

  const onCreateUserClicked = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!schedule) {
      return;
    }
    const user = await createUser(schedule.id, name, getCurrentTimezone());
    await forceScheduleRefresh();
    navigate(`/schedule/${schedule.inviteCode}/user/${user.id}`);
  };

  const goToUser = (userId: number) => {
    if (!schedule) {
      return;
    }
    navigate(`/schedule/${schedule.inviteCode}/user/${userId}`);
  };

  if (!schedule) {
    return <Suspense />;
  }

  const setUserShown =
    (userId: number) => async (event: React.ChangeEvent<HTMLInputElement>) => {
      const shown = event.target.checked;
      const user = schedule.users.find(
        (scheduleUser) => scheduleUser.id === userId,
      )!;
      const updatedUser = {
        ...user,
        shown,
      };
      const reconstructedUsers = schedule.users.map((scheduleUser) => {
        if (scheduleUser.id === userId) {
          return updatedUser;
        }
        return scheduleUser;
      });

      const newSchedule = {
        ...schedule,
        users: reconstructedUsers,
      };

      setSchedule(newSchedule);
      await updateUser(updatedUser);
    };

  const theme = useTheme();

  return (
    <Card>
      <Stack spacing={2} padding={2}>
        <form onSubmit={onCreateUserClicked}>
          <FormControl fullWidth>
            <CopyToClipboardButton
              value={`${window.location.href}/invite`}
              text="Copy Invite Link"
            />
            <Typography variant="h6" margin={3} align="center">
              OR
            </Typography>
            <TextField
              variant="filled"
              InputLabelProps={{
                style: {
                  color: theme.palette.primary.main,
                },
              }}
              label="Add New Person"
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputProps={{
                'data-lpignore': true,
              }}
            />
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button variant="contained" type="submit" disabled={!name}>
              Create
            </Button>
          </FormControl>
        </form>
        {schedule.users.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>People</TableCell>
              </TableRow>
            </TableHead>
            {sortBy(schedule.users, ['name']).map((user) => (
              <TableRow>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => goToUser(user.id)}>
                    Goto
                  </Button>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.shown}
                    onChange={setUserShown(user.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Stack>
    </Card>
  );
};
