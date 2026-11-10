import CohortBuilder from "./containers/CohortBuilder";
import { Route, Routes } from "react-router";
import Landing from "./containers/Landing";

export default function App() {
  return (
    <Routes>
      <Route index element={<Landing />} />
      <Route path="build" element={<CohortBuilder />} />
    </Routes>
  );
}
