import React, { useState, useEffect } from 'react';
import { createMeeting, searchParticipants } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  MapPin, 
  UserCheck,
  CheckCircle
} from 'lucide-react';

const CreateMeetingPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    meetingType: 'General Meeting',
    branchId: '',
    groupId: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    venue: 'Society Board Room',
    description: '',
    priority: 'Medium'
  });

  const [agendas, setAgendas] = useState([
    { title: 'Opening Remarks & Roll Call', description: 'Welcome members and record attendance.' }
  ]);

  const [participantSearch, setParticipantSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle participant search
  useEffect(() => {
    if (!participantSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchParticipants(participantSearch);
        setSearchResults(res.data || []);
      } catch (err) {
        console.error('Participant Search Error', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [participantSearch]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddAgenda = () => {
    setAgendas(prev => [...prev, { title: '', description: '' }]);
  };

  const handleRemoveAgenda = (idx) => {
    setAgendas(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAgendaChange = (idx, field, value) => {
    setAgendas(prev => {
      const copy = [...prev];
      copy[idx][field] = value;
      return copy;
    });
  };

  const handleAddParticipant = (p) => {
    if (!selectedParticipants.some(sp => sp.participantId === p.participantId)) {
      setSelectedParticipants(prev => [...prev, p]);
    }
    setParticipantSearch('');
    setSearchResults([]);
  };

  const handleRemoveParticipant = (pId) => {
    setSelectedParticipants(prev => prev.filter(sp => sp.participantId !== pId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.venue) {
      setError('Please fill in all required meeting fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        agendas: agendas.filter(a => a.title.trim() !== ''),
        participants: selectedParticipants
      };

      const res = await createMeeting(payload);
      navigate(`/meetings/details/${res.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/meetings/dashboard" className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Governance Hub
        </Link>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-emerald-400" />
          Schedule New Society Meeting
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure meeting parameters, agenda topics, and invite participants</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-700/80 pb-3">
            1. Meeting Setup & Venue
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="E.g., Q3 Board of Directors Review Meeting"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Type *</label>
              <select
                name="meetingType"
                value={formData.meetingType}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="General Meeting">General Meeting</option>
                <option value="Board Meeting">Board Meeting</option>
                <option value="Committee Meeting">Committee Meeting</option>
                <option value="Branch Meeting">Branch Meeting</option>
                <option value="Group Meeting">Group Meeting</option>
                <option value="Financial Review">Financial Review</option>
                <option value="Loan Review">Loan Review</option>
                <option value="Emergency Meeting">Emergency Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time *</label>
                <input
                  type="text"
                  name="startTime"
                  required
                  placeholder="10:00 AM"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">End Time *</label>
                <input
                  type="text"
                  name="endTime"
                  required
                  placeholder="12:00 PM"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Venue / Physical or Virtual Location *</label>
              <input
                type="text"
                name="venue"
                required
                placeholder="E.g., Head Office Conference Hall / Zoom Link"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Description / Context</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Provide context, objective, or background notes..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Agendas Section */}
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-700/80 pb-3">
            <h2 className="text-lg font-bold text-white">
              2. Proposed Agenda Items
            </h2>
            <button
              type="button"
              onClick={handleAddAgenda}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Agenda Topic
            </button>
          </div>

          <div className="space-y-3">
            {agendas.map((ag, idx) => (
              <div key={idx} className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl flex gap-4 items-start">
                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-2">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Agenda Topic Title..."
                    value={ag.title}
                    onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Brief description / instructions (optional)..."
                    value={ag.description}
                    onChange={(e) => handleAgendaChange(idx, 'description', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {agendas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAgenda(idx)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Participants Selection */}
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-700/80 pb-3">
            3. Invite Participants (Staff & Members)
          </h2>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Search Users or Members by Name/ID</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Type to search staff or members..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-800">
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => handleAddParticipant(res)}
                    className="p-3 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{res.name}</div>
                      <div className="text-xs text-slate-400">{res.subText}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                      + Add
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected List */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-400">Invited Participants ({selectedParticipants.length}):</div>
            {selectedParticipants.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-2">No participants added yet. Search above to invite members or staff.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedParticipants.map((p) => (
                  <div key={p.participantId} className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({p.participantType})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.participantId)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 justify-end">
          <Link
            to="/meetings/dashboard"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Schedule Meeting Session
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMeetingPage;
