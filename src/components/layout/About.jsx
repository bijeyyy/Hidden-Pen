function About() {
    return (
        <section
            id="about"
            className="min-h-screen w-full overflow-x-hidden flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8"
        >
            <div className="bg-neutral-primary-soft w-full max-w-3xl p-6 sm:p-10 border border-default rounded-base shadow-xs">
                <h5 className="mb-4 text-3xl sm:text-4xl md:text-5xl text-center font-bold tracking-tight text-pink-400 font-heading leading-tight">
                    About Hidden Pen
                </h5>

                <p className="text-center text-body text-sm sm:text-base md:text-lg leading-relaxed">
                    Communicate freely with Hidden Pen. Get your own link, share it online,
                    and receive anonymous messages instantly. Your thoughts stay hidden,
                    your messages stay safe, and connecting has never been this easy.
                </p>
            </div>
        </section>
    );
}

export default About;