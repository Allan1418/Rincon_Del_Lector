import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUploadCloud, FiCamera, FiBookOpen } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";
import {
    getLibroById, // Importa la nueva funcion
    updateLibro,
    uploadBookImage,
    getBookImageUrl,
    uploadBookEpub,
} from "../../../services/ProfileService";
import LoadingScreen from "../../Hooks/LoadingScreen";
import ErrorDisplay from "../../Hooks/ErrorDisplay";
import { AuthContext } from "../../Context/AuthContext";
import styles from "./EditBook.module.css";

const EditBook = () => {
    const { bookId } = useParams();
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [epubFile, setEpubFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const bookData = await getLibroById(bookId, token); 

                if (!bookData) throw new Error("Libro no encontrado");

                setBook({
                    ...bookData,
                    synopsis: bookData.synopsis || "",
                });

                if (bookData.image) {
                    setPreviewImageUrl(getBookImageUrl(bookId));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBook();
    }, [bookId, token]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setPreviewImageUrl(URL.createObjectURL(file));
        } else {
            setError("Por favor selecciona un archivo de imagen válido");
        }
    };

    const handleEpubChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.name.toLowerCase().endsWith('.epub')) {
            setError('El archivo debe tener extensión .epub');
            return;
          }
          setEpubFile(file);
        }
      };

    const handleDragOver = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (type === "image") {
            handleImageChange({ target: { files: [file] } });
        } else {
            handleEpubChange({ target: { files: [file] } });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
      
        try {
          await updateLibro(bookId, book, token); 
      
          const uploadPromises = [];
          if (epubFile) {
            uploadPromises.push(uploadBookEpub(bookId, epubFile, token));
          }
          if (imageFile) {
            uploadPromises.push(uploadBookImage(bookId, imageFile, token));
          }
      
          await Promise.all(uploadPromises);
      
          setSuccessMessage("¡Libro actualizado correctamente!");
          setTimeout(() => navigate(`/libros/${bookId}`), 1000);
        } catch (error) {
          setError(error.message || "Error al guardar cambios");
        } finally {
          setIsLoading(false);
        }
      };
    if (isLoading) return <LoadingScreen />;
    if (error) return <ErrorDisplay error={error} />;
    if (!book) return <div className={styles.error}>Libro no encontrado</div>;

    return (
        <div className={styles.editBookContainer}>
            <div className={styles.headerContainer}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Volver</span>
                </button>

                <h1 className={styles.title}>Editar Libro</h1>
            </div>

            {successMessage && (
                <div className={styles.successMessage}>
                    <div className={styles.checkmark}>✓</div>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={styles.metadataSection}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Título del Libro</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={book.title}
                                onChange={(e) => setBook({ ...book, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Sinopsis</label>
                            <textarea
                                className={styles.textarea}
                                value={book.synopsis}
                                onChange={(e) => setBook({ ...book, synopsis: e.target.value })}
                                rows="18"
                                placeholder="Escribe una descripción atractiva para tu libro..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Precio</label>
                            <div className={styles.priceInput}>
                                <span className={styles.currency}></span>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={book.price}
                                    onChange={(e) => setBook({ ...book, price: e.target.value })}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.filesSection}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Portada del Libro</label>
                            <div
                                className={styles.imageUpload}
                                onDragOver={(e) => handleDragOver(e, "image")}
                                onDrop={(e) => handleDrop(e, "image")}
                            >
                                <div className={styles.imagePreview}>
                                    <img
                                        src={previewImageUrl || getBookImageUrl(bookId)}
                                        alt="Preview"
                                        className={`${styles.bookImage} ${styles.verticalImage}`}
                                        onError={(e) => {
                                            e.target.src = "/placeholder-book-cover.jpg";
                                        }}
                                    />
                                    <label className={styles.editOverlay}>
                                        <FiCamera className={styles.uploadIcon} />
                                        <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                    </label>
                                </div>
                                <p className={styles.uploadHint}>Arrastra una imagen o haz clic para subir</p>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Archivo EPUB</label>
                            <div
                                className={styles.fileUpload}
                                onDragOver={(e) => handleDragOver(e, "epub")}
                                onDrop={(e) => handleDrop(e, "epub")}
                            >
                                <label htmlFor="epubInput" className={styles.fileLabel}>
                                    <FiUploadCloud className={styles.uploadIcon} />
                                    {epubFile ? (
                                        <div className={styles.selectedFile}>
                                            <FiBookOpen />
                                            <span>{epubFile.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={styles.uploadText}>Seleccionar archivo EPUB</span>
                                            <span className={styles.fileTypes}>Formatos soportados: .epub</span>
                                        </>
                                    )}
                                </label>
                                <input
                                    type="file"
                                    id="epubInput"
                                    accept=".epub"
                                    onChange={handleEpubChange}
                                    className={styles.fileInput}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <div className={styles.spinner} />
                            Guardando... {uploadProgress > 0 && `${uploadProgress}%`}
                        </>
                    ) : (
                        "Guardar Cambios"
                    )}
                </button>
            </form>
        </div>
    );
};

export default EditBook;