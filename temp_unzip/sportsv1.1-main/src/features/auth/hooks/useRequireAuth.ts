import { useNavigate } from 'react-router-dom';
import { User } from '@/features/players/types/user';

export const useRequireAuth = () => {
  const navigate = useNavigate();

  const requireAuth = (user: User | null) => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  return requireAuth;
};
