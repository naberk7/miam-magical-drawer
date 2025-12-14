'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Settings, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [participants, setParticipants] = useState([]);
  const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
  const [showAdmin, setShowAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [phase, setPhase] = useState('registration');
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [dataId, setDataId] = useState(null);
  
  const ADMIN_PASSWORD = '776110';

  // Generate snowflakes once
  const [snowflakes] = useState(() => 
    [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 10 + 10,
      animationDelay: Math.random() * 5,
      fontSize: Math.random() * 10 + 10
    }))
  );

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data when participants, deadline, phase, or assignments change
  useEffect(() => {
    if (dataId !== null) {
      saveData();
    }
  }, [participants, deadline, phase, assignments]);

  // Trigger confetti when phase changes to drawn
  useEffect(() => {
    if (phase === 'drawn') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [phase]);

  // Countdown timer effect
  useEffect(() => {
    if (!deadline) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const distance = deadlineTime - now;

      if (distance < 0) {
        setTimeRemaining(null);
        // Timer expired - admin must manually perform draw
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline, phase, participants]);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('drawer_data')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading data:', error);
        return;
      }

      if (data) {
        setDataId(data.id);
        setParticipants(data.participants || []);
        setDeadline(data.deadline || null);
        setPhase(data.phase || 'registration');
        setAssignments(data.assignments || []);
        
        if (data.phase === 'drawn') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      } else {
        // Create initial record
        const { data: newData, error: insertError } = await supabase
          .from('drawer_data')
          .insert([{
            participants: [],
            phase: 'registration',
            deadline: null,
            assignments: []
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating initial record:', insertError);
        } else {
          setDataId(newData.id);
        }
      }
    } catch (err) {
      console.error('Error in loadData:', err);
    }
  };

  const saveData = async () => {
    if (!dataId) return;

    try {
      const { error } = await supabase
        .from('drawer_data')
        .update({
          participants,
          phase,
          deadline,
          assignments,
          updated_at: new Date().toISOString()
        })
        .eq('id', dataId);

      if (error) {
        console.error('Error saving data:', error);
      }
    } catch (err) {
      console.error('Error in saveData:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.surname.trim() || !formData.email.trim()) {
      setError('All fields are required');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (participants.some(p => p.email.toLowerCase() === formData.email.toLowerCase())) {
      setError('This email is already registered');
      return;
    }

    const avoidCenter = Math.random() > 0.5;
    let x, y;
    
    if (avoidCenter) {
      // Position on left or right sides - but not too close to edges
      x = Math.random() > 0.5 
        ? 10 + Math.random() * 15  // Left side: 10-25%
        : 75 + Math.random() * 15; // Right side: 75-90%
      y = 15 + Math.random() * 70; // Vertical: 15-85%
    } else {
      // Position on top or bottom areas - avoid extreme edges
      x = 15 + Math.random() * 70; // Horizontal: 15-85%
      y = Math.random() > 0.5 
        ? 10 + Math.random() * 15  // Top: 10-25%
        : 70 + Math.random() * 20; // Bottom: 70-90%
    }
    
    const newParticipant = {
      id: Date.now(),
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      email: formData.email.trim().toLowerCase(),
      x: x,
      y: y,
      delay: Math.random() * 5
    };

    setParticipants([...participants, newParticipant]);
    setFormData({ name: '', surname: '', email: '' });
    
    // Send confirmation email
    console.log('Attempting to send confirmation email to:', formData.email);
    try {
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase()
        })
      });
      
      const data = await response.json();
      console.log('Email API response:', response.status, data);
      
      if (!response.ok) {
        console.error('Failed to send confirmation email:', data);
      } else {
        console.log('Email sent successfully!', data);
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const handleAdminLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setPasswordInput('');
    } else {
      alert('Incorrect password');
      setPasswordInput('');
    }
  };

  const removeParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const startEdit = (participant) => {
    setEditingId(participant.id);
    setEditEmail(participant.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEmail('');
  };

  const saveEdit = (id) => {
    if (!editEmail.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    const emailExists = participants.some(p => 
      p.id !== id && p.email.toLowerCase() === editEmail.toLowerCase()
    );

    if (emailExists) {
      alert('This email is already used by another participant');
      return;
    }

    setParticipants(participants.map(p => 
      p.id === id ? { ...p, email: editEmail.toLowerCase() } : p
    ));
    setEditingId(null);
    setEditEmail('');
  };

  const handleSetDeadline = (dateTimeString) => {
    if (!dateTimeString) {
      alert('Please select a date and time');
      return;
    }

    setDeadline(dateTimeString);
    setShowDeadlinePicker(false);
  };

  const removeDeadline = () => {
    if (confirm('Are you sure you want to remove the deadline?')) {
      setDeadline(null);
    }
  };

  const resetApp = async () => {
    if (confirm('Are you sure you want to reset participants and assignments? The deadline will remain unchanged.')) {
      try {
        const { error } = await supabase
          .from('drawer_data')
          .update({
            participants: [],
            phase: 'registration',
            assignments: [],
            updated_at: new Date().toISOString()
          })
          .eq('id', dataId);

        if (error) {
          console.error('Error resetting:', error);
          alert('Error resetting. Please try again.');
        } else {
          setParticipants([]);
          setPhase('registration');
          setAssignments([]);
          alert('Reset complete! You can now add participants again.');
        }
      } catch (err) {
        console.error('Error in resetApp:', err);
        alert('Error resetting. Please try again.');
      }
    }
  };

  const performDraw = () => {
    if (participants.length < 3) {
      alert('You need at least 3 participants to perform a draw!');
      return;
    }

    if (phase === 'drawn') {
      if (!confirm('Draw has already been performed. Do you want to redraw? This will create new assignments.')) {
        return;
      }
    }

    const shuffleArray = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    let validAssignment = false;
    let shuffled = [];
    let attempts = 0;
    const maxAttempts = 100;

    while (!validAssignment && attempts < maxAttempts) {
      shuffled = shuffleArray(participants);
      validAssignment = true;

      for (let i = 0; i < shuffled.length; i++) {
        if (shuffled[i].id === participants[i].id) {
          validAssignment = false;
          break;
        }
      }

      attempts++;
    }

    if (!validAssignment) {
      alert('Could not generate valid assignments. Please try again.');
      return;
    }

    const newAssignments = participants.map((giver, index) => ({
      giverId: giver.id,
      giverName: `${giver.name} ${giver.surname}`,
      giverEmail: giver.email,
      receiverId: participants[(index + 1) % participants.length].id,
      receiverName: `${participants[(index + 1) % participants.length].name} ${participants[(index + 1) % participants.length].surname}`,
      receiverEmail: participants[(index + 1) % participants.length].email
    }));

    setAssignments(newAssignments);
    setPhase('drawn');
    
    console.log('Draw completed! Assignments:', newAssignments);
    alert('Draw completed successfully! Check the admin panel to see assignments.');
  };

  const handleAdminClose = () => {
    setShowAdmin(false);
    setIsAdmin(false);
    setPasswordInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-green-900 to-red-950 text-white p-8 relative overflow-hidden">
      {/* Snowflakes background */}
      <div className="absolute inset-0 pointer-events-none">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute text-white opacity-60 animate-fall"
            style={{
              left: `${flake.left}%`,
              top: `-20px`,
              animationDuration: `${flake.animationDuration}s`,
              animationDelay: `${flake.animationDelay}s`,
              fontSize: `${flake.fontSize}px`
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: `${Math.random() * 20 + 15}px`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              {['🎉', '🎊', '✨', '🎁', '⭐', '🌟', '💫'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      )}

      {/* Floating participant names */}
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="absolute text-yellow-300 font-bold text-lg opacity-80 pointer-events-none animate-float"
          style={{
            left: `${participant.x}%`,
            top: `${participant.y}%`,
            animationDelay: `${participant.delay}s`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          🎁 {participant.name}
        </div>
      ))}

      {/* Admin button */}
      <button
        onClick={() => setShowAdmin(true)}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all z-10"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Main content */}
      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-12 h-12 text-yellow-300" />
            <h1 className="text-5xl font-bold text-yellow-300" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
              MIAM Magical Drawer
            </h1>
            <Gift className="w-12 h-12 text-yellow-300" />
          </div>
          <p className="text-xl text-green-200">Join the festive musical note exchange!</p>
          
          {/* Countdown Timer - only show in registration phase */}
          {phase === 'registration' && timeRemaining && (
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-yellow-300/50">
              <p className="text-sm text-yellow-300 mb-2 font-semibold">⏰ Time Remaining</p>
              <div className="flex justify-center gap-3 text-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{timeRemaining.days}</div>
                  <div className="text-xs text-green-200">Days</div>
                </div>
                <div className="text-3xl font-bold text-yellow-300">:</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{String(timeRemaining.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-green-200">Hours</div>
                </div>
                <div className="text-3xl font-bold text-yellow-300">:</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-green-200">Minutes</div>
                </div>
                <div className="text-3xl font-bold text-yellow-300">:</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-green-200">Seconds</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Registration form or completion message */}
        {phase === 'registration' ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 mb-4 border-2 border-yellow-300/30">
            <h2 className="text-xl font-bold mb-4 text-center text-yellow-300">Register Now! 🎄</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-300 text-sm"
                  placeholder="First Name"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-300 text-sm"
                  placeholder="Last Name"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-300 text-sm"
                  placeholder="Email"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-2 text-center text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-bold py-2.5 rounded-lg transition-all transform hover:scale-105 text-sm"
              >
                Join! 🎅
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-600 to-red-600 backdrop-blur-md rounded-xl p-6 mb-4 border-4 border-yellow-300 text-center">
            <h2 className="text-2xl font-bold mb-3 text-white">🎁 Drawing is Done! 🎁</h2>
            <p className="text-xl text-white mb-2">Please check your mailbox!</p>
            <p className="text-sm text-yellow-200">📧 Emails have been sent to all participants</p>
          </div>
        )}

        {/* Participants count */}
        <div 
          key={`${phase}-${participants.length}`}
          className="text-center bg-white/10 backdrop-blur-md rounded-xl p-3 border-2 border-yellow-300/30"
        >
          <h3 className="text-lg font-bold text-yellow-300">
            {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'}
          </h3>
        </div>
      </div>

      {/* Admin Modal */}
      {showAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-800 to-green-800 rounded-2xl p-8 max-w-lg w-full border-4 border-yellow-300 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleAdminClose}
              className="absolute top-4 right-4 text-white hover:text-yellow-300"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-yellow-300 text-center">
              🎄 Admin Panel 🎄
            </h2>

            {!isAdmin ? (
              <div>
                <label className="block text-sm font-semibold mb-2">Enter Admin Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-300 mb-4"
                  placeholder="Enter password"
                />
                <button
                  onClick={handleAdminLogin}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-red-900 font-bold py-3 rounded-lg"
                >
                  Login
                </button>
              </div>
            ) : (
              <div>
                  {/* Deadline Section */}
                  <div className="mb-4 pb-4 border-b-2 border-white/20">
                  <h3 className="text-lg font-bold mb-3 text-yellow-300">⏰ Deadline Settings</h3>
                  
                  {deadline ? (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-white/70">Current Deadline:</p>
                          <p className="font-bold text-lg">
                            {new Date(deadline).toLocaleString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setShowDeadlinePicker(true)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded"
                        >
                          Change
                        </button>
                        <button
                          onClick={removeDeadline}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeadlinePicker(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
                    >
                      Set Deadline
                    </button>
                  )}
                  
                  {showDeadlinePicker && (
                    <div className="mt-4 bg-white/10 rounded-lg p-4">
                      <label className="block text-sm font-semibold mb-2">Select Date & Time:</label>
                      <input
                        type="datetime-local"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSetDeadline(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 rounded bg-white/20 border-2 border-white/30 text-white focus:outline-none focus:border-yellow-300"
                      />
                      <button
                        onClick={() => setShowDeadlinePicker(false)}
                        className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Participants Section */}
                <div className="mb-4 pb-4 border-b-2 border-white/20">
                  <h3 className="text-lg font-bold mb-3 text-yellow-300">Registered Participants</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 bg-white/5 rounded-lg p-3">
                    {participants.length === 0 ? (
                      <p className="text-center text-white/70 py-8">No participants yet</p>
                    ) : (
                      participants.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white/10 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <p className="font-bold">{p.name} {p.surname}</p>
                              {editingId === p.id ? (
                                <div className="mt-2 flex gap-2">
                                  <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="flex-1 px-3 py-1.5 rounded bg-white/20 border-2 border-yellow-300 text-white text-sm focus:outline-none"
                                    placeholder="Email"
                                  />
                                  <button
                                    onClick={() => saveEdit(p.id)}
                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded text-sm font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 rounded text-sm font-bold"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-white/70">{p.email}</p>
                                  <button
                                    onClick={() => startEdit(p)}
                                    className="text-yellow-300 hover:text-yellow-400 text-xs underline"
                                  >
                                    edit
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingId !== p.id && (
                              <button
                                onClick={() => removeParticipant(p.id)}
                                className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Assignments Section - only show if drawn */}
                {phase === 'drawn' && assignments.length > 0 && (
                  <div className="mb-4 pb-4 border-b-2 border-white/20">
                    <h3 className="text-lg font-bold mb-3 text-yellow-300">🎁 Assignments</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 bg-purple-900/20 rounded-lg p-3 border-2 border-purple-400">
                      {assignments.map((assignment, index) => (
                        <div key={index} className="bg-white/10 rounded p-3 text-sm">
                          <div className="font-bold">{assignment.giverName}</div>
                          <div className="text-white/70 text-center my-1">→ gives to →</div>
                          <div className="font-bold text-green-300">{assignment.receiverName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t-2 border-white/20 space-y-2">
                  {/* Draw button */}
                  {phase === 'registration' && (
                    <button
                      onClick={performDraw}
                      disabled={participants.length < 3}
                      className={`w-full font-bold py-3 rounded-lg ${
                        participants.length < 3
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white`}
                    >
                      {participants.length < 3 
                        ? `Need ${3 - participants.length} more participants`
                        : '🎁 Perform Draw Now!'
                      }
                    </button>
                  )}

                  {/* Reset button for testing - only visible to admin */}
                  <button
                    onClick={resetApp}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg text-sm"
                  >
                    🔧 Reset for Testing
                  </button>

                  <p className="text-center text-sm text-white/70">Email sending coming in Phase 4! 📧</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -20px) rotate(5deg);
          }
          50% {
            transform: translate(-15px, -40px) rotate(-5deg);
          }
          75% {
            transform: translate(10px, -20px) rotate(3deg);
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
