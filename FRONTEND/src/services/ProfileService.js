// src/services/authService.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

export const handleLogin = async (loginEmail, loginPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: loginEmail,
                password: loginPassword
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw data;
        }

        localStorage.setItem('Authorization', `Token ${data.key}`);
        if (data.user) {
            localStorage.setItem('username', data.user.username);
        }

        return data;

    } catch (error) {
        console.error('Error en login:', error);
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
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password1: password, password2: password2 }),
      });
      
        const data = await response.json();

        if (!response.ok) {
            throw data;
        }

        return { success: true };
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw { message: 'Error en el servidor. Intenta nuevamente.' };
        }
        throw error;
    }
};

export const getUserData = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/`, {
      headers: { 
        Authorization: `${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
    }

    const userData = await response.json();
    return userData;
    
  } catch (error) {
    console.error('Error en getUserData:', error);
    throw error;
  }
};

export const handleLogout = async (token) => {
  try {
      if (token) {
          await fetch(`${API_BASE_URL}/logout/`, {
              method: 'POST',
              headers: { 
                  Authorization: `${token}`,
                  'Content-Type': 'application/json' 
              },
          });
      }
  } catch (error) {
      console.error('Error en handleLogout:', error);
      throw error;
  }
};

export const getUserByUsername = async (username) => {
    try {
        const response = await fetch(`http://127.0.0.0.1:8000/api/users/${username}/`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Usuario no encontrado');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const updateUserProfile = async (token, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `${token}`
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Respuesta PATCH:', data);

    if (!response.ok) {
      throw new Error(data.detail || JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    throw error;
  }
};

export const changePassword = async (newPassword1, newPassword2, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/change/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token 
      },
      body: JSON.stringify({ 
        new_password1: newPassword1, 
        new_password2: newPassword2 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    throw error;
  }
};