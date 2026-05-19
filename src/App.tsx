import { HashRouter, Routes, Route } from 'react-router-dom'
import { InventoryPage } from '@/pages/InventoryPage'
import { AddBeanPage } from '@/pages/AddBeanPage'
import { BeanDetailPage } from '@/pages/BeanDetailPage'
import { EditBeanPage } from '@/pages/EditBeanPage'
import { BrewPage } from '@/pages/BrewPage'
import { AddBrewPage } from '@/pages/AddBrewPage'
import { BrewDetailPage } from '@/pages/BrewDetailPage'
import { EditBrewPage } from '@/pages/EditBrewPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route path="/add" element={<AddBeanPage />} />
        <Route path="/bean/:id" element={<BeanDetailPage />} />
        <Route path="/bean/:id/edit" element={<EditBeanPage />} />
        <Route path="/brew" element={<BrewPage />} />
        <Route path="/brew/add" element={<AddBrewPage />} />
        <Route path="/brew/:id/edit" element={<EditBrewPage />} />
        <Route path="/brew/:id" element={<BrewDetailPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
