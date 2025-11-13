import { useState } from "react";
import type { PollWithVoteResponse } from "../types";
import { pollsAPI, votesAPI } from "../services/api";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    LinearProgress,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { MoreVert, Edit, Delete } from "@mui/icons-material";

interface PollCardProps {
    pollData: PollWithVoteResponse;
    onVoteUpdate: () => void;
    onEdit?: (poll: PollWithVoteResponse) => void;
    onDelete?: (pollId: number) => void;
    showActions?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({
    pollData,
    onVoteUpdate,
    onEdit,
    onDelete,
    showActions = false,
}) => {
    const { poll, selectedOption } = pollData;
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState("");

    const options = [
        { number: 1, text: poll.optionOne, votes: poll.optionOneVotes },
        { number: 2, text: poll.optionTwo, votes: poll.optionTwoVotes },
        ...(poll.optionThree
            ? [
                  {
                      number: 3,
                      text: poll.optionThree,
                      votes: poll.optionThreeVotes || 0,
                  },
              ]
            : []),
        ...(poll.optionFour
            ? [
                  {
                      number: 4,
                      text: poll.optionFour,
                      votes: poll.optionFourVotes || 0,
                  },
              ]
            : []),
    ];

    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

    const handleVote = async (optionNumber: number) => {
        if (voting) return;

        setVoting(true);
        setError("");
        try {
            await votesAPI.castVote({
                pollId: poll.id,
                selectedOption: optionNumber,
            });
            onVoteUpdate();
        } catch (err: any) {
            setError(err.response?.data || "Failed to vote");
        } finally {
            setVoting(false);
        }
    };

    const handleRemoveVote = async () => {
        if (voting) return;

        setVoting(true);
        setError("");
        try {
            await votesAPI.removeVote(poll.id);
            onVoteUpdate();
        } catch (err: any) {
            setError(err.response?.data || "Failed to remove vote");
        } finally {
            setVoting(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;

        try {
            await pollsAPI.deletePoll(poll.id);
            onDelete(poll.id);
        } catch (err: any) {
            setError(err.response?.data || "Failed to delete poll");
        }
        setMenuAnchor(null);
    };
    return (
        <Card sx={{ mb: 3, position: "relative" }}>
            <CardContent>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Typography variant="h6" gutterBottom sx={{ pr: 2 }}>
                        {poll.question}
                    </Typography>
                    {showActions && (
                        <>
                            <IconButton
                                size="small"
                                onClick={(e) => setMenuAnchor(e.currentTarget)}
                            >
                                <MoreVert />
                            </IconButton>
                            <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={() => setMenuAnchor(null)}
                            >
                                <MenuItem
                                    onClick={() => {
                                        onEdit?.(pollData);
                                        setMenuAnchor(null);
                                    }}
                                >
                                    <Edit sx={{ mr: 1 }} /> Edit
                                </MenuItem>
                                <MenuItem onClick={handleDelete}>
                                    <Delete sx={{ mr: 1 }} /> Delete
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {poll.createdBy.username} •{" "}
                    {new Date(poll.createdAt).toLocaleDateString()}
                </Typography>

                <Chip
                    label={poll.city}
                    size="small"
                    sx={{ mb: 2 }}
                    color="primary"
                    variant="outlined"
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {options.map((option) => {
                    const percentage =
                        totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    const isSelected = selectedOption === option.number;

                    return (
                        <Box key={option.number} sx={{ mb: 2 }}>
                            <Button
                                fullWidth
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => handleVote(option.number)}
                                disabled={voting}
                                sx={{
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                    textTransform: "none",
                                    py: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    align="left"
                                    sx={{ flex: 1 }}
                                >
                                    {option.text}
                                </Typography>
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                    {option.votes} ({percentage.toFixed(1)}%)
                                </Typography>
                            </Button>
                            <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "grey.200",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 3,
                                    },
                                }}
                            />
                        </Box>
                    );
                })}

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                >
                    <Typography variant="body2" color="text.secondary">
                        {totalVotes} total votes
                    </Typography>
                    {selectedOption && (
                        <Button
                            size="small"
                            onClick={handleRemoveVote}
                            disabled={voting}
                            variant="outlined"
                            color="secondary"
                        >
                            Remove Vote
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default PollCard;
