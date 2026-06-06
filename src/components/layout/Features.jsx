function Features() {
    return (
        <section
            id="features"
            className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8"
        >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-pink-400 text-center">
                Features
            </h1>

            <div className="mt-8 grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-xl md:text-2xl text-center sm:text-start font-semibold tracking-tight text-pink-400 leading-8">
                        Anonymous Messages
                    </h5>
                    <p className="text-center sm:text-start text-sm md:text-base">
                        Receive messages without revealing identities.
                    </p>
                </div>

                <div className="bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-xl md:text-2xl text-center sm:text-start font-semibold tracking-tight text-pink-400 leading-8">
                        Your Own Link
                    </h5>
                    <p className="text-center sm:text-start text-sm md:text-base">
                        Get your own Hidden Pen link and share it anywhere.
                    </p>
                </div>

                <div className="bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-xl md:text-2xl text-center sm:text-start font-semibold tracking-tight text-pink-400 leading-8">
                        Private & Secure
                    </h5>
                    <p className="text-center sm:text-start text-sm md:text-base">
                        Only you can see the messages you receive.
                    </p>
                </div>

                <div className="bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-xl md:text-2xl text-center sm:text-start font-semibold tracking-tight text-pink-400 leading-8">
                        Easy To Use
                    </h5>
                    <p className="text-center sm:text-start text-sm md:text-base">
                        Create account, share link, receive messages.
                    </p>
                </div>

                <div className="bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-xl md:text-2xl text-center sm:text-start font-semibold tracking-tight text-pink-400 leading-8">
                        Modern Design
                    </h5>
                    <p className="text-center sm:text-start text-sm md:text-base">
                        Clean and smooth interface.
                    </p>
                </div>

                <div className="bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-xl md:text-2xl text-center sm:text-start font-semibold tracking-tight text-pink-400 leading-8">
                        Free To Use
                    </h5>
                    <p className="text-center sm:text-start text-sm md:text-base">
                        Use Hidden Pen anytime without paying.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Features;