import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const Login: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Vul een e-mail en wachtwoord in!");
      return;
    }
    try {
      console.log("📩 Probeer in te loggen met:", email, password);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 🔥 Check of de gebruiker is geverifieerd
      if (!userCredential.user.emailVerified) {
        setError("Je e-mail is nog niet geverifieerd. Controleer je inbox!");
        console.warn("⚠️ Niet geverifieerd:", userCredential.user);
        return;
      }

      console.log("✅ Ingelogd:", userCredential.user);
      onLogin(userCredential.user);
    } catch (error: any) {
      console.error("❌ Fout bij inloggen:", error.message);
      setError(error.message);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!email || !password) {
      setError("Vul een e-mail en wachtwoord in!");
      return;
    }
    try {
      console.log("📝 Probeer te registreren met:", email, password);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Geregistreerd:", userCredential.user);

      // 🔥 Verificatie e-mail verzenden
      await sendEmailVerification(userCredential.user);
      console.log("📩 Verificatie e-mail verzonden!");
      setError("Verificatie e-mail verzonden. Controleer je inbox!");

      onLogin(userCredential.user);
    } catch (error: any) {
      console.error("❌ Fout bij registreren:", error.message);
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Ingelogd met Google:", result.user);
      onLogin(result.user);
    } catch (error: any) {
      console.error("❌ Google Login Fout:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      {/* Afbeelding bovenaan */}
      <img
        src="/logo_poespas.webp" // Vervang dit pad door de werkelijke URL of het import van je afbeelding
        alt="Login afbeelding"
        className="mb-4 w-32 h-12" // Pas de styling aan naar wens
      />
      <h2 className="text-2xl font-bold mb-4">Login / Registratie</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button onClick={handleEmailLogin} className="bg-pink-400 text-white p-2 rounded w-full mb-2">
        Inloggen met E-mail
      </button>
      <button onClick={handleRegister} className="bg-pink-300 text-white p-2 rounded w-full mb-2">
        Registreren
      </button>
      <button onClick={handleGoogleLogin} className="bg-pink-200 text-white p-2 rounded w-full">
        Inloggen met Google
      </button>
      {/* Toegevoegde tekst */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Build by Bakkie Pleur Automations
      </p>
    </div>
  );
};

export default Login;
