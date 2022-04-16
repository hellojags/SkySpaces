import { Icon } from '@iconify/react';
import { useRef, useState, useEffect } from 'react';
import homeFill from '@iconify/icons-eva/home-fill';
import personFill from '@iconify/icons-eva/person-fill';
import settings2Fill from '@iconify/icons-eva/settings-2-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import { alpha } from '@mui/material/styles';
import { Button, Box, Divider, MenuItem, Typography, Avatar, IconButton, Stack } from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';
//
import account from '../../_mocks_/account';

import { useSkynet, useUserProfile } from '../../contexts';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: homeFill,
    linkTo: '/'
  },
  {
    label: 'Profile',
    icon: personFill,
    linkTo: '#'
  },
  {
    label: 'Settings',
    icon: settings2Fill,
    linkTo: '#'
  }
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { login, logout, loggedIn, userID } = useSkynet();
//  const { getUserProfile } = useUserProfile();
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  
  const [open, setOpen] = useState(false);
  const [userDetails, setUserDetails] = useState();
  const [showCopyIcon, setShowCopyIcon] = useState(true);
  const handleOpen = () => {
    setOpen(true);
    setShowCopyIcon(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  /* useEffect(() => {
    const user =  getUserProfile();
     setUserDetails(user);
     console.log(userDetails, 'account popuver');
  }, []) */

  const logoutHandler = async () => {
    await logout();
    handleClose();
    navigate('/login', { replace: true });
    // TODO: cleanup in-progress upload before logout.
    // setUploads([]) or null or empty
  }
  const copyToClipboard = () => {
    navigator.clipboard.writeText(userID);
    setShowCopyIcon(false);
  }

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
            }
          })
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {account.displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {account.email}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {userID}
            </Typography>
            {showCopyIcon && <Button variant="text" endIcon={<Icon icon="iconoir:copy" />} sx={{minWidth: 'auto', padding: 0}} onClick={copyToClipboard}></Button>}
            {!showCopyIcon && <Button variant="text" endIcon={<Icon icon="bi:check-all" />} sx={{minWidth: 'auto', padding: 0}} onClick={copyToClipboard}></Button>}
          </Stack>
        </Box>

        <Divider sx={{ my: 1 }} />

        {MENU_OPTIONS.map((option) => (
          <MenuItem
            key={option.label}
            to={option.linkTo}
            component={RouterLink}
            onClick={handleClose}
            sx={{ typography: 'body2', py: 1, px: 2.5 }}
          >
            <Box
              component={Icon}
              icon={option.icon}
              sx={{
                mr: 2,
                width: 24,
                height: 24
              }}
            />

            {option.label}
          </MenuItem>
        ))}

        <Box sx={{ p: 2, pt: 1.5 }}>
          <Button fullWidth color="inherit" variant="outlined" onClick={logoutHandler}>
            Logout
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
