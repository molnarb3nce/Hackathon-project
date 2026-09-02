import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme, Button, Box } from "@mui/material";
import ChatBubble from "../ChatBubble";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111827",
    },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", sans-serif',
  },
});

function App() {
  const [open, setOpen] = React.useState(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        }}
      >
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Open chat
        </Button>
      </Box>

      <ChatBubble
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultPosition="right"
        variant="drawer"
      />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
