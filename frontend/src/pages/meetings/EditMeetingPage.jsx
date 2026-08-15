import React, { useState, useEffect } from 'react';
import { fetchMeetingDetails, updateMeeting } from '../../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, CheckCircle } from 'lucide-react';

const EditMeetingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    meetingType: 'General Meeting',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    description: '',
    priority: 'Medium',
    status: 'Scheduled'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await fetchMeetingDetails(id);
        const mtg = res.data.meeting;
        
        if (res.data.minutes && res.data.minutes.finalized) {
          setError('This meeting has finalized minutes and cannot be edited.');
        }

        setFormData({
          title: mtg.title || '',
          meetingType: mtg.meetingType || 'General Meeting',
          date: mtg.date ? new Date(mtg.date).toISOString().split('T')[0] : '',
          startTime: mtg.startTime || '',
          endTime: mtg.endTime || '',
          venue: mtg.venue || '',
          description: mtg.description || '',
          priority: mtg.priority || 'Medium',
          status: mtg.status || 'Scheduled'
        });
      } catch (err) {
        setError(err.message || 'Failed to load meeting for editing');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateMeeting(id, formData);
      navigate(`/meetings/details/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update meeting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link to={`/meetings/details/${id}`} className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Meeting Details
        </Link>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-emerald-400" />
          Edit Meeting Details
        </h1>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Postponed">Postponed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Type</label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="General Meeting">General Meeting</option>
              <option value="Board Meeting">Board Meeting</option>
              <option value="Committee Meeting">Committee Meeting</option>
              <option value="Branch Meeting">Branch Meeting</option>
              <option value="Group Meeting">Group Meeting</option>
              <option value="Financial Review">Financial Review</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
              <input
                type="text"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Link
            to={`/meetings/details/${id}`}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            {saving ? 'Saving...' : <><CheckCircle className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMeetingPage;
