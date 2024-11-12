import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        // Add other fields as needed
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const success = await createAccount(formData);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError('An error occurred during signup.');
        }
    };

    const createAccount = async (data) => {
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            return response.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return (
        <div className="signup">
            <h1>Create Your Account</h1>
            {/* Add your signup form fields here */}
        </div>
    );
}

export default Signup;