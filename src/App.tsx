import { BrowserRouter, Routes, Route } from "react-router-dom";
import DrawerComponent from "./components/DrawerComponent";
import ContactosPage from "./pages/ContactosPage";
import ChatUserPage from "./pages/ChatUserPage";
import GlobalProvider from "./providers/GlobalProvider";
import LoginPage from "./pages/LoginPage";
import CampanasPage from "./pages/CampanasPage";
import ContactoDiaClienetes from "./pages/ContactoDiaClienetes";
import CalificacionesVendedor from "./pages/reports/CalificacionesVendedor";
import { ToastContainer } from "react-toastify";
import CalendarioVendedores from "./pages/CalendarioVendedores";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <DrawerComponent>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/crm" element={<ChatUserPage />} />
            <Route path="/contactos" element={<ContactosPage />} />
            <Route path="/campañas" element={<CampanasPage />} />
            <Route path="/contactodia" element={<ContactoDiaClienetes />} />
            <Route path="/calendario" element={<CalendarioVendedores />} />

            <Route path="/reportes">
              <Route
                path="calificacionesvendedor"
                element={<CalificacionesVendedor />}
              />
            </Route>
          </Routes>
        </DrawerComponent>
        <ToastContainer />
      </GlobalProvider>
    </BrowserRouter>
  );
};

export default App;
