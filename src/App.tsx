import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GlobalProvider from "./providers/GlobalProvider";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </GlobalProvider>
    </BrowserRouter>
  );
};

export default App;
