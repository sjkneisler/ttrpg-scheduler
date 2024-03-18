/** @jsxImportSource @emotion/react */
import React, { Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSchedule } from '../hooks/useSchedule';
import { AggregateWeeklyCalendar } from './AggregateWeekyCalendar';
import { aggregateAvailability } from '../utils/aggregate';
import { AggregationType } from '../../../common/types/aggregation-type';
import {
  getCurrentTimezone,
  getTimezoneOffset,
} from '../../../common/util/timezones';
import { UsersTable } from './UsersTable';
import { PageContainer } from './PageContainer';
import { TimezonePicker } from './TimezonePicker';

export const CampaignView: React.FC = () => {
  const navigate = useNavigate();
  const schedule = useSchedule();
  const [aggregationType, setAggregationType] = useState<AggregationType>(
    AggregationType.Shared,
  );
  const [timezone, setTimezone] = useState(getCurrentTimezone());

  const onBack = () => {
    navigate('/');
  };

  const showAvailability = useMemo(() => {
    if (!schedule) {
      return null;
    }

    return aggregateAvailability(
      schedule,
      aggregationType,
      getTimezoneOffset(timezone),
    );
  }, [schedule, aggregationType, timezone]);

  if (!schedule || !showAvailability) {
    return <Suspense />;
  }

  return (
    <PageContainer>
      <Stack direction="row">
        <Stack spacing={2}>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <UsersTable />
          <FormControl fullWidth>
            <Typography variant="h6">Aggregation Type</Typography>
            <ToggleButtonGroup
              value={aggregationType}
              exclusive
              onChange={(e, value) =>
                setAggregationType(value as AggregationType)
              }
            >
              <ToggleButton value={AggregationType.Shared}>Shared</ToggleButton>
              <ToggleButton value={AggregationType.Average}>
                Average
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
          <TimezonePicker
            timezone={timezone}
            setTimezone={setTimezone}
            label="Displayed Timezone"
          />
        </Stack>
        <AggregateWeeklyCalendar availability={showAvailability} />
      </Stack>
    </PageContainer>
  );
};
