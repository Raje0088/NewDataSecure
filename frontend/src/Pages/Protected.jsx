import React from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context-api/AuthContext'
import { Link, Navigate } from 'react-router-dom'

const Protected = ({children}) => {
    const {userLoginId} = useContext(AuthContext)
    if(!userLoginId){
        return <Navigate to="/login" />
    }
  return children
  
}

export default Protected
