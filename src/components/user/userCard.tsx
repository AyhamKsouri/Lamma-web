// src/components/UserCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fixProfileImagePath } from '@/lib/urlFix';

interface UserCardProps {
  user: {
    _id: string;
    email: string;
    userInfo?: {
      name?: string;
      profileImage?: string;
    };
  };
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const name = user.userInfo?.name || user.email;
  const profileImage = fixProfileImagePath(user.userInfo?.profileImage || '');

  return (
    <Link to={`/Profile/${user._id}`}>
      <Card className="p-4 hover:shadow-lg transition rounded-xl">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={profileImage} />
            <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default UserCard;
