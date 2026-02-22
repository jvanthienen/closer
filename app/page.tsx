export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with decorative element */}
      <div className="relative">
        <h1 className="relative inline-block">
          Best this week
          {/* Decorative underline */}
          <div
            className="absolute -bottom-1 left-0 h-[3px] w-20 rounded-full opacity-40"
            style={{
              background: 'linear-gradient(90deg, #C17B5C 0%, transparent 100%)',
            }}
          />
        </h1>
      </div>

      {/* Empty state card with organic design */}
      <div
        className="relative group animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      >
        {/* Warm glow behind card */}
        <div
          className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(232, 146, 100, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />

        {/* Main card */}
        <div
          className="relative rounded-[28px] p-8 backdrop-blur-md border transition-all duration-500 hover:scale-[1.02]"
          style={{
            background: 'rgba(255, 252, 249, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 98, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          {/* Decorative corner element */}
          <div
            className="absolute top-6 right-6 w-12 h-12 rounded-full opacity-20 animate-float"
            style={{
              background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
            }}
          />

          {/* Content */}
          <div className="relative space-y-6">
            {/* Icon */}
            <div className="inline-flex">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(232, 146, 100, 0.15) 0%, rgba(193, 123, 92, 0.1) 100%)',
                }}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="#8B624A"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-3">
              <p
                className="text-lg leading-relaxed font-serif"
                style={{ color: '#5C4A3E' }}
              >
                Add someone you miss.
                <br />
                We'll find the gentle overlap.
              </p>

              <p
                className="text-sm font-sans opacity-60"
                style={{ color: '#8B624A' }}
              >
                No calls scheduled yet
              </p>
            </div>

            {/* CTA */}
            <button
              className="group/btn relative px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
                color: '#FFFCF9',
                boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              <span className="relative z-10">Add your first friend</span>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming section placeholder */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <h2
          className="text-lg mb-4 font-serif opacity-70"
          style={{ color: '#5C4A3E' }}
        >
          Upcoming
        </h2>

        <div
          className="rounded-[24px] p-6 backdrop-blur-md border"
          style={{
            background: 'rgba(255, 252, 249, 0.45)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          <p
            className="text-sm font-sans text-center opacity-50"
            style={{ color: '#8B624A' }}
          >
            No birthdays in the next 30 days
          </p>
        </div>
      </div>
    </div>
  );
}
