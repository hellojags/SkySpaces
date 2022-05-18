import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import menu2Fill from '@iconify/icons-eva/menu-2-fill';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton, Button, Modal, Card, CardHeader, CardContent, CardActions, Typography, CircularProgress } from '@mui/material';
// components
import { MHidden } from '../../components/@material-extend';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';
import { useSkynetManager } from '../../contexts';
import UploaderElement from "../../components/upload/UploaderElement";
import { makeStyles } from '@mui/styles';
import { useAction } from '../../contexts';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 55;
const APPBAR_DESKTOP = 55;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`
  }
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 2)
  }
}));
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
};

// ----------------------------------------------------------------------

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func
};
const styles = makeStyles((theme) => ({
  modalStyle: {
    overflow: 'auto',
    maxHeight: 500,
    width: '90%',
    ['@media (min-width: 992px)']: {
      width: '60%'
    }
  },
  actionButton: {
    justifyContent: 'center'
  },
  spinner: {
    width: '15px !important',
    height: '17px !important',
    margin: '5px',
  },
  hideModal: {
    visibility: 'hidden'
  },
  showModal: {
    visibility: 'visible'
  }
}));

export default function DashboardNavbar({ onOpenSidebar }) {
  const classes = styles();
  const { uploads } = useSkynetManager();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  //const [folderPath, setFolderPath] = useState("/localhost/home"); // this needs to be dynamic
  const { folderPath } = useAction();

  useEffect(() => {
    console.log(folderPath);
  }, [folderPath])
  return (
    <RootStyle>
      <ToolbarStyle>
        <MHidden width="lgUp">
          <IconButton onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
            <Icon icon={menu2Fill} />
          </IconButton>
        </MHidden>

        <Searchbar />
        <Box sx={{ flexGrow: 1 }} />
        {uploads.length !== 0 &&
          <Button variant="text" onClick={handleOpen}>
            <CircularProgress className={classes.spinner} />
            <Typography>
              Uploading {uploads.length} items
            </Typography>
          </Button>
        }
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          <LanguagePopover />
          <NotificationsPopover />
          <AccountPopover />
        </Stack>
      </ToolbarStyle>
      <Modal
        open={true}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className={open ? classes.showModal : classes.hideModal}
      >
        <Box sx={style} className={classes.modalStyle}>
          <CardHeader title="Progress" />
          {/* <Card>
        </Card> */}
          {uploads.length === 0 &&
            <Card>
              <CardContent>
                <Typography>
                  Currently no upload is in progress.
                </Typography>
              </CardContent>
            </Card>
          }
          {uploads.map((upload) => (
            <UploaderElement
              key={upload.id}
              upload={upload}
              folderPath={folderPath}
              open={open}
            />
          ))}
          <CardActions className={classes.actionButton}>
            <Button variant="contained" onClick={handleClose} >
              Close
            </Button>
          </CardActions>
        </Box>
      </Modal>
    </RootStyle>
  );
}
