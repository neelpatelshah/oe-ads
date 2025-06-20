"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import Link from "next/link";
import { MockAdDB, CompanyId, Ad, Company } from "../../data/mockdb";
import {
  MockAdInsights,
  AdInsight,
  startTrafficSimulator,
} from "../../data/insights";
import { capitalize } from "lodash";

const MetricCard = ({ title, value }: { title: string; value: string }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="h2">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default function AnalyticsPage({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("co") as CompanyId | null;

  const [company, setCompany] = useState<Company | null>({
    id: slug as CompanyId,
    name: capitalize(slug),
  });
  const [companyInsights, setCompanyInsights] = useState<AdInsight | null>(
    null
  );
  const [companyAds, setCompanyAds] = useState<Ad[]>([]);
  const [adInsights, setAdInsights] = useState<Record<string, AdInsight>>({});

  useEffect(() => {
    const stopTraffic = startTrafficSimulator({ intervalMs: 1500 });

    const intervalId = setInterval(() => {
      if (companyId) {
        const currentCompany =
          MockAdDB.listCompanies().find((c) => c.id === companyId) || null;
        setCompany(currentCompany);

        setCompanyInsights(MockAdInsights.getForCompany(companyId));

        const ads = MockAdDB.listAds({ companyId });
        setCompanyAds(ads);

        const individualAdInsights: Record<string, AdInsight> = {};
        ads.forEach((ad) => {
          individualAdInsights[ad.id] = MockAdInsights.getForAd(ad.id);
        });
        setAdInsights(individualAdInsights);
      }
    }, 1000);

    return () => {
      stopTraffic();
      clearInterval(intervalId);
    };
  }, [companyId]);

  if (!companyId || !company) {
    return (
      <Container>
        <Box textAlign="center" mt={10}>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography>Please select a company to view analytics.</Typography>
          <Button component={Link} href="/" variant="contained" sx={{ mt: 2 }}>
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {company.name} Analytics
            </Typography>
            <Button component={Link} href="/" color="inherit">
              Home
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Overall Performance
        </Typography>
        {companyInsights && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Impressions"
                value={companyInsights.impressions.toLocaleString()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Clicks"
                value={companyInsights.clicks.toLocaleString()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="CTR"
                value={`${(companyInsights.ctr * 100).toFixed(2)}%`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Viewability"
                value={`${(companyInsights.viewabilityRate * 100).toFixed(2)}%`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Avg. Dwell"
                value={`${companyInsights.avgDwell.toFixed(2)}s`}
              />
            </Grid>
          </Grid>
        )}

        <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
          Ad-Level Performance
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ad Headline</TableCell>
                <TableCell align="right">Impressions</TableCell>
                <TableCell align="right">Clicks</TableCell>
                <TableCell align="right">CTR</TableCell>
                <TableCell align="right">Viewability</TableCell>
                <TableCell align="right">Avg. Dwell (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companyAds.map((ad) => {
                const insight = adInsights[ad.id];
                return (
                  <TableRow hover key={ad.id}>
                    <TableCell component="th" scope="row">
                      {ad.headline}
                    </TableCell>
                    <TableCell align="right">
                      {insight?.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {insight?.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {insight ? `${(insight.ctr * 100).toFixed(2)}%` : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {insight
                        ? `${(insight.viewabilityRate * 100).toFixed(2)}%`
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {insight ? `${insight.avgDwell.toFixed(2)}` : "N/A"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
