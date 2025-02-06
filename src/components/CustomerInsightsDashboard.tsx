import React, { useState } from "react";

const CustomerInsightsDashboard: React.FC = () => {

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const correctPassword = "ikhebhierietstezoeken";

 
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === correctPassword) {
      setAuthenticated(true);
    } else {
      alert("Onjuist wachtwoord. Probeer het opnieuw!");
      setPassword("");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Beveiligde Sectie</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="password"
            placeholder="Voer wachtwoord in"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Versturen
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">
        👥 Klantinzichten Dashboard
      </h1>
      <p className="text-center text-gray-600">
        Hier komt een overzicht van klantgedrag en staaltjes.
      </p>
      {/* Plaats hier de rest van je dashboard-content */}
    </div>
  );
};

export default CustomerInsightsDashboard;
