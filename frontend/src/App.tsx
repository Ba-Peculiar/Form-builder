import { Route, Routes } from 'react-router-dom'
import { FormBuilderPage } from './pages/FormBuilderPage'
import { FormsDashboardPage } from './pages/FormsDashboardPage'
import { PublicFormPage } from './pages/PublicFormPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">Dynamic Form Builder</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<FormsDashboardPage />} />
          <Route path="/forms/:formId" element={<FormBuilderPage />} />
          <Route path="/public/forms/:formId" element={<PublicFormPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
