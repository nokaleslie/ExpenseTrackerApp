class AuthService {
  // Sign up new user
  static async signUp(email, password, fullName) {
    try {
      const result = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name: fullName,
        },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Sign in user
  static async signIn(email, password) {
    try {
      const user = await Auth.signIn(email, password);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Sign out user
  static async signOut() {
    try {
      await Auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Get current authenticated user
  static async getCurrentUser() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Confirm sign up with verification code
  static async confirmSignUp(email, code) {
    try {
      await Auth.confirmSignUp(email, code);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Resend confirmation code
  static async resendConfirmationCode(email) {
    try {
      await Auth.resendSignUp(email);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Forgot password
  static async forgotPassword(email) {
    try {
      await Auth.forgotPassword(email);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Confirm forgot password with code
  static async forgotPasswordSubmit(email, code, newPassword) {
    try {
      await Auth.forgotPasswordSubmit(email, code, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Change password for authenticated user
  static async changePassword(oldPassword, newPassword) {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Get user attributes
  static async getUserAttributes() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const attributes = await Auth.userAttributes(user);
      return { success: true, data: attributes };
    } catch (error) {
      return { success: false, error };
    }
  }
}

export default AuthService;