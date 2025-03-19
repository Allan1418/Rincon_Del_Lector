import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Home/HomePage.jsx';
import AuthForm from './Components/AuthForm/AuthForm.jsx';
import ProfileSection from './Components/Profile/ProfileSection.jsx';
import Layout from './Components/Layout.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="" element={<HomePage />} />
          <Route path="/AuthForm" element={<AuthForm />} />
          <Route path="/User/name" element={<ProfileSection />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;