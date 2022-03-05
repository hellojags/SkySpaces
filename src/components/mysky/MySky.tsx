import React from "react";
import Button from "@mui/material/Button";
import { Grid, Container } from "@mui/material";
import {useSkynet,} from "../../contexts";

export function MySky() {
  const { login, logout, loggedIn, userID } = useSkynet();
  return (
    <div>
      <Container maxWidth="xl">
        <Grid container paddingTop={2} spacing={2}>
          <Grid item lg={8}>
            <div>{userID}</div>
          </Grid>
          <Grid item lg={4}>
            {loggedIn === false && (
              <Button variant="contained" onClick={login}>
                Login
              </Button>
            )}
            {loggedIn === null && <Button>Loading MySky...</Button>}
            {loggedIn === true && (
              <Button onClick={logout}>Log Out of MySky</Button>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
