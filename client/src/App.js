import React, { useEffect, useState } from "react";
import Axios from "axios";
import './App.css';

function App() {

  const [nameSignup, setNameSignup] = useState("");
  const [emailSignup, setEmailSignup] = useState("");
  const [passwordSignup, setPasswordSignup] = useState("");

  const [signupStatus, setSignupStatus] = useState("");



  Axios.defaults.withCredentials = true;

  //用Axios把前端輸入資料送給後端
  const signup = () => {
    Axios.post("http://localhost:5000/users", {
      name: nameSignup,
      email: emailSignup,
      password: passwordSignup,

    }).then((response) => {
        setSignupStatus(JSON.stringify(response.data));
        console.log(JSON.stringify(response.data));
      
    }).catch((error)=>{
      if (error.response){
        setSignupStatus(JSON.stringify(error.response.data.message));
        console.log(JSON.stringify(error.response.data.message));
      }
    });
  };


  return (
    <div className="App">
      <header className="App-header">
        
        <div className="form">
          <div className="form-group">
            <label className="form-label">name: </label>
            <input type="text" onChange={(e)=>{setNameSignup(e.target.value)}} className="form-control" name="name"></input>
          </div>
          <div className="form-group">
            <label className="form-label">email: </label>
            <input type="email" onChange={(e)=>{setEmailSignup(e.target.value)}} className="form-control" name="email"></input>
          </div>
          <div className="form-group">
            <label className="form-label">password: </label>
            <input type="password" onChange={(e)=>{setPasswordSignup(e.target.value)}} className="form-control" name="password"></input>
          </div>
        </div>

        <button onClick={signup} className="signupBtn">Signup</button>

        <p>{signupStatus}</p>

      </header>
    </div>
  );
}


export default App;
