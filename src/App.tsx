import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./router";

const App = (): React.ReactElement => {
  return <RouterProvider router={router} />;
};

export default App;
