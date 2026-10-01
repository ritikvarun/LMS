import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import getCurrentUser from './customHooks/getCurrentUser';
import getCreatorCourseData from './customHooks/getCreatorCourseData';
import ScrollToTop from './components/ScrollToTop';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import AddCourses from './pages/AddCourses';
import CreateCourse from './pages/CreateCourse';
import CreateLecture from './pages/CreateLecture';
import EditLecture from './pages/EditLecture';
import ManageLiveClasses from './pages/ManageLiveClasses';
import ManageMockTests from './pages/ManageMockTests';
import ManageCurriculum from './pages/ManageCurriculum';
import ManageFreeCurriculum from './pages/ManageFreeCurriculum';
import AdminFreeCourses from './pages/AdminFreeCourses';
import AdminPaidCourses from './pages/AdminPaidCourses';
import ManageBooks from './pages/ManageBooks';

export const serverUrl = (
  (import.meta.env.VITE_SERVER_URL || "").replace(/^["']|["']$/g, "").trim() || 
  (import.meta.env.MODE === "development" ? "http://localhost:8000" : "https://lms-jcpg.onrender.com")
).replace(/\/+$/, "");

// Route protection: requires logged in user and token
function ProtectedRoute({ children }) {
  const { userData } = useSelector((state) => state.user);
  const token = localStorage.getItem("admin_token");

  if (!userData && !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Redirects already authenticated user away from /login
function AuthRoute({ children }) {
  const { userData } = useSelector((state) => state.user);
  const token = localStorage.getItem("admin_token");

  if (userData && token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const { userData } = useSelector((state) => state.user);

  getCurrentUser();
  getCreatorCourseData();

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
        {/* Auth Route */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />

        {/* Dashboard / Home */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Courses Management */}
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/paid-courses" element={<ProtectedRoute><AdminPaidCourses /></ProtectedRoute>} />
        <Route path="/admin/paid-courses" element={<ProtectedRoute><AdminPaidCourses /></ProtectedRoute>} />
        <Route path="/free-courses" element={<ProtectedRoute><AdminFreeCourses /></ProtectedRoute>} />
        <Route path="/admin/free-courses" element={<ProtectedRoute><AdminFreeCourses /></ProtectedRoute>} />

        {/* Course Creation & Editing */}
        <Route path="/createcourses" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
        <Route path="/admin/createcourses" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
        <Route path="/addcourses/:courseId" element={<ProtectedRoute><AddCourses /></ProtectedRoute>} />
        <Route path="/admin/addcourses/:courseId" element={<ProtectedRoute><AddCourses /></ProtectedRoute>} />

        {/* Curriculum Management */}
        <Route path="/admin/curriculum/:courseId" element={<ProtectedRoute><ManageCurriculum /></ProtectedRoute>} />
        <Route path="/curriculum/:courseId" element={<ProtectedRoute><ManageCurriculum /></ProtectedRoute>} />
        <Route path="/admin/free-curriculum/:courseId" element={<ProtectedRoute><ManageFreeCurriculum /></ProtectedRoute>} />
        <Route path="/free-curriculum/:courseId" element={<ProtectedRoute><ManageFreeCurriculum /></ProtectedRoute>} />

        {/* Lectures */}
        <Route path="/createlecture/:courseId" element={<ProtectedRoute><CreateLecture /></ProtectedRoute>} />
        <Route path="/admin/createlecture/:courseId" element={<ProtectedRoute><CreateLecture /></ProtectedRoute>} />
        <Route path="/editlecture/:courseId/:lectureId" element={<ProtectedRoute><EditLecture /></ProtectedRoute>} />
        <Route path="/admin/editlecture/:courseId/:lectureId" element={<ProtectedRoute><EditLecture /></ProtectedRoute>} />

        {/* Live Classes & Mock Tests */}
        <Route path="/managelive/:courseId" element={<ProtectedRoute><ManageLiveClasses /></ProtectedRoute>} />
        <Route path="/admin/managelive/:courseId" element={<ProtectedRoute><ManageLiveClasses /></ProtectedRoute>} />
        <Route path="/managetests/:courseId" element={<ProtectedRoute><ManageMockTests /></ProtectedRoute>} />
        <Route path="/admin/managetests/:courseId" element={<ProtectedRoute><ManageMockTests /></ProtectedRoute>} />

        {/* Books */}
        <Route path="/books" element={<ProtectedRoute><ManageBooks /></ProtectedRoute>} />
        <Route path="/admin/books" element={<ProtectedRoute><ManageBooks /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
