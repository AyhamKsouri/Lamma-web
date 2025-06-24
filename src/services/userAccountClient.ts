// src/services/userAccountClient.ts
import { apiClient } from "./api";

export interface SimpleUser {
  _id: string;
  userInfo: { name: string; profileImage?: string };
}

/**
 * apiClient.get<T>() already returns T (i.e. the JSON body), not AxiosResponse<T>.
 * So just `await` the call and you get the array back.
 */
export const fetchFollowers = async (userId: string): Promise<SimpleUser[]> => {
  console.log("[fetchFollowers] calling /followers for user:", userId);
  const data = await apiClient.get<SimpleUser[]>(`/api/user-account/${userId}/followers`);
  console.log("[fetchFollowers] unwrapped data:", data);
  return data;
};

export const fetchFollowing = async (userId: string): Promise<SimpleUser[]> => {
  console.log("[fetchFollowing] calling /following for user:", userId);
  const data = await apiClient.get<SimpleUser[]>(`/api/user-account/${userId}/following`);
  console.log("[fetchFollowing] unwrapped data:", data);
  return data;
};
