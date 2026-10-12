import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Legacy route — orders now return to cart with a success popup. */
export default function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/cart", { replace: true });
  }, [navigate]);

  return null;
}
