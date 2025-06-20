"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  CircularProgress,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";
import { styled } from "@mui/system";
import { MockAdDB } from "../data/mockdb";

interface HistoryItem {
  role: string;
  content: string;
}

const StyledPaper = styled(Paper)({
  padding: "1rem",
  marginTop: "1rem",
  marginBottom: "1rem",
  fontFamily: "Open Sans, sans-serif",
});

const StyledButton = styled(Button)({
  height: "56px", // to match TextField height
});

const FixedAppBar = styled(AppBar)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
});

export default function Home() {
  const [question, setQuestion] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showAd, setShowAd] = useState<boolean>(false);
  const [ad, setAd] = useState<
    null | ReturnType<typeof MockAdDB.listAds>[number]
  >(null);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setShowAd(true);

    // Pick a random ad
    const ads = MockAdDB.listAds();
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    setAd(randomAd);

    scrollToBottom();

    try {
      const responsePromise = axios.post("/api/ask", { question, history });

      // Wait 10 seconds before showing answer
      await new Promise((resolve) => setTimeout(resolve, 10000));

      setShowAd(false);

      const response = await responsePromise;

      setHistory([
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: response.data.answer },
      ]);
      setAnswer(response.data.answer);
      setQuestion("");
    } catch (error) {
      console.error("Error fetching the answer:", error);
      setShowAd(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setAnswer("");
    setQuestion("");
    scrollToBottom();
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading, history]);

  return (
    <>
      <FixedAppBar position="static">
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              style={{ flexGrow: 1, fontFamily: "Roboto, sans-serif" }}
            >
              Meredith
            </Typography>
            <Button color="inherit" onClick={handleNewConversation}>
              New Conversation
            </Button>
          </Toolbar>
        </Container>
      </FixedAppBar>

      <Container
        maxWidth="md"
        style={{
          marginTop: "120px",
          fontFamily: "Roboto, sans-serif",
          marginBottom: "250px",
        }}
      >
        {/* Show ad as a floating overlay in the corner if showAd is true */}
        {showAd && ad && (
          <Box
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              width: 340,
              bgcolor: "white",
              boxShadow: 6,
              borderRadius: 2,
              p: 2,
              zIndex: 2000,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={ad.creativeUrl}
              alt={ad.headline}
              style={{
                maxWidth: "300px",
                maxHeight: "120px",
                marginBottom: "0.5rem",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <Typography variant="subtitle1" align="center" gutterBottom>
              {ad.headline}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sponsored by{" "}
              {
                MockAdDB.listCompanies().find((c) => c.id === ad.companyId)
                  ?.name
              }
            </Typography>
            <Box
              mt={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <CircularProgress size={18} />
              <Typography variant="caption" display="block" mt={0.5}>
                Loading answer...
              </Typography>
            </Box>
          </Box>
        )}
        {history.length > 0 && (
          <List>
            {history.map((item, index) => (
              <StyledPaper elevation={3} key={index}>
                <Typography variant="body1" component="div">
                  <strong>
                    {item.role.charAt(0).toUpperCase() + item.role.slice(1)}:
                  </strong>
                </Typography>
                <Box
                  component="div"
                  dangerouslySetInnerHTML={{
                    __html: item.content.replace(/\n/g, "<br />"),
                  }}
                />
              </StyledPaper>
            ))}
          </List>
        )}
        <StyledPaper elevation={3}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "1rem", alignItems: "center" }}
          >
            <TextField
              label="Ask a question"
              variant="outlined"
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading} // Disable input while loading
            />
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Ask
            </StyledButton>
          </form>
        </StyledPaper>
        {loading && !showAd && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <CircularProgress />
          </Box>
        )}
      </Container>
    </>
  );
}
