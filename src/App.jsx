import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Calendar from "./pages/Calendar";
import Health from "./pages/Health";
import Deen from "./pages/Deen";
import Ideas from "./pages/Ideas";
import Performance from "./pages/Performance";
import Review from "./pages/Review";
import Parked from "./pages/Parked";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/health" element={<Health />} />
        <Route path="/deen" element={<Deen />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/review" element={<Review />} />
        <Route path="/parked" element={<Parked />} />
      </Route>
    </Routes>
  );
}
