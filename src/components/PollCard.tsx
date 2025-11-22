import { useState, useMemo } from "react";
import type { PollWithVoteResponse, CommentResponse } from "../types";
import { pollsAPI, votesAPI, commentsAPI } from "../services/api";
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
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    CircularProgress,
    InputAdornment,
} from "@mui/material";
import { MoreVert, Edit, Delete, Person, Comment as CommentIcon, Send, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PollCardProps {
    pollData: PollWithVoteResponse;
    onVoteUpdate: () => void;
    onEdit?: (poll: PollWithVoteResponse) => void;
    onDelete?: (pollId: number) => void;
    showActions?: boolean;
    readOnly?: boolean;
    profileUsername?: string;
    userMode?: 'LOCAL' | 'EXPLORE';
}

const PollCard: React.FC<PollCardProps> = ({
    pollData,
    onVoteUpdate,
    onEdit,
    onDelete,
    showActions = false,
    readOnly = false,
    profileUsername,
    userMode = 'LOCAL',
}) => {
    const { poll, selectedOption } = pollData;
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState("");
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Function to calculate relative time
    const getRelativeTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} min. ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hr. ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    };

    // Memoize the relative time to avoid recalculating on every render
    const relativeTime = useMemo(() => getRelativeTime(poll.createdAt), [poll.createdAt]);

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

    // Determine if we should show results
    const shouldShowResults = userMode === 'EXPLORE' || selectedOption !== null;

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

    // Comment functionality
    const handleOpenComments = async () => {
        setCommentsOpen(true);
        setLoadingComments(true);
        try {
            const commentsData = await commentsAPI.getComments(poll.id);
            setComments(commentsData);
        } catch (err: any) {
            setError("Failed to load comments");
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCloseComments = () => {
        setCommentsOpen(false);
        setNewComment("");
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const newCommentData = await commentsAPI.addComment(poll.id, { content: newComment.trim() });
            setComments(prev => [newCommentData, ...prev]);
            setNewComment("");
            // Update comment count in poll data
            poll.commentCount += 1;
        } catch (err: any) {
            setError("Failed to add comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await commentsAPI.deleteComment(commentId);
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            // Update comment count in poll data
            poll.commentCount -= 1;
        } catch (err: any) {
            setError("Failed to delete comment");
        }
    };

    const getCommentRelativeTime = (dateString: string) => {
        return getRelativeTime(dateString);
    };

    // Check if current user is the author of a comment
    const isCurrentUserComment = (comment: CommentResponse) => {
        return comment.username === user?.username;
    };

    return (
        <>
            <Card sx={{ mb: 3, position: "relative" }}>
                <CardContent>
                    {/* Top section: Question, Username, and City in one line */}
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ mb: 1 }}
                    >
                        <Typography variant="h6" sx={{ pr: 2, flex: 1 }}>
                            {poll.question}
                        </Typography>

                        {/* Username and City inline in top right corner */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                label={poll.city}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                    backgroundColor: "rgba(156, 39, 176, 0.1)",
                                    color: "#BA68C8",
                                    border: "1px solid rgba(156, 39, 176, 0.3)",
                                    fontWeight: 500,
                                }}
                            />
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
                    </Box>

                    {/* Middle section: Date, Actions, and Tags */}
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ mb: 2 }}
                    >
                        {/* Relative time and Tags on the left */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {relativeTime}
                            </Typography>
                            
                            {/* Tags below the relative time */}
                            {poll.tags && poll.tags.length > 0 && (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {poll.tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                backgroundColor: "rgba(156, 39, 176, 0.1)",
                                                color: "#BA68C8",
                                                border: "1px solid rgba(156, 39, 176, 0.3)",
                                                fontWeight: 500,
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Actions menu on the right */}
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
                                    {/* Progress bar background - only show if results should be visible */}
                                    {shouldShowResults && (
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
                                    )}

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
                                        
                                        {/* Show percentage and votes only if results should be visible */}
                                        {shouldShowResults ? (
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
                                        ) : (
                                            // Show placeholder or nothing when results are hidden
                                            <Box sx={{ minWidth: "75px" }}></Box>
                                        )}
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
                        {/* Show total votes only if results should be visible */}
                        {shouldShowResults ? (
                            <Typography variant="body2" color="text.secondary">
                                {totalVotes} total votes
                            </Typography>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Vote to see results
                            </Typography>
                        )}
                        
                        {/* Comments section */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                                startIcon={<CommentIcon />}
                                onClick={handleOpenComments}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: "#BA68C8",
                                    color: "#BA68C8",
                                    "&:hover": {
                                        background: "rgba(186, 104, 200, 0.1)",
                                        borderColor: "#9C27B0",
                                    },
                                }}
                            >
                                {poll.commentCount}
                            </Button>
                            
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
                    </Box>
                </CardContent>
            </Card>

            {/* Comments Dialog */}
            <Dialog 
                open={commentsOpen} 
                onClose={handleCloseComments}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Comments ({poll.commentCount})
                        </Typography>
                        <IconButton onClick={handleCloseComments}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {/* Comments List */}
                    {loadingComments ? (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress />
                        </Box>
                    ) : comments.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" align="center" py={3}>
                            No comments yet. Be the first to comment!
                        </Typography>
                    ) : (
                        <List>
                            {comments.map((comment, index) => (
                                <Box key={comment.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Box>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                                        {/* Clickable username for comment author */}
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 0.5,
                                                                cursor: "pointer",
                                                                padding: "2px 0px",
                                                                borderRadius: 1,
                                                                transition: "all 0.2s ease",
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(156, 39, 176, 0.1)",
                                                                    transform: "translateY(-1px)",
                                                                },
                                                            }}
                                                            onClick={() => handleUsernameClick(comment.username)}
                                                        >
                                                            <Person sx={{ fontSize: 14, color: "#BA68C8" }} />
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#BA68C8" }}>
                                                                {isCurrentUserComment(comment) ? 'You' : comment.username}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {getCommentRelativeTime(comment.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2">
                                                        {comment.content}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        {isCurrentUserComment(comment) && (
                                            <ListItemSecondaryAction>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    color="error"
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        )}
                                    </ListItem>
                                    {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                                </Box>
                            ))}
                        </List>
                    )}

                    {/* Add Comment Form - Moved below all comments */}
                    {!readOnly && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <TextField
                                fullWidth
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton 
                                                    onClick={handleAddComment}
                                                    disabled={!newComment.trim() || submittingComment}
                                                    sx={{ color: "#9C27B0" }}
                                                >
                                                    <Send />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                size="small"
                            />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PollCard;