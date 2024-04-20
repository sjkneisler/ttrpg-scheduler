import React from 'react';
import { Box, Container, Link, Stack } from '@mui/material';
import { PageContainer } from '../components/PageContainer';

export const AttributionsPage: React.FC = () => {
  return (
    <PageContainer>
      <Container>
        <Box>
          •{' '}
          <Link
            display="inline"
            href="https://www.iconfinder.com/icons/299092/calendar_icon"
          >
            Calendar Icon
          </Link>{' '}
          by{' '}
          <Link display="inline" href="https://www.iconfinder.com/paomedia">
            Paomedia
          </Link>{' '}
          is licensed under{' '}
          <Link
            display="inline"
            href="https://creativecommons.org/licenses/by/3.0/"
          >
            CC BY 3.0
          </Link>
        </Box>
      </Container>
    </PageContainer>
  );
};
