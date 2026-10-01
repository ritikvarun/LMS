import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPassword from './pages/ForgotPassword'
import getCurrentUser from './customHooks/getCurrentUser'
import { useSelector } from 'react-redux'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import AllCouses from './pages/AllCouses'
import LiveClassRoom from './pages/LiveClassRoom'
import MockTestRoom from './pages/MockTestRoom'
import TestResultPage from './pages/TestResultPage'
import getCouseData from './customHooks/getCouseData'
import ViewCourse from './pages/ViewCourse'
import ScrollToTop from './components/ScrollToTop'
import EnrolledCourse from './pages/EnrolledCourse'
import ViewLecture from './pages/ViewLecture'
import FreeCourses from './pages/FreeCourses'
import FreeCourseDetail from './pages/FreeCourseDetail'

export const serverUrl = (
  (import.meta.env.VITE_SERVER_URL || "").replace(/^["']|["']$/g, "").trim() || 
  (import.meta.env.MODE === "development" ? "http://localhost:8000" : "https://lms-jcpg.onrender.com")
).replace(/\/+$/, "");

// Seamless redirect helper for any existing admin links to standalone admin panel
function RedirectToAdmin() {
  const adminUrl = (import.meta.env.VITE_ADMIN_URL || "http://localhost:5174").replace(/\/+$/, "");
  window.location.href = adminUrl;
  return null;
}

function App() {
  let { userData } = useSelector(state => state.user);

  getCurrentUser();
  getCouseData();

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
        <Route path='/profile' element={userData ? <Profile /> : <Navigate to={"/signup"} />} />
        <Route path='/freecourses' element={<FreeCourses />} />
        <Route path='/freecourse/:courseId' element={<FreeCourseDetail />} />
        <Route path='/allcourses' element={userData ? <AllCouses /> : <Navigate to={"/signup"} />} />
        <Route path='/viewcourse/:courseId' element={userData ? <ViewCourse /> : <Navigate to={"/signup"} />} />
        <Route path='/editprofile' element={userData ? <EditProfile /> : <Navigate to={"/signup"} />} />
        <Route path='/enrolledcourses' element={userData ? <EnrolledCourse /> : <Navigate to={"/signup"} />} />
        <Route path='/viewlecture/:courseId' element={userData ? <ViewLecture /> : <Navigate to={"/signup"} />} />
        <Route path='/live/:courseId/:liveClassId' element={userData ? <LiveClassRoom /> : <Navigate to={"/signup"} />} />
        <Route path='/test/:courseId/:testId' element={userData ? <MockTestRoom /> : <Navigate to={"/signup"} />} />
        <Route path='/test-result/:attemptId' element={userData ? <TestResultPage /> : <Navigate to={"/signup"} />} />
        <Route path='/forgotpassword' element={<ForgotPassword />} />
        
        {/* Forward admin & educator routes to standalone admin portal */}
        <Route path='/dashboard' element={<RedirectToAdmin />} />
        <Route path='/admin/*' element={<RedirectToAdmin />} />
      </Routes>
    </>
  );
}

export default App;
