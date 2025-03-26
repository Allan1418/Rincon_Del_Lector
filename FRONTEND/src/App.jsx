import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Components/Home/HomePage.jsx';
import AuthForm from './Components/AuthForm/AuthForm.jsx';
import ProfileSection from './Components/Profile/ProfileSection.jsx';
import Layout from './Components/Layout.jsx';
import ChangePasswordForm from './Components/Profile/ChangesProfile/ChangeProfileForm.jsx';
import ResetPassword from './Components/Profile/ResetPassword.jsx';

function App() {
  
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="" element={<HomePage />} />
          <Route path="/AuthForm" element={<AuthForm />} />
          <Route path="/user/:username" element={<ProfileSection />} />
          <Route path='/user/:username/changed' element={<ChangePasswordForm />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;