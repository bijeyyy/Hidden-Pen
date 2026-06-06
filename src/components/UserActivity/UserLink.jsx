import { react } from 'react';
import { Link } from "react-router-dom";

function UserLink() {
    return (
        <>
            <div className='py-8 px-12'>
                <Link to="/user_dashboard" className='hover:underline'>
                    <span>
                        ← Back to Dashboard
                    </span>
                </Link>
            </div>
        </>
    );
}

export default UserLink;