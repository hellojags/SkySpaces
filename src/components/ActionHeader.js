import React, { useEffect, useCallback } from "react";
import { IconButton, ListItem, Grid, Chip, Paper, Toolbar, Button } from "@mui/material";
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import MenuButton from './MenuButton';
import { useAction } from '../contexts'
import { useFileManager } from '../contexts'
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

    const { actionsMsg, setActionMsg, selectedFiles, folderPath } = useAction();
    const { cutFiles, copyFiles } = useFileManager();
    const [inMyFiles, setInMyFiles] = React.useState(true);
    const [inPhotos, setInPhotos] = React.useState(false);
    const [selected, setSelected] = React.useState(false);
    const [filesSelected, setFilesSelected] = React.useState([]);
    const [showInfoButton, setShowInfoButton] = React.useState(false);
    const [selectedChip, setSelectedChip] = React.useState(0);
    const [totalFiles, setTotalFiles] = React.useState(0);
    const [sourcePath, setSourcePath] = React.useState('/');
    const [targetPath, setTargetPath] = React.useState('');
    const [localAction, setLocalAction] = React.useState('');
    const [chipData, setChipData] = React.useState([
        { key: 0, label: 'All Photos' },
        { key: 1, label: 'Albums' },
        { key: 2, label: 'Tags' },
        { key: 3, label: 'Places' },
    ]);

    const actionHandler = (action) => {
        //props.parentCallBack(action);
        if (action === 'Cut' || action === 'Copy') {
            setLocalAction(action);
        } else {
            setActionMsg(action);
            console.log(actionsMsg);
        }
    }

    useEffect(() => {
        if ((localAction === 'Cut' || localAction === 'Copy')) {
            setSourcePath(folderPath);
        }
    }, [localAction]);

    useEffect(() => {
        let tempSourcePath = sourcePath.endsWith('/') ? sourcePath.slice(0, sourcePath.length - 1) : sourcePath;
        setSourcePath(tempSourcePath);
        console.log(sourcePath);
    }, [sourcePath, targetPath]);

    useEffect(() => {
        let tempTargetPath = targetPath.endsWith('/') ? targetPath.slice(0, targetPath.length - 1) : targetPath;
        setTargetPath(tempTargetPath);
        console.log(targetPath);
        paste();
    }, [targetPath]);

    const setTarget = () => {
        setTargetPath(folderPath);
    }
    const paste = () => {
        if (localAction === 'Cut') {
            filesSelected.forEach(file => {
                (async () => {
                    let res = await cutFiles(sourcePath + '/' + file.name, targetPath + '/' + file.name);
                    console.log(res, 'cut file res');
                    if (res.success) {
                        setActionMsg('File Moved Successfully');
                    }
                })();
            });
        }
        if (localAction === 'Copy') {
            filesSelected.forEach(file => {
                (async () => {
                    let res = await copyFiles(sourcePath + '/' + file.name, targetPath);
                    console.log(res, 'copy file res');
                    if (res.success) {
                        setActionMsg('File Copied Successfully');
                    }
                })();
            });
        }
    }

    React.useEffect(() => {
        if (selectedFiles.length > 0) {
            if (!selectedFiles[0].isDir) {
                setFilesSelected(selectedFiles);
            }
            else {
                setFilesSelected(prevState => prevState);
            }
            console.log(filesSelected, 'selectedFiles');
        } else {
            if (sourcePath === folderPath) {
                setFilesSelected([]);
                setLocalAction('');
            }
        }
        if (selectedFiles.length === 1 && !selectedFiles[0].isDir) {
            setShowInfoButton(true);
        } else {
            setShowInfoButton(false);
            props.parentCallBack(false);
        }
        const showInfo = (selectedFiles.length === 1 && !selectedFiles[0].isDir) ? true : false;
        setShowInfoButton(showInfo);
        if (selectedFiles.length > 0) {
            setTotalFiles(selectedFiles.length);
            setInMyFiles(false);
            setSelected(true);
        } else {
            setInMyFiles(true);
            setSelected(false);
        }
        if (sourcePath !== folderPath) {
            setActionMsg('');
        } else {
            setActionMsg(prevState => prevState);
        }
    }, [selectedFiles, folderPath])
    return (
        <Toolbar className={classes.toolbarCss} disableGutters={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            {inMyFiles &&
                <Grid className={classes.leftGrid}>
                    <Button onClick={() => actionHandler('Create Folder')}><Icon icon="ic:outline-add" /> New Folder</Button>
                    <MenuButton parentCallBack={actionHandler} buttonName="Upload" items={['Files', 'Folder', 'Web App']} />
                </Grid>}
            {selected &&
                <Grid>
                    {actionsMsg !== 'Cut' && <Button onClick={() => actionHandler('Cut')} startIcon={<Icon icon="fluent:screen-cut-20-filled" />}>Cut</Button>}
                    {actionsMsg !== 'Copy' && <Button onClick={() => actionHandler('Copy')} startIcon={<Icon icon="cil:copy" />}>Copy</Button>}
                    <Button onClick={() => actionHandler('Share')} startIcon={<Icon icon="fa6-regular:share-from-square" />}>Share</Button>
                    <Button onClick={() => actionHandler('Download')} startIcon={<Icon icon="clarity:download-line" />}>Download</Button>
                    <Button onClick={() => actionHandler('Delete')} startIcon={<Icon icon="bi:trash" />}>Delete</Button>
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
                        <Button startIcon={<Icon icon="iconoir:cancel" />}>{totalFiles} selected</Button>
                    }
                    <MenuButton buttonName="List" items={['List', 'Tiles']} />
                    {((localAction === 'Cut' || localAction === 'Copy') && filesSelected.length > 0) &&
                        <Button onClick={() => setTarget()} startIcon={<Icon icon="clarity:paste-solid" />}>Paste</Button>
                    }
                    {showInfoButton && <IconButton aria-label="info" sx={{ color: '#00AB55' }} onClick={handleDrawerOpen} >
                        <Icon icon="bytesize:info" />
                    </IconButton>}
                </Grid>}

        </Toolbar>
    );
}

export default ActionHeader;
