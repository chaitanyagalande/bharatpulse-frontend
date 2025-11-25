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
    Link,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import StateCitySelect from "../components/StateCitySelect";

const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterRequest>({
        username: "",
        email: "",
        password: "",
        city: "",
    });
    const [selectedState, setSelectedState] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate city selection
        if (!formData.city) {
            setMessage("❌ Please select a city");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await register(formData);
            setMessage("✅ Registration successful! Please login.");
            setFormData({
                username: "",
                email: "",
                password: "",
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
        <Container component="main" maxWidth="sm">
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
                        component="h1"
                        variant="h4"
                        align="center"
                        gutterBottom
                        color="primary"
                        fontWeight="bold"
                    >
                        CityPolling
                    </Typography>
                    <Typography
                        component="h2"
                        variant="h5"
                        align="center"
                        gutterBottom
                    >
                        Create Account
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="textSecondary" 
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

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
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
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Sign Up"}
                        </Button>
                        <Box textAlign="center">
                            <Typography variant="body2" color="textSecondary">
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
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;