import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Components/Home/HomePage.jsx';
import AuthForm from './Components/AuthForm/AuthForm.jsx';
import ProfileSection from './Components/Profile/ProfileSection.jsx';
import Layout from './Components/Layout.jsx';
import ChangePasswordForm from './Components/Profile/ChangesProfile/ChangeProfileForm.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="" element={<HomePage />} />
          <Route path="/AuthForm" element={<AuthForm />} />
          <Route path="/:username" element={<ProfileSection />} />
          <Route path='/:username/changed' element={<ChangePasswordForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;