/** @jsxImportSource @emotion/react */
import React, { Suspense, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ScheduleGranularity } from '@prisma/client';
import _ from 'lodash';
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
import { ScheduleWithIncludes } from '../../../common/types/user';
import { updateSchedule } from '../api/client';

const granularityLabelMap: Record<ScheduleGranularity, string> = {
  FIFTEENMINUTES: 'Fifteen Minutes',
  THIRTYMINUTES: 'Thirty Minutes',
  ONEHOUR: 'One Hour',
};

const granularityEnumMap: Record<string, ScheduleGranularity> = {
  FIFTEENMINUTES: ScheduleGranularity.FIFTEENMINUTES,
  THIRTYMINUTES: ScheduleGranularity.THIRTYMINUTES,
  ONEHOUR: ScheduleGranularity.ONEHOUR,
};

export const CampaignView: React.FC = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useContext(ScheduleContext);
  const [aggregationType, setAggregationType] = useState<AggregationType>(
    AggregationType.Shared,
  );
  const [timezone, setTimezone] = useState(getCurrentTimezone());

  const setGranularity = async (newGranularityString: string) => {
    if (!schedule) {
      return;
    }
    const newGranularity = granularityEnumMap[newGranularityString];

    const newSchedule: ScheduleWithIncludes = {
      ...schedule,
      granularity: newGranularity,
    };

    setSchedule(await updateSchedule(newSchedule));
  };

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
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <Typography variant="h6">Aggregation Type</Typography>
                  <ToggleButtonGroup
                    value={aggregationType}
                    exclusive
                    onChange={(e, value) =>
                      setAggregationType(value as AggregationType)
                    }
                  >
                    <ToggleButton value={AggregationType.Shared}>
                      Shared
                    </ToggleButton>
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
                <FormControl fullWidth>
                  <InputLabel id="granularity-select-label">
                    Schedule Granularity
                  </InputLabel>
                  <Select
                    value={schedule.granularity}
                    onChange={(event) => setGranularity(event.target.value)}
                    labelId="granularity-select-label"
                    label="Schedule Granularity"
                  >
                    {_.entries(granularityLabelMap).map(
                      ([granularity, label]) => (
                        <MenuItem value={granularity}>{label}</MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
        <AggregateWeeklyCalendar
          availability={showAvailability}
          granularity={schedule.granularity}
        />
      </Stack>
    </PageContainer>
  );
};
