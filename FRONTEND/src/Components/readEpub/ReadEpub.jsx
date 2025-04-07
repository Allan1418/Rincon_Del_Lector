"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { getEpubFile } from "../../services/ProfileService"
import ePub from "epubjs"
import styles from "./ReadEpub.module.css"

const ReadEpub = () => {
  const { bookId } = useParams()
  const viewerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fontSize, setFontSize] = useState(100)
  const [theme, setTheme] = useState("white")
  const [showSettings, setShowSettings] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Book structure information
  const [chapters, setChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(null)
  const [showChapters, setShowChapters] = useState(false)

  const bookInstance = useRef(null)
  const renditionInstance = useRef(null)
  const isMounted = useRef(true)

  const [annotations, setAnnotations] = useState([])
  const [highlights, setHighlights] = useState([])
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [selectedCfi, setSelectedCfi] = useState("")
  const [showTextMenu, setShowTextMenu] = useState(false)
  const [textMenuPosition, setTextMenuPosition] = useState({ x: 0, y: 0 })
  const [currentNote, setCurrentNote] = useState("")
  const [editingAnnotation, setEditingAnnotation] = useState(null)

  // New state for notes
  const [notes, setNotes] = useState([])
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [showNotesPanel, setShowNotesPanel] = useState(false)

  const applySettings = () => {
    if (!renditionInstance.current) return
    renditionInstance.current.themes.fontSize(`${fontSize}%`)
    if (theme === "white") {
      renditionInstance.current.themes.override("color", "#000000")
      renditionInstance.current.themes.override("background", "#ffffff")
    } else if (theme === "sepia") {
      renditionInstance.current.themes.override("color", "#5b4636")
      renditionInstance.current.themes.override("background", "#f4ecd8")
    } else if (theme === "dark") {
      renditionInstance.current.themes.override("color", "#cccccc")
      renditionInstance.current.themes.override("background", "#222222")
    }
  }

  const handleZoomIn = () => {
    if (fontSize < 200) setFontSize((prev) => prev + 10)
  }

  const handleZoomOut = () => {
    if (fontSize > 70) setFontSize((prev) => prev - 10)
  }

  const handleNextPage = () => renditionInstance.current?.next()
  const handlePrevPage = () => renditionInstance.current?.prev()

  const changeTheme = (newTheme) => setTheme(newTheme)

  const handleTextSelection = (cfiRange) => {
    if (!renditionInstance.current) return

    const selection = renditionInstance.current.getSelection()
    if (!selection?.text) {
      setShowTextMenu(false)
      return
    }

    const cfi = cfiRange?.cfi
    const text = selection.text

    if (cfi && text) {
      setSelectedCfi(cfi)
      setSelectedText(text)

      const viewerRect = viewerRef.current.getBoundingClientRect()
      const position = {
        x: (selection.rect.right + selection.rect.left) / 2 + viewerRect.left,
        y: selection.rect.bottom + viewerRect.top + 10,
      }

      setTextMenuPosition(position)
      setShowTextMenu(true)
    } else {
      setShowTextMenu(false)
    }
  }

  const handleHighlight = () => {
    if (!selectedCfi) return

    const newHighlight = {
      id: Date.now().toString(),
      cfi: selectedCfi,
      text: selectedText,
      color: "yellow",
    }

    setHighlights((prev) => [...prev, newHighlight])
    renditionInstance.current.annotations.highlight(selectedCfi, {}, null, `hl-${newHighlight.id}`, {
      fill: "yellow",
      opacity: 0.3,
    })

    setShowTextMenu(false)
  }

  const handleAddNote = () => {
    setCurrentNote("")
    setEditingAnnotation({
      id: Date.now().toString(),
      cfi: selectedCfi,
      text: selectedText,
      note: "",
    })
    setShowTextMenu(false)
    setShowAnnotationPanel(true)
  }

  const saveAnnotation = () => {
    if (!editingAnnotation || !currentNote.trim()) return

    const newAnnotation = {
      ...editingAnnotation,
      note: currentNote.trim(),
      timestamp: new Date().toISOString(),
    }

    setAnnotations((prev) => {
      const updated = prev.filter((a) => a.id !== editingAnnotation.id)
      return [...updated, newAnnotation]
    })

    renditionInstance.current.annotations.highlight(
      newAnnotation.cfi,
      {},
      () => {
        setEditingAnnotation(newAnnotation)
        setCurrentNote(newAnnotation.note)
        setShowAnnotationPanel(true)
      },
      `note-${newAnnotation.id}`,
      { fill: "#a2d2ff", opacity: 0.3 },
    )

    setEditingAnnotation(null)
    setCurrentNote("")
    setShowAnnotationPanel(false)
  }

  const deleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
    renditionInstance.current.annotations.remove(`note-${id}`)
  }

  const deleteHighlight = (id) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id))
    renditionInstance.current.annotations.remove(`hl-${id}`)
  }

  // New function to add a general note (not tied to text selection)
  const addGeneralNote = () => {
    if (!newNote.trim()) return

    const newNoteObj = {
      id: Date.now().toString(),
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      location: currentPage,
      chapter: currentChapter?.label || "Unknown chapter",
    }

    setNotes((prev) => [...prev, newNoteObj])
    setNewNote("")
    setShowNoteInput(false)
  }

  // Function to navigate to a specific chapter
  const navigateToChapter = (chapter) => {
    if (!renditionInstance.current || !chapter.href) return

    renditionInstance.current.display(chapter.href)
    setShowChapters(false)
  }

  useEffect(() => {
    isMounted.current = true

    const initializeEpub = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("Authorization")
        if (!token) throw new Error("Sesión expirada")

        const epubUrl = await getEpubFile(bookId, token)
        if (!isMounted.current) return

        // Limpiar instancias anteriores
        if (bookInstance.current) await bookInstance.current.destroy()
        if (renditionInstance.current) await renditionInstance.current.destroy()

        // Crear nuevas instancias
        bookInstance.current = ePub(epubUrl, {
          openAs: "epub",
          requestCredentials: "include",
        })

        renditionInstance.current = bookInstance.current.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          manager: "default",
          spread: "none",
          flow: "paginated",
        })

        // Get book chapters/spine
        const spine = bookInstance.current.spine
        const toc = await bookInstance.current.loaded.navigation

        if (toc && toc.toc) {
          setChapters(
            toc.toc.map((item) => ({
              id: item.id,
              label: item.label,
              href: item.href,
            })),
          )
        }

        // Configurar eventos
        renditionInstance.current.on("selected", handleTextSelection)
        renditionInstance.current.on("relocated", (location) => {
          if (isMounted.current) {
            setCurrentPage(location.start.displayed.page)
            setTotalPages(location.total)

            // Update current chapter
            const currentHref = location.start.href
            const chapter =
              toc?.toc.find((item) => item.href === currentHref) ||
              toc?.toc.find((item) => currentHref.includes(item.href))

            if (chapter) {
              setCurrentChapter({
                id: chapter.id,
                label: chapter.label,
                href: chapter.href,
              })
            }
          }
        })

        await renditionInstance.current.display()
        applySettings()

        // Cargar anotaciones guardadas
        const storedAnnotations = JSON.parse(localStorage.getItem(`annotations-${bookId}`)) || []
        const storedHighlights = JSON.parse(localStorage.getItem(`highlights-${bookId}`)) || []
        const storedNotes = JSON.parse(localStorage.getItem(`notes-${bookId}`)) || []

        storedHighlights.forEach((h) => {
          renditionInstance.current.annotations.highlight(h.cfi, {}, null, `hl-${h.id}`, {
            fill: h.color,
            opacity: 0.3,
          })
        })

        storedAnnotations.forEach((a) => {
          renditionInstance.current.annotations.highlight(
            a.cfi,
            {},
            () => {
              setEditingAnnotation(a)
              setCurrentNote(a.note)
              setShowAnnotationPanel(true)
            },
            `note-${a.id}`,
            { fill: "#a2d2ff", opacity: 0.3 },
          )
        })

        setAnnotations(storedAnnotations)
        setHighlights(storedHighlights)
        setNotes(storedNotes)
        setLoading(false)
      } catch (err) {
        if (isMounted.current) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    initializeEpub()

    return () => {
      isMounted.current = false
      bookInstance.current?.destroy()
      renditionInstance.current?.destroy()
    }
  }, [bookId])

  useEffect(() => {
    localStorage.setItem(`annotations-${bookId}`, JSON.stringify(annotations))
    localStorage.setItem(`highlights-${bookId}`, JSON.stringify(highlights))
    localStorage.setItem(`notes-${bookId}`, JSON.stringify(notes))
  }, [annotations, highlights, notes, bookId])

  useEffect(() => applySettings(), [fontSize, theme])

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <svg
            className={styles.errorIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 className={styles.errorTitle}>Error al cargar el libro</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className={styles.mainContainer}>
      <div className={`${styles.container} ${styles[theme]}`}>
        {/* Loading overlay */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Cargando libro...</p>
            </div>
          </div>
        )}

        {/* Lector principal */}
        <div className={styles.readerContainer}>
          {/* Barra superior */}
          <div className={styles.headerBar}>
            <button className={styles.backButton} onClick={() => window.history.back()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Volver</span>
            </button>

            {/* Controles */}
            <div className={styles.toolbarControls}>
              <button onClick={handleZoomOut} disabled={fontSize <= 70}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
              <span className={styles.fontSizeDisplay}>{fontSize}%</span>
              <button onClick={handleZoomIn} disabled={fontSize >= 200}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
              <button onClick={() => setShowSettings(!showSettings)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <button
                onClick={() => setShowAnnotationPanel(true)}
                className={annotations.length > 0 ? styles.hasNotes : ""}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                {annotations.length > 0 && <span className={styles.notesCount}>{annotations.length}</span>}
              </button>
              {/* New button for general notes */}
              <button onClick={() => setShowNotesPanel(true)} className={notes.length > 0 ? styles.hasNotes : ""}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                {notes.length > 0 && <span className={styles.notesCount}>{notes.length}</span>}
              </button>
              {/* Chapter navigation button */}
              <button onClick={() => setShowChapters(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Visor EPUB */}
          <div ref={viewerRef} className={styles.viewer} />

          {/* Navegación */}
          <div className={styles.navigationControls}>
            <button onClick={handlePrevPage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className={styles.pageInfo}>
              {currentPage > 0 ? (
                <span>
                  Página {currentPage} de {totalPages} | {currentChapter?.label || ""}
                </span>
              ) : (
                <span>Cargando...</span>
              )}
            </div>
            <button onClick={handleNextPage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Menú de texto seleccionado */}
        {showTextMenu && (
          <div
            className={styles.textSelectionMenu}
            style={{
              left: `${textMenuPosition.x}px`,
              top: `${textMenuPosition.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <button onClick={handleHighlight}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Subrayar
            </button>
            <button onClick={handleAddNote}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Agregar nota
            </button>
          </div>
        )}

        {/* Panel de anotaciones */}
        {showAnnotationPanel && (
          <div className={styles.annotationOverlay} onClick={() => setShowAnnotationPanel(false)}>
            <div className={styles.annotationPanel} onClick={(e) => e.stopPropagation()}>
              <div className={styles.panelHeader}>
                <h3>{editingAnnotation ? "Editar nota" : "Mis anotaciones"}</h3>
                <button
                  onClick={() => {
                    setShowAnnotationPanel(false)
                    setEditingAnnotation(null)
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {editingAnnotation ? (
                <div className={styles.annotationEditor}>
                  <div className={styles.selectedTextPreview}>"{editingAnnotation.text}"</div>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Escribe tu nota aquí..."
                  />
                  <div className={styles.editorActions}>
                    <button onClick={() => setEditingAnnotation(null)}>Cancelar</button>
                    <button onClick={saveAnnotation}>Guardar</button>
                  </div>
                </div>
              ) : (
                <div className={styles.annotationList}>
                  {annotations.length === 0 && highlights.length === 0 ? (
                    <div className={styles.emptyState}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                      <p>No hay anotaciones todavía</p>
                    </div>
                  ) : (
                    <>
                      {annotations.map((annotation) => (
                        <div key={annotation.id} className={styles.annotationItem}>
                          <div className={styles.annotationText}>"{annotation.text}"</div>
                          <div className={styles.annotationNote}>{annotation.note}</div>
                          <div className={styles.itemActions}>
                            <button
                              onClick={() => {
                                setEditingAnnotation(annotation)
                                setCurrentNote(annotation.note)
                              }}
                            >
                              Editar
                            </button>
                            <button onClick={() => deleteAnnotation(annotation.id)}>Eliminar</button>
                          </div>
                        </div>
                      ))}
                      {highlights.map((highlight) => (
                        <div key={highlight.id} className={styles.highlightItem}>
                          <div className={styles.highlightText}>"{highlight.text}"</div>
                          <button onClick={() => deleteHighlight(highlight.id)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel de notas generales */}
        {showNotesPanel && (
          <div className={styles.annotationOverlay} onClick={() => setShowNotesPanel(false)}>
            <div className={styles.annotationPanel} onClick={(e) => e.stopPropagation()}>
              <div className={styles.panelHeader}>
                <h3>Mis notas</h3>
                <button onClick={() => setShowNotesPanel(false)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className={styles.annotationList}>
                {notes.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <p>No hay notas todavía</p>
                    <button className={styles.addNoteButton} onClick={() => setShowNoteInput(true)}>
                      Agregar nota
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.notesHeader}>
                      <h4>Notas ({notes.length})</h4>
                      <button className={styles.addNoteButton} onClick={() => setShowNoteInput(true)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nueva nota
                      </button>
                    </div>

                    {notes.map((note) => (
                      <div key={note.id} className={styles.noteItem}>
                        <div className={styles.noteText}>{note.text}</div>
                        <div className={styles.noteMetadata}>
                          <span>Página {note.location}</span>
                          <span>{note.chapter}</span>
                          <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.itemActions}>
                          <button
                            onClick={() => {
                              setNewNote(note.text)
                              setShowNoteInput(true)
                              // Set up for editing instead of creating new
                              setEditingAnnotation({ ...note, isGeneralNote: true })
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setNotes((prev) => prev.filter((n) => n.id !== note.id))
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {showNoteInput && (
                  <div className={styles.noteInputContainer}>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Escribe tu nota aquí..."
                      className={styles.noteInput}
                    />
                    <div className={styles.noteInputActions}>
                      <button
                        onClick={() => {
                          setShowNoteInput(false)
                          setNewNote("")
                          setEditingAnnotation(null)
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (editingAnnotation?.isGeneralNote) {
                            // Update existing note
                            setNotes((prev) =>
                              prev.map((note) =>
                                note.id === editingAnnotation.id
                                  ? { ...note, text: newNote, timestamp: new Date().toISOString() }
                                  : note,
                              ),
                            )
                            setEditingAnnotation(null)
                          } else {
                            // Add new note
                            addGeneralNote()
                          }
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panel de capítulos */}
        {showChapters && (
          <div className={styles.annotationOverlay} onClick={() => setShowChapters(false)}>
            <div className={styles.annotationPanel} onClick={(e) => e.stopPropagation()}>
              <div className={styles.panelHeader}>
                <h3>Capítulos</h3>
                <button onClick={() => setShowChapters(false)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className={styles.chapterList}>
                {chapters.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <p>No se encontraron capítulos</p>
                  </div>
                ) : (
                  <div className={styles.chaptersContainer}>
                    <div className={styles.chapterInfo}>
                      <p>Total de capítulos: {chapters.length}</p>
                      <p>Capítulo actual: {currentChapter?.label || "Desconocido"}</p>
                    </div>

                    {chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className={`${styles.chapterItem} ${currentChapter?.id === chapter.id ? styles.activeChapter : ""}`}
                        onClick={() => navigateToChapter(chapter)}
                      >
                        <span>{chapter.label}</span>
                        {currentChapter?.id === chapter.id && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={styles.currentIcon}
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Configuraciones */}
        {showSettings && (
          <div className={styles.settingsOverlay} onClick={() => setShowSettings(false)}>
            <div className={styles.settingsPanel} onClick={(e) => e.stopPropagation()}>
              <div className={styles.panelHeader}>
                <h3>Configuración de lectura</h3>
                <button onClick={() => setShowSettings(false)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className={styles.settingsContent}>
                <div className={styles.settingGroup}>
                  <label>Tamaño de texto</label>
                  <div className={styles.fontSizeControl}>
                    <button onClick={handleZoomOut} disabled={fontSize <= 70}>
                      A-
                    </button>
                    <div className={styles.fontSizeValue}>{fontSize}%</div>
                    <button onClick={handleZoomIn} disabled={fontSize >= 200}>
                      A+
                    </button>
                  </div>
                  <button className={styles.resetButton} onClick={() => setFontSize(100)}>
                    Restablecer tamaño
                  </button>
                </div>
                <div className={styles.settingGroup}>
                  <label>Tema de lectura</label>
                  <div className={styles.themeButtons}>
                    <button
                      className={`${styles.themeButton} ${theme === "white" ? styles.activeTheme : ""}`}
                      onClick={() => changeTheme("white")}
                    >
                      <div className={styles.themePreview}></div>
                      <span>Claro</span>
                    </button>
                    <button
                      className={`${styles.themeButton} ${theme === "sepia" ? styles.activeTheme : ""}`}
                      onClick={() => changeTheme("sepia")}
                    >
                      <div className={styles.themePreview}></div>
                      <span>Sepia</span>
                    </button>
                    <button
                      className={`${styles.themeButton} ${theme === "dark" ? styles.activeTheme : ""}`}
                      onClick={() => changeTheme("dark")}
                    >
                      <div className={styles.themePreview}></div>
                      <span>Oscuro</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default ReadEpub

