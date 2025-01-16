import { useState } from 'react'
import {Routes, Route, BrowserRouter as Router} from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import './App.css'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
     <Routes>
      <Route path="/" element={< Landing />} />
      <Route path='/login' element={<Login />}/>
      <Route path='/signup' element={<Signup />}/>
      <Route path='/calendar' element={<Login />}/>
      <Route path='/settings' element={<Login />}/>
      <Route path='/stats' element={<Login />}/>
      <Route path='/entry' element={<Login />}/>
      <Route path='/home' element={<Login />}/>
     </Routes>
    </Router>
  )
}

export default App
