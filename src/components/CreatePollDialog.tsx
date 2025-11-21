import { useState } from "react";
import type { PollCreateRequest } from "../types";
import { pollsAPI } from "../services/api";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface CreatePollDialogProps {
  open: boolean;
  onClose: () => void;
  onPollCreated: () => void;
}

const CreatePollDialog: React.FC<CreatePollDialogProps> = ({
  open,
  onClose,
  onPollCreated,
}) => {
  const [formData, setFormData] = useState({
    question: '',
    optionOne: '',
    optionTwo: '',
    optionThree: '',
    optionFour: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [optionsCount, setOptionsCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const pollData: PollCreateRequest = {
        poll: {
          question: formData.question.trim(),
          optionOne: formData.optionOne.trim(),
          optionTwo: formData.optionTwo.trim(),
          optionThree: optionsCount >= 3 && formData.optionThree.trim() ? formData.optionThree.trim() : undefined,
          optionFour: optionsCount >= 4 && formData.optionFour.trim() ? formData.optionFour.trim() : undefined,
          // city is automatically assigned by the API
        },
        tags: tags
      };

      await pollsAPI.createPoll(pollData);
      onPollCreated();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create poll');
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
    setTags([]);
    setCurrentTag('');
    setOptionsCount(2);
    setError('');
    onClose();
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Poll</DialogTitle>
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

          <Box sx={{ mb: 2 }}>
            <Box display="flex" gap={1} sx={{ mb: 1 }}>
              <TextField
                margin="dense"
                label="Add Tag"
                type="text"
                variant="outlined"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Enter tag and press Enter or click Add"
                sx={{ flexGrow: 1 }}
              />
              <Button
                onClick={handleAddTag}
                variant="outlined"
                disabled={!currentTag.trim()}
                sx={{ mt: 1 }}
              >
                Add
              </Button>
            </Box>
            
            {tags.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
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
            {loading ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreatePollDialog;