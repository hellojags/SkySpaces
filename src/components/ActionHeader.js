import React, {useEffect} from "react";
import { IconButton, ListItem, Grid, Chip, Paper,Toolbar, MenuItem, Button, Menu, Fade, Drawer, Divider } from "@mui/material";
import { Icon } from '@iconify/react';
import { createTheme, styled, useTheme } from '@mui/material/styles';
import { makeStyles } from '@material-ui/core/styles';
import MenuButton from './MenuButton';
/* import { createStyles, makeStyles } from '@mui/styles'; */

  const useStyles = makeStyles((theme) => ({
    right: {
      marginLeft: 'auto'
    },
    toolbarCss: {
        width: '100%',
        borderBottom: '1px solid #ccc',
        borderTop: '1px solid #ccc'
    }
  }));
  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  }));
  const drawerWidth = 300;
  
export function ActionHeader(props) {
    const theme = useTheme();
    const classes = useStyles();
    const handleClick = (clickedChip) => {
        console.log(clickedChip);
    };

  const handleDrawerOpen = () => {
      props.parentCallBack(true);
  };
    const [inMyFiles, setInMyFiles] = React.useState(false);
    const [inPhotos, setInPhotos] = React.useState(false);
    const [selected, setSelected] = React.useState(true);
    const [selectedChip, setSelectedChip] = React.useState(0);
    const [chipData, setChipData] = React.useState([
        { key: 0, label: 'All Photos' },
        { key: 1, label: 'Albums' },
        { key: 2, label: 'Tags' },
        { key: 3, label: 'Places' },
      ]);
    
  return (
      <Toolbar className={classes.toolbarCss} disableGutters={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        {inMyFiles && 
        <Grid sx={{ width: '50%' }}>
            <Button sx={{color: '#00AB55'}}><Icon icon="ic:outline-add" /> New Folder</Button>
            <MenuButton buttonName="Upload" items={['Files', 'Folder', 'Web App']}/>
        </Grid>}
        {selected && 
            <Grid>
                <Button startIcon={<Icon icon="fa6-regular:share-from-square" />}>Share</Button>
                <Button startIcon={<Icon icon="bi:trash" />}>Delete</Button>
                <Button startIcon={<Icon icon="carbon:folder-move-to" />}>Move to</Button>
                <Button startIcon={<Icon icon="cil:copy" />}>Copy to</Button>
                <Button startIcon={<Icon icon="bx:rename" />}>Rename</Button>
                <Button startIcon={<Icon icon="cil:library" />}>Create album from folder</Button>
                <Button startIcon={<Icon icon="icomoon-free:embed2" />}>Embed</Button>
            </Grid>
        }
        {inPhotos && 
        <Paper
            sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                listStyle: 'none',
                p: 0.5,
                m: 0,
            }}
            component="ul"
            >
            {chipData.map((data) => {
                return (
                <ListItem key={data.key} sx={{width: 'auto'}} onClick={handleClick(data.key)}>
                    <Chip
                    label={data.label}
                    variant={data.key === selectedChip ? "" : 'outlined'}
                    />
                </ListItem>
                );
            })}
        </Paper>}
        {(inMyFiles || selected) && 
        <Grid className={classes.right}>
            {!selected && 
                <MenuButton buttonName="Sort" items={['Name', 'Modified', 'File Size']} order={['Ascending', 'Descending']}/>
            }
            {selected && 
                <Button startIcon={<Icon icon="iconoir:cancel" />}>1 selected</Button> 
            }
            <MenuButton buttonName="List" items={['List', 'Tiles']}/>
            <IconButton aria-label="info" sx={{color: '#00AB55'}} onClick={handleDrawerOpen} > 
                <Icon icon="bytesize:info" />
            </IconButton>
        </Grid>}
        
      </Toolbar>
  );
}

export default ActionHeader;
