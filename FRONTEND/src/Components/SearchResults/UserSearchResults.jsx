import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import styles from "./UserSearchResults.module.css";
import { searchUsers, getProfileImage } from "../../services/ProfileService";

const UserSearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("q") || "";
    const currentPage = parseInt(params.get("page")) || 1;
    const defaultProfileImage = "/images/Avatar.png";

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });

    const pageSize = 20;
    const totalPages = Math.ceil(pagination.count / pageSize);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const data = await searchUsers(searchQuery, currentPage);
                const usersWithImages = await Promise.all(
                    data.results.map(async (user) => {
                        let imageUrl = defaultProfileImage;

                        if (user.image_name) {
                            try {
                                imageUrl = await getProfileImage(user.image_name);
                            } catch (imageError) {
                                console.error("Error fetching image:", imageError);
                            }
                        }

                        return {
                            ...user,
                            imageUrl: imageUrl,
                        };
                    })
                );
                setUsers(usersWithImages);
                setPagination({ next: data.next, previous: data.previous, count: data.count });
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [searchQuery, currentPage, defaultProfileImage]);

    const changePage = (newPage) => {
        navigate(`/search/?q=${encodeURIComponent(searchQuery)}&page=${newPage}`);
    };

    const renderPagination = () => {
        let pages = [];
        const maxPageNumbers = 10;

        if (totalPages <= maxPageNumbers) {
            pages = [...Array(totalPages).keys()].map((i) => i + 1);
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, 5, "...", totalPages];
            } else if (currentPage >= totalPages - 2) {
                pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
            }
        }

        return (
            <div className={styles.pagination}>
                {currentPage > 1 && (
                    <button onClick={() => changePage(currentPage - 1)}>{"<"}</button>
                )}

                {pages.map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === "number" && changePage(page)}
                        className={page === currentPage ? styles.activePage : ""}
                        disabled={page === "..."}
                    >
                        {page}
                    </button>
                ))}

                {currentPage < totalPages && (
                    <button onClick={() => changePage(currentPage + 1)}>{">"}</button>
                )}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Resultados de Búsqueda</h1>
            {searchQuery && <p className={styles.subtitle}>Resultados para: <span>{searchQuery}</span></p>}

            {isLoading ? (
                <p>Cargando...</p>
            ) : users.length === 0 ? (
                <p>No se encontraron usuarios</p>
            ) : (
                <div className={styles.resultsGrid}>
                    {users.map((user) => (
                        <Link to={`/user/${user.username}`} key={user.username} className={styles.userCard}>
                            <img src={user.imageUrl} 
                                 alt={user.username} 
                                 className={styles.avatar} 
                            />
                            <h3>{user.username}</h3>
                        </Link>
                    ))}
                </div>
            )}

            {totalPages > 1 && renderPagination()}
        </div>
    );
};

export default UserSearchResults;