import { BrowserRouter, Routes, Route } from "react-router-dom";
import DrawerComponent from "./components/DrawerComponent";
import ContactosPage from "./pages/ContactosPage";
import ChatUserPage from "./pages/ChatUserPage";
import GlobalProvider from "./providers/GlobalProvider";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <DrawerComponent>
          <Routes>
            <Route path="/" element={<ChatUserPage />} />
            <Route path="/contactos" element={<ContactosPage />} />
          </Routes>
        </DrawerComponent>
      </GlobalProvider>
    </BrowserRouter>
  );
};

export default App;
