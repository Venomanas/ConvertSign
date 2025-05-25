/* note !!!
1. Simulated authentication functionality using localStorage for demo purposes whereas In a real application, this would use Firebase, Auth0, or another authentication service 
*/


// User authentication utilities 
export const createUser = async (email, password, displayName) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if email is already in use
      const existingUsers = JSON.parse(
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
      const newUser = {
        uid,
        email,
        password, // Note: In a real app, never store passwords in plain text
        createdAt: new Date().toISOString(),
      };

      // Add user to storage
      existingUsers.push(newUser);
      localStorage.setItem("convertSignUsers", JSON.stringify(existingUsers));

      // Create user profile
      const profile = {
        uid,
        displayName: displayName || email.split("@")[0],
        email,
        createdAt: new Date().toISOString(),
        filesUploaded: 0,
      };

      // Store profiles
      const profiles = JSON.parse(
        localStorage.getItem("convertSignProfiles") || "[]"
      );
      profiles.push(profile);
      localStorage.setItem("convertSignProfiles", JSON.stringify(profiles));

      // Set current user in session
      const sessionUser = { uid, email };
      localStorage.setItem(
        "convertSignCurrentUser",
        JSON.stringify(sessionUser)
      );

      // Simulate network delay
      setTimeout(() => resolve(sessionUser), 500);
    } 
    catch (error) {
      reject(error);
    }
  });
};

export const signInUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    try {
      const users = JSON.parse(
        localStorage.getItem("convertSignUsers") || "[]"
      );
      const user = users.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Set current user in session
      const sessionUser = { uid: user.uid, email: user.email };
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

export const signOutUser = async () => {
  return new Promise(resolve => {
    // Remove current user from session
    localStorage.removeItem("convertSignCurrentUser");

    // Simulate network delay
    setTimeout(() => resolve(), 500);
  });
};

export const getCurrentUser = () => {
  try {
    const userString = localStorage.getItem("convertSignCurrentUser");
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
};

// User profile utilities
export const getUserProfile = uid => {
  try {
    const profiles = JSON.parse(
      localStorage.getItem("convertSignProfiles") || "[]"
    );
    return profiles.find(profile => profile.uid === uid) || null;
  } catch {
    return null;
  }
};

export const updateUserProfile = (uid, updates) => {
  try {
    const profiles = JSON.parse(
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
export const getUserFiles = uid => {
  try {
    const userFilesKey = `convertSignFiles_${uid}`;
    return JSON.parse(localStorage.getItem(userFilesKey) || "[]");
  } catch {
    return [];
  }
};

export const updateUserFiles = (uid, files) => {
  try {
    const userFilesKey = `convertSignFiles_${uid}`;
    localStorage.setItem(userFilesKey, JSON.stringify(files));

    // Update user stats
    const profiles = JSON.parse(
      localStorage.getItem("convertSignProfiles") || "[]"
    );
    const updatedProfiles = profiles.map(profile => {
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
export const recordUserActivity = (uid, activity) => {
  try {
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

export const getUserActivities = uid => {
  try {
    return JSON.parse(
      localStorage.getItem(`convertSignActivities_${uid}`) || "[]"
    );
  } catch {
    return [];
  }
};
