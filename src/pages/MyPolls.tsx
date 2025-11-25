import { useEffect, useState } from "react";
import type { PollWithVoteResponse } from "../types";
import { pollsAPI } from "../services/api";
import { AccessTime, TrendingUp } from "@mui/icons-material";
import { Container, Box, Typography, ToggleButtonGroup, ToggleButton, Alert, CircularProgress } from "@mui/material";
import PollCard from "../components/PollCard";
import EditPollDialog from "../components/EditPollDialog";

const MyPolls: React.FC = () => {
    const [polls, setPolls] = useState<PollWithVoteResponse[]>([]);
    const [sortBy, setSortBy] = useState("latest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedPoll, setSelectedPoll] =
        useState<PollWithVoteResponse | null>(null);

    const fetchMyPolls = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await pollsAPI.getMyPolls(sortBy);
            setPolls(data);
        } catch (err: any) {
            setError(err.response?.data || "Failed to fetch your polls");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPolls();
    }, [sortBy]);

    const handleSortChange = (
        _: React.MouseEvent<HTMLElement>,
        newSortBy: string
    ) => {
        if (newSortBy !== null) {
            setSortBy(newSortBy);
        }
    };

    const handleEdit = (poll: PollWithVoteResponse) => {
        setSelectedPoll(poll);
        setEditDialogOpen(true);
    };

    const handleDelete = (pollId: number) => {
        setPolls(polls.filter((p) => p.poll.id !== pollId));
    };

    const handlePollUpdated = () => {
        fetchMyPolls();
        setEditDialogOpen(false);
        setSelectedPoll(null);
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
                    My Polls
                </Typography>

                <Box display="flex" justifyContent="flex-end" mb={3}>
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

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    polls.map((pollData) => (
                        <PollCard
                            key={pollData.poll.id}
                            pollData={pollData}
                            onVoteUpdate={fetchMyPolls}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            showActions={true}
                            userMode="EXPLORE" // Forcing results to always show in MyPolls page
                        />
                    ))
                )}

                {!loading && polls.length === 0 && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        align="center"
                        my={4}
                    >
                        You haven't created any polls yet. Create your first
                        poll to get started!
                    </Typography>
                )}

                <EditPollDialog
                    open={editDialogOpen}
                    poll={selectedPoll}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setSelectedPoll(null);
                    }}
                    onPollUpdated={handlePollUpdated}
                />
            </Box>
        </Container>
    );
};

export default MyPolls;
