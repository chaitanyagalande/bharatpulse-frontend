import { useEffect, useState } from "react";
import type { PollWithVoteResponse } from "../types";
import { Alert, Box, CircularProgress, Container, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { HowToVote, AccessTime, TrendingUp } from "@mui/icons-material";
import PollCard from "../components/PollCard";
import { pollsAPI } from "../services/api";

const MyVotes: React.FC = () => {
  const [polls, setPolls] = useState<PollWithVoteResponse[]>([]);
  const [sortBy, setSortBy] = useState('latestvoted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyVotedPolls = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await pollsAPI.getMyVotedPolls(sortBy);
      setPolls(data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to fetch your voted polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVotedPolls();
  }, [sortBy]);

  const handleSortChange = (_: React.MouseEvent<HTMLElement>, newSortBy: string) => {
    if (newSortBy !== null) {
      setSortBy(newSortBy);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          My Votes
        </Typography>

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            aria-label="sort polls"
            size="small"
          >
            <ToggleButton value="latestvoted">
              <HowToVote sx={{ mr: 1 }} /> Latest Voted
            </ToggleButton>
            <ToggleButton value="latest">
              <AccessTime sx={{ mr: 1 }} /> Latest Created
            </ToggleButton>
            <ToggleButton value="mostVoted">
              <TrendingUp sx={{ mr: 1 }} /> Most Voted
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          polls.map((pollData) => (
            <PollCard
              key={pollData.poll.id}
              pollData={pollData}
              onVoteUpdate={fetchMyVotedPolls}
            />
          ))
        )}

        {!loading && polls.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" my={4}>
            You haven't voted on any polls yet. Check out the feed to vote on polls in your city!
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default MyVotes;

