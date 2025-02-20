import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useAuthInfo() {
  const { userId, getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken();
      setToken(fetchedToken);
    };
    fetchToken();
  }, [getToken]);

  return { userId, token };
}
