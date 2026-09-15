import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import axios from 'axios'
import { setCreatorCourseData } from '../redux/courseSlice'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const getCreatorCourseData = () => {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    const getCreatorData = async () => {
      // Only fetch creator courses if user is logged in AND has 'educator' role
      if (!userData || userData.role !== 'educator') {
        dispatch(setCreatorCourseData([]))
        return
      }

      try {
        const result = await axios.get(serverUrl + "/api/course/getcreatorcourses", { withCredentials: true })
        dispatch(setCreatorCourseData(result.data))
      } catch (error) {
        console.log("Error fetching creator courses:", error)
        // Do not display toast error if token is missing/expired or during logout
        if (error.response?.status !== 400 && error.response?.status !== 401) {
          toast.error(error.response?.data?.message || "Failed to get creator courses")
        }
      }
    }

    getCreatorData()
  }, [userData])
}

export default getCreatorCourseData
