"use client"

import React from "react"
import styles from "./Faq.module.css"
import { ChevronDown, HelpCircle, ShoppingCart, Heart, BookOpen, Star, User } from "lucide-react"
import cn from "classnames"

const AyudaFaq = () => {
  const [openSections, setOpenSections] = React.useState({
    compra: false,
    favoritos: false,
    publicacion: false,
    resenas: false,
    cuenta: false,
  })

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const answerId = React.useId()

    return (
      <div className={styles.pregunta}>
        <button
          className={styles.questionButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={answerId}
        >
          <h3>{question}</h3>
          <ChevronDown className={cn(styles.chevron, isOpen && styles.rotate)} />
        </button>
        <div id={answerId} className={cn(styles.respuestaContainer, isOpen && styles.open)}>
          <p className={styles.respuesta}>{answer}</p>
        </div>
      </div>
    )
  }

  const FaqSection = ({ title, icon, section, children }) => {
    const isOpen = openSections[section]
    const sectionId = React.useId()

    return (
      <section className={cn(styles.seccion, isOpen && styles.active)}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection(section)}
          aria-expanded={isOpen}
          aria-controls={sectionId}
        >
          <div className={styles.sectionTitle}>
            {icon}
            <h2 className={styles.subtitulo}>{title}</h2>
          </div>
          <ChevronDown className={cn(styles.sectionChevron, isOpen && styles.rotate)} />
        </button>
        <div id={sectionId} className={cn(styles.sectionContent, isOpen && styles.open)}>
          {children}
        </div>
      </section>
    )
  }

  return (
    <div className={styles.ayudaContainer}>
      <div className={styles.headerContainer}>
        <HelpCircle className={styles.headerIcon} />
        <h1 className={styles.titulo}>Ayuda y Preguntas Frecuentes</h1>
      </div>

      <div className={styles.faqContainer}>
        <FaqSection
          title="Compra de Libros Electrónicos"
          icon={<ShoppingCart className={styles.sectionIcon} />}
          section="compra"
        >
          <FaqItem
            question="¿Cómo puedo comprar un libro electrónico?"
            answer="Navega por nuestra selección de libros, haz clic en el libro que te interese y luego en el botón 'Comprar'. Sigue las instrucciones para completar el pago."
          />
          <FaqItem
            question="¿Puedo leer los libros en diferentes dispositivos?"
            answer="Sí, una vez que compras un libro electrónico, generalmente puedes leerlo en múltiples dispositivos (móviles, tablets, ordenadores) utilizando nuestra aplicación o plataforma web."
          />
          <FaqItem
            question="¿Qué sucede si tengo problemas con mi compra?"
            answer="Por favor, contacta a nuestro equipo de soporte a través de la sección de 'Contacto' o envíanos un correo electrónico a soporte@rincondellector.com."
          />
        </FaqSection>

        <FaqSection
          title="Publicación de Libros"
          icon={<BookOpen className={styles.sectionIcon} />}
          section="publicacion"
        >
          <FaqItem
            question="¿Cómo puedo publicar mi libro en la plataforma?"
            answer="Dirígete a la sección de 'Publicación' en tu perfil de usuario. Allí encontrarás las instrucciones y el formulario para subir tu obra."
          />
          <FaqItem
            question="¿Qué formatos de archivo aceptan para la publicación?"
            answer="Actualmente aceptamos archivos en formato EPUB  para la publicación de libros electrónicos."
          />
          <FaqItem
            question="¿Puedo establecer un precio para mi libro?"
            answer="Sí, como autor independiente, tendrás la opción de establecer el precio de venta de tu libro. También podrás ofrecerlo de forma gratuita si lo deseas."
          />
        </FaqSection>

        <FaqSection title="Cuenta y Perfil" icon={<User className={styles.sectionIcon} />} section="cuenta">
          <FaqItem
            question="¿Cómo puedo crear una cuenta?"
            answer="En la página principal, haz clic en 'Registrarse' y sigue los pasos para crear tu cuenta. Necesitarás proporcionar una dirección de correo electrónico válida y crear una contraseña."
          />
          <FaqItem
            question="¿Cómo puedo editar mi perfil?"
            answer="Una vez que hayas iniciado sesión, ve a la sección de 'Perfil' donde podrás editar tu información personal."
          />
        </FaqSection>
      </div>

      <div className={styles.contactoContainer}>
        <p className={styles.contacto}>
          Si tienes alguna otra pregunta o necesitas más ayuda, no dudes en contactarnos a través de nuestra página de{" Rincon del Lector "}
        </p>
      </div>
    </div>
  )
}

export default AyudaFaq
