import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Description,
  Work,
  School,
  Search,
  Psychology,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { RootState } from '../../store/store';

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Career Guidance', icon: <Work />, path: '/career' },
  { text: 'Learning Roadmap', icon: <School />, path: '/roadmap' },
  { text: 'Job Search', icon: <Search />, path: '/jobs' },
  { text: 'Resume Generator', icon: <Description />, path: '/resume' },
  { text: 'Interview Bot', icon: <Psychology />, path: '/interview' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const drawer = (
    <Box sx={{ 
      width: 280, 
      pt: 2,
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      height: '100%',
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          px: 3, 
          mb: 2, 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        AI Career Tools
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              borderRadius: 3,
              mb: 0.5,
              cursor: 'pointer',
              background: location.pathname === item.path 
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                : 'transparent',
              color: location.pathname === item.path ? 'white' : 'text.primary',
              border: location.pathname === item.path 
                ? 'none' 
                : '1px solid rgba(99, 102, 241, 0.2)',
              '&:hover': {
                background: location.pathname === item.path 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                  : 'rgba(99, 102, 241, 0.1)',
                transform: 'translateX(4px)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: location.pathname === item.path ? 600 : 500 
                } 
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Unified AI Career Tools
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={handleThemeToggle}
            sx={{
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(99, 102, 241, 0.2)',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            boxShadow: '8px 0 32px -8px rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: '280px' },
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
