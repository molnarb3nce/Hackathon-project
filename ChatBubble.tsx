import React, { FormEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";

type ChatPosition = "right" | "left";
type ChatViewMode = "drawer" | "page";
type ChatMessage = { id: number; text: string; isUser: boolean };

interface ChatBubbleProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  recommendations?: string[];
  defaultPosition?: ChatPosition;
  variant?: "drawer" | "page";
}

const defaultRecommendations = [
  "Draft a product update",
  "Design a cleaner onboarding flow",
  "Summarize my meeting notes",
  "Generate customer responses",
];

const demoResponses = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Here is a concise summary of the latest activity.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. I reviewed the context and matched the relevant details.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. The recommended next step is to review the priority queue.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. I can turn this into a clear action plan for the team.",
];

const loadingLabels = ["Thinking", "Searching", "Connecting dots", "Summarizing", "Researching"];
const responseDelayMs = 6000;
const wordIntervalMs = 75;

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOpen = true,
  onClose,
  title = "AI Chat",
  recommendations = defaultRecommendations,
  defaultPosition = "right",
  variant = "drawer",
}) => {
  const [drawerOpen, setDrawerOpen] = useState(isOpen);
  const [position, setPosition] = useState<ChatPosition>(defaultPosition);
  const [viewMode, setViewMode] = useState<ChatViewMode>(variant === "page" ? "page" : "drawer");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [pendingResponse, setPendingResponse] = useState<null | { id: number; text: string }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingStatus, setShowLoadingStatus] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Thinking");

  const isFullPage = viewMode === "page";

  useEffect(() => {
    setDrawerOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setViewMode(variant === "page" ? "page" : "drawer");
  }, [variant]);

  const handleClose = () => {
    setDrawerOpen(false);
    onClose?.();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const messageId = Date.now();
    const userMessage = { id: messageId, text: trimmed, isUser: true };
    const reply = {
      id: messageId + 1,
      text: demoResponses[Math.floor(Math.random() * demoResponses.length)],
    };

    setMessages((current) => [...current, userMessage]);
    setPendingResponse(reply);
    setLoadingLabel("Thinking");
    setShowLoadingStatus(true);
    setIsLoading(true);
    setInputValue("");
  };

  useEffect(() => {
    if (!pendingResponse) {
      return undefined;
    }

    const response = pendingResponse;
    const words = response.text.split(" ");
    let wordIndex = 0;
    let typingTimer: ReturnType<typeof setInterval> | undefined;
    let labelIndex = 0;

    const labelTimer = setInterval(() => {
      labelIndex = (labelIndex + 1) % loadingLabels.length;
      setLoadingLabel(loadingLabels[labelIndex]);
    }, 2000);

    const responseTimer = setTimeout(() => {
      setShowLoadingStatus(false);
      setMessages((current) => [...current, { id: response.id, text: "", isUser: false }]);
      typingTimer = setInterval(() => {
        wordIndex += 1;
        setMessages((current) =>
          current.map((message) =>
            message.id === response.id
              ? { ...message, text: words.slice(0, wordIndex).join(" ") }
              : message,
          ),
        );

        if (wordIndex >= words.length) {
          if (typingTimer) {
            clearInterval(typingTimer);
          }
          setIsLoading(false);
          setPendingResponse(null);
        }
      }, wordIntervalMs);
    }, responseDelayMs);

    return () => {
      clearInterval(labelTimer);
      clearTimeout(responseTimer);
      if (typingTimer) {
        clearInterval(typingTimer);
      }
    };
  }, [pendingResponse]);

  const togglePosition = () => {
    setPosition((current) => (current === "right" ? "left" : "right"));
  };

  const toggleViewMode = () => {
    setViewMode((current) => (current === "drawer" ? "page" : "drawer"));
  };

  const selectViewMode = (mode: ChatViewMode) => {
    setViewMode(mode);
    closeMenus();
  };

  const closeMenus = () => {
    setMoreMenuAnchor(null);
  };

  return (
    <Drawer
      anchor={position}
      open={drawerOpen}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      transitionDuration={{ enter: 320, exit: 240 }}
      slotProps={{
        paper: {
          sx: {
            width: isFullPage ? "100vw" : { xs: "100vw", sm: 420 },
            maxWidth: isFullPage ? "100vw" : 420,
            height: "100vh",
            top: 0,
            bottom: 0,
            borderRadius: 0,
            boxShadow: "none",
            border: "none",
            overflow: "hidden",
            bgcolor: "#f8fafc",
            m: 0,
          },
        },
        backdrop: {
          sx: {
            backgroundColor: "rgba(255, 255, 255, 0.82)",
          },
        },
      }}
      sx={{
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                px: 1.2,
                py: 0.7,
                borderRadius: 1.5,
                bgcolor: "#dbeafe",
                color: "#0f172a",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              {title}
            </Box>
          </Box>

          <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={togglePosition}
              aria-label="Toggle chat side"
              sx={{
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                width: 34,
                height: 34,
                borderRadius: 1.5,
              }}
            >
              <ViewSidebarIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(event) => setMoreMenuAnchor(event.currentTarget)}
              aria-label="More options"
              sx={{
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                width: 34,
                height: 34,
                borderRadius: 1.5,
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={moreMenuAnchor}
              open={Boolean(moreMenuAnchor)}
              onClose={closeMenus}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => selectViewMode("page")}>
                Full page view
              </MenuItem>
              <MenuItem onClick={() => selectViewMode("drawer")}>
                Drawer view
              </MenuItem>
            </Menu>
            <IconButton
              size="small"
              onClick={handleClose}
              aria-label="Close chat"
              sx={{
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                width: 34,
                height: 34,
                borderRadius: 1.5,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            px: 2,
            pt: 2.5,
            pb: 1.5,
            bgcolor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "auto",
          }}
        >
          {messages.length === 0 && (
            <>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: 24, sm: 30 },
                  lineHeight: 1.15,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#0f172a",
                }}
              >
                How can I help, user?
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
                {recommendations.map((recommendation) => (
                  <Button
                    key={recommendation}
                    variant="outlined"
                    onClick={() => setInputValue(recommendation)}
                    sx={{
                      borderColor: "rgba(15, 23, 42, 0.08)",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      borderRadius: 2,
                      py: 1,
                      px: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 13,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      justifyContent: "flex-start",
                      minHeight: 0,
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                        borderColor: "rgba(15, 23, 42, 0.12)",
                      },
                    }}
                  >
                    {recommendation}
                  </Button>
                ))}
              </Box>
            </>
          )}

          {messages.length > 0 && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: message.isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "82%",
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      backgroundColor: message.isUser ? "#dbeafe" : "#e5e7eb",
                      color: message.isUser ? "#0f172a" : "#111827",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {message.text}
                  </Box>
                </Box>
              ))}
              {showLoadingStatus && (
                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 13,
                    fontStyle: "italic",
                    animation: "chatPulse 1.4s ease-in-out infinite",
                    "@keyframes chatPulse": {
                      "0%, 100%": { opacity: 0.42 },
                      "50%": { opacity: 1 },
                    },
                  }}
                >
                  {loadingLabel}
                  <Box component="span" sx={{ display: "inline-block", width: 18, overflow: "hidden", verticalAlign: "bottom" }}>
                    <Box component="span" sx={{ animation: "chatDots 1.2s steps(4, end) infinite", "@keyframes chatDots": { from: { transform: "translateX(0)" }, to: { transform: "translateX(-12px)" } } }}>
                      ...
                    </Box>
                  </Box>
                </Typography>
              )}
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            borderTop: "1px solid rgba(15, 23, 42, 0.06)",
            px: 2,
            py: 1.5,
            bgcolor: "#ffffff",
            mt: "auto",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Paper
              component="div"
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                px: 1,
                py: 0.75,
                minHeight: 90,
              }}
            >
              <InputBase
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Type your message..."
                inputProps={{ "aria-label": "Message input" }}
                sx={{
                  fontSize: 15,
                  color: "#0f172a",
                  alignItems: "flex-end",
                  minHeight: 72,
                  py: 0.75,
                  "& input::placeholder": {
                    color: "#64748b",
                    opacity: 1,
                  },
                }}
              />

              <IconButton
                type="submit"
                aria-label="Send message"
                disableRipple
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.75,
                  alignSelf: "flex-end",
                  backgroundColor: "#93c5fd",
                  color: "#0f172a",
                  "&:hover": {
                    backgroundColor: "#7dd3fc",
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Paper>
          </form>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatBubble;
