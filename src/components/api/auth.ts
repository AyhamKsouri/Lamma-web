import axios from 'axios';

export const checkToken = async (): Promise<boolean> => {
  const token = localStorage.getItem('token');

  if (!token) return false;

  try {
    const res = await axios.get('http://localhost:3000/api/auth/check-token', {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ important
      },
    });

    return res.status === 200;
  } catch (err) {
    return false;
  }
};
