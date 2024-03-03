/** @jsxImportSource @emotion/react */
import React, { Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Table, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { css } from '@emotion/react';
import { createUser } from '../api/client';
import { useSchedule } from '../hooks/useSchedule';
import { AggregateWeeklyCalendar } from './AggregateWeekyCalendar';
import { aggregateAvailability } from '../utils/aggregate';

export const CampaignView: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const schedule = useSchedule();

  const onCreateUserClicked = async () => {
    if (!schedule) {
      return;
    }
    const user = await createUser(schedule.id, name);
    navigate(`/schedule/${schedule.id}/user/${user.id}`);
  };

  const onBack = () => {
    navigate('/');
  };

  const goToUser = (userId: number) => {
    if (!schedule) {
      return;
    }
    navigate(`/schedule/${schedule.id}/user/${userId}`);
  };

  const showAvailability = useMemo(() => {
    if (!schedule) {
      return null;
    }

    return aggregateAvailability(schedule);
  }, [schedule]);

  if (!schedule || !showAvailability) {
    return <Suspense />;
  }

  return (
    <div css={css`
            margin: 30px;
        `}
    >
      <Button variant="outlined" onClick={onBack}>Back</Button>
      <Typography variant="h4">
        Schedule:
        {' '}
        {schedule.name}
      </Typography>
      <TextField label="User Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Button variant="outlined" onClick={onCreateUserClicked}>Create User</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Name
            </TableCell>
            <TableCell>
              Goto
            </TableCell>
          </TableRow>
        </TableHead>
        {schedule.users.map((user) => (
          <TableRow>
            <TableCell>{user.name}</TableCell>
            <TableCell><Button variant="outlined" onClick={() => goToUser(user.id)}>See User</Button></TableCell>
          </TableRow>
        ))}
      </Table>
      <AggregateWeeklyCalendar availability={showAvailability} />
    </div>
  );
};
