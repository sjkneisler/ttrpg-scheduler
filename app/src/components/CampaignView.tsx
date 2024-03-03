/** @jsxImportSource @emotion/react */
import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Table, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { css } from '@emotion/react';
import { createUser } from '../api/client';
import { useSchedule } from '../hooks/useSchedule';

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

  if (!schedule) {
    return <Suspense />;
  }

  return (
    <div css={css`
            margin: 30px;
        `}
    >
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
          </TableRow>
        </TableHead>
        {schedule.users.map((user) => (
          <TableRow>
            <TableCell>{user.name}</TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
};
