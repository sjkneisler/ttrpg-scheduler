import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { createUser } from '../api/client';

export const CampaignView: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const parsedScheduleId = parseInt(scheduleId!, 10);

  const onCreateUserClicked = async () => {
    const user = await createUser(parsedScheduleId, name);
    navigate(`/schedule/${parsedScheduleId}/user/${user.id}`);
  };
  return (
    <div>
      <TextField label="User Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Button variant="outlined" onClick={onCreateUserClicked}>Create User</Button>
    </div>
  );
};
