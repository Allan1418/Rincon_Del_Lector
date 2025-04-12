import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Components/Home/HomePage.jsx';
import AuthForm from './Components/AuthForm/AuthForm.jsx';
import ProfileSection from './Components/Profile/ProfileSection.jsx';
import Layout from './Components/Layout.jsx';
import ChangePasswordForm from './Components/Profile/ChangesProfile/ChangeProfileForm.jsx';
import ResetPassword from './Components/Profile/Forgottenpassword/ResetPassword.jsx';
import UserSearchResults from './Components/SearchResults/SearchResults.jsx';
import EditBook from './Components/Library/ChangeBook/EditBook.jsx';
import BookDetails from './Components/Library/BookDetails.jsx';
import LibrosGrid from './Components/Home/ExplorarLibros/LibrosGrid.jsx';
import Cart from './Components/Cart/Cart.jsx';
import PurchaseHistory from './Components/Cart/Purchased/PurchaseHistory.jsx';
import OwnerEarnings from './Components/Cart/Owner/OwnerEarnings.jsx';
import CreateBookForm from './Components/Library/CreateBook/CreateBookForm.jsx';
import ReadEpub from './Components/readEpub/ReadEpub.jsx'
import Faq from './Components/Home/Faq.jsx'

function App() {
  
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="" element={<HomePage />} />
          <Route path="/authForm" element={<AuthForm />} />
          <Route path="/user/:username" element={<ProfileSection />} />
          <Route path='/user/:username/changed' element={<ChangePasswordForm />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/search" element={<UserSearchResults />} />
          <Route path="/edit/:bookId" element={<EditBook />} />
          <Route path="/user/:username/crearLibro" element={<CreateBookForm />} />
          <Route path="/libros/:bookId" element={<BookDetails />} />
          <Route path="/explorar" element={<LibrosGrid />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/historial" element={<PurchaseHistory />} />
          <Route path="/ganancias" element={<OwnerEarnings />} />
          <Route path="/lector/:bookId/ver" element={<ReadEpub />} />
          <Route path='/FAQ' element={<Faq />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;