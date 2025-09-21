import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Divider,
  Button,
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
  MoreVert,
  Settings,
  Help,
  Info,
  GitHub,
  Launch,
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
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const handleMobileMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuItemClick = (action: string) => {
    handleMenuClose();
    
    switch (action) {
      case 'github':
        window.open('https://github.com/girishnp17/Ava', '_blank');
        break;
      case 'settings':
        // Add settings navigation when page is created
        console.log('Settings clicked');
        break;
      case 'help':
        // Add help/documentation navigation
        console.log('Help clicked');
        break;
      case 'about':
        // Add about page navigation
        console.log('About clicked');
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    }}>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 8px 32px -8px rgba(139, 92, 246, 0.2)',
        }}
      >
        <Toolbar>
          {/* Logo/Title */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              mr: 4, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
            }}
          >
            Ava
          </Typography>
          
          {/* Desktop Navigation */}
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' },
            gap: 1,
          }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                  background: location.pathname === item.path 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  boxShadow: 'none',
                  '&:hover': {
                    background: location.pathname === item.path 
                      ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' 
                      : 'rgba(139, 92, 246, 0.15)',
                    transform: 'translateY(-2px)',
                    color: '#ffffff',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleMobileMenuToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              '&:hover': {
                background: 'rgba(139, 92, 246, 0.2)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile Navigation Menu */}
          <Menu
            anchorEl={mobileMenuAnchorEl}
            open={Boolean(mobileMenuAnchorEl)}
            onClose={handleMobileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            sx={{ display: { md: 'none' } }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 250,
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
                borderRadius: 3,
              },
            }}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  background: location.pathname === item.path 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                    : 'transparent',
                  color: location.pathname === item.path ? 'white' : 'inherit',
                  '&:hover': {
                    background: location.pathname === item.path 
                      ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                      : 'rgba(99, 102, 241, 0.1)',
                  },
                  py: 1.5,
                  px: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {item.icon}
                  <Typography variant="body1" sx={{ fontWeight: location.pathname === item.path ? 600 : 500 }}>
                    {item.text}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
          
          {/* Theme Toggle */}
          <IconButton 
            color="inherit" 
            onClick={handleThemeToggle}
            sx={{
              mr: 1,
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Top Corner Menu */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <MoreVert />
          </IconButton>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.4)',
              },
            }}
          >
            <MenuItem 
              onClick={() => handleMenuItemClick('github')}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                },
              }}
            >
              <GitHub fontSize="small" sx={{ mr: 2, color: '#8b5cf6' }} />
              <Typography sx={{ flexGrow: 1, color: '#e2e8f0' }}>View on GitHub</Typography>
              <Launch fontSize="small" sx={{ ml: 1, opacity: 0.7, color: '#8b5cf6' }} />
            </MenuItem>
            
            <Divider sx={{ borderColor: 'rgba(139, 92, 246, 0.3)', my: 1 }} />
            
            <MenuItem 
              onClick={() => handleMenuItemClick('settings')}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                },
              }}
            >
              <Settings fontSize="small" sx={{ mr: 2, color: '#8b5cf6' }} />
              <Typography sx={{ color: '#e2e8f0' }}>Settings</Typography>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleMenuItemClick('help')}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                },
              }}
            >
              <Help fontSize="small" sx={{ mr: 2, color: '#8b5cf6' }} />
              <Typography sx={{ color: '#e2e8f0' }}>Help & Documentation</Typography>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleMenuItemClick('about')}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                },
              }}
            >
              <Info fontSize="small" sx={{ mr: 2, color: '#8b5cf6' }} />
              <Typography sx={{ color: '#e2e8f0' }}>About</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          pt: '64px', // Account for AppBar height
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
