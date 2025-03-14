const User = require("../models/user");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

const validate_string = (value, field_name, min_length = 5) => {
  if (!value || typeof value !== "string" || value.trim().length < min_length) {
    return `${field_name} is required and must be a string with at least ${min_length} characters`;
  }
  return null;
};

const validate_email = (email) => {
  return validate_string(email, "email") || (!email.includes("@") ? "valid email is required" : null);
};

const validate_password = (password) => {
  return validate_string(password, "password", 8);
};

const validate_preferences = (preferences) => {
  if (!preferences) return null;
  if (typeof preferences !== "object" || Array.isArray(preferences)) {
    return "preferences must be an object";
  }
  const allowed_preferences = ["promotions", "order_updates", "recommendations"];
  const invalid_fields = Object.keys(preferences).filter(key => !allowed_preferences.includes(key));
  if (invalid_fields.length > 0) {
    return `invalid preference fields: ${invalid_fields.join(", ")}. only 'promotions', 'order_updates', and 'recommendations' are allowed.`;
  }
  for (const key of Object.keys(preferences)) {
    if (typeof preferences[key] !== "boolean") {
      return `preferences.${key} must be a boolean true/false`;
    }
  }
  return null;
};

exports.registeruser = async (req, res) => {
  try {
    const { name, email, password, preferences } = req.body;
    const errors = [
      validate_string(name, "name"),
      validate_email(email),
      validate_password(password),
      validate_preferences(preferences)
    ].filter(Boolean);

    if (errors.length) return res.status(400).json({ message: errors[0] });

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = new User({ name, email, password, preferences });
    await user.save();

    const response = user.toObject();
    delete response.password;
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const err = [validate_email(email), validate_password(password)].filter(Boolean);
    if (err.length) return res.status(400).json({ message: err[0] });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credential" });
    }

    const token = generateToken(user);
    res.json({ user: { name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

exports.deleteuser = async (req, res) => {
  try {
    const id = req.user.id;
    if (!id) return res.status(400).json({ message: "User ID  required" });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(err.name === "CastError" ? 400 : 500).json({ message: "Invalid user ID format" });
  }
};

exports.getuser = async (req, res) => {
  try {
    const id = req.user.id;
    if (!id) return res.status(400).json({ message: "User ID required" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const response = user.toObject();
    delete response.password;
    res.status(200).json({ data: response });
  } catch (err) {
    res.status(err.name === "CastError" ? 400 : 500).json({ message: "Invalid user ID format" });
  }
};

exports.updateuser = async (req, res) => {
  try {
    const id = req.user.id;
    const { name, email, preferences } = req.body;

    const errors = [
      name ? validate_string(name, "name") : null,
      email ? validate_email(email) : null,
      preferences ? validate_preferences(preferences) : null
    ].filter(Boolean);

    if (errors.length) return res.status(400).json({ message: errors[0] });

    if (email && (await User.findOne({ email, _id: { $ne: id } }))) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const user = await User.findByIdAndUpdate(id, { name, email, preferences }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userres = user.toObject();
    delete userres.password;
    res.status(200).json({ message: "User updated", data: userres });
  } catch (err) {
    res.status(err.name === "CastError" ? 400 : 500).json({ message: "Invalid user ID format" });
  }
};

exports.changepassword = async (req, res) => {
  try {
    const id = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) return res.status(400).json({ message: "Current password is needed" });
    const error = validatePassword(newPassword);
    if (error) return res.status(400).json({ message: error });

    const user = await User.findById(id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(err.name === "CastError" ? 400 : 500).json({ message: "Invalid user ID format" });
  }
};
