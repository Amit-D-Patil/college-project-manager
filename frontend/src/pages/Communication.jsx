import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  MessageSquare,
  Send,
  Paperclip,
  Users,
  UserCheck,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

const Communication = () => {
  const { user, profile } = useAuth();
  
  // States
  const [contacts, setContacts] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Selection
  const [selectedContact, setSelectedContact] = useState(null); // { id, name, type: 'direct' or 'group' }
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inputs
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  
  // Auto-scroll ref
  const chatEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      const res = await API.get('/messages/conversations');
      if (res.data.success) {
        setContacts(res.data.contacts);
        
        // Handle student group chat availability
        if (res.data.group) {
          setActiveGroup(res.data.group);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contact) => {
    let url = '/messages?';
    if (contact.type === 'group') {
      url += `groupId=${contact.id}`;
    } else {
      url += `recipientId=${contact.id}`;
    }

    try {
      const res = await API.get(url);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact);
      
      // Setup interval to poll messages every 5 seconds for chat experience
      const pollInterval = setInterval(() => {
        loadMessages(selectedContact);
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [selectedContact]);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectContact = (id, name, type) => {
    setSelectedContact({ id, name, type });
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachment) return;

    const formData = new FormData();
    formData.append('content', messageText);
    
    if (selectedContact.type === 'group') {
      formData.append('groupId', selectedContact.id);
    } else {
      formData.append('recipientId', selectedContact.id);
    }

    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const res = await API.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setMessageText('');
        setAttachment(null);
        // Append message locally for speed
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex border border-slate-200 rounded-2xl bg-white shadow-xl overflow-hidden">
      
      {/* --- LEFT: THREADS/CONTACTS LIST --- */}
      <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <MessageSquare size={16} className="text-primary-500" />
            <span>ERP Messenger</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {/* Student/Faculty Group Chat Channel */}
          {activeGroup && (
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-2 block">Team Channel</span>
              {Array.isArray(activeGroup) ? (
                // Faculty assigned groups list
                activeGroup.map((g) => (
                  <button
                    key={g._id}
                    onClick={() => handleSelectContact(g._id, `Group ${g.groupCode} Channel`, 'group')}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      selectedContact?.id === g._id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Users size={16} className={selectedContact?.id === g._id ? 'text-white' : 'text-slate-400'} />
                    <span>Group {g.groupCode} Channel</span>
                  </button>
                ))
              ) : (
                // Student group chat
                <button
                  onClick={() => handleSelectContact(activeGroup._id, `Group ${activeGroup.groupCode} Channel`, 'group')}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-2.5 text-xs font-semibold transition-all ${
                    selectedContact?.id === activeGroup._id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Users size={16} className={selectedContact?.id === activeGroup._id ? 'text-white' : 'text-slate-400'} />
                  <span>Group {activeGroup.groupCode} Channel</span>
                </button>
              )}
            </div>
          )}

          {/* Direct message contacts */}
          <div className="space-y-1 pt-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-2 block">Direct Messages</span>
            
            {contacts.length === 0 ? (
              <div className="text-center text-[10px] text-slate-400 py-6 font-medium">
                No active chat threads
              </div>
            ) : (
              contacts.map((contact) => {
                const isSelected = selectedContact?.id === contact._id;
                const contactName = contact.studentProfile?.name || contact.facultyProfile?.name || contact.email;
                return (
                  <button
                    key={contact._id}
                    onClick={() => handleSelectContact(contact._id, contactName, 'direct')}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <UserCheck size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
                    <div className="overflow-hidden">
                      <div className="truncate">{contactName}</div>
                      <span className={`text-[9px] uppercase font-bold block ${isSelected ? 'text-primary-200' : 'text-slate-400'}`}>
                        {contact.currentRole}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT: CHAT MESSAGES PANEL --- */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-slate-50/30">
          
          {/* Active Contact Header */}
          <div className="h-14 border-b border-slate-200 flex items-center px-6 bg-white shrink-0">
            <h4 className="font-bold text-slate-800 text-sm">{selectedContact.name}</h4>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-12">No messages recorded in this chat thread. Start chatting below.</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl p-4 text-xs shadow-sm space-y-1.5 ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}>
                      {!isMe && (
                        <span className="font-bold text-[10px] text-primary-600 block">
                          {msg.senderId?.email || 'User'}
                        </span>
                      )}
                      <p className="leading-relaxed font-normal">{msg.content}</p>

                      {msg.attachmentUrl && (
                        <a
                          href={`http://localhost:5000${msg.attachmentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1 font-bold mt-2.5 p-2 rounded-lg text-[10px] border ${
                            isMe
                              ? 'bg-primary-700 border-primary-800 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Paperclip size={12} />
                          <span className="truncate max-w-[200px]">{msg.attachmentName || 'Attachment'}</span>
                        </a>
                      )}

                      <span className={`text-[9px] block text-right mt-1.5 font-medium ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2.5 items-center shrink-0">
            {/* Attachment input */}
            <div className="relative">
              <input
                type="file"
                id="chat-file"
                onChange={(e) => setAttachment(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="chat-file"
                className={`p-2.5 rounded-full hover:bg-slate-100 block cursor-pointer transition-all border ${
                  attachment ? 'bg-primary-50 border-primary-200 text-primary-600' : 'text-slate-400 border-transparent'
                }`}
                title="Attach file"
              >
                <Paperclip size={18} />
              </label>
            </div>

            <input
              type="text"
              placeholder={attachment ? `Attached: ${attachment.name}` : "Type your message..."}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white text-xs py-3.5 px-4 rounded-xl focus:ring-1 focus:ring-primary-500"
            />

            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl shadow-md shadow-primary-500/10 transition-all shrink-0"
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-slate-50/30 text-slate-400">
          <FolderOpen size={48} className="text-slate-200 mb-3" />
          <span className="text-xs font-medium">Select an active contact or team channel from the left sidebar to start messaging.</span>
        </div>
      )}

    </div>
  );
};

export default Communication;
