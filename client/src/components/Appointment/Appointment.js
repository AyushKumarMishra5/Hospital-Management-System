import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { doctorsList } from '../Doctors/Doctors';
import './Appointment.css';
import Axios from 'axios';

// Replace these with your actual EmailJS credentials
const EMAILJS_PUBLIC_KEY = "Z1FnnOX_5kkn5xVzn"; // Get this from EmailJS Account Settings
const EMAILJS_SERVICE_ID = "service_o8lujaq"; // Get this after adding an email service
const EMAILJS_TEMPLATE_ID = "template_ht91o4u"; // Get this after creating a template
const EMAILJS_CANCEL_TEMPLATE_ID = "template_nqr7o1g"; // Create another template for cancellations

// Initialize EmailJS with your public key
emailjs.init(EMAILJS_PUBLIC_KEY);

// Helper function to check if a doctor is already booked at a specific time
const isDoctorBooked = (doctorName, selectedDate, selectedTime, existingAppointments) => {
  // If no appointments, doctor is not booked
  if (!existingAppointments || existingAppointments.length === 0) return false;
  
  // Format the time for 30-minute slot comparison
  const timeSlot = new Date(`${selectedDate}T${selectedTime}`);
  
  // Check if there's an existing appointment for this doctor at this time
  return existingAppointments.some(appointment => {
    // Skip canceled appointments
    if (appointment.status === 'Canceled') return false;
    
    // Check if this appointment is for the same doctor and date
    if (appointment.doctor === doctorName && appointment.date === selectedDate) {
      // Create a date object for the appointment time
      const appointmentTime = new Date(`${appointment.date}T${appointment.time}`);
      
      // Calculate time difference in minutes
      const timeDiff = Math.abs(timeSlot - appointmentTime) / (1000 * 60);
      
      // If time difference is less than 20 minutes, consider slot as booked
      return timeDiff < 20;
    }
    
    return false;
  });
};

// Helper function to find the next available time slot (20 min increments)
const findNextAvailableSlot = (doctorName, selectedDate, selectedTime, existingAppointments) => {
  // Start with selected time
  const timeSlot = new Date(`${selectedDate}T${selectedTime}`);
  let nextSlot = new Date(timeSlot);
  
  // Try slots in 20 minute increments (up to 2 hours)
  for (let i = 1; i <= 6; i++) {
    nextSlot = new Date(timeSlot.getTime() + (i * 20 * 60 * 1000));
    
    // Format time as HH:MM for checking
    const nextTimeStr = nextSlot.toTimeString().substring(0, 5);
    
    // Check if this slot is available
    if (!isDoctorBooked(doctorName, selectedDate, nextTimeStr, existingAppointments)) {
      return nextTimeStr;
    }
  }
  
  // If no slot found within 2 hours, return null
  return null;
};

// Helper function to check if a doctor is available on a specific day and time
const isDoctorAvailable = (doctor, selectedDate, selectedTime, existingAppointments = []) => {
  // If no date or time selected, return true
  if (!selectedDate || !selectedTime) return true;
  
  // First check if the doctor is already booked at this time
  if (isDoctorBooked(doctor.name, selectedDate, selectedTime, existingAppointments)) {
    return false;
  }
  
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const time = selectedTime;
  
  // Parse availability string (e.g., "Mon-Fri, 9AM-5PM")
  const availabilityStr = doctor.availability;
  
  // If it's an emergency doctor with 24/7 availability
  if (availabilityStr === "24/7") return true;
  
  // Parse day range
  const parts = availabilityStr.split(', ');
  const dayRange = parts[0]; // e.g., "Mon-Fri"
  const timeRange = parts[1]; // e.g., "9AM-5PM"
  
  // Define day mapping
  const dayMapping = {
    "Sun": 0,
    "Mon": 1,
    "Tue": 2,
    "Wed": 3,
    "Thu": 4,
    "Fri": 5,
    "Sat": 6
  };
  
  // Parse day range
  let availableDays = [];
  if (dayRange.includes('-')) {
    const [startDay, endDay] = dayRange.split('-');
    const startDayIndex = dayMapping[startDay];
    const endDayIndex = dayMapping[endDay];
    
    // Handle cases like "Wed-Sun" where we need to wrap around
    if (startDayIndex <= endDayIndex) {
      for (let i = startDayIndex; i <= endDayIndex; i++) {
        availableDays.push(i);
      }
    } else {
      // Handle wraparound case (e.g., "Sat-Mon")
      for (let i = startDayIndex; i <= 6; i++) {
        availableDays.push(i);
      }
      for (let i = 0; i <= endDayIndex; i++) {
        availableDays.push(i);
      }
    }
  } else {
    // Single day availability
    availableDays.push(dayMapping[dayRange]);
  }
  
  // Check if selected day is in available days
  const isDayAvailable = availableDays.includes(dayOfWeek);
  if (!isDayAvailable) return false;
  
  // Parse time range
  if (!timeRange) return true; // If no time range specified, assume all times available
  
  const [startTime, endTime] = timeRange.split('-');
  
  // Convert 12-hour format to 24-hour for comparison
  const convert12to24 = (time12h) => {
    const [time, modifier] = time12h.split(/([AP]M)/);
    let [hours, minutes] = time.split(':');
    if (!minutes) minutes = '00';
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM' && hours !== '00') {
      hours = parseInt(hours, 10) + 12;
    }
    
    // Convert hours to string before using padStart
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };
  
  // Convert selected time to 24-hour format for comparison
  const selectedTime24 = time; // Already in 24h format as the input is type="time"
  
  // Get start and end hours in 24-hour format
  const startTime24 = convert12to24(startTime);
  const endTime24 = convert12to24(endTime);
  
  // Check if selected time is within the available time range
  return selectedTime24 >= startTime24 && selectedTime24 <= endTime24;
};

