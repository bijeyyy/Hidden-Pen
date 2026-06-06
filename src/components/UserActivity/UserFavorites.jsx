import { Link } from "react-router-dom";

function UserFavorites() {

    // Sample data (palitan ito ng data mula sa Supabase)
    const favoriteMessages = [];

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">

            {/* Header */}
            <div className="mt-6 mb-8">
                <h1 className="flex gap-2 text-3xl font-bold text-heading">
                    Loved Messages
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-9 text-primary">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </h1>

                <p className="mt-2 text-body">
                    Your favorite messages are kept here.
                </p>
            </div>

            {favoriteMessages.length === 0 ? (

                /* Empty State */
                <div className="bg-neutral-primary-soft border border-default rounded-base p-12 text-center shadow-xs">

                    <div className="flex justify-center items-center text-6xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-22">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-semibold text-heading">
                        No favorite messages yet
                    </h2>

                    <p className="mt-2 text-body">
                        Save messages you love and they'll appear here.
                    </p>

                    <Link to="/user_inbox">
                        <button className="mt-6 px-6 py-3 bg-button hover:bg-button-hover text-white rounded-base hover:opacity-90 transition cursor-pointer">
                            Go to Inbox
                        </button>
                    </Link>

                </div>

            ) : (

                /* Favorite Messages */
                <div className="space-y-4">

                    {favoriteMessages.map((message) => (

                        <div
                            key={message.id}
                            className="bg-white border border-default rounded-base p-5 shadow-xs hover:shadow-sm transition"
                        >

                            <div className="flex items-center justify-between mb-3">

                                <span className="font-medium text-heading">
                                    ❤️ Favorite Message
                                </span>

                                <span className="text-sm text-body">
                                    {message.date}
                                </span>

                            </div>

                            <p className="text-body">
                                {message.text}
                            </p>

                            <button className="mt-4 text-sm text-red-500 hover:underline">
                                Remove from Favorites
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default UserFavorites;