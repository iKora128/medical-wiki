import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";

export function Login() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("'Login error:'", error);
      if (error.code === "'auth/configuration-not-found'") {
        setError("'Firebase configuration is incomplete. Please check your environment variables.'");
      } else {
        setError("'ログインに失敗しました。もう一度お試しください。'");
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Googleでログイン
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

