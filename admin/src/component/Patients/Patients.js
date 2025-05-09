import React, { useState, useEffect } from 'react';
import './Patients.css';
// Import doctorsList from local data file
import { doctorsList } from '../../data/doctorsList';

export default function Appointment() {
  // ---------- STATES KI SETUP ---------- //
  
  // Calendar ke liye current date ka state
  const [currentDate, setCurrentDate] = useState(new Date());
  // View type ke liye state (grid/week/day)
  const [view, setView] = useState('grid');
  
  // Forms dikhane/hide karne ke liye states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Selected appointment ko store karne ke liye
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // New appointment ka data store karne ke liye
  const [newAppointment, setNewAppointment] = useState({
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    doctor: '',
    status: '',
    description: '',
    shareVia: {
      email: true,
      sms: true,
      whatsapp: false
    }
  });

  // Calendar view ke liye selected day
  const [selectedDay, setSelectedDay] = useState(new Date());
  
  // Doctors ki list store karne ke liye
  const [doctors, setDoctors] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  
  // Purpose of visit ke options
  const purposeOptions = [
    "Checkup",
    "Root Canal",
    "Cleaning",
    "Surgery",
    "Consultation",
    "Follow-up",
    "X-Ray",
    "Dental Implant",
    "Tooth Extraction",
    "Teeth Whitening"
  ];
  
  // Appointments ki list store karne ke liye
  const [appointments, setAppointments] = useState([]);
  // Search functionality ke liye
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  
  // Add new state for showing appointments list
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);

  // Add new state for notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add new state for read notifications
  const [readNotifications, setReadNotifications] = useState([]);

  // ---------- LIFECYCLE METHODS ---------- //
  
  // WebSocket connection setup
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'appointment_update') {
        // Automatically update appointments when new data is received
        fetchAppointments();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Component load hone par appointments ko fetch karo
  const fetchAppointments = async () => {
    try {
      // MongoDB से सभी appointments को fetch करो
      const response = await fetch('http://localhost:5000/patient');
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // MongoDB से आए appointments को admin panel के format में convert करो
        const formattedAppointments = data.map(appointment => ({
          id: appointment._id,
          name: appointment.patientName || "Unknown Patient",
          date: new Date(appointment.date),
          startTime: appointment.time,
          endTime: addMinutesToTime(appointment.time, 30), // Add 30 mins by default
          purpose: appointment.visitType || "Consultation",
          doctor: appointment.doctor,
          status: appointment.status || "Confirmed",
          description: `Patient Email: ${appointment.patientEmail || "No email provided"}`,
          shareVia: {
            email: true,
            sms: false,
            whatsapp: false
          },
          source: 'client' // Mark all appointments as client appointments
        }));
        
        setAppointments(formattedAppointments);
      } else {
        // If no appointments found, set empty array
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Show error message to admin
      alert('Error loading appointments. Please try again.');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Initialize doctors list
  useEffect(() => {
    // Doctors ki list ko set karo
    if (Array.isArray(doctorsList)) {
      setDoctors(doctorsList.map(doctor => ({
        id: doctor.id,
        name: doctor.name
      })));
    }

    // Current doctor ko set karo
    if (Array.isArray(doctorsList) && doctorsList.length > 0) {
      const dentist = doctorsList.find(doc => doc.name === "Dr. Alok Pandey");
      setCurrentDoctor(dentist || doctorsList[0]);
    }
  }, []);

  // Helper function to add minutes to time string (HH:MM format)
  const addMinutesToTime = (timeStr, minutes) => {
    if (!timeStr) return "09:00";
    
    const [hours, mins] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + mins + minutes;
    
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };
  
  // Jab bhi appointments update ho, localStorage me save karo
  useEffect(() => {
    // Keep only admin appointments for saving to localStorage
    const adminAppointments = appointments.filter(appointment => 
      appointment.source !== 'client'
    );
    
    // Filter out necessary fields before saving to localStorage
    const appointmentsToSave = adminAppointments.map(appointment => {
      // Convert Date object to string to prevent circular reference issues
      const appointmentCopy = { ...appointment };
      
      if (appointmentCopy.date instanceof Date) {
        appointmentCopy.date = appointmentCopy.date.toISOString();
      }
      
      return appointmentCopy;
    });
    
    localStorage.setItem('appointments', JSON.stringify(appointmentsToSave));
  }, [appointments]);

  // Add this useEffect near the top of the component with other useEffects
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationsElement = document.querySelector('.notifications');
      if (notificationsElement && !notificationsElement.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  // Add useEffect to load read notifications from localStorage
  useEffect(() => {
    const savedReadNotifications = localStorage.getItem('readNotifications');
    if (savedReadNotifications) {
      setReadNotifications(JSON.parse(savedReadNotifications));
    }
  }, []);

  // ---------- HELPER FUNCTIONS ---------- //

  // Previous month/week pe jane ke liye
  const prevPeriod = () => {
    if (view === 'grid') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (view === 'day') {
      const newDate = new Date(selectedDay);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDay(newDate);
    }
  };

  // Next month/week pe jane ke liye
  const nextPeriod = () => {
    if (view === 'grid') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (view === 'day') {
      const newDate = new Date(selectedDay);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDay(newDate);
    }
  };

  // Current period (month/week) ko format karne ke liye
  const formatCurrentPeriod = () => {
    if (view === 'grid') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const weekStart = getWeekStartDate(currentDate);
      return weekStart.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (view === 'day') {
      return selectedDay.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return '';
  };

  // Week ke start date ko get karne ke liye (Sunday)
  const getWeekStartDate = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 for Sunday
    d.setDate(d.getDate() - day); // Week ke start me jao
    return d;
  };

  // Month ke sare din get karne ke liye
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Month ka first day get karo
    const firstDay = new Date(year, month, 1).getDay();
    
    // Previous month ke din add karo
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - firstDay + i + 1),
        isCurrentMonth: false,
        day: prevMonthDays - firstDay + i + 1
      });
    } 
    
    // Current month ke din add karo
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        day: i
      });
    }
    
    // Next month ke din add karo
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        day: i
      });
    }
    
    return days;
  };

  // Ek specific din ke liye appointments get karne ke liye
  const getAppointmentsForDay = (date) => {
    return filteredAppointments.filter(a => 
      a.date.getDate() === date.getDate() && 
      a.date.getMonth() === date.getMonth() && 
      a.date.getFullYear() === date.getFullYear()
    );
  };

  // Din ko double digit me format karne ke liye (e.g., 1 -> 01)
  const formatDay = (day) => {
    return day < 10 ? `0${day}` : day;
  };

  // Week ke din
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Week view ke liye din get karne ke liye
  const getWeekDays = () => {
    const weekStart = getWeekStartDate(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        dayName: weekDays[i],
        dayNumber: date.getDate()
      });
    }
    
    return days;
  };

  // Time slots get karne ke liye (24 hours)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour < 12 ? 'am' : 'pm';
      slots.push({
        time: `${displayHour}:00 ${period}`,
        hour
      });
    }
    return slots;
  };

  // Specific din aur hour ke liye appointments get karne ke liye
  const getAppointmentsForTimeSlot = (date, hour) => {
    const formattedHour = hour.toString().padStart(2, '0');
    return filteredAppointments.filter(a => {
      const appointmentDate = new Date(a.date);
      const appointmentStartHour = parseInt(a.startTime.split(':')[0]);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear() &&
        appointmentStartHour === hour
      );
    });
  };

  // Today ke date pe jane ke liye
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  // ---------- FORM HANDLING ---------- //

  // Form input change handle karne ke liye
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Share options (email/sms/whatsapp) ko handle karne ke liye
  const handleShareChange = (option) => {
    setNewAppointment(prev => ({
      ...prev,
      shareVia: {
        ...prev.shareVia,
        [option]: !prev.shareVia[option]
      }
    }));
  };

  // New appointment add karne ke liye
  const handleAddAppointment = (e) => {
    e.preventDefault();
    
    // New appointment create karo
    const startDateObj = new Date(newAppointment.startDate);
    const endDateObj = new Date(newAppointment.endDate);
    const appointment = {
      id: Date.now(),
      name: newAppointment.name,
      startDate: startDateObj,
      endDate: endDateObj,
      date: startDateObj,
      startTime: newAppointment.startTime,
      endTime: newAppointment.endTime,
      purpose: newAppointment.purpose,
      doctor: newAppointment.doctor,
      status: newAppointment.status,
      description: newAppointment.description,
      shareVia: newAppointment.shareVia
    };
    
    // Appointments list me add karo
    const updatedAppointments = [...appointments, appointment];
    setAppointments(updatedAppointments);
    
    // LocalStorage me save karo
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    // Form reset karo
    resetForm();
    setShowAddForm(false);
  };

  // Appointment ko edit karne ke liye
  const handleEditAppointment = (e) => {
    e.preventDefault();
    
    // Create updated appointment object
    const updatedAppointment = {
      ...selectedAppointment,
      name: newAppointment.name,
      startDate: new Date(newAppointment.startDate),
      endDate: new Date(newAppointment.endDate),
      date: new Date(newAppointment.startDate),
      startTime: newAppointment.startTime,
      endTime: newAppointment.endTime,
      purpose: newAppointment.purpose,
      doctor: newAppointment.doctor,
      status: newAppointment.status,
      description: newAppointment.description,
      shareVia: newAppointment.shareVia
    };
    
    // For client appointments, only update the status
    if (selectedAppointment.source === 'client') {
      // Only update status for client appointments
      updatedAppointment.status = newAppointment.status;
      
      // Also update in client appointments localStorage
      const clientAppointments = JSON.parse(localStorage.getItem('clientAppointments') || '[]');
      const updatedClientAppointments = clientAppointments.map(app => 
        app.id === selectedAppointment.id ? {...app, status: newAppointment.status} : app
      );
      localStorage.setItem('clientAppointments', JSON.stringify(updatedClientAppointments));
    }
    
    // Map over appointments to update the correct one
    const updatedAppointments = appointments.map(app => 
      app.id === selectedAppointment.id ? updatedAppointment : app
    );
    
    setAppointments(updatedAppointments);
    
    // Form reset karke close karo
    resetForm();
    setShowEditForm(false);
    setSelectedAppointment(null);
  };

  // Appointment ko delete karne ke liye
  const handleDeleteAppointment = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      // Find the appointment to check if it's a client appointment
      const appointmentToDelete = appointments.find(app => app.id === id);
      
      // Update the appointments state
      const updatedAppointments = appointments.filter(app => app.id !== id);
      setAppointments(updatedAppointments);
      
      // If it's a client appointment, also update clientAppointments in localStorage
      if (appointmentToDelete && appointmentToDelete.source === 'client') {
        const clientAppointments = JSON.parse(localStorage.getItem('clientAppointments') || '[]');
        const updatedClientAppointments = clientAppointments.filter(app => app.id !== id);
        localStorage.setItem('clientAppointments', JSON.stringify(updatedClientAppointments));
      }
    }
  };

  // Edit modal ko open karne ke liye
  const openEditModal = (appointment) => {
    // Ensure appointment date is a proper Date object
    const appointmentDate = appointment.date instanceof Date 
      ? appointment.date 
      : new Date(appointment.date);
    
    setSelectedAppointment(appointment);
    setNewAppointment({
      name: appointment.name,
      startDate: appointment.startDate || appointmentDate,
      endDate: appointment.endDate || appointmentDate,
      date: appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      purpose: appointment.purpose,
      doctor: appointment.doctor,
      status: appointment.status || 'Confirmed',
      description: appointment.description || '',
      shareVia: appointment.shareVia || {
        email: true,
        sms: false,
        whatsapp: false
      }
    });
    setShowEditForm(true);
  };

  // Form ko reset karne ke liye
  const resetForm = () => {
    setNewAppointment({
      name: '',
      startDate: new Date(),
      endDate: new Date(),
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      purpose: '',
      doctor: '',
      status: '',
      description: '',
      shareVia: {
        email: true,
        sms: true,
        whatsapp: false
      }
    });
  };

  // Check karne ke liye ki kya date aaj ki hai
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Time ko 24 hour se 12 hour format me convert karne ke liye
  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour);
    const ampm = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  // Selected day ke liye appointments ko get karne ke liye
  const getAppointmentsForSelectedDay = () => {
    return filteredAppointments.filter(a => {
      const appDate = new Date(a.date);
      return appDate.getDate() === selectedDay.getDate() && 
             appDate.getMonth() === selectedDay.getMonth() && 
             appDate.getFullYear() === selectedDay.getFullYear();
    }).sort((a, b) => {
      // Start time ke hisab se sort karo
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Week ke din ko format karne ke liye
  const formatDayOfWeek = (date) => {
    return date.toLocaleString('default', { weekday: 'long' });
  };

  // Month view me din pe click karne par
  const handleDayClick = (date) => {
    setSelectedDay(date);
    setView('day');
  };

  // Initialize filteredAppointments with all appointments
  useEffect(() => {
    setFilteredAppointments(appointments);
  }, [appointments]);

  // Search filter ko handle karne ke liye
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAppointments(appointments);
      return;
    }
    
    // Name, doctor ya purpose ke basis pe filter karo
    const filtered = appointments.filter(appointment => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (appointment.name && appointment.name.toLowerCase().includes(searchLower)) ||
        (appointment.doctor && appointment.doctor.toLowerCase().includes(searchLower)) ||
        (appointment.purpose && appointment.purpose.toLowerCase().includes(searchLower))
      );
    });
    setFilteredAppointments(filtered);
  }, [searchQuery, appointments]);

  // Search input ko handle karne ke liye
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // ---------- DATE FORMATTING FUNCTIONS ---------- //

  // Date ko form ke liye format karne ke liye (YYYY-MM-DD format me)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date ko display ke liye format karne ke liye (MM/DD/YYYY format me)
  const formatDateDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Add function to determine time period and color
  const getTimePeriod = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return { period: 'Morning', color: '#4a90e2' };
    if (hour >= 12 && hour < 17) return { period: 'Afternoon', color: '#f39c12' };
    if (hour >= 17 && hour < 20) return { period: 'Evening', color: '#8e44ad' };
    return { period: 'Night', color: '#2c3e50' };
  };

  // Add function to sort appointments by date and time
  const getSortedAppointments = () => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Update the getNotifications function
  const getNotifications = () => {
    const today = new Date();
    const upcomingAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const timeDiff = appointmentDate.getTime() - today.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      return daysDiff >= 0 && daysDiff <= 3;
    });

    return upcomingAppointments.map(appointment => {
      const appointmentDate = new Date(appointment.date);
      const timeDiff = appointmentDate.getTime() - today.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      let type = 'upcoming';
      if (daysDiff === 0) type = 'today';
      if (daysDiff === 1) type = 'tomorrow';

      return {
        id: appointment.id,
        type,
        title: `Appointment with ${appointment.name}`,
        time: `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`,
        date: formatDateDisplay(appointment.date),
        doctor: appointment.doctor,
        isRead: readNotifications.includes(appointment.id)
      };
    });
  };

  // Update notifications when appointments change
  useEffect(() => {
    setNotifications(getNotifications());
  }, [appointments]);

  // Update the markAsRead function
  const markAsRead = (notificationId) => {
    const updatedReadNotifications = [...readNotifications, notificationId];
    setReadNotifications(updatedReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));
    
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Add function to get notification badge count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  return (
    <div className="appointment-container">
      <div className="appointment-header">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search appointments by patient, doctor or purpose..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="user-profile">
          <div 
            className="total-appointments"
            onClick={() => setShowAppointmentsList(!showAppointmentsList)}
            style={{ cursor: 'pointer' }}
          >
            <span className="total-count">
              <i className="fas fa-calendar-check"></i>
              <span className="count-number">{appointments.length}</span>
            </span>
            <span className="count-label">Total Appointments</span>
          </div>

          {showAppointmentsList && (
            <div 
              className="add-appointment-modal" 
              onClick={() => setShowAppointmentsList(false)}
            >
              <div 
                className="appointments-list-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="popup-header">
                  <h3>All Appointments</h3>
                  <button 
                    className="close-btn" 
                    onClick={() => setShowAppointmentsList(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="popup-content">
                  {getSortedAppointments().map((appointment) => {
                    const { period } = getTimePeriod(appointment.startTime);
                    return (
                      <div 
                        key={appointment.id} 
                        className="appointment-item"
                        onClick={() => {
                          setShowAppointmentsList(false);
                          openEditModal(appointment);
                        }}
                      >
                        <div className="appointment-time-info">
                          <span className="appointment-date">
                            {formatDateDisplay(appointment.date)}
                          </span>
                          <span className="appointment-time">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </span>
                          <span className={`time-period ${period.toLowerCase()}`}>
                            {period}
                          </span>
                        </div>
                        <div className="appointment-details">
                          <span className="patient-name">
                            {appointment.name}
                          </span>
                          <span className="appointment-with">
                            <i className="fas fa-user-md"></i>
                            {appointment.doctor}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="notifications">
            <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="fas fa-bell"></i>
              {getUnreadCount() > 0 && <span className="notification-badge">{getUnreadCount()}</span>}
            </div>
            {showNotifications && (
              <div 
                className="notifications-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="notifications-header">
                  <h3>Notifications ({getUnreadCount()} unread)</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowNotifications(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="notifications-content">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}
                        onClick={() => {
                          markAsRead(notification.id);
                          const appointment = appointments.find(a => a.id === notification.id);
                          if (appointment) {
                            openEditModal(appointment);
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="notification-icon">
                          {notification.type === 'today' && <i className="fas fa-exclamation-circle"></i>}
                          {notification.type === 'tomorrow' && <i className="fas fa-clock"></i>}
                          {notification.type === 'upcoming' && <i className="fas fa-calendar-alt"></i>}
                        </div>
                        <div className="notification-details">
                          <div className="notification-title">
                            {notification.isRead ? (
                              notification.title
                            ) : (
                              <strong>{notification.title}</strong>
                            )}
                          </div>
                          <div className="notification-time">
                            <i className="far fa-clock"></i> {notification.time}
                          </div>
                          <div className="notification-date">
                            <i className="far fa-calendar"></i> {notification.date}
                          </div>
                          <div className="notification-doctor">
                            <i className="fas fa-user-md"></i> {notification.doctor}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="unread-indicator">
                            <span className="dot"></span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <i className="far fa-bell-slash"></i>
                      <p>No upcoming appointments</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {currentDoctor && (
            <div className="profile">
              <div className="profile-image">
                <img 
                  src={currentDoctor.image} 
                  alt={currentDoctor.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg";
                  }}
                />
              </div>
              <div className="profile-info">
                <div className="profile-name">{currentDoctor.name}</div>
                <div className="profile-specialty">{currentDoctor.specialization}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <h1 className="appointments-title">Appointments</h1>
      
      <div className="calendar-controls">
        <div className="left-controls">
          <button className="today-btn" onClick={goToToday}>Today</button>
        </div>
        
        <div className="month-navigation">
          <button className="nav-btn prev" onClick={prevPeriod}><i className="fas fa-chevron-left"></i></button>
          <div className="current-month">{formatCurrentPeriod()}</div>
          <button className="nav-btn next" onClick={nextPeriod}><i className="fas fa-chevron-right"></i></button>
        </div>
        
        <div className="view-options">
          <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
            <i className="fas fa-th"></i>
          </button>
          <button className={`view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>
            <i className="far fa-calendar-alt"></i>
          </button>
          <button className={`view-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>
            <i className="far fa-clock"></i>
          </button>
        </div>
      </div>
      
      {view === 'grid' && (
        <div className="calendar-grid">
          <div className="weekdays">
            {weekDays.map((day, index) => (
              <div key={index} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="days">
            {getDaysInMonth(currentDate).map((dayInfo, index) => {
              const dayAppointments = getAppointmentsForDay(dayInfo.date);
              return (
                <div 
                  key={index} 
                  className={`day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isToday(dayInfo.date) ? 'today' : ''}`}
                  onClick={() => handleDayClick(dayInfo.date)}
                >
                  <div className="day-number">{formatDay(dayInfo.day)}</div>
                  {dayAppointments.length > 0 && (
                    <div className="day-appointments">
                      <div 
                        className="appointment-preview"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(dayAppointments[0]);
                        }}
                      >
                        <div className="appointment-item">{dayAppointments[0].name}</div>
                      </div>
                      {dayAppointments.length > 1 && (
                        <div className="more-appointments">+{dayAppointments.length - 1} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="week-view">
          <div className="week-header">
            <div className="time-column-header"></div>
            {getWeekDays().map((day, index) => (
              <div 
                key={index} 
                className={`day-column-header ${isToday(day.date) ? 'today' : ''}`}
              >
                <div className="day-name">{day.dayNumber} {day.dayName}</div>
              </div>
            ))}
          </div>
          
          <div className="week-body">
            {getTimeSlots().map((slot, slotIndex) => (
              <div key={slotIndex} className="time-row">
                <div className="time-label">{slot.time}</div>
                {getWeekDays().map((day, dayIndex) => {
                  const appts = getAppointmentsForTimeSlot(day.date, slot.hour);
                  return (
                    <div key={dayIndex} className="day-slot">
                      {appts.map((appt, apptIndex) => (
                        <div 
                          key={apptIndex} 
                          className="week-appointment" 
                          onClick={() => openEditModal(appt)}
                        >
                          <div className="time-range">
                            {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                          </div>
                          <div className="patient-name">{appt.name}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {view === 'day' && (
        <div className="day-view">
          <div className="day-view-header">
            <h3>{formatDayOfWeek(selectedDay)}</h3>
            <p className="day-date">{selectedDay.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          
          <div className="day-view-content">
            <div className="time-slots">
              {getTimeSlots().map((slot, slotIndex) => {
                const timeAppts = appointments.filter(a => {
                  const appointmentDate = new Date(a.date);
                  const appointmentStartHour = parseInt(a.startTime.split(':')[0]);
                  return (
                    appointmentDate.getDate() === selectedDay.getDate() &&
                    appointmentDate.getMonth() === selectedDay.getMonth() &&
                    appointmentDate.getFullYear() === selectedDay.getFullYear() &&
                    appointmentStartHour === slot.hour
                  );
                });
                
                return (
                  <div key={slotIndex} className="day-time-slot">
                    <div className="time-slot-label">{slot.time}</div>
                    <div className="time-slot-content">
                      {timeAppts.map((appt, apptIndex) => (
                        <div 
                          key={apptIndex} 
                          className="day-appointment" 
                          onClick={() => openEditModal(appt)}
                        >
                          <div className="time-range">
                            {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                          </div>
                          <div className="patient-name">{appt.name}</div>
                          <div className="appointment-purpose">{appt.purpose}</div>
                          <div className="appointment-doctor">{appt.doctor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button className="add-appointment-btn" onClick={() => setShowAddForm(true)}>
        <i className="fas fa-plus"></i>
      </button>

      {showAddForm && (
        <div 
          className="add-appointment-modal"
          onClick={() => setShowAddForm(false)}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>New Appointment</h2>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddAppointment}>
              <div className="form-group">
                <label>Patient Name</label>
                <div className="input-with-add">
                  <input 
                    type="text" 
                    name="name" 
                    value={newAppointment.name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Select Patient and patient name will appear here"
                  />
                  <button type="button" className="add-btn">+ Add</button>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Purpose of visit</label>
                  <select 
                    name="purpose" 
                    value={newAppointment.purpose} 
                    onChange={handleInputChange}
                    className="dropdown-select"
                    placeholder="Select service.."
                  >
                    <option value="">Select service..</option>
                    {purposeOptions.map((purpose, index) => (
                      <option key={index} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formatDateForInput(newAppointment.startDate || newAppointment.date)}
                    onChange={handleInputChange}
                    min={formatDateForInput(new Date())}
                    required
                  />
                </div>
              </div>
              
              {/* <div className="form-row">
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={formatDateForInput(newAppointment.endDate || newAppointment.date)}
                    onChange={handleInputChange}
                    min={formatDateForInput(newAppointment.startDate || new Date())}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={newAppointment.startTime}
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>End time</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={newAppointment.endTime}
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <select 
                    name="doctor" 
                    value={newAppointment.doctor} 
                    onChange={handleInputChange}
                    className="dropdown-select"
                  >
                    <option value="">Select doctor</option>
                    {doctors && doctors.length > 0 ? (
                      doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                      ))
                    ) : (
                      // Fallback options if doctors list is not available
                      <>
                        <option value="Hugo Lloris">Hugo Lloris</option>
                        <option value="Dr. Smith">Dr. Smith</option>
                        <option value="Dr. Johnson">Dr. Johnson</option>
                      </>
                    )}
                  </select>
                </div>
              </div> */}
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status" 
                  value={newAppointment.status} 
                  onChange={handleInputChange}
                  className="dropdown-select"
                >
                  <option value="">Status...</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={newAppointment.description} 
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="She will be coming for a checkup...."
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Share with patient via</label>
                <div className="share-options">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={newAppointment.shareVia.email} 
                      onChange={() => handleShareChange('email')} 
                    />
                    <span className="checkbox-text">Email</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={newAppointment.shareVia.sms} 
                      onChange={() => handleShareChange('sms')} 
                    />
                    <span className="checkbox-text">SMS</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={newAppointment.shareVia.whatsapp} 
                      onChange={() => handleShareChange('whatsapp')} 
                    />
                    <span className="checkbox-text">WhatsApp</span>
                  </label>
                </div>
              </div>
              
              <div className="form-buttons edit-buttons">
                <button type="button" className="discard-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="save-btn">
                  Save <i className="fas fa-check-circle"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && selectedAppointment && (
        <div 
          className="add-appointment-modal"
          onClick={() => {
            setShowEditForm(false);
            setSelectedAppointment(null);
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Appointment</h2>
              <button className="close-btn" onClick={() => {
                setShowEditForm(false);
                setSelectedAppointment(null);
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditAppointment}>
              <div className="form-group">
                <label>Patient Name</label>
                <div className="input-with-add">
                  <input 
                    type="text" 
                    name="name" 
                    value={newAppointment.name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Select Patient and patient name will appear here"
                  />
                  <button type="button" className="add-btn">+ Add</button>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Purpose of visit</label>
                  <select 
                    name="purpose" 
                    value={newAppointment.purpose} 
                    onChange={handleInputChange}
                    className="dropdown-select"
                    placeholder="Select service.."
                  >
                    <option value="">Select service..</option>
                    {purposeOptions.map((purpose, index) => (
                      <option key={index} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formatDateForInput(newAppointment.startDate || newAppointment.date)}
                    onChange={handleInputChange}
                    min={formatDateForInput(new Date())}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={formatDateForInput(newAppointment.endDate || newAppointment.date)}
                    onChange={handleInputChange}
                    min={formatDateForInput(newAppointment.startDate || new Date())}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={newAppointment.startTime}
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>End time</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={newAppointment.endTime}
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <select 
                    name="doctor" 
                    value={newAppointment.doctor} 
                    onChange={handleInputChange}
                    className="dropdown-select"
                  >
                    <option value="">Select doctor</option>
                    {doctors && doctors.length > 0 ? (
                      doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Hugo Lloris">Hugo Lloris</option>
                        <option value="Dr. Smith">Dr. Smith</option>
                        <option value="Dr. Johnson">Dr. Johnson</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status" 
                  value={newAppointment.status} 
                  onChange={handleInputChange}
                  className="dropdown-select"
                >
                  <option value="">Status...</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={newAppointment.description} 
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="She will be coming for a checkup...."
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Share with patient via</label>
                <div className="share-options">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={newAppointment.shareVia.email} 
                      onChange={() => handleShareChange('email')} 
                    />
                    <span className="checkbox-text">Email</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={newAppointment.shareVia.sms} 
                      onChange={() => handleShareChange('sms')} 
                    />
                    <span className="checkbox-text">SMS</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={newAppointment.shareVia.whatsapp} 
                      onChange={() => handleShareChange('whatsapp')} 
                    />
                    <span className="checkbox-text">WhatsApp</span>
                  </label>
                </div>
              </div>
              
              <div className="form-buttons edit-buttons">
                <div className="left-buttons">
                  <button 
                    type="button" 
                    className="delete-btn" 
                    onClick={() => {
                      handleDeleteAppointment(selectedAppointment.id);
                      setShowEditForm(false);
                      setSelectedAppointment(null);
                    }}
                  >
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                  <button 
                    type="button" 
                    className="discard-btn" 
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedAppointment(null);
                    }}
                  >
                    Discard
                  </button>
                </div>
                <button type="submit" className="save-btn">
                  Save <i className="fas fa-check-circle"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
