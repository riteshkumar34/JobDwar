import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { JobsPage } from './pages/JobsPage'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<JobsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
