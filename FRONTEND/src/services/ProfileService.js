const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';
const API_USERS_URL = 'http://127.0.0.1:8000/api/users';
const API_LIBROS_URL = 'http://localhost:8000/api';
const API_BUSINESS_URL = 'http://localhost:8000/api/business';

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

export const getFollowing = async (username, token) => {
  try {
    const response = await fetch(`${API_USERS_URL}/following/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `${token}` })
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();

    return data.map(user => ({
      username: user.username,
      image_name: user.image_name,
    }));

  } catch (error) {
    throw error;
  }
};

export const getFollowers = async (username, token) => {
  try {
    const response = await fetch(`${API_USERS_URL}/followers/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `${token}` })
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();

    return data.map(user => ({
      username: user.username,
      image_name: user.image_name,
    }));

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
    const response = await fetch('http://localhost:8000/api/libros/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({
        title: bookData.title,
        synopsis: bookData.synopsis,
        index: bookData.index
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createBook:', error);
    throw error;
  }
};

export const getLibros = async (token = null, username = null, ordering = null, owned = null, page = null, purchased = null, search = null) => {
  try {
    let url = `${API_LIBROS_URL}/libros/`;
    const queryParams = new URLSearchParams();

    if (username) queryParams.append('owner', username);
    if (ordering) queryParams.append('ordering', ordering);
    if (owned !== null) queryParams.append('owned', owned);
    if (page) queryParams.append('page', page);
    if (purchased !== null) queryParams.append('purchased', purchased);
    if (search) queryParams.append('search', search);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `${token}`;
    }

    const response = await fetch(url, {
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error en getLibros:", errorData);
      return { results: [], error: errorData };
    }

    return response.json();
  } catch (error) {
    console.error("Error en getLibros:", error);
    return { results: [], error: { message: error.message || "Error desconocido" } };
  }
};

export const getLibroById = async (bookId, token) => {
  try {
    const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/`, {
      headers: {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error en servidor");
    }

    return await response.json();
  } catch (error) {
    console.error('Error en uploadBookEpub:', error);
    throw error;
  }
};

export const getEpubFile = async (bookId, token) => {
  try {
    const response = await fetch(`${API_LIBROS_URL}/libros/${bookId}/get_file/`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    
    if (!response.ok) throw new Error('Error en la descarga');
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    throw new Error("Error cargando EPUB: " + error.message);
  }
};

export const addToCart = async (bookId, token) => {
  try {
    const response = await fetch(`${API_BUSINESS_URL}/cart/agregar/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ book_id: bookId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getCarrito = async (token) => {
  try {
    const response = await fetch(`${API_BUSINESS_URL}/cart/`, {
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();

    const librosDetallados = await Promise.all(
      data.libros.map(async (libroId) => {
        const libro = await getLibroById(libroId, token);
        return libro;
      })
    );

    return { total: data.total, libros: librosDetallados };
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = async (token, libroId) => {
  try {
    const formData = new URLSearchParams();
    formData.append("book_id", libroId);

    const response = await fetch(`${API_BUSINESS_URL}/cart/quitar/`, {
      method: 'DELETE',
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      let errorMessage = "Error al eliminar el libro del carrito.";
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (jsonError) {
        if (response.status === 404) {
          errorMessage = "Libro no encontrado en el carrito";
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    return response.status;
  } catch (error) {
    console.error("Error en removeFromCart:", error);
    throw error;
  }
};

export const purchaseCart = async (token) => {
  try {
    const response = await fetch(`${API_BUSINESS_URL}/cart/comprar/`, {
      method: 'POST',
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/json',
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

export const getPurchaseHistory = async (token) => {
  if (!token) {
    console.error('Token is undefined. Cannot make request.');
    return null;
  }
  try {
    const response = await fetch(`${API_BUSINESS_URL}/purchase-history/`, {
      headers: {
        'Authorization': `${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return null;
  }
}

export const getOwnerEarnings = async (token) => {
  try {
    const response = await fetch(`${API_BUSINESS_URL}/owner-earnings/`, {
      headers: {
        'Authorization': `${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching owner earnings:', error);
    return null;
  }
};