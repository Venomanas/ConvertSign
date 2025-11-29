
export interface User {
  name?: string;
  uid: string;
  email: string;
}
export interface UserFull extends User {
  password: string;
  createdAt: string;
}
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  filesUploaded: number;
}
export interface UserActivity {
  type: string;
  details: Record<string, unknown>;
  timestamp?: string;
}

// authUtils.ts or types.ts

export interface FileObject {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  base64?: string;
  dateAdded: string;
  processed: boolean;
  isSignature?: boolean;
  convertedFormat?: string;
  dateProcessed?: string;
  blob?: Blob; // ✅ for persistence in IndexedDB
}

/* note !!!
1. Simulated authentication functionality using localStorage for demo purposes whereas In a real application, this would use Firebase, Auth0, or another authentication service 
*/

// User authentication utilities

/**
 * create a new user account
 * @param email - user email
 * @param password - user password
 * @param displayName- optional display name
 */
export const createUser = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if email is already in use
      if (typeof window === "undefined") {
        throw new Error("This Function must be called in abrowser environment");
      }

      const existingUsers: UserFull[] = JSON.parse(
        localStorage.getItem("convertSignUsers") || "[]"
      );
      const emailExists = existingUsers.some(user => user.email === email);

      if (emailExists) {
        throw new Error("Email already in use");
      }

      // Generate a unique user ID
      const uid = `user_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Create new user
      const newUser: UserFull = {
        uid,
        password, // Note: In a real app, never store passwords in plain text
        email,
        createdAt: new Date().toISOString(),
      };

      // Add user to storage
      existingUsers.push(newUser);
      localStorage.setItem("convertSignUsers", JSON.stringify(existingUsers));

      // Create user profile
      const profile: UserProfile = {
        uid,
        displayName: displayName || email.split("@")[0],
        email,
        createdAt: new Date().toISOString(),
        filesUploaded: 0,
      };

      // Store profiles
      const profiles: UserProfile[] = JSON.parse(
        localStorage.getItem("convertSignProfiles") || "[]"
      );
      profiles.push(profile);
      localStorage.setItem("convertSignProfiles", JSON.stringify(profiles));

      // Set current user in session
      const sessionUser: User = { uid, email };
      localStorage.setItem(
        "convertSignCurrentUser",
        JSON.stringify(sessionUser)
      );

      // Simulate network delay
      setTimeout(() => resolve(sessionUser), 500);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Sign in existing User
 * @param email-user email
 * @param password- user password
 * @returns User Object
 */
export const signInUser = async (
  email: string,
  password: string
): Promise<User> => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === "undefined") {
        throw new Error("This function must be called in a browser");
      }
      const users: UserFull[] = JSON.parse(
        localStorage.getItem("convertSignUsers") || "[]"
      );
      const user = users.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Set current user in session
      const sessionUser: User = { uid: user.uid, email: user.email };
      localStorage.setItem(
        "convertSignCurrentUser",
        JSON.stringify(sessionUser)
      );

      // Simulate network delay
      setTimeout(() => resolve(sessionUser), 500);
    } catch (error) {
      reject(error);
    }
  });
};
/*
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  return new Promise(resolve => {
    // Remove current user from session
    localStorage.removeItem("convertSignCurrentUser");

    // Simulate network delay
    setTimeout(() => resolve(), 500);
  });
};
/**
 * get the current logged in user
 * @returns user object or null
 */
export const getCurrentUser = (): User | null => {
  try {
    if (typeof window === "undefined") return null;

    const userString = localStorage.getItem("convertSignCurrentUser");
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
};

// User profile utilities
/**
 *
 * @param uid
 * @returns
 */
export const getUserProfile = (uid: string): UserProfile | null => {
  try {
    if (typeof window === "undefined") return null;
    const profiles: UserProfile[] = JSON.parse(
      localStorage.getItem("convertSignProfiles") || "[]"
    );
    return profiles.find(profile => profile.uid === uid) || null;
  } catch {
    return null;
  }
};
/**
 *
 * @param uid
 * @param updates
 * @returns
 */
export const updateUserProfile = (
  uid: string,
  updates: Partial<UserProfile>
): UserProfile | null => {
  try {
    if (typeof window === "undefined") return null;
    const profiles: UserProfile[] = JSON.parse(
      localStorage.getItem("convertSignProfiles") || "[]"
    );
    const updatedProfiles = profiles.map(profile =>
      profile.uid === uid ? { ...profile, ...updates } : profile
    );
    localStorage.setItem(
      "convertSignProfiles",
      JSON.stringify(updatedProfiles)
    );
    return getUserProfile(uid);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

// File storage utilities per user
/**
 *
 * @param uid
 * @returns
 */
export const getUserFiles = (uid: string): FileObject[] => {
  try {
    if (typeof window === "undefined") return [];
    const userFilesKey = `convertSignFiles_${uid}`;
    return JSON.parse(localStorage.getItem(userFilesKey) || "[]");
  } catch {
    return [];
  }
};
/**
 *
 * @param uid
 * @param files
 */
export const updateUserFiles = (uid: string, files: FileObject[]): void => {
  try {
    const userFilesKey = `convertSignFiles_${uid}`;
    localStorage.setItem(userFilesKey, JSON.stringify(files));

    // Update user stats
    const profiles = JSON.parse(
      localStorage.getItem("convertSignProfiles") || "[]"
    );
    const updatedProfiles = profiles.map((profile: { uid: string }) => {
      if (profile.uid === uid) {
        return { ...profile, filesUploaded: files.length };
      }
      return profile;
    });
    localStorage.setItem(
      "convertSignProfiles",
      JSON.stringify(updatedProfiles)
    );
  } catch (error) {
    console.error("Error updating user files:", error);
  }
};

// Track file conversions and activities
/**
 *
 * @param uid
 * @param activity
 * @returns
 */
export const recordUserActivity = (
  uid: string,
  activity: UserActivity
): void => {
  try {
    if (typeof window === "undefined") return;
    const activities = JSON.parse(
      localStorage.getItem(`convertSignActivities_${uid}`) || "[]"
    );
    activities.push({
      ...activity,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(
      `convertSignActivities_${uid}`,
      JSON.stringify(activities)
    );
  } catch (error) {
    console.error("Error recording user activity:", error);
  }
};

/**
 *
 * @param uid
 * @returns
 */
export const getUserActivities = (uid: string): UserActivity[] => {
  try {
    if (typeof window === "undefined") return [];
    return JSON.parse(
      localStorage.getItem(`convertSignActivities_${uid}`) || "[]"
    );
  } catch {
    return [];
  }
};
