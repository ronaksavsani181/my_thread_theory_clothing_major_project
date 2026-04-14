import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🟢 CRITICAL FIX: Check if the user is suspended (blocked) by an Admin
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: "Your account has been suspended. Please contact client services." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // 🟢 NEW: FORGOT PASSWORD
// export const forgotPassword = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });

//     if (!user) {
//       return res.status(404).json({ message: "There is no user with that email address." });
//     }

//     // Generate a random token
//     const resetToken = crypto.randomBytes(20).toString("hex");

//     // Hash the token and save it to the database
//     user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//     user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

//     await user.save();

//     // Create the reset URL
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//     // 🟢 UPDATED: More robust Nodemailer configuration
//     // 🟢 MAILTRAP TEST TRANSPORTER
//     const transporter = nodemailer.createTransport({
//       host: "sandbox.smtp.mailtrap.io",
//       port: 2525,
//       auth: {
//         user: "YOUR_MAILTRAP_USER_ID", // Copy this from your Mailtrap dashboard
//         pass: "YOUR_MAILTRAP_PASSWORD" // Copy this from your Mailtrap dashboard
//       }
//     });

//     // 🟢 ADDED: Verify the connection setup before sending
//     await new Promise((resolve, reject) => {
//       transporter.verify(function (error, success) {
//         if (error) {
//           console.log("Transporter Error:", error);
//           reject(error);
//         } else {
//           console.log("Server is ready to take our messages");
//           resolve(success);
//         }
//       });
//     });

//     const mailOptions = {
//       from: `"Thread Theory Support" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: "Password Reset Request - Thread Theory",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; text-align: center;">
//           <h2 style="color: #0a0a0a; text-transform: uppercase; letter-spacing: 2px;">Password Reset</h2>
//           <p style="color: #555; line-height: 1.6;">You recently requested to reset your password for your Thread Theory account. Click the button below to proceed.</p>
//           <a href="${resetUrl}" style="background-color: #0a0a0a; color: #ffffff; padding: 14px 28px; text-decoration: none; display: inline-block; margin-top: 20px; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; font-weight: bold;">Reset Password</a>
//           <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request a password reset, please ignore this email. This link will expire in 10 minutes.</p>
//         </div>
//       `,
//     };

//     // Send the email
//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: "Password reset link sent to your email." });
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     res.status(500).json({ message: "Email could not be sent. Please try again." });
//   }
// };

// 🟢 SIMULATED FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "There is no user with that email address." });
    }

    // 1. Generate a real, secure random token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // 2. Hash the token and save it to the database temporarily
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    await user.save();

    // 3. Create the reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // 4. INSTEAD OF EMAILING: Send the link directly back to the frontend for the demo!
    res.status(200).json({ 
      message: "Reset link generated successfully.",
      demoLink: resetUrl // We pass the link here!
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to generate reset link." });
  }
};



// 🟢 NEW: RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    // Hash the token from the URL to compare it with the DB
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password successfully updated. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};