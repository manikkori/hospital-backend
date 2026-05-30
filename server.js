// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
// DHYAN DE: .env file me MONGO_URI dalna mat bhulna!
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB')
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// ==========================================
// 1. DATABASE SCHEMAS (MODELS)
// ==========================================

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    doctor: { type: String },
    appointmentDate: { type: Date, required: true },
    message: { type: String },
    status: { type: String, default: 'Pending' } // Pending, Confirmed, Cancelled
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Contact Inquiry Schema
const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'Unread' }
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

// ==========================================
// 2. REST API ROUTES
// ==========================================

// Root Route
app.get('/', (req, res) => res.send('Hospital Backend API is Running...'));

// POST: Book new appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();
        res.status(201).json({ success: true, message: 'Appointment booked successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});
// POST: Admin Login API
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple authentication for hospital client
    if (username === 'admin' && password === 'admin123') {
        // Iss token ko frontend save karega taaki baar baar login na karna pade
        res.status(200).json({ success: true, token: 'hospital_secure_token_9988' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials. Access Denied.' });
    }
});

// GET: Fetch all appointments (For Admin Panel)
app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});
// DELETE: Remove an inquiry
app.delete('/api/inquiries/:id', async (req, res) => {
    try {
        await Inquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Message deleted successfully!' });
    } catch (error) {
        console.error("Delete error:", error.message);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// POST: Submit contact inquiry
app.post('/api/inquiries', async (req, res) => {
    try {
        const newInquiry = new Inquiry(req.body);
        await newInquiry.save();
        res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// GET: Fetch all inquiries (For Admin Panel)
app.get('/api/inquiries', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ==========================================
// 3. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});