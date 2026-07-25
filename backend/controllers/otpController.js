const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");

// Configure nodemailer transporter (use your own email credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mkadnan2004@gmail.com", // your Gmail address
    pass: "lpli btho zxam afio",    // your Gmail app password
  },
});

// Generate a random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Request OTP
exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOtp();

  try {
    // Remove any previous OTP for this email
    await Otp.deleteMany({ email });

    // Save new OTP to DB
    await Otp.create({ email, otp });

    // Send OTP to user's entered email
    const mailOptions = {
      from: "mkadnan2004@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("OTP send error:", err);
    res.status(500).json({ error: err.message || "Failed to send OTP" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  console.log('Verifying OTP for:', email, otp); // Log incoming data
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const record = await Otp.findOne({ email, otp });
    console.log('OTP record found:', record); // Log DB result
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    await Otp.deleteOne({ _id: record._id });
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ error: err.message || "OTP verification failed" });
  }
};

// Send OTP (newly added function)
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  // Here you would generate and send the OTP
  // For now, just return success
  res.json({ success: true, message: `OTP sent to ${email}` });
};