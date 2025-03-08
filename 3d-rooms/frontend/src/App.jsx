import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HangoutRoom from "./Pages/HangoutRoom";
import LoginPage from "./Pages/Auth/Login";
import RegisterPage from "./Pages/Auth/Register";

// PrivateRoute component
const PrivateRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/group/:groupId"
          element={
            <PrivateRoute>
              <HangoutRoom />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
