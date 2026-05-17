import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { InventoryPage } from '@/pages/InventoryPage'
import { AddBeanPage } from '@/pages/AddBeanPage'
import { BeanDetailPage } from '@/pages/BeanDetailPage'
import { EditBeanPage } from '@/pages/EditBeanPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route path="/add" element={<AddBeanPage />} />
        <Route path="/bean/:id" element={<BeanDetailPage />} />
        <Route path="/bean/:id/edit" element={<EditBeanPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App