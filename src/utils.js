// Format timestamp to human readable date
export const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp * 1000);
    return date.toUTCString();
  } catch (error) {
    return timestamp;
  }
};

// Decode JWT token
export const decodeJWT = (jwtToken) => {
  if (!jwtToken) return null;

  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format - JWT should have 3 parts separated by dots' };
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    return {
      header,
      payload,
      signature: parts[2],
      valid: true
    };
  } catch (error) {
    return { error: 'Invalid JWT format - Unable to decode' };
  }
};

// Check if a claim is a timestamp claim
export const isTimestampClaim = (key) => {
  return ['iat', 'exp', 'nbf'].includes(key);
}; 