/** @jsxImportSource @emotion/react */
import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useLocalStorageState from 'use-local-storage-state';
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

  const [recentScheduleData] = useLocalStorageState<[string, string][]>(
    'recentSchedules',
    { defaultValue: [] },
  );

  const theme = useTheme();

  return (
    <PageContainer>
      <Container maxWidth="sm">
        <Stack spacing={10}>
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
          {recentScheduleData.length > 0 && (
            <Card sx={{ p: 2, maxWidth: 300, alignSelf: 'center' }}>
              <Stack spacing={3}>
                <Typography variant="h6" align="center">
                  Recent Schedules
                </Typography>
                <Table>
                  <TableBody>
                    {recentScheduleData.map(
                      ([recentScheduleInviteCode, recentScheduleName]) => (
                        <TableRow>
                          <TableCell sx={{ p: 0 }}>
                            <Button
                              component={Link}
                              to={`/schedule/${recentScheduleInviteCode}`}
                              sx={{ width: '100%', height: '100%' }}
                              // style={{
                              //   width: '100%',
                              //   height: '100%',
                              // }}
                            >
                              <Typography variant="body1">
                                {recentScheduleName}
                              </Typography>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>
    </PageContainer>
  );
};
