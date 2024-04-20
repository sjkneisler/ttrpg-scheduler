/** @jsxImportSource @emotion/react */
import {
  Box,
  Button,
  Container,
  FormControl,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { createSchedule } from '../api/client';
import { PageContainer } from '../components/PageContainer';

export const Home: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const createCampaign = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const schedule = await createSchedule(name);
    navigate(`/schedule/${schedule.inviteCode}`);
  };

  const theme = useTheme();

  return (
    <PageContainer>
      <Container maxWidth="sm">
        <Stack spacing={3} marginTop={2}>
          <Typography variant="subtitle1" align="center" fontStyle="italic">
            A tool for scheduling recurring weekly events
          </Typography>
          <Box maxWidth="xs" alignSelf="center">
            <form onSubmit={createCampaign}>
              <FormControl>
                <TextField
                  label="Schedule Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  inputProps={{
                    'data-lpignore': true,
                    style: {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                  autoComplete="off"
                  InputLabelProps={{
                    style: {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
                <Button variant="contained" type="submit" disabled={!name}>
                  Create Schedule
                </Button>
              </FormControl>
            </form>
          </Box>
        </Stack>
      </Container>
    </PageContainer>
  );
};
