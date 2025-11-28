import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import type { LoginRequest } from "../types";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginRequest>({
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            await login(formData);
            setMessage("✅ Login successful!");
            setTimeout(() => navigate("/feed"), 1000);
        } catch (err: any) {
            setMessage(`❌ ${err.parsedMessage || err.response?.data || "Login failed"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "80vh",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        width: "100%",
                        maxWidth: 400,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        align="center"
                        color="primary"
                        fontWeight="bold"
                    >
                        BharatPulse
                    </Typography>
                    <Typography
                        variant="h5"
                        component="h2"
                        align="center"
                        gutterBottom
                    >
                        Sign In
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        align="center" 
                        sx={{ mb: 3 }}
                    >
                        Sign in to your account
                    </Typography>

                    {message && (
                        <Alert 
                            severity={message.includes('✅') ? 'success' : 'error'} 
                            sx={{ mb: 2 }}
                        >
                            {message}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Sign In"}
                        </Button>
                    </Box>
                    
                    <Box sx={{ textAlign: "center", mt: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                            Don't have an account?{" "}
                            <Link
                                component={RouterLink}
                                to="/register"
                                style={{ fontWeight: "bold" }}
                            >
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;