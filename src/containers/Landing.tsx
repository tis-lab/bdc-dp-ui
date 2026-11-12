import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { createSearchParams, useNavigate } from "react-router";
import { GridContainer, Hero, HeroText, MainSection } from "./Landing.styles";
import { Panel, PanelTitle } from "../components/Panel/Panel.styles";
import ConceptSearchbar from "../components/ConceptSearchbar";
import { useId } from "react";

const BUILD_PATH = "/build";

export default function Landing() {
  const searchSectionId = useId();
  const definitionSectionId = useId();
  const navigate = useNavigate();

  // Results live in the cohort builder, hand the query over through the URL
  const handleSearch = (text: string) => {
    const q = text.trim();
    navigate({
      pathname: BUILD_PATH,
      search: q ? `?${createSearchParams({ q })}` : "",
    });
  };

  return (
    <Box>
      <Hero>
        <Container>
          <GridContainer container>
            <Grid size={{ xs: 12, md: 6 }}>
              <HeroText>
                <Typography variant="h1" gutterBottom>
                  Welcome to Cohort Builder
                </Typography>
                <Typography variant="body1">
                  BioData Catalyst connects researchers to NHLBI datasets,
                  tools, and workflows — enabling large-scale analysis across
                  thousands of studies and hundreds of thousands of
                  participants.
                </Typography>
              </HeroText>
              <Button variant="contained" color="primary">
                Take a Quick Tour
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}></Grid>
          </GridContainer>
        </Container>
      </Hero>
      <MainSection>
        <Typography variant="h2" gutterBottom>
          Start Building a Cohort
        </Typography>
        <Typography variant="body2">
          Search for concepts or start from an existing definition
        </Typography>
        <Grid container spacing={4} columns={5} paddingTop={4}>
          <Grid size={{ xs: 5, md: 3 }}>
            <Panel as="section" aria-labelledby={searchSectionId}>
              <PanelTitle id={searchSectionId}>Search Concepts</PanelTitle>
              <Typography variant="body2" gutterBottom>
                Find variables across BDC studies by keyword or ontology term
              </Typography>
              <ConceptSearchbar
                onSearch={handleSearch}
                placeholder="e.g. blood pressure, diabetes, BMI…"
                showExamples
              />
            </Panel>
          </Grid>
          <Grid size={{ xs: 5, md: 2 }}>
            <Panel as="section" aria-labelledby={definitionSectionId}>
              <PanelTitle id={definitionSectionId}>
                Existing Cohort Definitions
              </PanelTitle>
              <Typography variant="body2">
                Start from a curated community definition
              </Typography>
            </Panel>
          </Grid>
        </Grid>
      </MainSection>
    </Box>
  );
}
