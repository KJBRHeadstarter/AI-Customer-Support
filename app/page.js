"use client";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  IconButton,
  ThemeProvider,
  createTheme,
  Fade,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useRef, useEffect } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#D5D5D5",
    },
    secondary: {
      main: "#3f51b5",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          textTransform: "none",
        },
      },
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I'm Branbong, Brandon's support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setMessage(""); // Clear the input field
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          messages.slice(1).concat({ role: "user", content: message })
        ),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const otherMessages = prevMessages.slice(0, prevMessages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + chunk },
          ];
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setFadeOut(true);
    setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content: `Hello! I'm Branbong, Brandon's support assistant. How can I help you today?`,
        },
      ]);
      setFadeOut(false);
    }, 500);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            width: { xs: "95%", sm: "80%", md: "600px" },
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Chat with Branbong
            </Typography>
            <IconButton onClick={clearChat} color="inherit" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Fade in={!fadeOut} timeout={500}>
              <Box>
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.role === "assistant" ? "flex-start" : "flex-end",
                      mb: 2,
                      animation: "fadeIn 0.5s ease-out",
                      "@keyframes fadeIn": {
                        "0%": { opacity: 0, transform: "translateY(10px)" },
                        "100%": { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    {msg.role === "assistant" && (
                      <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>B</Avatar>
                    )}
                    <Box
                      sx={{
                        maxWidth: "70%",
                        bgcolor:
                          msg.role === "assistant"
                            ? "primary.light"
                            : "secondary.light",
                        color:
                          msg.role === "assistant"
                            ? "primary.contrastText"
                            : "secondary.contrastText",
                        borderRadius: 3,
                        p: 2,
                        wordBreak: "break-word",
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                    </Box>
                    {msg.role === "user" && (
                      <Avatar sx={{ bgcolor: "secondary.main", ml: 1 }}>
                        U
                      </Avatar>
                    )}
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
            </Fade>
          </Box>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            sx={{
              p: 2,
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    bgcolor: "background.default",
                  },
                }}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
                sx={{
                  ml: 1,
                  px: 3,
                  py: 1.5,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
