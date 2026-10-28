
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [name, setName] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    if (!name.trim()) return;

    login({
      id: "1",
      name: name.trim(),
    });

    navigate("/");
  }

  return (
    <section>
      <h1>Login to TweetApp</h1>

      <form onSubmit={handleLogin}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <button type="submit">Login</button>
      </form>
    </section>
  );
}