export default function Appointment() {
  // States for appointments and form
  const [appointments, setAppointments] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState(doctorsList);
  const [bookedSlot, setBookedSlot] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);

  // Get current user info (this should come from your auth context/state)
  const currentUser = {
    id: '123', // This should come from your auth system
    name: 'Manjeet Singh',
    email: 'manjeet@example.com'
  };

  // State for new appointment
  const [newAppointment, setNewAppointment] = useState({
    patientId: currentUser.id,
    patientName: '',
    patientEmail: '', // This will store the user's entered email
    doctor: '',
    visitType: '',
    date: '',
    time: '',
    status: 'Confirmed'
  });

  // Visit types
  const visitTypes = [
    "Urgent",
    "New symptom visit",
    "Annual medicare wellness visit",
    "Follow up visit",
    "Chronic care visit"
  ];

  // Load all appointments from localStorage on component mount
  useEffect(() => {
    const savedAppointments = localStorage.getItem('clientAppointments');
    if (savedAppointments) {
      const parsedAppointments = JSON.parse(savedAppointments);
      // Set all appointments for slot checking
      setAllAppointments(parsedAppointments);
      
      // Filter appointments for current user
      const userAppointments = parsedAppointments.filter(
        app => app.patientId === currentUser.id
      );
      setAppointments(userAppointments);
    }
  }, [currentUser.id]);

  // Update filtered appointments when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAppointments(appointments);
      return;
    }
    
    const filtered = appointments.filter(appointment => {
      const searchLower = searchQuery.toLowerCase();
      return (
        appointment.doctor.toLowerCase().includes(searchLower) ||
        appointment.visitType.toLowerCase().includes(searchLower)
      );
    });
    setFilteredAppointments(filtered);
  }, [searchQuery, appointments]);

  // Filter available doctors when date or time changes
  useEffect(() => {
    const { date, time, doctor } = newAppointment;
    setBookedSlot(null); // Reset booked slot message when date/time changes
    
    if (date && time) {
      // Check if any doctors are available at this time
      const filtered = doctorsList.filter(doc => {
        const isAvailable = isDoctorAvailable(doc, date, time, allAppointments);
        
        // If the user already selected this doctor and it's now unavailable due to booking,
        // save the next available slot information
        if (doctor === doc.name && !isAvailable && isDoctorBooked(doc.name, date, time, allAppointments)) {
          const nextSlot = findNextAvailableSlot(doc.name, date, time, allAppointments);
          if (nextSlot) {
            setBookedSlot({
              doctorName: doc.name,
              nextAvailableTime: nextSlot
            });
          }
        }
        
        return isAvailable;
      });
      
      setAvailableDoctors(filtered);
    } else {
      setAvailableDoctors(doctorsList);
    }
  }, [newAppointment.date, newAppointment.time, allAppointments, newAppointment.doctor]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset booked slot message when doctor or date/time changes
    if (name === 'doctor' || name === 'date' || name === 'time') {
      setBookedSlot(null);
    }
    
    // If doctor was selected but is no longer available after date/time change, clear selection
    if ((name === 'date' || name === 'time') && newAppointment.doctor) {
      const selectedDoctor = doctorsList.find(d => d.name === newAppointment.doctor);
      if (selectedDoctor && !isDoctorAvailable(
          selectedDoctor, 
          name === 'date' ? value : newAppointment.date, 
          name === 'time' ? value : newAppointment.time,
          allAppointments
      )) {
        setNewAppointment(prev => ({
          ...prev,
          doctor: ''
        }));
      }
    }
  };

  // Send confirmation email
  const sendConfirmationEmail = async (appointmentDetails) => {
    try {
      console.log('Sending email to:', appointmentDetails.patientEmail); 
      
      const templateParams = {
        to_email: appointmentDetails.patientEmail,
        to_name: appointmentDetails.patientName,
        doctor_name: appointmentDetails.doctor,
        appointment_date: formatDate(appointmentDetails.date),
        appointment_time: appointmentDetails.time,
        visit_type: appointmentDetails.visitType,
        hospital_name: "𝚇𝚎𝚗𝚘 𝙷𝚎𝚊𝚕𝚝𝚑",
        hospital_address: "154, 9, Bannerghatta Rd, opposite IIM, Sahyadri Layout, Panduranga Nagar, Bengaluru, Karnataka 560076",
        hospital_phone: "096633 67253",
        reply_to: "xenohealthcare@gmail.com" 
      };

      console.log('Template params:', templateParams); 
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        console.log('Confirmation email sent successfully to:', appointmentDetails.patientEmail);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      alert('Could not send confirmation email. Please save your appointment details.');
    }
  };

  // Send cancellation email
  const sendCancellationEmail = async (appointmentDetails) => {
    try {
      console.log('Sending cancellation email to:', appointmentDetails.patientEmail); 

      const templateParams = {
        to_email: appointmentDetails.patientEmail,
        to_name: appointmentDetails.patientName,
        doctor_name: appointmentDetails.doctor,
        appointment_date: formatDate(appointmentDetails.date),
        appointment_time: appointmentDetails.time,
        visit_type: appointmentDetails.visitType,
        hospital_name: "𝚇𝚎𝚗𝚘 𝙷𝚎𝚊𝚕𝚝𝚑",
        hospital_address: "154, 9, Bannerghatta Rd, opposite IIM, Sahyadri Layout, Panduranga Nagar, Bengaluru, Karnataka 560076",
        hospital_phone: "096633 67253",
        reply_to: "xenohealthcare@gmail.com" 
      };

      console.log('Cancellation template params:', templateParams); 

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CANCEL_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        console.log('Cancellation email sent successfully to:', appointmentDetails.patientEmail);
      } else {
        throw new Error('Failed to send cancellation email');
      }
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error; // Propagate error to handle it in the calling function
    }
  };

  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!newAppointment.patientEmail) {
      alert('Please enter your email address');
      return;
    }

    if (!newAppointment.patientName) {
      alert('Please enter your name');
      return;
    }

    const {patientName, patientEmail, doctor, visitType, date, time} = newAppointment;
    
    try {
      setIsSubmitting(true);
      
      // MongoDB me data save karne ke liye API call
      const response = await Axios.post('https://hospital-management-system-p9bo.onrender.com/patient', {
        patientName,
        patientEmail, 
        doctor,
        visitType,
        date,
        time,
        status: 'Confirmed'
      });

      if (response.data) {
        console.log('Appointment saved:', response.data);
        
        // Email bhejne ka function call karo
        await sendConfirmationEmail({
          ...newAppointment,
          id: response.data._id // MongoDB se mile ID ko use karo
        });
        
        // UI update karo
        const updatedAllAppointments = [...allAppointments, {
          ...newAppointment,
          id: response.data._id,
          status: 'Confirmed'
        }];
        
        setAllAppointments(updatedAllAppointments);
        setAppointments(prev => [...prev, {
          ...newAppointment,
          id: response.data._id,
          status: 'Confirmed'
        }]);
        
        // Form reset karo
        setNewAppointment({
          patientId: currentUser.id,
          patientName: '',
          patientEmail: '',
          doctor: '',
          visitType: '',
          date: '',
          time: '',
          status: 'Confirmed'
        });
        
        setShowScheduleForm(false);
        alert('Appointment successfully booked! Confirmation email ' + newAppointment.patientEmail + ' sent on Email');
      }
    } catch (error) {
      console.error('Error in appointment submission:', error);
      alert('Appointment book error. try again');
    } finally {
      setIsSubmitting(false);
    }

    // Double-check if the doctor is still available (prevents race conditions)
    const doctorObj = doctorsList.find(d => d.name === newAppointment.doctor);
    if (doctorObj && !isDoctorAvailable(doctorObj, newAppointment.date, newAppointment.time, allAppointments)) {
      // Doctor has been booked by someone else while form was open
      const nextSlot = findNextAvailableSlot(
        newAppointment.doctor, 
        newAppointment.date, 
        newAppointment.time, 
        allAppointments
      );
      
      setBookedSlot({
        doctorName: newAppointment.doctor,
        nextAvailableTime: nextSlot
      });
      
      alert(`Sorry, ${newAppointment.doctor} is no longer available at this time slot. The next available slot is at ${nextSlot}.`);
      return;
    }

    setIsSubmitting(true);
    
    const appointment = {
      id: Date.now(),
      ...newAppointment,
      status: 'Confirmed'
    };
    
    try {
      // Send confirmation email first
      await sendConfirmationEmail(appointment);
      
      // If email sent successfully, save the appointment
      const updatedAllAppointments = [...allAppointments, appointment];
      
      localStorage.setItem('clientAppointments', JSON.stringify(updatedAllAppointments));
      setAllAppointments(updatedAllAppointments);
      setAppointments(prev => [...prev, appointment]);
      
      // Reset form and close modal
      setNewAppointment({
        patientId: currentUser.id,
        patientName: '',
        patientEmail: '',
        doctor: '',
        visitType: '',
        date: '',
        time: '',
        status: 'Confirmed'
      });
      setShowScheduleForm(false);

      // Show success message
      alert('Appointment scheduled successfully! A confirmation email has been sent to ' + appointment.patientEmail);
    } catch (error) {
      console.error('Error in appointment submission:', error);
      alert('There was an error scheduling your appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // Send cancellation email first
      await sendCancellationEmail(selectedAppointment);

      // If email sent successfully, update appointment status
      const allApps = JSON.parse(localStorage.getItem('clientAppointments') || '[]');
      
      const updatedAllAppointments = allApps.map(app => 
        app.id === selectedAppointment.id ? { ...app, status: 'Canceled' } : app
      );

      // Update localStorage with all appointments
      localStorage.setItem('clientAppointments', JSON.stringify(updatedAllAppointments));

      // Update all appointments state for slot checking
      setAllAppointments(updatedAllAppointments);
      
      // Update state with only user's appointments
      setAppointments(prev => 
        prev.map(app => 
          app.id === selectedAppointment.id ? { ...app, status: 'Canceled' } : app
        )
      );

      // Close confirmation modal
      setShowCancelConfirm(false);
      setSelectedAppointment(null);

      // Show success message
      alert('Appointment has been canceled successfully. A confirmation email has been sent to ' + selectedAppointment.patientEmail);
    } catch (error) {
      console.error('Error in appointment cancellation:', error);
      alert('There was an error canceling your appointment. Please try again.');
    }
  };

  // Check if appointment can be canceled (only confirmed appointments within 24 hours)
  const canCancelAppointment = (appointment) => {
    if (appointment.status !== 'Confirmed') return false;
    
    const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
    const now = new Date();
    const hoursDifference = (appointmentDate - now) / (1000 * 60 * 60);
    
    return hoursDifference > 24;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    return timeStr;
  };

  // Handle appointment deletion
  const handleDeleteAppointment = () => {
    if (!selectedAppointment) return;

    try {
      // Get all appointments from localStorage
      const allApps = JSON.parse(localStorage.getItem('clientAppointments') || '[]');
      
      // Filter out the selected appointment
      const updatedAllAppointments = allApps.filter(app => 
        app.id !== selectedAppointment.id
      );

      // Update localStorage with all appointments except the deleted one
      localStorage.setItem('clientAppointments', JSON.stringify(updatedAllAppointments));

      // Update all appointments state for slot checking
      setAllAppointments(updatedAllAppointments);
      
      // Update state with filtered appointments
      setAppointments(prev => 
        prev.filter(app => app.id !== selectedAppointment.id)
      );

      // Close confirmation modal
      setShowDeleteConfirm(false);
      setSelectedAppointment(null);

      // Show success message
      alert('Appointment has been deleted successfully.');
    } catch (error) {
      console.error('Error in appointment deletion:', error);
      alert('There was an error deleting your appointment. Please try again.');
    }
  };

  // Handle clearing all appointment data for current user
  const handleClearAllData = () => {
    try {
      // Get all appointments from localStorage
      const allApps = JSON.parse(localStorage.getItem('clientAppointments') || '[]');
      
      // Filter out appointments for current user
      const updatedAllAppointments = allApps.filter(app => 
        app.patientId !== currentUser.id
      );

      // Update localStorage without current user's appointments
      localStorage.setItem('clientAppointments', JSON.stringify(updatedAllAppointments));

      // Update all appointments state for slot checking
      setAllAppointments(updatedAllAppointments);
      
      // Clear appointments state
      setAppointments([]);
      
      // Close confirmation modal
      setShowClearDataConfirm(false);

      // Show success message
      alert('All your appointment records have been cleared successfully.');
    } catch (error) {
      console.error('Error clearing appointment data:', error);
      alert('There was an error clearing your appointment data. Please try again.');
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="schedule-btn"
            onClick={() => setShowScheduleForm(true)}
          >
            Schedule an Appointment
          </button>
          <button 
            className="clear-data-btn"
            onClick={() => setShowClearDataConfirm(true)}
          >
            Clear All Records
          </button>
        </div>
      </div>

      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Doctor</th>
              <th>Visit Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment, index) => (
              <tr key={appointment.id}>
                <td>{index + 1}</td>
                <td>{appointment.doctor}</td>
                <td>{appointment.visitType}</td>
                <td>{formatDate(appointment.date)}</td>
                <td>{formatTime(appointment.time)}</td>
                <td>
                  <span className={`status ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>
                  {canCancelAppointment(appointment) && (
                    <button
                      className="cancel-appointment-btn"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowCancelConfirm(true);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleForm && (
        <div className="modal-overlay" onClick={() => setShowScheduleForm(false)}>
          <div className="schedule-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule an Appointment</h2>
              <button 
                className="close-btn"
                onClick={() => setShowScheduleForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  ✉️ Email Address
                </label>
                <input
                  type="email"
                  name="patientEmail"
                  value={newAppointment.patientEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="form-group name-field">
                <label>
                  👤 Your Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={newAppointment.patientName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  🩺 Visit Type
                </label>
                <select
                  name="visitType"
                  value={newAppointment.visitType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select visit type</option>
                  {visitTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="date-time-container">
                <div className="form-group">
                  <label>
                    📅 Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newAppointment.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    🕒 Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={newAppointment.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  👨‍⚕️ Doctor
                </label>
                <select 
                  name="doctor" 
                  value={newAppointment.doctor} 
                  onChange={handleInputChange}
                  className="dropdown-select"
                  required
                >
                  <option value="">Select a doctor</option>
                  {availableDoctors.length > 0 ? (
                    availableDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.specialization} ({doctor.availability})
                      </option>
                    ))
                  ) : (
                    <option disabled value="">No doctors available at selected time</option>
                  )}
                </select>
                {newAppointment.date && newAppointment.time && availableDoctors.length === 0 && (
                  <p className="no-doctors-message">No doctors are available at the selected date and time. Please choose a different time.</p>
                )}
                {bookedSlot && (
                  <div className="booked-slot-message">
                    <p>Dr. {bookedSlot.doctorName} is already booked at this time.</p>
                    <p>Next available slot: <button 
                      type="button"
                      className="next-slot-btn"
                      onClick={() => {
                        setNewAppointment(prev => ({
                          ...prev,
                          time: bookedSlot.nextAvailableTime
                        }));
                      }}
                    >
                      {bookedSlot.nextAvailableTime}
                    </button></p>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowScheduleForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting || availableDoctors.length === 0}
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="cancel-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Appointment</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCancelConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to cancel your appointment with {selectedAppointment.doctor} on {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}?</p>
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  No, Keep It
                </button>
                <button 
                  className="submit-btn cancel-confirm-btn"
                  onClick={handleCancelAppointment}
                >
                  Yes, Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="cancel-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Appointment</h2>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete your completed appointment with {selectedAppointment.doctor} on {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}?</p>
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  No, Keep It
                </button>
                <button 
                  className="submit-btn delete-confirm-btn"
                  onClick={handleDeleteAppointment}
                >
                  Yes, Delete Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Data Confirmation Modal */}
      {showClearDataConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearDataConfirm(false)}>
          <div className="cancel-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Clear All Records</h2>
              <button 
                className="close-btn"
                onClick={() => setShowClearDataConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete ALL your appointment records? This action cannot be undone.</p>
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowClearDataConfirm(false)}
                >
                  No, Keep Records
                </button>
                <button 
                  className="submit-btn delete-confirm-btn"
                  onClick={handleClearAllData}
                >
                  Yes, Clear All Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
