import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./Components/Header/Header"
import Body from "./Components/Body/Body"
import Footer from "./Components/Footer/Footer"
import Chatbot from "./Components/Chatbot/Chatbot"
import Register from "./pages/Register/Register"
import Login from "./pages/Login/Login"
import Profile from "./pages/Profile/Profile";
import WorkerRegister from "./pages/WorkerRegister/WorkerRegister";
import WorkerDashboard from "./pages/WorkerDashboard/WorkerDashboard";
import BrowseJobs from "./pages/BrowseJobs/BrowseJobs";
import MyJobs from "./pages/MyJobs/MyJobs";
import BrowseWorkers from "./pages/BrowseWorkers/BrowseWorkers";

// Layout component for pages with Header/Footer
function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth pages without Header/Footer */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker/register" element={<WorkerRegister />} />
        
        {/* Pages with Header/Footer */}
        <Route path="/" element={
          <Layout>
            <Body />
          </Layout>
        } />

        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />

        <Route path="/worker/dashboard" element={
          <Layout>
            <WorkerDashboard />
          </Layout>
        } />

        <Route path="/worker/jobs" element={
          <Layout>
            <BrowseJobs />
          </Layout>
        } />

        <Route path="/jobs" element={
          <Layout>
            <MyJobs />
          </Layout>
        } />

        <Route path="/workers" element={
          <Layout>
            <BrowseWorkers />
          </Layout>
        } />
        
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  )
}

export default App
