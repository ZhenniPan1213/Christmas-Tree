import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // 👈 必须引入这个文件，Tailwind 才能生效

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)