import { BrowserRouter, Routes, Route } from "react-router-dom";
import DrawerComponent from "./components/DrawerComponent";
import ChatUserPage from "./pages/HomePage";
import GlobalProvider from "./providers/GlobalProvider";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <DrawerComponent>
          <Routes>
            <Route path="/" element={<ChatUserPage />} />
          </Routes>
        </DrawerComponent>
      </GlobalProvider>
    </BrowserRouter>
  );
};

export default App;
