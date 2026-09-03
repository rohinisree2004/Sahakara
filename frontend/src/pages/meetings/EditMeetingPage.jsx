import React, { useState, useEffect } from 'react';
import { fetchMeetingDetails, updateMeeting } from '../../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  MapPin, 
  FileText, 
  AlertCircle,
  Building2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

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
        if (res.data?.success) {
          const mtg = res.data.data.meeting;
          
          if (res.data.data.minutes && res.data.data.minutes.finalized) {
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
        }
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
      navigate(`/meetings/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update meeting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 max-w-4xl mx-auto my-12">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">Loading meeting details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100/80 pb-6">
        <div>
          <Link
            to={`/meetings/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors uppercase tracking-wider mb-2 font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Meeting Desk
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 shadow-xs">
              <Calendar className="w-7 h-7" />
            </span>
            Edit Meeting Logistics
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Update schedule, title, venue, or status for this governance assembly.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Meeting Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Meeting Classification <span className="text-rose-500">*</span>
            </label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="Annual General Meeting (AGM)">Annual General Meeting (AGM)</option>
              <option value="Special General Meeting (SGM)">Special General Meeting (SGM)</option>
              <option value="Group Meeting">SHG / JLG Group Meeting</option>
              <option value="Board Meeting">Board of Directors Meeting</option>
              <option value="Executive Committee">Executive Committee Meeting</option>
              <option value="Branch Meeting">Branch Meeting</option>
              <option value="Financial Review">Financial Review</option>
              <option value="Loan Review">Loan Review</option>
              <option value="General Meeting">General Meeting</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Operational Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Postponed">Postponed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Start Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              End Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Venue / Meeting Room <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Overview / Context Notes
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to={`/meetings/${id}`}
            className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMeetingPage;
