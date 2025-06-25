import React, { FC, useState, useEffect } from "react";
import { Star, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  addEventFeedback,
  fetchEventFeedbacks,
} from "@/services/eventService";
import { Button } from "@/components/ui/button";

export interface Feedback {
  _id: string;
  event: string;
  user: {
    _id: string;
    email: string;
    profileImage?: string;
  };
  rating: number;
  message: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface Props {
  eventId: string;
}

const FeedbackSection: FC<Props> = ({ eventId }) => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeedbacks = async () => {
    try {
      const res = await fetchEventFeedbacks(eventId);
      setFeedbacks(res.data);
      if (user) {
        const mine = res.data.find((f) => f.user._id === user._id);
        if (mine) {
          setUserRating(mine.rating);
          setMessage(mine.message);
        }
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [eventId]);

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in to drop some love! 🎉");
      return;
    }
    if (userRating < 1 || userRating > 5) {
      setError("Pick some stars to shine! ✨");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await addEventFeedback(eventId, userRating, message);
      await loadFeedbacks();
      setMessage("");
    } catch (err: any) {
      console.error("Submit feedback error:", err);
      setError(err.response?.data?.error || "Oops, feedback failed to sparkle! 🚀");
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackCount = feedbacks.length;
  const averageRating =
    feedbackCount > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbackCount
      : 0;

  return (
    <div className="bg-gradient-to-br from-cyan-100 to-purple-200 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-400" /> Feedback Fiesta
      </h2>

      <div className="flex items-center space-x-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={20}
            className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-300">
          ({feedbackCount} review{feedbackCount === 1 ? "" : "s"})
        </span>
      </div>

      {user && !feedbacks.some((f) => f.user._id === user._id) && (
        <div className="space-y-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={28}
                className={`cursor-pointer transition-colors duration-200 ${i < userRating ? "text-yellow-400 animate-bounce" : "text-gray-300 hover:text-yellow-200"}`}
                onClick={() => setUserRating(i + 1)}
                onMouseEnter={(e) => (e.currentTarget.style.animation = "bounce 0.3s")}
                onAnimationEnd={(e) => (e.currentTarget.style.animation = "")}
              />
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts (optional)"
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 resize-y min-h-[80px] placeholder:text-gray-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-200"
          >
            {isSubmitting ? "Submitting..." : "Drop Your Sparkle! ✨"}
          </Button>
        </div>
      )}

      <ul className="space-y-6">
        {feedbacks.map((f) => (
          <li key={f._id} className="border-t pt-4 hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < f.rating ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(f.createdAt).toLocaleDateString()}
              </span>
            </div>
            {f.message && (
              <p className="mt-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-inner">
                {f.message}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeedbackSection;