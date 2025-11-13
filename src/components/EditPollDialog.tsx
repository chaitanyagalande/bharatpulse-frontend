import { useEffect, useState } from "react";
import type { Poll, PollWithVoteResponse } from "../types";
import { pollsAPI } from "../services/api";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface EditPollDialogProps {
  open: boolean;
  poll: PollWithVoteResponse | null;
  onClose: () => void;
  onPollUpdated: () => void;
}

const EditPollDialog: React.FC<EditPollDialogProps> = ({
  open,
  poll,
  onClose,
  onPollUpdated,
}) => {
  const [formData, setFormData] = useState({
    question: '',
    optionOne: '',
    optionTwo: '',
    optionThree: '',
    optionFour: '',
  });
  const [optionsCount, setOptionsCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (poll) {
      const { poll: pollData } = poll;
      setFormData({
        question: pollData.question,
        optionOne: pollData.optionOne,
        optionTwo: pollData.optionTwo,
        optionThree: pollData.optionThree || '',
        optionFour: pollData.optionFour || '',
      });
      
      // Calculate number of options
      let count = 2;
      if (pollData.optionThree) count = 3;
      if (pollData.optionFour) count = 4;
      setOptionsCount(count);
    }
  }, [poll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;
    
    setLoading(true);
    setError('');

    try {
      const updatedPoll: Partial<Poll> = {
        question: formData.question.trim(),
        optionOne: formData.optionOne.trim(),
        optionTwo: formData.optionTwo.trim(),
        optionThree: optionsCount >= 3 && formData.optionThree.trim() ? formData.optionThree.trim() : undefined,
        optionFour: optionsCount >= 4 && formData.optionFour.trim() ? formData.optionFour.trim() : undefined,
      };

      await pollsAPI.editPoll(poll.poll.id, updatedPoll as Poll);
      onPollUpdated();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update poll');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      question: '',
      optionOne: '',
      optionTwo: '',
      optionThree: '',
      optionFour: '',
    });
    setOptionsCount(2);
    setError('');
    onClose();
  };

  const canAddOption = optionsCount < 4;
  const canRemoveOption = optionsCount > 2;

  const addOption = () => {
    if (canAddOption) {
      setOptionsCount(optionsCount + 1);
    }
  };

  const removeOption = () => {
    if (canRemoveOption) {
      setOptionsCount(optionsCount - 1);
      // Clear the removed option
      if (optionsCount === 4) {
        setFormData({ ...formData, optionFour: '' });
      } else if (optionsCount === 3) {
        setFormData({ ...formData, optionThree: '' });
      }
    }
  };

  if (!poll) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Poll</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            autoFocus
            margin="dense"
            label="Poll Question"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <TextField
              margin="dense"
              label="Option 1"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.optionOne}
              onChange={(e) => setFormData({ ...formData, optionOne: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Option 2"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.optionTwo}
              onChange={(e) => setFormData({ ...formData, optionTwo: e.target.value })}
              required
            />
            
            {optionsCount >= 3 && (
              <TextField
                margin="dense"
                label="Option 3 (Optional)"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.optionThree}
                onChange={(e) => setFormData({ ...formData, optionThree: e.target.value })}
              />
            )}
            
            {optionsCount >= 4 && (
              <TextField
                margin="dense"
                label="Option 4 (Optional)"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.optionFour}
                onChange={(e) => setFormData({ ...formData, optionFour: e.target.value })}
              />
            )}
          </Box>

          <Box display="flex" gap={1}>
            {canAddOption && (
              <Button
                startIcon={<Add />}
                onClick={addOption}
                size="small"
                variant="outlined"
              >
                Add Option
              </Button>
            )}
            {canRemoveOption && (
              <Button
                startIcon={<Remove />}
                onClick={removeOption}
                size="small"
                variant="outlined"
                color="secondary"
              >
                Remove Option
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Poll'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditPollDialog;

