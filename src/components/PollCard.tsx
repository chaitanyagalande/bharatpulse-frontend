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
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { MoreVert, Edit, Delete, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface PollCardProps {
    pollData: PollWithVoteResponse;
    onVoteUpdate: () => void;
    onEdit?: (poll: PollWithVoteResponse) => void;
    onDelete?: (pollId: number) => void;
    showActions?: boolean;
    readOnly?: boolean;
    profileUsername?: string; // Add this to pass the profile username from UserPublicProfile
}

const PollCard: React.FC<PollCardProps> = ({
    pollData,
    onVoteUpdate,
    onEdit,
    onDelete,
    showActions = false,
    readOnly = false,
    profileUsername, // Add this prop
}) => {
    const { poll, selectedOption } = pollData;
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
        if (voting || readOnly) {
            setError("Voting is disabled when viewing other users' profiles");
            return;
        }

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
        if (voting || readOnly) {
            setError("Voting is disabled when viewing other users' profiles");
            return;
        }

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

    const handleUsernameClick = (username: string) => {
        navigate(`/profile/${username}`);
    };

    return (
        <Card sx={{ mb: 3, position: "relative" }}>
            <CardContent>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 1 }}
                >
                    <Typography variant="h6" sx={{ pr: 2, flex: 1 }}>
                        {poll.question}
                    </Typography>

                    {/* Username in top right corner */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                                backgroundColor: "rgba(156, 39, 176, 0.1)",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => handleUsernameClick(poll.createdBy.username)}
                    >
                        <Person sx={{ fontSize: 16, color: "#BA68C8" }} />
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: "#BA68C8",
                                fontSize: "0.8rem",
                            }}
                        >
                            {poll.createdBy.username}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                >
                    <Typography variant="body2" color="text.secondary">
                        {new Date(poll.createdAt).toLocaleDateString()}
                    </Typography>

                    {showActions && (
                        <Box>
                            <IconButton
                                size="small"
                                onClick={(e) => setMenuAnchor(e.currentTarget)}
                                sx={{ color: "#D1C4E9" }}
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
                        </Box>
                    )}
                </Box>

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
                        <Box
                            key={option.number}
                            sx={{ mb: 2, position: "relative" }}
                        >
                            <Button
                                fullWidth
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => handleVote(option.number)}
                                disabled={voting || readOnly}
                                sx={{
                                    justifyContent: "space-between",
                                    textTransform: "none",
                                    py: 1.5,
                                    px: 2,
                                    position: "relative",
                                    overflow: "hidden",
                                    background: isSelected
                                        ? "linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)"
                                        : readOnly
                                        ? "rgba(255, 255, 255, 0.02)"
                                        : "rgba(255, 255, 255, 0.05)",
                                    border: isSelected ? "none" : "1px solid",
                                    borderColor: readOnly
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(156, 39, 176, 0.3)",
                                    "&:hover": readOnly
                                        ? {}
                                        : {
                                              background: isSelected
                                                  ? "linear-gradient(135deg, #8E24AA 0%, #D500F9 100%)"
                                                  : "rgba(156, 39, 176, 0.1)",
                                              transform: "translateY(-1px)",
                                          },
                                    cursor: readOnly ? "default" : "pointer",
                                }}
                            >
                                {/* Progress bar background */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        height: "100%",
                                        width: `${percentage}%`,
                                        background: isSelected
                                            ? "rgba(255, 255, 255, 0.2)"
                                            : readOnly
                                            ? "rgba(255, 255, 255, 0.05)"
                                            : "rgba(156, 39, 176, 0.2)",
                                        transition: "width 0.3s ease",
                                        zIndex: 1,
                                    }}
                                />

                                {/* Option text and percentage */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                        position: "relative",
                                        zIndex: 2,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            color: isSelected
                                                ? "#FFFFFF"
                                                : readOnly
                                                ? "rgba(255, 255, 255, 0.5)"
                                                : "#F3E5F5",
                                        }}
                                    >
                                        {option.text}
                                        {readOnly && isSelected && profileUsername && (
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                sx={{
                                                    ml: 1,
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                (Voted by {profileUsername})
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: isSelected
                                                    ? "#FFFFFF"
                                                    : readOnly
                                                    ? "rgba(255, 255, 255, 0.4)"
                                                    : "#BA68C8",
                                                minWidth: "45px",
                                                textAlign: "right",
                                            }}
                                        >
                                            {percentage.toFixed(1)}%
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: isSelected
                                                    ? "rgba(255, 255, 255, 0.8)"
                                                    : readOnly
                                                    ? "rgba(255, 255, 255, 0.3)"
                                                    : "rgba(243, 229, 245, 0.7)",
                                                minWidth: "30px",
                                                textAlign: "right",
                                            }}
                                        >
                                            ({option.votes})
                                        </Typography>
                                    </Box>
                                </Box>
                            </Button>

                            {/* Read-only message */}
                            {readOnly && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        textAlign: "center",
                                        mt: 0.5,
                                    }}
                                >
                                </Box>
                            )}
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
                    {selectedOption && !readOnly && (
                        <Button
                            size="small"
                            onClick={handleRemoveVote}
                            disabled={voting}
                            variant="outlined"
                            color="secondary"
                            sx={{
                                borderColor: "#E040FB",
                                color: "#E040FB",
                                "&:hover": {
                                    background: "rgba(224, 64, 251, 0.1)",
                                    borderColor: "#BA68C8",
                                },
                            }}
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