import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchChatContacts, 
  fetchChatMessages, 
  sendChatMessageApi 
} from '../../services/api';
import { 
  MessageSquare, 
  Send, 
  User, 
  Users, 
  Search, 
  Clock, 
  CheckCheck, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  Building,
  RefreshCw
} from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null); // { type: 'user' | 'group', data: object }
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'groups'
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef(null);

  // Load contacts and groups
  const loadContacts = async () => {
    try {
      const res = await fetchChatContacts();
      if (res.data && res.data.success) {
        const { contacts: contactList, groups: groupList } = res.data.data;
        setContacts(contactList || []);
        setGroups(groupList || []);

        if (!selectedRecipient) {
          if (contactList && contactList.length > 0) {
            setSelectedRecipient({ type: 'user', data: contactList[0] });
          } else if (groupList && groupList.length > 0) {
            setSelectedRecipient({ type: 'group', data: groupList[0] });
          }
        }
      }
    } catch (error) {
      console.warn('Error loading contacts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Load messages when selected recipient changes
  const loadMessages = async () => {
    if (!selectedRecipient) return;
    try {
      const params = selectedRecipient.type === 'user' 
        ? { contactId: selectedRecipient.data._id }
        : { groupId: selectedRecipient.data._id };

      const res = await fetchChatMessages(params);
      if (res.data && res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch (error) {
      console.warn('Error loading messages:', error.message);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [selectedRecipient]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRecipient || sending) return;

    const payload = {
      message: messageInput.trim(),
      ...(selectedRecipient.type === 'user' ? { receiverId: selectedRecipient.data._id } : { groupId: selectedRecipient.data._id })
    };

    setSending(true);
    try {
      const res = await sendChatMessageApi(payload);
      if (res.data && res.data.success) {
        setMessageInput('');
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error.message);
    } finally {
      setSending(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.groupCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading communication network...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            <span>Cooperative Communication Hub</span>
          </h1>
          <p className="text-xs text-slate-500">
            Secure multi-channel messaging between Branch Managers, Group Executives, Administrators, and Society Members
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-600' : 'text-teal-600'}`} />
          <span>Refresh Thread</span>
        </button>
      </div>

      {/* Main Chat Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 min-h-0 bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Left Sidebar: Contacts & Channels (4 Cols) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col min-h-0 bg-slate-50/50">
          
          {/* Tab Selector & Search */}
          <div className="p-3 border-b border-slate-200 space-y-3 bg-white">
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'direct' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Direct ({contacts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'groups' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>SHG Groups ({groups.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={activeTab === 'direct' ? 'Search contacts by name or role...' : 'Search SHG / JLG groups...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
            {activeTab === 'direct' ? (
              filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No contacts found</div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedRecipient?.type === 'user' && selectedRecipient.data._id === contact._id;
                  return (
                    <button
                      key={contact._id}
                      onClick={() => setSelectedRecipient({ type: 'user', data: contact })}
                      className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center gap-3 border ${
                        isSelected
                          ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-xs'
                          : 'border-transparent text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                        {contact.name?.charAt(0) || 'U'}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate text-slate-900">{contact.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100/80 text-teal-800 font-mono font-bold">
                            {contact.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{contact.email || contact.username}</p>
                      </div>
                    </button>
                  );
                })
              )
            ) : (
              filteredGroups.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No SHG groups found</div>
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = selectedRecipient?.type === 'group' && selectedRecipient.data._id === group._id;
                  return (
                    <button
                      key={group._id}
                      onClick={() => setSelectedRecipient({ type: 'group', data: group })}
                      className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center gap-3 border ${
                        isSelected
                          ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-xs'
                          : 'border-transparent text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate text-slate-900">{group.groupName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100/80 text-teal-800 font-mono font-bold">
                            {group.groupCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{group.groupType}</p>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>

        </div>

        {/* Right Chat Panel (8 Cols) */}
        <div className="md:col-span-8 flex flex-col min-h-0 bg-white">
          
          {/* Active Conversation Header */}
          {selectedRecipient ? (
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
                  {selectedRecipient.type === 'user' ? (
                    selectedRecipient.data.name?.charAt(0) || 'U'
                  ) : (
                    <Users className="w-5 h-5 text-teal-700" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedRecipient.type === 'user' ? selectedRecipient.data.name : selectedRecipient.data.groupName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold">
                      {selectedRecipient.type === 'user' ? selectedRecipient.data.role : selectedRecipient.data.groupCode}
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    {selectedRecipient.type === 'user' ? (selectedRecipient.data.email || 'Direct Messaging') : 'SHG Group Channel'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-200 text-xs text-slate-400">Select a recipient to start messaging</div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0 bg-slate-50/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No messages yet in this conversation.</p>
                <p className="text-[11px] text-slate-400">Send a message below to begin communicating.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === user?._id;
                return (
                  <div
                    key={msg._id || Math.random()}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        {isMine ? 'You' : msg.senderName || 'Member'}
                      </span>
                      {msg.senderRole && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold">
                          {msg.senderRole}
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMine
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.message}
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-slate-400">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-teal-600 ml-1" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder={`Message ${selectedRecipient?.type === 'user' ? selectedRecipient.data.name : selectedRecipient?.data?.groupName || ''}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-600/20 disabled:opacity-40"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

export default ChatPage;
