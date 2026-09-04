import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Listings: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Danh sách xe đạp
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Trang này sẽ được phát triển sau.
        </Typography>
      </Box>
    </Container>
  );
};

export default Listings;
