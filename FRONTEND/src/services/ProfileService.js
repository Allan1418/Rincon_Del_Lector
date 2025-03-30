const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';
const API_USERS_URL = 'http://127.0.0.1:8000/api/users';
const API_LIBROS_URL = 'http://localhost:8000/api';

export const handleLogin = async (loginEmail, loginPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginEmail, password: loginPassword }),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw data;
    }
  } catch (error) {
    throw error;
  }
};

export const handleRegister = async (username, email, password, password2) => {
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
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `${token}`
      },
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

export const getFollowing = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/following/`, {
      headers: { Authorization: `${token}` },
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
    const response = await fetch(`${API_USERS_URL}/follow/${username}/`, {
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
    const response = await fetch(`${API_USERS_URL}/follow/${username}/`, {
      method: 'DELETE',
      headers: { Authorization: `${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    return response.status;
  } catch (error) {
    throw error;
  }
};

export const getFollowers = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/followers/`, {
      headers: { Authorization: `${token}` },
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
    const url = `${API_USERS_URL}/${username}/`;
    const headers = token ? { Authorization: `${token}` } : {};

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw await response.json();
    }

    const data = await response.json();

    return {
      username: data.username,
      about: data.about,
      image_name: data.image_name || null,
      follower_count: data.followers_count,
      following_count: data.following_count,
      is_following: data.is_following,
    };
  } catch (error) {
    console.error("❌ Error en getUserByUsername:", error);
    throw error;
  }
};

export const searchUsers = async (query, page = 1, token = null) => {
  try {
    const url = `${API_USERS_URL}/search/?q=${encodeURIComponent(query)}&page=${page}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `${token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Error al obtener usuarios");

    return response.json();
  } catch (error) {
    console.error("Error en la búsqueda de usuarios:", error);
    return { results: [], next: null, previous: null, count: 0 };
  }
};

export const getProfileImage = (imageName) => {
  return `${API_USERS_URL}/image/${imageName}`;
};

export const uploadProfileImage = async (imageFile, token) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_USERS_URL}/image/`, {
      method: 'POST',
      headers: {
        'Authorization': `${token}`,
      },
      body: formData,
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

export const createBook = async (bookData, token) => {
  try {
    const response = await fetch(`${API_LIBROS_URL}/libros/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify(bookData),
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

export const getLibros = async (token, username = null, ordering = null, owned = null, page = null, purchased = null, search = null) => {
  try {
      let url = `${API_LIBROS_URL}/libros/`;
      const queryParams = new URLSearchParams();

      if (username) queryParams.append('username', username);
      if (ordering) queryParams.append('ordering', ordering);
      if (owned !== null) queryParams.append('owned', owned);
      if (page) queryParams.append('page', page);
      if (purchased !== null) queryParams.append('purchased', purchased);
      if (search) queryParams.append('search', search);

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url, {
          headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `${token}` }),
          },
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

export const getLibroById = async (bookId, token) => {
  try {
    const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
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

export const updateLibro = async (bookId, bookData, token) => {
  try {
    const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify(bookData),
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

export const uploadBookImage = async (bookId, imageFile, token) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/upload_image/`, {
      method: 'POST',
      headers: {
        Authorization: `${token}`,
      },
      body: formData,
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

export const getBookImageUrl = (bookId) => {
  return `${API_LIBROS_URL}/libros/${bookId}/get_image/`;
};

export const deleteLibro = async (bookId, token) => {
  try {
    const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    return response.status;
  } catch (error) {
    throw error;
  }
};

export const uploadBookEpub = async (bookId, epubFile, token) => {
  try {
    const formData = new FormData();
    formData.append('file', epubFile);

    const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/upload_file/`, {
      method: 'POST',
      headers: {
        Authorization: `${token}`,
      },
      body: formData,
    });

  } catch (error) {
    console.error('Error en uploadBookEpub:', error);
    throw new Error(error.message || 'Error al subir EPUB');
  }
};

export const downloadBookEpub = async (bookId, token) => {
  const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/get_file/`, {
    method: 'GET',
    headers: {
      'Authorization': `${token}`,
      'Accept': 'application/epub+zip, application/json'
    }
  });
  
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('epub')) {
    throw new Error('El archivo no es un EPUB válido');
  }

  return response;
};