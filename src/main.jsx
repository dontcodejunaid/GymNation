import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { migrateLegacyStorage } from './utils/storageMigration.js'

// Must run before App mounts — App reads the member pass during its first render.
migrateLegacyStorage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
