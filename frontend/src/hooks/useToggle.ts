// Custom hook placeholder
import { useState } from "react";
export const useToggle = () => {
  const [state, setState] = useState(false);
  return [state, () => setState(!state)];
};
