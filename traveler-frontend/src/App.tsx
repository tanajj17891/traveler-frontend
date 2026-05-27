import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup"; 
import Login from "./pages/Login";


function App() {
  return (
    <Routes>
    <Route path = "/Login" element = {<Login />} />
    <Route path = "/Signup" element = {<Signup />} />

    </Routes>
  )
}

export default App;