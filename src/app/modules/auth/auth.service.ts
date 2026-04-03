import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../user/user.model';
import { RegisterInput, LoginInput } from '../user/user.validation';
import config from '../../config';

const SALT_ROUNDS = 12;
const googleClient = new OAuth2Client(config.google.client_id);

export const authService = {
  // Register a new user
  async register(input: Omit<RegisterInput, 'confirmPassword'>) {
    const { firstName, lastName, email, password } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { status: 409, message: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = authService.generateToken(user._id.toString());

    return {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  },

  // Login user
  async login(input: LoginInput) {
    const { email, password } = input;

    // Find user with password (since we have select: false on password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    // Generate token
    const token = authService.generateToken(user._id.toString());

    return {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  },

  // Get current user by ID
  async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  // Generate JWT token
  generateToken(userId: string) {
    return jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expires_in }
    );
  },

  // Verify token
  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      return decoded;
    } catch {
      throw { status: 401, message: 'Invalid or expired token' };
    }
  },

  // Google Login
  async googleLogin(credential: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.google.client_id,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw { status: 400, message: 'Invalid Google token' };
      }

      const { email, given_name, family_name, picture } = payload;

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user with a random password (they'll use Google to login)
        const randomPassword = await bcrypt.hash(
          Math.random().toString(36) + Date.now().toString(36),
          SALT_ROUNDS
        );

        user = await User.create({
          firstName: given_name || 'Google',
          lastName: family_name || 'User',
          email,
          password: randomPassword,
          avatar: picture || null,
        });
      } else if (picture && !user.avatar) {
        // Update avatar if user doesn't have one
        user.avatar = picture;
        await user.save();
      }

      const token = authService.generateToken(user._id.toString());

      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      };
    } catch (error: any) {
      if (error.status) throw error;
      throw { status: 401, message: 'Google authentication failed' };
    }
  },
};
