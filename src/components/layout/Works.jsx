function Works() {
    return (
        <section
            id="how-it-works"
            className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8"
        >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-pink-400 text-center">
                How It Works
            </h1>

            <p className="text-body mt-3 text-center text-sm sm:text-base md:text-xl max-w-2xl">
                Follow these simple steps to start receiving anonymous messages.
            </p>

            <div className="mt-8 grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-primary-soft text-center p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-4xl font-semibold tracking-tight text-pink-400 leading-8">
                        1
                    </h5>
                    <p className="text-pink-500 font-bold">
                        Create Your Link
                    </p>
                    <span className="block mt-2 text-sm md:text-base">
                        Sign up and generate your unique Hidden Pen link.
                    </span>
                </div>

                <div className="bg-neutral-primary-soft text-center p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-4xl font-semibold tracking-tight text-pink-400 leading-8">
                        2
                    </h5>
                    <p className="text-pink-500 font-bold">
                        Share Your Link
                    </p>
                    <span className="block mt-2 text-sm md:text-base">
                        Post your link on social media or anywhere online.
                    </span>
                </div>

                <div className="bg-neutral-primary-soft text-center p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-4xl font-semibold tracking-tight text-pink-400 leading-8">
                        3
                    </h5>
                    <p className="text-pink-500 font-bold">
                        Receive Messages
                    </p>
                    <span className="block mt-2 text-sm md:text-base">
                        People can send you anonymous messages safely.
                    </span>
                </div>

                <div className="bg-neutral-primary-soft text-center p-6 border border-default rounded-base shadow-xs">
                    <h5 className="mb-3 text-4xl font-semibold tracking-tight text-pink-400 leading-8">
                        4
                    </h5>
                    <p className="text-pink-500 font-bold">
                        Read
                    </p>
                    <span className="block mt-2 text-sm md:text-base">
                        View all messages and read them freely.
                    </span>
                </div>
            </div>
        </section>
    );
}

export default Works;