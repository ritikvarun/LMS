import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import { ToastContainer} from 'react-toastify';
import ForgotPassword from './pages/ForgotPassword'
import getCurrentUser from './customHooks/getCurrentUser'
import { useSelector } from 'react-redux'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Dashboard from './pages/admin/Dashboard'
import Courses from './pages/admin/Courses'
import AllCouses from './pages/AllCouses'
import AddCourses from './pages/admin/AddCourses'
import CreateCourse from './pages/admin/CreateCourse'
import CreateLecture from './pages/admin/CreateLecture'
import EditLecture from './pages/admin/EditLecture'
import ManageLiveClasses from './pages/admin/ManageLiveClasses'
import LiveClassRoom from './pages/LiveClassRoom'
import ManageMockTests from './pages/admin/ManageMockTests'
import MockTestRoom from './pages/MockTestRoom'
import TestResultPage from './pages/TestResultPage'

import getCouseData from './customHooks/getCouseData'
import ViewCourse from './pages/ViewCourse'
import ScrollToTop from './components/ScrollToTop'
import getCreatorCourseData from './customHooks/getCreatorCourseData'
import EnrolledCourse from './pages/EnrolledCourse'
import ViewLecture from './pages/ViewLecture'
import FreeCourses from './pages/FreeCourses'
import FreeCourseDetail from './pages/FreeCourseDetail'
import ManageCurriculum from './pages/admin/ManageCurriculum'
import ManageFreeCurriculum from './pages/admin/ManageFreeCurriculum'
import AdminFreeCourses from './pages/admin/AdminFreeCourses'
import AdminPaidCourses from './pages/admin/AdminPaidCourses'
import ManageBooks from './pages/admin/ManageBooks'

export const serverUrl = (
  import.meta.env.VITE_SERVER_URL || 
  (import.meta.env.MODE === "development" ? "http://localhost:8000" : "https://lms-jcpg.onrender.com")
).replace(/\/+$/, "");

function App() {
  
  let {userData} = useSelector(state=>state.user)

  getCurrentUser()
  getCouseData()
  getCreatorCourseData()
  return (
    <>
    
      <ToastContainer />
      <ScrollToTop/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
        <Route path='/profile' element={userData?<Profile/>:<Navigate to={"/signup"}/>}/>
        <Route path='/freecourses' element={<FreeCourses/>}/>
        <Route path='/freecourse/:courseId' element={<FreeCourseDetail/>}/>
        <Route path='/allcourses' element={userData?<AllCouses/>:<Navigate to={"/signup"}/>}/>
        <Route path='/viewcourse/:courseId' element={userData?<ViewCourse/>:<Navigate to={"/signup"}/>}/>
        <Route path='/editprofile' element={userData?<EditProfile/>:<Navigate to={"/signup"}/>}/>
        <Route path='/enrolledcourses' element={userData?<EnrolledCourse/>:<Navigate to={"/signup"}/>}/>
        <Route path='/viewlecture/:courseId' element={userData?<ViewLecture/>:<Navigate to={"/signup"}/>}/>
        <Route path='/admin/curriculum/:courseId' element={userData?.role === "educator"?<ManageCurriculum/>:<Navigate to={"/signup"}/>}/>
        <Route path='/admin/free-curriculum/:courseId' element={userData?.role === "educator"?<ManageFreeCurriculum/>:<Navigate to={"/signup"}/>}/>
        
        
        <Route path='/dashboard' element={userData?.role === "educator"?<Dashboard/>:<Navigate to={"/signup"}/>}/>
        <Route path='/admin/paid-courses' element={userData?.role === "educator"?<AdminPaidCourses/>:<Navigate to={"/signup"}/>}/>
        <Route path='/admin/free-courses' element={userData?.role === "educator"?<AdminFreeCourses/>:<Navigate to={"/signup"}/>}/>
        <Route path='/admin/books' element={userData?.role === "educator"?<ManageBooks/>:<Navigate to={"/signup"}/>}/>
        <Route path='/courses' element={userData?.role === "educator"?<Courses/>:<Navigate to={"/signup"}/>}/>
        <Route path='/addcourses/:courseId' element={userData?.role === "educator"?<AddCourses/>:<Navigate to={"/signup"}/>}/>
        <Route path='/createcourses' element={userData?.role === "educator"?<CreateCourse/>:<Navigate to={"/signup"}/>}/>
        <Route path='/createlecture/:courseId' element={userData?.role === "educator"?<CreateLecture/>:<Navigate to={"/signup"}/>}/>
        <Route path='/editlecture/:courseId/:lectureId' element={userData?.role === "educator"?<EditLecture/>:<Navigate to={"/signup"}/>}/>
        <Route path='/managelive/:courseId' element={userData?.role === "educator"?<ManageLiveClasses/>:<Navigate to={"/signup"}/>}/>
        <Route path='/managetests/:courseId' element={userData?.role === "educator"?<ManageMockTests/>:<Navigate to={"/signup"}/>}/>
        <Route path='/live/:courseId/:liveClassId' element={userData?<LiveClassRoom/>:<Navigate to={"/signup"}/>}/>
        <Route path='/test/:courseId/:testId' element={userData?<MockTestRoom/>:<Navigate to={"/signup"}/>}/>
        <Route path='/test-result/:attemptId' element={userData?<TestResultPage/>:<Navigate to={"/signup"}/>}/>
        <Route path='/forgotpassword' element={<ForgotPassword/>}/>
         </Routes>

         </>
   
  )
}

export default App
