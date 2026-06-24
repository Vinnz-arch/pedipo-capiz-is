import { RouterProvider } from "react-router-dom";
import { Routes } from "./routes/Routes";
import { Toaster } from "sonner";

const App = () => {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <RouterProvider router={Routes} />
    </>
  );
};

export default App;
