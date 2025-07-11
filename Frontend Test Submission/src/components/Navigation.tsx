import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import { Link, BarChart } from '@mui/icons-material';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={location.pathname} onChange={handleChange} centered>
        <Tab 
          icon={<Link />} 
          label="URL Shortener" 
          value="/" 
          iconPosition="start"
        />
        <Tab 
          icon={<BarChart />} 
          label="Statistics" 
          value="/statistics" 
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );
};

export default Navigation;