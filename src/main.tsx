import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Accueil from './pages/enfant/Accueil';
import Appareil from './pages/enfant/Appareil';
import ChoixJeu from './pages/enfant/ChoixJeu';
import Partie from './pages/enfant/Partie';
import ParentLayout from './pages/parent/ParentLayout';
import Programme from './pages/parent/Programme';
import Chapitre from './pages/parent/Chapitre';
import Suivi from './pages/parent/Suivi';
import Enfants from './pages/parent/Enfants';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/appareil/:token" element={<Appareil />} />
        <Route path="/jouer/:scope" element={<ChoixJeu />} />
        <Route path="/jouer/:scope/:game" element={<Partie />} />
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<Programme />} />
          <Route path="chapitre/:id" element={<Chapitre />} />
          <Route path="suivi" element={<Suivi />} />
          <Route path="enfants" element={<Enfants />} />
        </Route>
        <Route path="*" element={<Accueil />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
