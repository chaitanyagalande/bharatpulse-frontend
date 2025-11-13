import axios from "axios";
import type { CityRequest, LoginRequest, LoginResponse, PasswordUpdateRequest, Poll, PollWithVoteResponse, RegisterRequest, UsernameUpdateRequest, UserPublicProfileResponse, Vote } from "../types";

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
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
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
    createPoll: (poll: Poll): Promise<Poll> => 
        api.post('/polls/create', poll).then(res => res.data),

    getPollFeed: (sortBy: string = "latest"): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/feed?sortBy=${sortBy}`).then(res => res.data),

    getMyPolls: (sortBy: string = 'latest'): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/my-polls?sortBy=${sortBy}`).then(res => res.data),

    getMyVotedPolls: (sortBy: string = 'latestvoted'): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/my-votes?sortBy=${sortBy}`).then(res => res.data),

    searchPolls: (query: string, sortBy: string = "latest"): Promise<PollWithVoteResponse[]> => 
        api.get(`/polls/search?query=${query}&sortBy=${sortBy}`).then(res => res.data),

    editPoll: (pollId: number, updatedPoll: Poll): Promise<Poll> => 
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
    api.get(`/profile/${username}`).then(res => res.data),
  
  getPollsCreatedByUser: (userId: number, sortBy: string = 'latest'): Promise<PollWithVoteResponse[]> => 
    api.get(`/profile/${userId}/polls-created?sortBy=${sortBy}`).then(res => res.data),
  
  getPollsVotedByUser: (userId: number, sortBy: string = 'latest'): Promise<PollWithVoteResponse[]> => 
    api.get(`/profile/${userId}/polls-voted?sortBy=${sortBy}`).then(res => res.data),
};