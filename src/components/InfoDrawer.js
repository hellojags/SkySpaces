import React, {useEffect, useState} from 'react';
import { Typography, Grid,  Container, Button, IconButton, ListItem, Chip, Paper,Toolbar, MenuItem, Menu, Fade, Drawer, Divider, Box } from "@mui/material";
import { Icon } from '@iconify/react';
import { createTheme, styled, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';


const useStyles = makeStyles({
    drawer: {
      marginLeft: "auto",
      "& .MuiBackdrop-root": {
        display: "none"
      },
      "& .MuiDrawer-paper": {
        position: "absolute",
        transition: "none !important",
        borderTop: "1px solid #e5e8eb"
      }
    }
  });

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  }));
  const drawerWidth = 300;

export function InfoDrawer({open, onClose}) {
    const [toggleMore, setToggleMore] = useState(false)
    const theme = useTheme();
    const classes = useStyles();
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth
                },
            }}
            variant="persistent"
            anchor="right"
            open={open}
            className={classes.drawer}>
            <DrawerHeader id="mainDrawer">
                <IconButton onClick={onClose}>
                    {theme.direction === 'rtl' ? <Icon icon="ci:chevron-left" /> : <Icon icon="ci:chevron-right" />}
                </IconButton>
                My Drawer
            </DrawerHeader>
            <Divider />
            <Container >
                {!toggleMore && <Typography>
                Lorem ipsum dolor sit amet. Sed itaque adipisci non libero perferendis architecto fugiat quo quae qui rerum necessitatibus et animi velit sed dolorem distinctio. Qui dolor commodi aut tempore voluptatibus est eveniet aspernatur ad suscipit dolorem.
Non ratione quam non quibusdam laborum ut quidem provident. Hic consequatur officia et nostrum aspernatur eos dolorem rerum.
                </Typography>}
                <Grid container justify="center">
                    <Button variant="outlined" size="small" onClick={() => setToggleMore(!toggleMore)}>
                        More Details {toggleMore && <Icon icon="bx:chevron-down" />} {!toggleMore && <Icon icon="bx:chevron-up" />}
                    </Button>
                </Grid>
                {toggleMore && <Typography>
                Lorem ipsum dolor sit amet. Sed itaque adipisci non libero perferendis architecto fugiat quo quae qui rerum necessitatibus et animi velit sed dolorem distinctio. Qui dolor commodi aut tempore voluptatibus est eveniet aspernatur ad suscipit dolorem.
Non ratione quam non quibusdam laborum ut quidem provident. Hic consequatur officia et nostrum aspernatur eos dolorem rerum. Cum galisum inventore et nesciunt reiciendis vel harum molestiae.
                </Typography>}
            </Container >
        </Drawer>
    );
}
export default InfoDrawer;