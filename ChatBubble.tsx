import React, { FormEvent, useEffect, useRef, useState } from "react";
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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

type ChatPosition = "right" | "left";
type ChatViewMode = "drawer" | "page";
type ChatMessage = { id: number; text: string; isUser: boolean };
type StarPosition = { top: string; left: string };

interface ChatBubbleProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  recommendations?: string[];
  defaultPosition?: ChatPosition;
  variant?: "drawer" | "page";
}

const defaultRecommendations = [
  "Show me unusual behaviors",
  "What rules triggered the most this week",
  "Suggest improvements to reduce false positives",
];

const additionalRecommendations = [
  "Summarize the latest transaction activity",
  "Find related transactions",
  "Explain this transaction",
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

const getRandomStarPositions = (): StarPosition[] => {
  const positions: Array<{ top: number; left: number }> = [];

  while (positions.length < 4) {
    const candidate = {
      top: 12 + Math.random() * 72,
      left: 7 + Math.random() * 86,
    };
    const isFarEnough = positions.every((position) =>
      Math.hypot(candidate.top - position.top, candidate.left - position.left) >= 18,
    );

    if (isFarEnough) {
      positions.push(candidate);
    }
  }

  return positions.map((position) => ({
    top: `${position.top}%`,
    left: `${position.left}%`,
  }));
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOpen = true,
  onClose,
  title = "Ai chat",
  recommendations = defaultRecommendations,
  defaultPosition = "right",
  variant = "drawer",
}) => {
  const [drawerOpen, setDrawerOpen] = useState(isOpen);
  const [position, setPosition] = useState<ChatPosition>(defaultPosition);
  const [isSwitchingSide, setIsSwitchingSide] = useState(false);
  const sideSwitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewModeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isViewModeChanging, setIsViewModeChanging] = useState(false);
  const sideOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viewMode, setViewMode] = useState<ChatViewMode>(variant === "page" ? "page" : "drawer");
  const [inputValue, setInputValue] = useState("");
  const [showMoreRecommendations, setShowMoreRecommendations] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [pendingResponse, setPendingResponse] = useState<null | { id: number; text: string }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingStatus, setShowLoadingStatus] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Thinking");
  const [starPositions, setStarPositions] = useState<StarPosition[]>(getRandomStarPositions);

  const isFullPage = viewMode === "page";

  useEffect(() => {
    setDrawerOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setViewMode(variant === "page" ? "page" : "drawer");
  }, [variant]);

  useEffect(() => () => {
    if (sideSwitchTimer.current) {
      clearTimeout(sideSwitchTimer.current);
    }
    if (viewModeTimer.current) {
      clearTimeout(viewModeTimer.current);
    }
    if (sideOpenTimer.current) {
      clearTimeout(sideOpenTimer.current);
    }
  }, []);

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

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    setStarPositions(getRandomStarPositions());
    let starInterval: ReturnType<typeof setInterval> | undefined;
    const starTimer = setTimeout(() => {
      setStarPositions(getRandomStarPositions());
      starInterval = setInterval(() => {
        setStarPositions(getRandomStarPositions());
      }, 2400);
    }, 1200);

    return () => {
      clearTimeout(starTimer);
      if (starInterval) {
        clearInterval(starInterval);
      }
    };
  }, [isLoading]);

  const togglePosition = () => {
    if (isSwitchingSide) {
      return;
    }

    setIsSwitchingSide(true);
    setDrawerOpen(false);
    sideSwitchTimer.current = setTimeout(() => {
      setPosition((current) => (current === "right" ? "left" : "right"));
      sideSwitchTimer.current = null;
      sideOpenTimer.current = setTimeout(() => {
        setDrawerOpen(true);
        setIsSwitchingSide(false);
        sideOpenTimer.current = null;
      }, 20);
    }, 260);
  };

  const toggleViewMode = () => {
    selectViewMode(viewMode === "drawer" ? "page" : "drawer");
  };

  const selectViewMode = (mode: ChatViewMode) => {
    if (mode !== viewMode) {
      setIsViewModeChanging(true);
      if (viewModeTimer.current) {
        clearTimeout(viewModeTimer.current);
      }
      viewModeTimer.current = setTimeout(() => {
        setIsViewModeChanging(false);
        viewModeTimer.current = null;
      }, 480);
    }
    setViewMode(mode);
    closeMenus();
  };

  const closeMenus = () => {
    setMoreMenuAnchor(null);
  };

  return (
    <Drawer
      key={position}
      anchor={position}
      open={drawerOpen}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      transitionDuration={{ enter: 360, exit: 240 }}
      slotProps={{
        paper: {
          sx: {
            width: isFullPage ? "100vw" : { xs: "100vw", sm: 450 },
            maxWidth: isFullPage ? "100vw" : 450,
            height: "100vh",
            top: 0,
            bottom: 0,
            borderRadius: 0,
            boxShadow: "none",
            border: "none",
            overflow: "hidden",
            bgcolor: "#ffffff",
            m: 0,
            willChange: "width, max-width",
            transition: "width 480ms cubic-bezier(0.22, 1, 0.36, 1), max-width 480ms cubic-bezier(0.22, 1, 0.36, 1)",
            animation: isViewModeChanging
              ? `${isFullPage ? "drawerExpandToPage" : "drawerCollapseToDrawer"} 480ms cubic-bezier(0.22, 1, 0.36, 1) both`
              : "none",
            "@keyframes drawerExpandToPage": {
              from: { width: "450px", maxWidth: "450px" },
              to: { width: "100vw", maxWidth: "100vw" },
            },
            "@keyframes drawerCollapseToDrawer": {
              from: { width: "100vw", maxWidth: "100vw" },
              to: { width: "450px", maxWidth: "450px" },
            },
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
          position: "relative",
          zIndex: 0,
          bgcolor: "transparent",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: "linear-gradient(110deg, rgba(192, 132, 252, 0.24) 0%, rgba(255, 255, 255, 0.94) 58%, #ffffff 100%)",
            opacity: isLoading ? 1 : 0,
            transition: "opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            opacity: isLoading ? 1 : 0,
            transition: "opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)",
            "& .thinkingStar": {
              position: "absolute",
              color: "#a78bfa",
              animation: "backgroundSparkle 2.4s ease-in-out infinite",
              "@keyframes backgroundSparkle": {
                "0%, 35%, 100%": { opacity: 0.22, transform: "scale(0.75) rotate(-10deg)" },
                "45%, 55%": { opacity: 0, transform: "scale(0.75) rotate(-10deg)" },
                "50%": { opacity: 0, transform: "scale(0.75) rotate(-10deg)" },
                "65%": { opacity: 0.8, transform: "scale(1.15) rotate(10deg)" },
              },
            },
          }}
        >
          {starPositions.map((star, index) => (
            <AutoAwesomeIcon
              key={index}
              className="thinkingStar"
              sx={{
                top: star.top,
                left: star.left,
                fontSize: [21, 14, 16, 11][index],
                animationDelay: `${index * 550}ms`,
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2.25,
            bgcolor: "transparent",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MenuIcon sx={{ color: "#8591a6", fontSize: 22 }} />
            <Typography sx={{ color: "#202833", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
              {title}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.8} sx={{ alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={togglePosition}
              disabled={isFullPage || isSwitchingSide}
              aria-label="Toggle chat side"
              sx={{
                color: "#8591a6",
                width: 34,
                height: 34,
                borderRadius: 1,
                "&.Mui-disabled": {
                  color: "#c4cad4",
                },
              }}
            >
              <ViewSidebarIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(event) => setMoreMenuAnchor(event.currentTarget)}
              aria-label="More options"
              sx={{
                color: "#8591a6",
                width: 34,
                height: 34,
                borderRadius: 1,
              }}
            >
                <MoreHorizIcon fontSize="small" />
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
                color: "#8591a6",
                width: 34,
                height: 34,
                borderRadius: 1,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            px: 3,
            pt: 2,
            pb: 1.5,
            bgcolor: "transparent",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            overflow: "auto",
            justifyContent: messages.length === 0 ? "flex-end" : "flex-start",
            position: "relative",
            zIndex: 2,
          }}
        >
          {messages.length === 0 && (
            <>
              <Typography
                variant="h4"
                sx={{
                  fontSize: 18,
                  lineHeight: 1.15,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#202833",
                }}
              >
                How can I help, user?
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}>
                {[...recommendations, ...(showMoreRecommendations ? additionalRecommendations : [])].map((recommendation) => (
                  <Button
                    key={recommendation}
                    variant="outlined"
                    onClick={() => setInputValue(recommendation)}
                    sx={{
                      color: "#697486",
                      border: "none",
                      borderRadius: 1,
                      py: 0.55,
                      px: 0,
                      textTransform: "none",
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: 1.2,
                      whiteSpace: "normal",
                      justifyContent: "flex-start",
                      minHeight: 0,
                      "&:hover": {
                        backgroundColor: "#f7f8fa",
                      },
                    }}
                  >
                    <ShowChartIcon sx={{ mr: 1, fontSize: 19, color: "#8591a6" }} />
                    {recommendation}
                  </Button>
                ))}
                <Button
                  onClick={() => setShowMoreRecommendations((current) => !current)}
                  sx={{
                    color: "#697486",
                    borderRadius: 1,
                    py: 0.55,
                    px: 0,
                    textTransform: "none",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: 1.2,
                    justifyContent: "flex-start",
                    minHeight: 0,
                    "&:hover": { backgroundColor: "#f7f8fa" },
                  }}
                >
                  <KeyboardArrowDownIcon sx={{ mr: 1, fontSize: 20, color: "#8591a6", transform: showMoreRecommendations ? "rotate(180deg)" : "none" }} />
                  {showMoreRecommendations ? "Show less" : "Show more"}
                </Button>
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
                      backgroundColor: message.isUser ? "#ede9fe" : "#e5e7eb",
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
                <Box sx={{ color: "#8b5cf6" }}>
                  <Typography
                    sx={{
                      color: "inherit",
                      fontSize: 13,
                      fontStyle: "italic",
                      animation: "thinkingPulse 1.4s ease-in-out infinite",
                      "@keyframes thinkingPulse": {
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
                </Box>
              )}
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            borderTop: "1px solid rgba(15, 23, 42, 0.06)",
            px: 3,
            py: 2.25,
            bgcolor: "transparent",
            mt: "auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Paper
              component="div"
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                position: "relative",
                border: "1px solid #d8dde5",
                backgroundColor: "#ffffff",
                borderRadius: 1.5,
                px: 1,
                py: 0,
                minHeight: 138,
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
                placeholder="Do anything with AI..."
                inputProps={{ "aria-label": "Message input" }}
                sx={{
                  fontSize: 15,
                  color: "#0f172a",
                  minHeight: 102,
                  py: 0,
                  pl: 1,
                  "& textarea": {
                    paddingTop: 0,
                  },
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
                  mb: 1,
                  backgroundColor: "#a78bfa",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#8b5cf6",
                  },
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </Paper>
          </form>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatBubble;
