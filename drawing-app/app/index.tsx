import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const loggedIn = true // 
      setIsLoggedIn(loggedIn);
    };

    checkLogin();
  }, []);

  if (isLoggedIn === null) {
    return null;
  }

  return isLoggedIn ? <Redirect href="/tabs" /> : <Redirect href="/login" />;
}
