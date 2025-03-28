const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

export const handleLogin = async (loginEmail, loginPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginEmail, password: loginPassword }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      return data;
    } else {
      throw data;
    }
  } catch (error) {
    throw error;
  }
};

export const handleRegister = async (username, email, password, password2) => {
  if (password !== password2) {
    throw { message: 'Las contraseñas no coinciden' };
  }
  try {
    const response = await fetch(`${API_BASE_URL}/registration/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password1: password, password2: password2 }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const getUserData = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/`, {
      headers: { Authorization: `${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const handleLogout = async (token) => {
  try {
    if (token) {
      await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        headers: { Authorization: `${token}`, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (token, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (newPassword1, newPassword2, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/change/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ new_password1: newPassword1, new_password2: newPassword2 }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/reset/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const confirmResetPassword = async (uid, token, newPassword1, newPassword2) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/reset/confirm/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, new_password1: newPassword1, new_password2: newPassword2 }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const followUser = async (username, token) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/users/follow/${username}/`, {
      method: 'POST',
      headers: { Authorization: `${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const unfollowUser = async (username, token) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/users/follow/${username}/`, {
      method: 'DELETE',
      headers: { Authorization: `${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al dejar de seguir');
    }
    return response.status;
  } catch (error) {
    throw error;
  }
};

export const getFollowers = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/followers/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const getFollowing = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/following/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const getUserByUsername = async (username, token) => {
  try {
    const url = `http://127.0.0.1:8000/api/users/${username}/`;
    const headers = {};
    if (token) {
      headers['Authorization'] = `${token}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Usuario no encontrado');
    }
    const data = await response.json();
    return {
      username: data.username,
      about: data.about,
      image: data.image,
      follower_count: data.followers_count,
      following_count: data.following_count,
      is_following: data.is_following,
    };
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query, token = null) => {
  try {
    const url = `http://127.0.0.1:8000/api/users/search/?q=${encodeURIComponent(query)}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `${token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error en la búsqueda');
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};