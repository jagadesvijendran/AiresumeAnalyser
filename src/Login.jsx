import { useState } from "react";
import axios from "axios";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

const login = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/login", {
      username,
      password,
    });

    localStorage.setItem("token", res.data.token);
   localStorage.setItem("username", res.data.username);


    setUser(username);
  } catch (err) {
    alert("Invalid username or password");
  }
};

  return (
    <div>
   <i className="fa-solid fa-user" style={{color: "#f7f7f8"}}></i>
      <h2>Login </h2>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;
