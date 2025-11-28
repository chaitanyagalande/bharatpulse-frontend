import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React, { useState } from "react";
import type { RegisterRequest } from "../types";
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
import StateCitySelect from "../components/StateCitySelect";

const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterRequest & { confirmPassword: string }>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        city: "",
    });
    const [selectedState, setSelectedState] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleStateChange = (stateCode: string) => {
        setSelectedState(stateCode);
        // Reset city when state changes
        setFormData(prev => ({
            ...prev,
            city: ""
        }));
    };

    const handleCityChange = (city: string) => {
        setFormData(prev => ({
            ...prev,
            city: city
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate city selection
        if (!formData.city) {
            setMessage("❌ Please select a city");
            return;
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setMessage("❌ Passwords do not match");
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setMessage("❌ Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // Create register data without confirmPassword
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            setMessage("✅ Registration successful! Please login.");
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
                city: "",
            });
            setSelectedState("");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            setMessage(`❌ ${err.parsedMessage || err.response?.data || "Registration failed"}`);
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
                    minHeight: "100vh",
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
                        variant="h1"
                        component="h1"
                        gutterBottom
                        align="center"
                        color="primary"
                        fontWeight="bold"
                        sx={{ 
                            fontSize: { xs: '2.5rem', sm: '3rem' },
                            mb: 1
                        }}
                    >
                        BharatPulse
                    </Typography>
                    
                    <Typography
                        variant="subtitle1"
                        component="p"
                        align="center"
                        color="text.secondary"
                        sx={{ 
                            mb: 3,
                            fontStyle: 'italic',
                            lineHeight: 1.4,
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                    >
                        A City-Based Community Polling Platform{" "}
                        <Box 
                            component="span" 
                            sx={{ 
                                display: 'block',
                                fontWeight: 'medium',
                                color: 'primary.main'
                            }}
                        >
                            for Indian Cities
                        </Box>
                    </Typography>

                    <Typography
                        variant="h5"
                        component="h2"
                        align="center"
                        gutterBottom
                        fontWeight="bold"
                    >
                        Create Account
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        align="center" 
                        sx={{ mb: 3 }}
                    >
                        Sign up for a new account
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
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        
                        {/* Password Field with Visibility Toggle */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
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
                            helperText="Password must be at least 6 characters"
                        />
                        
                        {/* Confirm Password Field with Visibility Toggle */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirm password visibility"
                                            onClick={handleClickShowConfirmPassword}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ""}
                            helperText={
                                formData.password !== formData.confirmPassword && formData.confirmPassword !== "" 
                                    ? "Passwords do not match" 
                                    : ""
                            }
                        />
                        
                        {/* State and City Selection */}
                        <Box sx={{ mt: 2, mb: 1 }}>
                            <StateCitySelect
                                stateValue={selectedState}
                                cityValue={formData.city}
                                onStateChange={handleStateChange}
                                onCityChange={handleCityChange}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Sign Up"}
                        </Button>
                    </Box>
                    
                    <Box sx={{ textAlign: "center", mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{" "}
                            <Link
                                component={RouterLink}
                                to="/login"
                                style={{ fontWeight: "bold" }}
                            >
                                Login here
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;