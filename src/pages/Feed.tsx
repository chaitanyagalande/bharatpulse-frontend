import React, { useEffect, useState } from "react";
import { pollsAPI } from "../services/api";
import type { PollWithVoteResponse } from "../types";
import {
    Box,
    Chip,
    CircularProgress,
    Container,
    InputAdornment,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { AccessTime, LocationOn, Public, Search, TrendingUp } from "@mui/icons-material";
import PollCard from "../components/PollCard";
import { useAuth } from "../context/AuthContext";

const Feed: React.FC = () => {
    const [polls, setPolls] = useState<PollWithVoteResponse[]>([]);
    const [sortBy, setSortBy] = useState("latest");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const { user } = useAuth();

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const data = searchQuery
                ? await pollsAPI.searchPolls(searchQuery, sortBy)
                : await pollsAPI.getPollFeed(sortBy);
            setPolls(data);
        } catch (error) {
            console.error("Failed to fetch polls:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, [sortBy]);

    useEffect(() => {
        const timeoutId = setTimeout(fetchPolls, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSortChange = (
        _: React.MouseEvent<HTMLElement>,
        newSortBy: string
    ) => {
        if (newSortBy !== null) {
            setSortBy(newSortBy);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    fontWeight="bold"
                >
                    Poll Feed
                </Typography>
                
                {/* Mode Indicator - Show only once at the top */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        icon={user?.mode === 'EXPLORE' ? <Public /> : <LocationOn />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" fontWeight="bold">
                                    {user?.mode} MODE
                                </Typography>
                                {user?.mode === 'LOCAL' && (
                                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                                        - Vote to see results
                                    </Typography>
                                )}
                            </Box>
                        }
                        color={user?.mode === 'EXPLORE' ? "primary" : "secondary"}
                        variant="outlined"
                        sx={{ 
                            fontWeight: 'bold',
                            borderWidth: 2,
                            '& .MuiChip-icon': {
                                color: 'inherit'
                            }
                        }}
                    />
                </Box>

                <Box
                    display="flex"
                    gap={2}
                    mb={3}
                    flexWrap="wrap"
                    alignItems="center"
                >
                    <TextField
                        placeholder="Search polls..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ minWidth: 200, flexGrow: 1 }}
                        size="small"
                    />

                    <ToggleButtonGroup
                        value={sortBy}
                        exclusive
                        onChange={handleSortChange}
                        aria-label="sort polls"
                        size="small"
                    >
                        <ToggleButton value="latest">
                            <AccessTime sx={{ mr: 1 }} /> Latest
                        </ToggleButton>
                        <ToggleButton value="oldest">
                            <AccessTime sx={{ mr: 1 }} /> Oldest
                        </ToggleButton>
                        <ToggleButton value="mostVoted">
                            <TrendingUp sx={{ mr: 1 }} /> Most Voted
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {initialLoad ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    polls.map((pollData) => (
                        <PollCard
                            key={pollData.poll.id}
                            pollData={pollData}
                            onVoteUpdate={fetchPolls}
                            userMode={user?.mode}
                        />
                    ))
                )}

                {!loading && !initialLoad && polls.length === 0 && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        align="center"
                        my={4}
                    >
                        {searchQuery
                            ? `No polls found for "${searchQuery}"`
                            : "No polls found. Be the first to create one!"}
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default Feed;
