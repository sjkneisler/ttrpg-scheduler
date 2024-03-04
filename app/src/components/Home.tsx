/** @jsxImportSource @emotion/react */
import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { createSchedule } from '../api/client';

export const Home: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const createCampaign = async () => {
    const schedule = await createSchedule(name);
    navigate(`/schedule/${schedule.id}`);
  };
  return (
    <div
      css={css`
        margin: 30px;
      `}
    >
      <TextField
        label="Campaign Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <Button variant="outlined" onClick={createCampaign}>
        Create Campaign
      </Button>
    </div>
  );
};
