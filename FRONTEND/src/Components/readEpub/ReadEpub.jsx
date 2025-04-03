import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Epub from "epubjs";
import { downloadBookEpub } from "../../services/ProfileService";
import { AuthContext } from "../Context/AuthContext";
import { useContext } from "react";

const ReadEpub = () => {
    const viewerRef = useRef(null);
    const { state } = useLocation();
    const { title } = state || {};
    const { bookId } = useParams();
    const [epubUrl, setEpubUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        let objectUrl;

        const loadEpubUrl = async () => {
            setLoading(true);
            setError(null);
            try {
                const blob = await downloadBookEpub(bookId, token);
                objectUrl = URL.createObjectURL(blob);
                setEpubUrl(objectUrl);
            } catch (err) {
                console.error("Error al obtener la URL del EPUB:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadEpubUrl();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [bookId, token]);

    useEffect(() => {
        let book;

        const renderBook = async () => {
            if (!epubUrl) return;

            try {
                book = Epub(epubUrl);
                await book.renderTo(viewerRef.current, {
                    width: "100%",
                    height: "100vh",
                    spread: "none",
                });

                const storedPosition = localStorage.getItem(`bookPosition-${bookId}`);
                if (storedPosition) {
                    book.goto(JSON.parse(storedPosition));
                }
            } catch (renderError) {
                console.error("Error al renderizar el libro:", renderError);
                setError(renderError);
            }
        };

        renderBook();

        return () => {
            if (book) {
                book.destroy();
            }
        };
    }, [epubUrl, bookId]);

    if (loading) {
        return <div>Cargando libro...</div>;
    }

    if (error) {
        return <div>Error al cargar el libro: {error.message}</div>;
    }

    return (
        <div className="lector-container">
            <h2 className="book-title">{title}</h2>
            <div ref={viewerRef} className="epub-viewer" />
        </div>
    );
};

export default ReadEpub;