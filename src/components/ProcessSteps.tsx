const STEPS = [
    { n: 1, title: 'Find Your Room',  desc: 'Browse premium listings',          icon: 'fa-search' },
    { n: 2, title: 'Book a Visit',    desc: 'Schedule in-person viewing',        icon: 'fa-calendar-check' },
    { n: 3, title: 'Send Enquiry',    desc: 'Share your requirements',           icon: 'fa-paper-plane' },
    { n: 4, title: 'Move In',         desc: 'Start your new living experience',  icon: 'fa-key' },
] as const;

export default function ProcessSteps() {
    return (
        <section className="py-10 px-4" aria-labelledby="how-it-works-title">
            <div className="max-w-[1200px] mx-auto">
                <h2 className="text-xl font-bold text-slate-900 text-center mb-7" id="how-it-works-title">
                    How Roomefy Works
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {STEPS.map(step => (
                        <div key={step.n} className="bg-white rounded-2xl p-5 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                            <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-3">
                                <i className={`fas ${step.icon} text-rose-600`} aria-hidden="true" />
                            </div>
                            <p className="text-[10px] font-black text-rose-600 tracking-widest uppercase mb-1">Step {step.n}</p>
                            <p className="text-sm font-bold text-slate-800 mb-1">{step.title}</p>
                            <p className="text-xs text-slate-400 leading-snug">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
