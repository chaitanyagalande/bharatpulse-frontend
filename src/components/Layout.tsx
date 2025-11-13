import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    IconButton,
    useMediaQuery,
    useTheme,
    ListItemButton,
} from "@mui/material";
import {
    Menu,
    Feed,
    HowToVote,
    Create,
    Person,
    Logout,
    Add,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import CreatePollDialog from "./CreatePollDialog";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createPollOpen, setCreatePollOpen] = useState(false);

    const menuItems = [
        { text: "Feed", icon: <Feed />, path: "/feed" },
        { text: "My Polls", icon: <Create />, path: "/my-polls" },
        { text: "My Votes", icon: <HowToVote />, path: "/my-votes" },
        { text: "Profile", icon: <Person />, path: "/profile" },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            sx={{ mr: 2 }}
                        >
                            <Menu />
                        </IconButton>
                    )}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: "pointer" }}
                        onClick={() => navigate("/feed")}
                    >
                        CityPolling
                    </Typography>
                    {!isMobile && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.text}
                                    color="inherit"
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        backgroundColor:
                                            location.pathname === item.path
                                                ? "rgba(255,255,255,0.1)"
                                                : "transparent",
                                    }}
                                >
                                    {item.text}
                                </Button>
                            ))}
                        </Box>
                    )}
                    <Button
                        color="inherit"
                        startIcon={<Add />}
                        onClick={() => setCreatePollOpen(true)}
                        sx={{ ml: 2 }}
                    >
                        Create Poll
                    </Button>
                    <Button color="inherit" onClick={logout} sx={{ ml: 1 }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {isMobile && (
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: 240,
                        },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: "auto" }}>
                        <List>
                            {menuItems.map((item) => (
                                <ListItemButton
                                    key={item.text}
                                    onClick={() => handleNavigation(item.path)}
                                    selected={location.pathname === item.path}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            ))}
                            <ListItemButton onClick={logout}>
                                <ListItemIcon>
                                    <Logout />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </List>
                    </Box>
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: "100%",
                    mt: 8,
                }}
            >
                {children}
            </Box>

            <CreatePollDialog
                open={createPollOpen}
                onClose={() => setCreatePollOpen(false)}
                onPollCreated={() => window.location.reload()}
            />
        </Box>
    );
};

export default Layout;
