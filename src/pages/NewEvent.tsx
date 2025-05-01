import React, { FC, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewEvent: FC = () => {
  const navigate = useNavigate();
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('other');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Image preview handler
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit handler
  const handleSubmit = (e: FormEvent) => {
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
    // TODO: send to backend
    navigate('/events');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-8 animate-fade-in bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        Create New Event
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <p className="text-red-500 bg-red-100 p-2 rounded">{error}</p>}

        {/* Section: Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Banner Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="form-input" />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-4 w-full h-56 object-cover rounded-lg shadow-md"
              />
            )}
          </div>
          <div>
            <label className="form-label">Title<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event Title"
              required
            />
            <label className="form-label mt-6">Type</label>
            <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
              {['clubbing','rave','birthday','wedding','food','sport','meeting','conference','other'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section: Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="form-label">Start Date<span className="text-red-500">*</span></label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Start Time<span className="text-red-500">*</span></label>
            <input type="time" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">End Date<span className="text-red-500">*</span></label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">End Time<span className="text-red-500">*</span></label>
            <input type="time" className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
        </div>

        {/* Section: Location & Price */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Location<span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City, Venue"
              required
            />
          </div>
          <div>
            <label className="form-label">Price (USD)</label>
            <input
              type="number"
              className="form-input"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              min={0}
              step={0.01}
            />
          </div>
        </div>

        {/* Section: Description */}
        <div>
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your event..."
          />
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="form-submit"
          >
            Create Event
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default NewEvent;
