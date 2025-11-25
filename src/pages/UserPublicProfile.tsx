import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Container,
    Paper,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { PollWithVoteResponse, UserPublicProfileResponse } from "../types";
import { publicProfileAPI } from "../services/api";
import { Person, Create, HowToVote } from "@mui/icons-material";
import PollCard from "../components/PollCard";

// Format city name function
const formatCityName = (city: string): string => {
    if (!city) return '';
  
    return city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
    children,
    value,
    index,
    ...other
}) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

const UserPublicProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<UserPublicProfileResponse | null>(
        null
    );
    const [createdPolls, setCreatedPolls] = useState<PollWithVoteResponse[]>(
        []
    );
    const [votedPolls, setVotedPolls] = useState<PollWithVoteResponse[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;

            setLoading(true);
            setError("");
            try {
                const profileData = await publicProfileAPI.getUserProfile(
                    username
                );
                setProfile(profileData);

                const [created, voted] = await Promise.all([
                    publicProfileAPI.getPollsCreatedByUser(profileData.id),
                    publicProfileAPI.getPollsVotedByUser(profileData.id),
                ]);

                setCreatedPolls(created);
                setVotedPolls(voted);
            } catch (err: any) {
                setError(err.response?.data || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Format profile city
    const formattedProfileCity = profile ? formatCityName(profile.city) : '';

    // Calculate city stats with created and voted counts
    const getCityStats = () => {
        if (!profile) return [];

        return profile.activeCities.map(city => {
            const createdInCity = createdPolls.filter(poll => 
                poll.poll.city === city.city
            );
            const votedInCity = votedPolls.filter(poll => 
                poll.poll.city === city.city
            );

            const formattedCityName = formatCityName(city.city);

            return {
                ...city,
                city: formattedCityName, // Use formatted city name
                pollsCreatedCount: createdInCity.length,
                pollsVotedCount: votedInCity.length,
            };
        });
    };

    const cityStats = getCityStats();

    if (loading) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !profile) {
        return (
            <Container maxWidth="md">
                <Alert severity="error" sx={{ my: 4 }}>
                    {error || "Profile not found"}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                {/* Profile Header */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Person sx={{ fontSize: 40 }} color="primary" />
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                fontWeight="bold"
                            >
                                {profile.username}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {formattedProfileCity} {/* Use formatted city name */}
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" gap={3} flexWrap="wrap">
                        <Box textAlign="center">
                            <Typography variant="h6" color="primary">
                                {profile.totalPollsCreatedCount}
                            </Typography>
                            <Typography variant="body2">
                                Polls Created
                            </Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h6" color="secondary">
                                {profile.totalPollsVotedCount}
                            </Typography>
                            <Typography variant="body2">Polls Voted</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h6">
                                {profile.totalPollsCreatedCount +
                                    profile.totalPollsVotedCount}
                            </Typography>
                            <Typography variant="body2">
                                Total Activity
                            </Typography>
                        </Box>
                    </Box>

                    {/* Active Cities - Minimalistic */}
                    {cityStats.length > 0 && (
                        <Box mt={2}>
                            <Typography variant="h6" gutterBottom>
                                Active Cities
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {cityStats.map((city) => (
                                    <Chip
                                        key={city.city}
                                        label={
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2" component="div" fontWeight="medium">
                                                    {city.city} ({city.percentage.toFixed(1)}%)
                                                </Typography>
                                                <Typography variant="caption" component="div" color="text.secondary">
                                                    Created: {city.pollsCreatedCount} • Voted: {city.pollsVotedCount}
                                                </Typography>
                                            </Box>
                                        }
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            height: 'auto',
                                            py: 1,
                                            '& .MuiChip-label': {
                                                display: 'block',
                                                whiteSpace: 'normal',
                                                px: 1.5,
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Tabs */}
                <Paper>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab icon={<Create />} label="Created Polls" />
                        <Tab icon={<HowToVote />} label="Voted Polls" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        {createdPolls.length === 0 ? (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                align="center"
                            >
                                {profile.username} hasn't created any polls yet.
                            </Typography>
                        ) : (
                            createdPolls.map((pollData) => (
                                <PollCard
                                    key={pollData.poll.id}
                                    pollData={pollData}
                                    onVoteUpdate={() => {}}
                                    readOnly={true}
                                    profileUsername={profile.username}
                                    userMode="EXPLORE" // Always show results in public profile page
                                />
                            ))
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        {votedPolls.length === 0 ? (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                align="center"
                            >
                                {profile.username} hasn't voted on any polls
                                yet.
                            </Typography>
                        ) : (
                            votedPolls.map((pollData) => (
                                <PollCard
                                    key={pollData.poll.id}
                                    pollData={pollData}
                                    onVoteUpdate={() => {}}
                                    readOnly={true}
                                    profileUsername={profile.username}
                                    userMode="EXPLORE" // Always show results in public profile page
                                />
                            ))
                        )}
                    </TabPanel>
                </Paper>
            </Box>
        </Container>
    );
};

export default UserPublicProfile;