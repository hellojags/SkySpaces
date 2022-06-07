import React, { useEffect, useState } from 'react';
import { Typography, Container, Card, CardHeader, IconButton, List, ListItem, ListItemAvatar, ListItemText, Drawer, Divider } from "@mui/material";
import { Icon } from '@iconify/react';
import { styled, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useAction } from '../contexts';
import { useFileManager } from '../contexts';

const useStyles = makeStyles({
    drawer: {
        marginLeft: "auto",
        "& .MuiBackdrop-root": {
            display: "none"
        },
        "& .MuiDrawer-paper": {
            position: "absolute",
            transition: "none !important",
            borderTop: "1px solid #e5e8eb",
            top: "-17px"
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
const drawerWidth = 350;

export function InfoDrawer({ open, onClose, selectedFiles }) {
    const [toggleMore, setToggleMore] = useState(false);
    const [fileDetails, setFileDetails] = useState({});
    const [createdDate, setCreatedDate] = useState('');
    const [modifiedDate, setModifiedDate] = useState('');
    const { folderPath } = useAction();
    const { getDirectoryIndex } = useFileManager();
    const theme = useTheme();
    const classes = useStyles();
    useEffect(() => {
        console.log('selectedFiles', selectedFiles);
        (async () => {
            const directoryIndexSkyFS = await getDirectoryIndex(folderPath);
            setCreatedDate(convertDate(directoryIndexSkyFS.files[selectedFiles[0].name].created));
            setModifiedDate(convertDate(directoryIndexSkyFS.files[selectedFiles[0].name].modified));
            setFileDetails(directoryIndexSkyFS.files[selectedFiles[0].name]);
            console.log(fileDetails);
        })();
    }, []);

    const convertDate = (seconds) => {
        const date = new Date(seconds);
        console.log(date);
        const formatedDate = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes();
        return formatedDate.toString();
    }
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
                <Typography variant="h4">
                    File Details
                </Typography>
            </DrawerHeader>
            <Divider />
            <Container>
                <Typography>
                    <CardHeader title="Info">
                    </CardHeader>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                Name
                            </ListItemAvatar>
                            <ListItemText secondary={fileDetails.name} />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                MIME Type
                            </ListItemAvatar>
                            <ListItemText secondary={fileDetails.mimeType} />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Size(bytes)
                            </ListItemAvatar>
                            {fileDetails.file && <ListItemText secondary={fileDetails.file.size} />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Created
                            </ListItemAvatar>
                            <ListItemText secondary={createdDate} />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Modified
                            </ListItemAvatar>
                            <ListItemText secondary={modifiedDate} />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Version
                            </ListItemAvatar>
                            <ListItemText secondary={fileDetails.version} />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Location URL
                            </ListItemAvatar>
                            {fileDetails.file && <ListItemText secondary="Don't have" />}
                        </ListItem>
                    </List>
                    <CardHeader title="Hashes">
                    </CardHeader>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                Hash
                            </ListItemAvatar>
                            {fileDetails.file && <ListItemText secondary={fileDetails.file.hash} />}
                        </ListItem>
                    </List>
                    <CardHeader title="Encryption">
                    </CardHeader>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                Type
                            </ListItemAvatar>
                            {fileDetails.file && <ListItemText secondary={fileDetails.file.encryptionType} />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Padding
                            </ListItemAvatar>
                            {fileDetails.file && <ListItemText secondary={fileDetails.file.padding} />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Blob Url
                            </ListItemAvatar>
                            {fileDetails.file && <ListItemText secondary={fileDetails.file.url} />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                Chunk Size
                            </ListItemAvatar>
                            {fileDetails.file && <ListItemText secondary={fileDetails.file.chunkSize} />}
                        </ListItem>
                    </List>
                    <CardHeader title="Extension Data">
                    </CardHeader>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                image.width
                            </ListItemAvatar>
                            {fileDetails.ext && <ListItemText secondary="Don't know" />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                image.height
                            </ListItemAvatar>
                            {fileDetails.ext && <ListItemText secondary="Don't know" />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                thumbnail.key
                            </ListItemAvatar>
                            {(fileDetails.ext && fileDetails.ext.thumbnail) && <ListItemText secondary={fileDetails.ext.thumbnail.key} />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                thumbnail.aspectRatio
                            </ListItemAvatar>
                            {(fileDetails.ext && fileDetails.ext.thumbnail) && <ListItemText secondary={fileDetails.ext.thumbnail.aspectRatio} />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                thumbnail.blurHash
                            </ListItemAvatar>
                            {(fileDetails.ext && fileDetails.ext.thumbnail) && <ListItemText secondary={fileDetails.ext.thumbnail.blurHash} />}
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                uploader
                            </ListItemAvatar>
                            {fileDetails.ext && <ListItemText secondary={fileDetails.ext.uploader} />}
                        </ListItem>
                    </List>
                </Typography>
                {/* {!toggleMore && <Typography>
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
                </Typography>} */}
            </Container>
        </Drawer >
    );
}
export default InfoDrawer;