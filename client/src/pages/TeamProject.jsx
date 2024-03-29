import TeamProjectList from "../components/TeamProjects/teamProjects";
import { Grid } from "@mui/material";

export default function TeamProject() {
  return (
    <Grid
      container
      spacing={2}
      direction="column"
      alignItems="center"
      justifyContent="space-around"
    >
      
        <h1>Team Projects</h1>
        <TeamProjectList />
      </Grid>
  );
}
