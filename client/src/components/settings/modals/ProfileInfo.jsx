import { useContext, useState } from 'react';
import styles from '../SettingsList.module.css';
import EditableField from './EditableField.jsx';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { profileUpdateSchema } from '../../../schemas/validationSchemas.js';
import axiosInstance from '../../../utils/axiosInstance.js';

const ProfileInfo = ({ onClose }) => {
    const { user, setUser } = useContext(AuthContext);

    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState(''); //for security reasons
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleFieldUpdate = async (field, newValue) => {
        try {
            await profileUpdateSchema.validateAt(field, { [field]: newValue });
            setErrors(prev => ({ ...prev, [field]: '' }));

            if (field === 'username') setUsername(newValue);
            if (field === 'email') setEmail(newValue);
            if (field === 'password') setPassword(newValue);

            //build the payload with only the updated field
            const payload = { [field]: newValue };
    
            const response = await axiosInstance.patch(`/profile/update/${user.id}`, payload);
            console.log('Profile updated:', response.data)

            // Optionally, update the AuthContext if the user profile changes
            if (field === 'username') setUsername(response.data.username);
            if (field === 'email') setEmail(response.data.email);
            if (field === 'password') setPassword(''); // Clear password after successful update

            //update the user context with new profile data
            setUser(response.data);

            return true;
        } catch (error) {
            setErrors(prev => ({ ...prev, [field]: error.message }));
            return false;
        }
    };

    return (<div className={styles['settings-list']}>
        <div className={styles['profile-container']}>
            <button onClick={onClose} className={styles['back-btn']} aria-label="Back">
                ←
            </button>


            <p id="profile-info-title" className={styles['main-text']}>
                Profile Information
            </p>

            <div className={styles['editable-fields']}>
                <EditableField
                    label="Username:"
                    value={username}
                    onSave={(value) => handleFieldUpdate('username', value)}
                    error={errors.username}
                />
                <EditableField
                    label="Email:"
                    value={email}
                    onSave={(value) => handleFieldUpdate('email', value)}
                    error={errors.email}
                />
                <EditableField
                    label="Password:"
                    value={password}
                    onSave={(value) => handleFieldUpdate('password', value)}
                    error={errors.password}
                />
            </div>
        </div>
    </div>
    );
};

export default ProfileInfo;
