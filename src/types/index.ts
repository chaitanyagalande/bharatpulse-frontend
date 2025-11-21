export interface User {
    id: number;
    username: string;
    email: string;
    city: string;
    role: string;
    mode: 'LOCAL' | 'EXPLORE';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    city: string;
}

export interface LoginResponse {
    token: string;
    email: string;
    userId: number;
}

export interface Poll {
  id: number;
  question: string;
  optionOne: string;
  optionTwo: string;
  optionThree?: string;
  optionFour?: string;
  city: string;
  createdBy: number;
  createdAt: string;
  optionOneVotes: number;
  optionTwoVotes: number;
  optionThreeVotes?: number;
  optionFourVotes?: number;
}

export interface PollCreateRequest {
  poll: {
    question: string;
    optionOne: string;
    optionTwo: string;
    optionThree?: string;
    optionFour?: string;
    // Don't include server-generated fields like:
    // id, createdBy, createdAt, *Votes fields
  };
  tags: string[];
}

export interface PollEditRequest {
  question: string;
  optionOne: string;
  optionTwo: string;
  optionThree?: string;
  optionFour?: string;
}

export interface CreatedByResponse {
  id: number;
  username: string;
}

export interface PollResponse {
  id: number;
  question: string;
  optionOne: string;
  optionTwo: string;
  optionThree?: string;
  optionFour?: string;
  city: string;
  createdBy: CreatedByResponse;
  createdAt: string;
  optionOneVotes: number;
  optionTwoVotes: number;
  optionThreeVotes?: number;
  optionFourVotes?: number;
  tags: string[];
}

export interface PollWithVoteResponse {
  poll: PollResponse;
  selectedOption?: number;
  votedAt?: string;
}

export interface Vote {
  id?: number;
  pollId: number;
  userId?: number;
  selectedOption: number;
  votedAt?: string;
}

export interface CityRequest {
  city: string;
}

export interface PasswordUpdateRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UsernameUpdateRequest {
  newUsername: string;
}

export interface UserPublicProfileResponse {
  id: number;
  username: string;
  city: string;
  totalPollsCreatedCount: number;
  totalPollsVotedCount: number;
  activeCities: CityActivityResponse[];
}

export interface CityActivityResponse {
  city: string;
  pollsCreatedCount: number;
  pollsVotedCount: number;
  percentage: number;
}

export interface Tag {
  id: number;
  name: string;
  city: string;
  usageCount: number;
}