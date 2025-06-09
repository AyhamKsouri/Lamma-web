import api from './api';

export const searchUsers = async (query: string) => {
  const res = await api.get(`/api/user-account/search?query=${encodeURIComponent(query)}`);
  return res.data; // assuming array of users
};
