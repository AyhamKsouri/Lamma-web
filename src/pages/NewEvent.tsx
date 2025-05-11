import React, { FC, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createEvent } from '@/services/eventService';
import { useToast } from '@/components/ui/use-toast';
import { AuthError } from '@/services/api';
import '@/styles/newevent.css'

const NewEvent: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('other');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Image preview handler
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !startTime || !endDate || !endTime || !location) {
      setError('Please fill in all required fields.');
      return;
    }
    if (new Date(`${endDate}T${endTime}`) < new Date(`${startDate}T${startTime}`)) {
      setError('End date/time must be after start date/time.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Log the data being sent
      console.log('Submitting form with data:', {
        title,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        location,
        type,
        visibility,
        price,
        hasImage: !!image
      });

      await createEvent({
        title,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        location,
        type: type as any,
        visibility,
        price,
        photos: image ? [image] : undefined,
      });

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      navigate('/events');
    } catch (error) {
      console.error('Submit Error:', error);
      
      if (error instanceof AuthError) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
        });
        signOut();
        navigate('/login');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to create event');
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to create event',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        {...fadeIn}
        className="max-w-5xl mx-auto"
      >
        <div className="card p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Create New Event
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/events')}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 
                         dark:hover:text-white transition duration-150"
            >
              ← Back to Events
            </motion.button>
          </div>

          <motion.form
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded"
              >
                <p className="text-red-700 dark:text-red-200">{error}</p>
              </motion.div>
            )}

            {/* Image Upload Section */}
            <motion.div variants={fadeIn} className="card p-6">
              <label className="form-label">Event Banner</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed 
                            border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="space-y-2 text-center">
                  {preview ? (
                    <div className="relative group">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto h-64 w-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 
                                    group-hover:opacity-100 transition duration-200 rounded-lg 
                                    flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setPreview(null);
                          }}
                          className="text-white hover:text-red-500 transition duration-150"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium 
                                      text-primary-600 hover:text-primary-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="custom-file-input"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Event Details */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Title<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Give your event a catchy title"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    {['clubbing', 'rave', 'birthday', 'wedding', 'food', 'sport', 'meeting', 'conference', 'other'].map(t => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Visibility<span className="text-red-500">*</span></label>
                  <select
                    className="form-input"
                    value={visibility}
                    onChange={e => setVisibility(e.target.value as 'public' | 'private')}
                    required
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell people what your event is about..."
                />
              </div>
            </motion.div>

            {/* Date & Time Section */}
            <motion.div variants={fadeIn} className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Date & Time
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="form-label">Start Date<span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Start Time<span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">End Date<span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">End Time<span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Location & Price Section */}
            <motion.div variants={fadeIn} className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Location & Price
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Location<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Enter venue name and address"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Price (TND)</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="form-input pl-8"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              variants={fadeIn}
              className="flex justify-end space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/events')}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 
                         dark:text-gray-300 rounded-lg font-semibold
                         hover:bg-gray-200 dark:hover:bg-gray-600
                         transition duration-150 ease-in-out"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="form-submit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </motion.button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default NewEvent;