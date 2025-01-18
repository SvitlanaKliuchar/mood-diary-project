import React from 'react';
import NavBar from '../components/landing/NavBar.jsx';
import Header from '../components/home/Header.jsx';
import Entries from '../components/home/Entries.jsx';
import Footer from '../components/landing/Footer.jsx';

const Login = () => {
    return (<>
        <NavBar />
        <Header />
        <Entries />
        <Footer />
    </>);
};

export default Login;