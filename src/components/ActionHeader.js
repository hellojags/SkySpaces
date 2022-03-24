import React from "react";
import Button from "@mui/material/Button";
import { Card, Box, Stack, IconButton, ListItemIcon, ListItemText, Grid } from "@mui/material";
import Toolbar from '@material-ui/core/Toolbar';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Icon } from '@iconify/react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
/* import { makeStyles } from '@material-ui/core/styles'; */
import { createStyles, makeStyles } from '@mui/styles';


const LeftAlignButtonStyle = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'left',
    border: '0'
  }));
const RightAlignButtonStyle = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'right',
    border: '0'
  }));
  const useStyles = makeStyles((theme) => ({
    right: {
      marginLeft: 'auto'
    }
  }));
  const theme = createTheme();
export function ActionHeader() {
    const classes = useStyles();
  const [age, setAge] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };
  return (
      <Toolbar sx={{ mt: 2 }}>
        <Grid container alignItems="center" sx={{ width: 300 }}>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 85 }}>
                <InputLabel id="demo-simple-select-standard-label">
                    <Icon icon="ic:outline-add" /> 
                    <span>New</span>
                </InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={age}
                onChange={handleChange}
                label="Age"
                disableUnderline
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 100 }}>
                <InputLabel id="demo-simple-select-standard-label">
                    <Icon icon="charm:upload"/>
                    <span>Upload</span>
                </InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={age}
                onChange={handleChange}
                label="Age"
                disableUnderline
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
        </Grid>
        <Grid className={classes.right}>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 85 }}>
                <InputLabel id="demo-simple-select-standard-label">
                    <Icon icon="fluent:arrow-sort-down-lines-24-regular"/>
                    <span>Sort</span>
                </InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={age}
                onChange={handleChange}
                label="Age"
                disableUnderline
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 85 }}>
                <InputLabel id="demo-simple-select-standard-label">
                    <Icon icon="fluent:list-20-filled"/>
                    <span>List</span>
                </InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={age}
                onChange={handleChange}
                label="Age"
                disableUnderline
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
            <IconButton aria-label="delete" sx={{ mt: 2 }}> 
                <Icon icon="bytesize:info" />
            </IconButton>
        </Grid>
      </Toolbar>
  );
}

export default ActionHeader;
