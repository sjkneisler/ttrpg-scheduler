/** @jsxImportSource @emotion/react */
import React, { Suspense, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
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
import { ScheduleContext } from './ScheduleContainer';

export const CampaignView: React.FC = () => {
  const navigate = useNavigate();
  const [schedule] = useContext(ScheduleContext);
  const [aggregationType, setAggregationType] = useState<AggregationType>(
    AggregationType.Shared,
  );
  const [timezone, setTimezone] = useState(getCurrentTimezone());

  const gotoPlan = () => {
    navigate('plan');
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
          <UsersTable />
          <Button variant="outlined" onClick={gotoPlan}>
            Plan a date!
          </Button>
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
