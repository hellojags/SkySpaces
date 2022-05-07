import React, { useEffect } from "react";
import { IconButton, ListItem, Grid, Chip, Paper, Toolbar, MenuItem, Button, Menu, Fade, Drawer, Divider } from "@mui/material";
import { Icon } from '@iconify/react';
import { createTheme, styled, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import MenuButton from './MenuButton';
import { useAction } from '../contexts'
/* import { createStyles, makeStyles } from '@mui/styles'; */

const useStyles = makeStyles((theme) => ({
    rightGrid: {
        marginLeft: 'auto'
    },
    leftGrid: {
        width: '50%'
    },
    toolbarCss: {
        width: '100%',
        borderBottom: '1px solid #ccc',
        borderTop: '1px solid #ccc',
        zIndex: 1099
    },
    chip: {
        width: 'auto',
        padding: 0
    }
}));

export function ActionHeader(props) {
    const theme = useTheme();
    const classes = useStyles();
    const handleClick = (clickedChip) => {
        // console.log(clickedChip);
        setSelectedChip(clickedChip);
    };

    const handleDrawerOpen = () => {
        props.parentCallBack(true);
    };

    const { setActionMsg } = useAction();
    const [inMyFiles, setInMyFiles] = React.useState(true);
    const [inPhotos, setInPhotos] = React.useState(false);
    const [selected, setSelected] = React.useState(false);
    const [selectedChip, setSelectedChip] = React.useState(0);
    const [chipData, setChipData] = React.useState([
        { key: 0, label: 'All Photos' },
        { key: 1, label: 'Albums' },
        { key: 2, label: 'Tags' },
        { key: 3, label: 'Places' },
    ]);

    const actionHandler = (action) => {
        console.log(action);
        //props.parentCallBack(action);
        setActionMsg(action);
    }
    return (
        <Toolbar className={classes.toolbarCss} disableGutters={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            {inMyFiles &&
                <Grid className={classes.leftGrid}>
                    <Button onClick={() => actionHandler('Create Folder')}><Icon icon="ic:outline-add" /> New Folder</Button>
                    <MenuButton parentCallBack={actionHandler} buttonName="Upload" items={['Files', 'Folder', 'Web App']} />
                </Grid>}
            {selected &&
                <Grid>
                    <Button onClick={() => actionHandler('Share')} startIcon={<Icon icon="fa6-regular:share-from-square" />}>Share</Button>
                    <Button onClick={() => actionHandler('Delete')} startIcon={<Icon icon="bi:trash" />}>Delete</Button>
                    <Button onClick={() => actionHandler('Move To')} startIcon={<Icon icon="carbon:folder-move-to" />}>Move to</Button>
                    <Button onClick={() => actionHandler('Copy To')} startIcon={<Icon icon="cil:copy" />}>Copy to</Button>
                    <Button onClick={() => actionHandler('Rename')} startIcon={<Icon icon="bx:rename" />}>Rename</Button>
                    {/* <Button startIcon={<Icon icon="cil:library" />}>Create album from folder</Button> */}
                    <Button startIcon={<Icon icon="icomoon-free:embed2" />}>Embed</Button>
                    <Button onClick={() => actionHandler('Version History')} startIcon={<Icon icon="ant-design:history-outlined" />}>Version History</Button>
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
                            <ListItem key={data.key} className={classes.chip} onClick={() => handleClick(data.key)}>
                                <Chip
                                    label={data.label}
                                    variant={data.key === selectedChip ? "" : 'outlined'}
                                />
                            </ListItem>
                        );
                    })}
                </Paper>}
            {(inMyFiles || selected) &&
                <Grid className={classes.rightGrid}>
                    {!selected &&
                        <MenuButton buttonName="Sort" items={['Name', 'Modified', 'File Size']} order={['Ascending', 'Descending']} />
                    }
                    {selected &&
                        <Button startIcon={<Icon icon="iconoir:cancel" />}>1 selected</Button>
                    }
                    <MenuButton buttonName="List" items={['List', 'Tiles']} />
                    <IconButton aria-label="info" sx={{ color: '#00AB55' }} onClick={handleDrawerOpen} >
                        <Icon icon="bytesize:info" />
                    </IconButton>
                </Grid>}

        </Toolbar>
    );
}

export default ActionHeader;
