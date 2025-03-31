import { useContext, useState } from 'react';
import styles from '../SettingsList.module.css'
import EditableField from './EditableField.jsx';
import { AuthContext } from '../../../contexts/AuthContext.jsx'
import { profileUpdateSchema } from '../../../schemas/validationSchemas.js';

const ProfileInfo = () => {
    //can use auth context to get user info
    const { user } = useContext(AuthContext)

    const [username, setUsername] = useState(user.username)
    const [email, setEmail] = useState(user.email)
    const [password, setPassword] = useState(user.password)
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: ''
    })

    //generic field validation and update handler
    const handleFieldUpdate = async (field, newValue) => {
        console.log(`New ${field}:`, newValue)
        try {
            await profileUpdateSchema.validateAt(field, { [field]: newValue })
            setErrors(prev => ({ ...prev, [field]: '' }))

            //update the corresponding state based on field name
            if (field === 'username') setUsername(newValue)
            if (field === 'email') setEmail(newValue)
            if (field === 'password') setPassword(newValue)

            //here we send it to backend
            // const response = await...

            return true

        } catch (error) {
            setErrors(prev => ({ ...prev, [field]: error.message }))
            return false
        }
    }

    return (
        <div className={styles['profile-container']}>
            <p className={styles['main-text']}>Profile Information</p>
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
            <button className={styles['close-btn']} aria-label='Close Modal Button'>&times;</button>
        </div>
    );
};

export default ProfileInfo;