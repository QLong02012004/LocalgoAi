/**
 * Facebook SDK Service
 * Handles Facebook SDK initialization and login
 */

// Facebook API Response Types
interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
}

interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null;
  status: string;
}

interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

// Initialize Facebook SDK
export const initializeFacebookSDK = (appId: string) => {
  if (window.FB) {
    return; // Already initialized
  }

  // Load Facebook SDK asynchronously
  window.fbAsyncInit = function () {
    window.FB?.init({
      appId: appId,
      xfbml: true,
      version: "v18.0",
    });
  };

  // Load the SDK script
  const script = document.createElement("script");
  script.src = "https://connect.facebook.net/en_US/sdk.js";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
};

// Facebook Login
export const facebookLogin = (
  options: {
    scope?: string;
  } = {},
): Promise<{
  accessToken: string;
  userID: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("Facebook SDK is not initialized"));
      return;
    }

    window.FB.login(
      (response: FacebookLoginResponse) => {
        if (response.authResponse) {
          resolve({
            accessToken: response.authResponse.accessToken,
            userID: response.authResponse.userID,
          });
        } else {
          reject(new Error("User cancelled login or did not fully authorize"));
        }
      },
      {
        scope: options.scope || "public_profile,email",
      },
    );
  });
};

// Get Facebook User Info
export const getFacebookUserInfo = (
  accessToken?: string,
): Promise<FacebookUserInfo> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("Facebook SDK is not initialized"));
      return;
    }

    window.FB.api(
      "/me",
      { fields: "id,name,email,picture", access_token: accessToken },
      (response: FacebookUserInfo | { error: { message: string } }) => {
        if ("error" in response) {
          reject(response.error);
        } else {
          resolve(response);
        }
      },
    );
  });
};

// Facebook Logout
export const facebookLogout = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!window.FB) {
      resolve();
      return;
    }

    window.FB.logout(() => {
      resolve();
    });
  });
};

// Declare Facebook global types
declare global {
  interface Window {
    FB?: {
      init: (config: {
        appId: string;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: { scope: string },
      ) => void;
      api: (
        path: string,
        params: Record<string, string | undefined>,
        callback: (
          response: FacebookUserInfo | { error: { message: string } },
        ) => void,
      ) => void;
      logout: (callback: () => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default {
  initializeFacebookSDK,
  facebookLogin,
  getFacebookUserInfo,
  facebookLogout,
};
