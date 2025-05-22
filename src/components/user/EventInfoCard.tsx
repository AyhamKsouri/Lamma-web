// src/components/auth/EventInfoCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Users, Clock, Star } from 'lucide-react';

const EventInfoCard: React.FC = () => {
  return (
    <Card className="w-full max-w-md border-none shadow-lg bg-gradient-purple text-white animate-slide-in-right">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Lamma</CardTitle>
        <CardDescription className="text-white/80 text-lg">
          Your Ultimate Event Management Solution
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Feature 1 */}
        <div className="space-y-2 animate-slide-up animation-delay-100">
          <h3 className="text-xl font-semibold flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 animate-bounce-soft">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Effortless Planning
          </h3>
          <p className="ml-11 text-white/80">
            Create and manage events with just a few clicks
          </p>
        </div>

        {/* Feature 2 */}
        <div className="space-y-2 animate-slide-up animation-delay-200">
          <h3 className="text-xl font-semibold flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 animate-bounce-soft">
              <Users className="h-4 w-4 text-white" />
            </div>
            Smart Attendee Management
          </h3>
          <p className="ml-11 text-white/80">
            Track registrations and communicate with attendees
          </p>
        </div>

        {/* Feature 3 */}
        <div className="space-y-2 animate-slide-up animation-delay-300">
          <h3 className="text-xl font-semibold flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 animate-bounce-soft">
              <Clock className="h-4 w-4 text-white" />
            </div>
            Real-time Analytics
          </h3>
          <p className="ml-11 text-white/80">
            Get insights on attendance and engagement
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/20 animate-slide-up animation-delay-400">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-300 flex items-center justify-center border-2 border-white text-indigo-800 font-semibold">
                J
              </div>
              <div className="w-8 h-8 rounded-full bg-pink-300 flex items-center justify-center border-2 border-white text-pink-800 font-semibold">
                K
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center border-2 border-white text-purple-800 font-semibold">
                M
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Join 10,000+ event planners</p>
              <div className="flex items-center mt-1 space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-yellow-300" />
                ))}
                <span className="ml-1 text-xs text-white/80">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventInfoCard;
