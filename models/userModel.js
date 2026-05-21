// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema - same as user service
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'STUDENT'],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Soft-delete middleware
UserSchema.pre(/^find/, function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted_at: null });
  }
});

UserSchema.index({ role: 1 });

const User = mongoose.model('User', UserSchema);

async function findUserByEmail(email) {
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user;
  } catch (err) {
    console.error('Error finding user:', err);
    return null;
  }
}

function findUserById(userId) {
    return users.find(user => user.user_id === userId);
}

module.exports = { findUserByEmail, findUserById, users };