import React from 'react';
import Navbar from '../components/Navbar';
import PageTransition from '../PageTransition';

function Investments() {
    return (
        <PageTransition>
            <div className="Investments">
                <Navbar isLoggedIn={true} />
                <div className="content">
                    <h1>Investments</h1>
                    {/* Your investments page content */}
                </div>
            </div>
        </PageTransition>
    );
}

export default Investments;