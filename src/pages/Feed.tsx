import React, { useEffect, useState } from "react";
import { pollsAPI, tagsAPI } from "../services/api";
import type { PollWithVoteResponse, Tag } from "../types";
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
import { AccessTime, LocationOn, Public, Search, TrendingUp, LocalOffer } from "@mui/icons-material";
import PollCard from "../components/PollCard";
import { useAuth } from "../context/AuthContext";

const Feed: React.FC = () => {
    const [polls, setPolls] = useState<PollWithVoteResponse[]>([]);
    const [sortBy, setSortBy] = useState("latest");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [popularTags, setPopularTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const { user } = useAuth();

    // Fetch popular tags on component mount
    useEffect(() => {
        const fetchPopularTags = async () => {
            try {
                const tags = await tagsAPI.getPopularTags();
                setPopularTags(tags);
            } catch (error) {
                console.error("Failed to fetch popular tags:", error);
            }
        };
        fetchPopularTags();
    }, []);

    const fetchPolls = async () => {
        setLoading(true);
        try {
            let data;
            if (selectedTags.length > 0) {
                // Use filterPolls API when tags are selected
                data = await pollsAPI.filterPolls(selectedTags, searchQuery, sortBy);
            } else {
                // Use searchPolls API when no tags are selected
                data = searchQuery
                    ? await pollsAPI.searchPolls(searchQuery, sortBy)
                    : await pollsAPI.getPollFeed(sortBy);
            }
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
    }, [sortBy, selectedTags]);

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

    const handleTagClick = (tagName: string) => {
        setSelectedTags(prev => 
            prev.includes(tagName) 
                ? prev.filter(tag => tag !== tagName) // Remove if already selected
                : [...prev, tagName] // Add if not selected
        );
    };

    const clearAllTags = () => {
        setSelectedTags([]);
    };

    // Delete this entire function after implementing websockets
    // Scroll preservation for vote updates
    const handleVoteUpdate = () => {
        const scrollPosition = window.scrollY;
        
        // Use requestAnimationFrame for smooth scroll restoration
        requestAnimationFrame(() => {
            fetchPolls().then(() => {
                requestAnimationFrame(() => {
                    window.scrollTo(0, scrollPosition);
                });
            });
        });
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

                {/* Popular Tags Section */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocalOffer sx={{ fontSize: 20, color: '#9C27B0' }} />
                        <Typography variant="h6" fontWeight="bold">
                            Popular Tags
                        </Typography>
                        {selectedTags.length > 0 && (
                            <Chip
                                label="Clear all"
                                size="small"
                                variant="outlined"
                                onClick={clearAllTags}
                                sx={{ 
                                    ml: 1,
                                    cursor: 'pointer',
                                    borderColor: '#9C27B0',
                                    color: '#9C27B0'
                                }}
                            />
                        )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {popularTags.map((tag) => (
                            <Chip
                                key={tag.id}
                                label={`${tag.name} (${tag.usageCount})`}
                                clickable
                                variant={selectedTags.includes(tag.name) ? "filled" : "outlined"}
                                color={selectedTags.includes(tag.name) ? "primary" : "default"}
                                onClick={() => handleTagClick(tag.name)}
                                sx={{
                                    fontWeight: selectedTags.includes(tag.name) ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    {/* Selected Tags Indicator */}
                    {selectedTags.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Filtering by: {selectedTags.join(', ')}
                            </Typography>
                        </Box>
                    )}
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
                            // Delete this line after implementing websockets
                            onVoteUpdate={handleVoteUpdate} // Use the scroll-preserving function
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
                        {selectedTags.length > 0 
                            ? searchQuery
                                ? `No polls found for "${searchQuery}" with selected tags`
                                : "No polls found with selected tags"
                            : searchQuery
                                ? `No polls found for "${searchQuery}"`
                                : "No polls found. Be the first to create one!"}
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default Feed;