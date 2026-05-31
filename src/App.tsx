import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./router";
import useNotification from "./services/notifications";

const App = (): React.ReactElement => {
  useNotification();

  return <RouterProvider router={router} />;
};

export default App;
