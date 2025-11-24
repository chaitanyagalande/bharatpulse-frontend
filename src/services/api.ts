import axios from "axios";
import type { CityRequest, CommentRequest, CommentResponse, LoginRequest, LoginResponse, PasswordUpdateRequest, Poll, PollCreateRequest, PollEditRequest, PollWithVoteResponse, RegisterRequest, Tag, UsernameUpdateRequest, UserPublicProfileResponse, Vote } from "../types";

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Append token to every request once logged in automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

// Remove token 
// Enhanced error handling interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        // Enhanced error handling for JSON responses
        if (error.response?.data) {
            const errorData = error.response.data;
            
            // Handle validation errors (field-specific errors)
            if (error.response.status === 400 && typeof errorData === 'object') {
                const errorMessages = Object.values(errorData)
                    .filter(value => typeof value === 'string')
                    .join(', ');
                
                if (errorMessages) {
                    error.parsedMessage = errorMessages;
                } else if (errorData.error) {
                    error.parsedMessage = errorData.error;
                }
            } 
            // Handle other JSON error responses
            else if (typeof errorData === 'object' && errorData.error) {
                error.parsedMessage = errorData.error;
            } 
            // Handle string error responses
            else if (typeof errorData === 'string') {
                error.parsedMessage = errorData;
            }
        }
        
        // Fallback error message
        if (!error.parsedMessage) {
            error.parsedMessage = error.message || 'An unexpected error occurred';
        }
        
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data: LoginRequest): Promise<LoginResponse> =>
        api.post(`/auth/login`, data).then(res => res.data),

    register: (data: RegisterRequest) => 
        api.post(`/auth/register`, data).then(res => res.data),
};

export const profileAPI = {
    getCurrentUser: () => 
        api.get(`/profile/me`).then(res => res.data),

    updateCity: (data: CityRequest) => 
        api.put('/profile/update-city', data).then(res => res.data),
  
    updatePassword: (data: PasswordUpdateRequest) => 
        api.patch('/profile/update-password', data).then(res => res.data),
  
    updateUsername: (data: UsernameUpdateRequest) => 
        api.patch('/profile/update-username', data).then(res => res.data),
  
    toggleMode: () => 
        api.patch('/profile/toggle-mode').then(res => res.data),
  
    deleteAccount: () => 
        api.delete('/profile/delete').then(res => res.data),
};

export const pollsAPI = {
    createPoll: (poll: PollCreateRequest): Promise<Poll> => 
        api.post('/polls/create', poll).then(res => res.data),

    getPollFeed: (sortBy: string = "latest"): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/feed?sortBy=${encodeURIComponent(sortBy)}`).then(res => res.data),

    getMyPolls: (sortBy: string = 'latest'): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/my-polls?sortBy=${encodeURIComponent(sortBy)}`).then(res => res.data),

    getMyVotedPolls: (sortBy: string = 'latestvoted'): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/my-votes?sortBy=${encodeURIComponent(sortBy)}`).then(res => res.data),

    searchPolls: (query: string, sortBy: string = "latest"): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/search?query=${encodeURIComponent(query)}&sortBy=${encodeURIComponent(sortBy)}`).then(res => res.data),

    filterPolls: (tags: string[], query: string = "", sortBy: string = "latest"): Promise<PollWithVoteResponse[]> =>
        api.get(`/polls/filter?tags=${tags.map(tag => encodeURIComponent(tag)).join(',')}&query=${encodeURIComponent(query)}&sortBy=${encodeURIComponent(sortBy)}`).then(res => res.data),

    editPoll: (pollId: number, updatedPoll: PollEditRequest): Promise<Poll> => 
        api.put(`/polls/edit/${pollId}`, updatedPoll).then(res => res.data),

    deletePoll: (pollId: number) => 
        api.delete(`/polls/delete/${pollId}`).then(res => res.data),
}

export const votesAPI = {
  castVote: (vote: Vote) => 
    api.post('/votes/cast', vote).then(res => res.data),
  
  removeVote: (pollId: number) => 
    api.delete(`/votes/remove/${pollId}`).then(res => res.data),
};

export const publicProfileAPI = {
  getUserProfile: (username: string): Promise<UserPublicProfileResponse> => 
    api.get(`/profile/${encodeURIComponent(username)}`).then(res => res.data),
  
  getPollsCreatedByUser: (userId: number, sortBy: string = 'latest'): Promise<PollWithVoteResponse[]> => 
    api.get(`/profile/${userId}/polls-created?sortBy=${encodeURIComponent(sortBy)}`).then(res => res.data),
  
  getPollsVotedByUser: (userId: number, sortBy: string = 'latest'): Promise<PollWithVoteResponse[]> => 
    api.get(`/profile/${userId}/polls-voted?sortBy=${encodeURIComponent(sortBy)}`).then(res => res.data),
};

export const tagsAPI = {
    getPopularTags: (): Promise<Tag[]> => 
        api.get(`/tags/popular`).then(res => res.data),
}

export const commentsAPI = {
    // Add comment to a poll
    addComment: (pollId: number, content: CommentRequest): Promise<CommentResponse> => 
        api.post(`/polls/${pollId}/comments`, content).then(res => res.data),

    // Get all comments for a poll
    getComments: (pollId: number): Promise<CommentResponse[]> => 
        api.get(`/polls/${pollId}/comments`).then(res => res.data),

    // Delete a comment (only your own comment)
    deleteComment: (commentId: number): Promise<string> => 
        api.delete(`/comments/${commentId}`).then(res => res.data),
}