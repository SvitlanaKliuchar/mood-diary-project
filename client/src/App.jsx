import { useState } from 'react'
import {Routes, Route, BrowserRouter as Router} from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import './App.css'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
     <Routes>
      <Route path="/" element={< Landing />} />
     </Routes>
    </Router>
  )
}

export default App
