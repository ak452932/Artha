const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const TeamMember = require("../models/Teammember");

const otpStore = {};
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY // Ensure this is set in your environment variables
    }
  })
);
// Ensure the transporter is working

// Handle user signup and send OTP
exports.signupUser = async (req, res) => {
  console.log("Received signup request:", req.body);
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      digits: true,
      specialChars: false
    });

    otpStore[email] = { otp, name, password, timestamp: Date.now() };

    // If email service is unavailable, fall back gracefully
    try {
      await transporter.sendMail({
        from: "akhileshkumar887722@gmail.com", // ✅ Use verified domain email
        to: email,
        subject: "Your OTP Code",
        html: `<p>Hi ${name},</p><p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Handle OTP verification and user creation
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) {
      return res.status(404).json({ message: "No OTP record found" });
    }

    const isExpired = Date.now() - record.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== record.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(record.password, 10);

    const user = new User({
      name: record.name,
      email,
      password: hashedPassword,
      isVerified: true
    });

    await user.save();
    delete otpStore[email];

    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt with:", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
// Add a new team member
exports.addTeamMember = async (req, res) => {
  console.log("Adding team member with data:", req.body);
const { name, role, description, imageUrl } = req.body;
  const newMember = new TeamMember({ name, role, description, imageUrl });
  await newMember.save();
  res.status(201).json({ message: 'Team member added' });

}

exports.getTeamMembers = async (req, res) => {
  const members = await TeamMember.find();  
  res.status(200).json(members);
}
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Forgot password request for:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      digits: true,
      specialChars: false
    });

    otpStore[email] = { otp, timestamp: Date.now() };
    console.log("Generated OTP:", otp);
    await transporter.sendMail({
      from: "akhileshkumar887722@gmail.com", // ✅ Use verified domain email
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It
expires in 5 minutes.</p>`
    });
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log("Reset password request for:", email);

  try {
    const record = otpStore[email];
    if (!record) {
      return res.status(404).json({ message: "No OTP record found" });
    }

    const isExpired = Date.now() - record.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== record.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    delete otpStore[email];

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}