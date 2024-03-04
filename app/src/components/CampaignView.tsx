/** @jsxImportSource @emotion/react */
import React, { Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { css } from '@emotion/react';
import { createUser } from '../api/client';
import { useSchedule } from '../hooks/useSchedule';
import { AggregateWeeklyCalendar } from './AggregateWeekyCalendar';
import { aggregateAvailability } from '../utils/aggregate';
import { AggregationType } from '../../../common/types/aggregation-type';
import {
  getCurrentTimezone,
  getTimezoneOffset,
} from '../../../common/util/timezones';

export const CampaignView: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const schedule = useSchedule();
  const [aggregationType, setAggregationType] = useState<AggregationType>(
    AggregationType.Common,
  );

  const onCreateUserClicked = async () => {
    if (!schedule) {
      return;
    }
    const user = await createUser(schedule.id, name, getCurrentTimezone());
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

    return aggregateAvailability(
      schedule,
      aggregationType,
      getTimezoneOffset(getCurrentTimezone()),
    );
  }, [schedule, aggregationType]);

  if (!schedule || !showAvailability) {
    return <Suspense />;
  }

  return (
    <div
      css={css`
        margin: 30px;
        display: flex;
        flex-direction: row;
      `}
    >
      <div
        css={css`
          flex: 1 1 auto;
        `}
      >
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Typography variant="h4">Schedule: {schedule.name}</Typography>
        <TextField
          label="User Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <Button variant="outlined" onClick={onCreateUserClicked}>
          Create User
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Goto</TableCell>
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
        <ToggleButtonGroup
          value={aggregationType}
          exclusive
          onChange={(e, value) => setAggregationType(value as AggregationType)}
        >
          <ToggleButton value={AggregationType.Common}>Common</ToggleButton>
          <ToggleButton value={AggregationType.Average}>Average</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div
        css={css`
          flex: 1 1 auto;
        `}
      >
        <AggregateWeeklyCalendar availability={showAvailability} />
      </div>
    </div>
  );
};
