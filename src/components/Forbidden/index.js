import React from 'react';
import { Box, Typography } from "@mui/material";

const Forbidden = () => <Box
  width="100%"
  height="100vh"
  display='flex'
  alignItems="center"
  justifyContent="center"
>
  <Typography variant="h1" color="white">403 - Forbidden</Typography>
</Box>;

export default Forbidden;
