import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;