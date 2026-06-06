import logo from '../../assets/hidden_pen.svg';

function Home() {
    return (
        <section
            id="home"
            className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-8"
        >
            <div className="bg-neutral-primary-soft flex justify-center border border-default rounded-xl shadow-xs p-4">
                <img
                    src={logo}
                    alt="logo"
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                />
            </div>

            <div className="mt-6 text-center max-w-3xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-pink-400 tracking-wide">
                    Welcome to Hidden Pen
                </h1>

                <p className="text-lg sm:text-2xl md:text-3xl p-3">
                    Speak freely. <i className="text-gray-600">Stay hidden.</i>
                </p>

                <p className="text-sm sm:text-base md:text-xl text-gray-500 leading-relaxed">
                    Hidden Pen lets you receive anonymous messages from anyone using your personal link.
                    Share your link, collect messages, and see what people really think
                    <i className="text-pink-500"> — no names, just honest words.</i>
                </p>
            </div>
        </section>
    );
}

export default Home;