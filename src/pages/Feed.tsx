import React, { useEffect, useState } from "react";
import { pollsAPI } from "../services/api";
import type { PollWithVoteResponse } from "../types";
import {
    Box,
    CircularProgress,
    Container,
    InputAdornment,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { AccessTime, Search, TrendingUp } from "@mui/icons-material";
import PollCard from "../components/PollCard";

const Feed: React.FC = () => {
    const [polls, setPolls] = useState<PollWithVoteResponse[]>([]);
    const [sortBy, setSortBy] = useState("latest");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

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
