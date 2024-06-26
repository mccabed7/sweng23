import "./Registration.css";
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import RegistrationInput from "./RegistrationInput";
import { useNavigate } from 'react-router-dom';

import { setSessionID } from './sessionModule.jsx';
import { setEmail } from './sessionModule.jsx';


const Registration = () => {

    const [isSignUp, setIsSignUp] = useState(true);

    const handleToggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    
    return (
        <>
            <div className="overlay">
                <h1 className="welcome-text">
                    {isSignUp ? "Join us today!" : "Welcome!"}
                </h1>
                <p className="intro1">
                    {isSignUp ? "Create an account to begin your journey with us." : "Log in to your account to view your dashboard."}
                </p>
                <button className="ghost" onClick={handleToggleForm}>
                    {isSignUp ? "Log in" : "Create Account"}
                </button>
            </div>
            <div className="app">
                {isSignUp ? <RegisterForm /> : <LoginForm />}
            </div>
        </>
    );
};

const RegisterForm = () => {

    const [values, setValues] = useState({
        firstname: "",
        lastname: "",
        dateOfBirth: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const inputs = [
        {
            id: 1,
            name: "firstname",
            type: "text",
            placeholder: "First Name",
            label: "First Name",
            required: true
        },
        {
            id: 2,
            name: "lastname",
            type: "text",
            placeholder: "Last Name",
            label: "Last Name",
            required: true
        },
        {
            id: 3,
            name: "dateOfBirth",
            type: "date",
            placeholder: "Date of Birth",
            label: "Date of Birth",
            required: true
        },
        {
            id: 4,
            name: "email",
            type: "email",
            placeholder: "Email",
            errorMessage: "Invalid email address",
            label: "Email",
            required: true
        },
        {
            id: 5,
            name: "password",
            type: "password",
            placeholder: "Password",
            errorMessage: "Password must be at least 8 characters, and contain at least one uppercase letter and one special character",
            label: "Password",
            pattern: `^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$`,
            required: true
        },
        {
            id: 6,
            name: "confirmPassword",
            type: "password",
            placeholder: "Confirm Password",
            errorMessage: "Passwords do not match",
            label: "Confirm Password",
            pattern: values.password,
            required: true
        }
    ];

    const navigate = useNavigate();

    const isFormValid = () => {
        const hasFirstName = (values.firstname != null);
        const hasLastName = (values.lastname != null);
        const hasDateOfBirth = (values.dateOfBirth != null);
        const hasEmail = (values.email != null);
        const hasPassword = (values.password != null);
        const hasConfirmPassword = (values.confirmPassword != null);
        return hasFirstName && hasLastName && hasDateOfBirth && hasEmail && hasPassword && hasConfirmPassword;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormValid()) {
            // Method which submits to API and checks if valid
            const dataForBackend = {
                'firstName': values.firstname,
                'lastName': values.lastname,
                'dateOfBirth': values.dateOfBirth,
                'email': values.email,
                'password': values.password
            }

            setEmail(values.email);
            try {
                const response = await fetch('/api/login?emailAddress=' + values.email, {
                    method: 'POST',
                    mode: 'cors', 
                    headers: {
                        'Content-Type': 'application/json'
                        
                    },
                    body: JSON.stringify(dataForBackend)
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);	
                    }
                    return response.text();})
                .then(data => {
                    setSessionID(data);
                    console.log('Response data:', data)
                ;});
                
            } catch (error) {
                console.error('Error:', error);
            }
            
            navigate('/dashboard');

        } else {
            
            alert('Invalid form data. Please check your inputs.');
        }
    };

    const onChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value});
    }

    return (
        <div className="register-form">
            <form onSubmit={handleSubmit}>
                <h1>Create Account</h1>
                {inputs.map(input => (
                    <RegistrationInput
                        key={input.id}
                        {...input}
                        value={values[input.name]}
                        onChange={onChange}
                    />
                ))}
                <button>Register</button>
            </form>
        </div>
    );
};

const LoginForm = () => {

    const [values, setValues] = useState({
        firstname: "",
        lastname: "",
        dateOfBirth: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const inputs = [
        {
            id: 1,
            name: "firstname",
            type: "text",
            placeholder: "First Name",
            label: "First Name",
            required: true
        },
        {
            id: 2,
            name: "lastname",
            type: "text",
            placeholder: "Last Name",
            label: "Last Name",
            required: true
        },
        {
            id: 3,
            name: "dateOfBirth",
            type: "date",
            placeholder: "Date of Birth",
            label: "Date of Birth",
            required: true
        },
        {
            id: 4,
            name: "email",
            type: "email",
            placeholder: "Email",
            errorMessage: "Invalid email address",
            label: "Email",
            required: true
        },
        {
            id: 5,
            name: "password",
            type: "password",
            placeholder: "Password",
            errorMessage: "Password must be at least 8 characters, and contain at least one uppercase letter and one special character",
            label: "Password",
            //pattern: `^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$`,
            required: true
        },
        {
            id: 6,
            name: "confirmPassword",
            type: "password",
            placeholder: "Confirm Password",
            errorMessage: "Passwords do not match",
            label: "Confirm Password",
            pattern: values.password,
            required: true
        }
    ];

    const navigate = useNavigate();

    const isFormValid = () => {
        const hasPassword = (values.password != null);
        const hasEmail = (values.email != null);
        return hasPassword && hasEmail;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormValid()) {
            const dataForBackend = {
                'email': values.email,
                'password': values.password
            }
            try {
                
                setEmail(values.email);
                const response = await fetch('/api/login?emailAddress=' + values.email +'&password=' + values.password, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);	
                    }
                    return response.text();})
                .then(data => {
                    setSessionID(data);
                ;});

            } catch (error) {
                console.error('Error:', error);
            }
            
            navigate('/dashboard');

        } else {
            
            alert('Invalid form data. Please check your inputs.');
        }
    };
        

    const onChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value});
    }

    return (
        <div className="login-form">
            <form className="login" onSubmit={handleSubmit}>
            <h1>Sign In</h1>
            {inputs.filter(input => input.name === "email" || input.name === "password").map(input => (
                <RegistrationInput
                    key={input.id}
                    {...input}
                    value={values[input.name]}
                    onChange={onChange}
                />
            ))}
            <button>Sign In</button>
            </form>
        </div>
    );
};

export default Registration;