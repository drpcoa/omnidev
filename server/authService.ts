import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';
import bcrypt from 'bcrypt';
import { insertUserSchema } from '@shared/schema';

// Configure passport strategies
export function configurePassport(app: any): void {
  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local strategy (username/password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          // If user doesn't have a password (OAuth user trying to login with password)
          if (!user.password) {
            return done(null, false, { 
              message: 'This account was created with social login. Please use GitHub or Google to sign in.' 
            });
          }
          
          // Compare password
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          // Update last login time
          await storage.updateUser(user.id, { lastLogin: new Date() });
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // GitHub strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.REPLIT_DOMAINS ? 
                     `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/github/callback` : 
                     'http://localhost:5000/api/auth/github/callback',
          scope: ['user:email', 'repo'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await storage.getUserByGithubId(profile.id);
            
            if (user) {
              // Update user with latest GitHub data
              user = await storage.updateUser(user.id, {
                avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
                lastLogin: new Date(),
              });
            } else {
              // Get email from GitHub profile
              const email = profile.emails?.[0]?.value;
              
              if (!email) {
                return done(new Error('GitHub email not available'), null);
              }
              
              // Check if user with this email already exists
              const existingUser = await storage.getUserByEmail(email);
              
              if (existingUser) {
                // Link GitHub to existing account
                user = await storage.updateUser(existingUser.id, {
                  githubId: profile.id,
                  avatarUrl: profile.photos?.[0]?.value || existingUser.avatarUrl,
                  lastLogin: new Date(),
                });
              } else {
                // Create new user
                user = await storage.createUser({
                  username: profile.username || `gh_${profile.id}`,
                  email,
                  githubId: profile.id,
                  avatarUrl: profile.photos?.[0]?.value,
                });
              }
            }
            
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // Google strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.REPLIT_DOMAINS ? 
                     `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/google/callback` : 
                     'http://localhost:5000/api/auth/google/callback',
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (user) {
              // Update user with latest Google data
              user = await storage.updateUser(user.id, {
                avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
                lastLogin: new Date(),
              });
            } else {
              // Get email from Google profile
              const email = profile.emails?.[0]?.value;
              
              if (!email) {
                return done(new Error('Google email not available'), null);
              }
              
              // Check if user with this email already exists
              const existingUser = await storage.getUserByEmail(email);
              
              if (existingUser) {
                // Link Google to existing account
                user = await storage.updateUser(existingUser.id, {
                  googleId: profile.id,
                  avatarUrl: profile.photos?.[0]?.value || existingUser.avatarUrl,
                  lastLogin: new Date(),
                });
              } else {
                // Create new user
                user = await storage.createUser({
                  username: profile.displayName || `google_${profile.id}`,
                  email,
                  googleId: profile.id,
                  avatarUrl: profile.photos?.[0]?.value,
                });
              }
            }
            
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized, please login' });
}

// Admin middleware
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any).isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Forbidden, admin access required' });
}

// Register a new user
export async function registerUser(email: string, username: string, password: string) {
  try {
    // Validate data
    const userData = insertUserSchema.parse({
      email,
      username,
      password: await bcrypt.hash(password, 10)
    });
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const user = await storage.createUser(userData);
    return user;
  } catch (error) {
    throw error;
  }
}
