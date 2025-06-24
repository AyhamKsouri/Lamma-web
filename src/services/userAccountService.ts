// src/services/userAccountService.ts
import { apiClient } from "./api";

export interface SimpleUser {
  _id: string;
  userInfo: {
    name: string;
    profileImage?: string;
  };
}

export function getFollowStats(userId: string) {
  return apiClient.get<{ followersCount: number; followingCount: number }>(
    `/api/user-account/${userId}/follow-stats`
  );
}

// src/services/userAccountService.ts
export const getFollowers = (userId: string) =>
  apiClient.get<SimpleUser[]>(
    `/api/user-account/${userId}/followers`,
    { headers: { "Cache-Control": "no-cache" } }
);

export const getFollowing = (userId: string) =>
  apiClient.get<SimpleUser[]>(
    `/api/user-account/${userId}/following`,
    { headers: { "Cache-Control": "no-cache" } }
);