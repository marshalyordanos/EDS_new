const InfoSection = () => {
  return (
    <div
      className="hidden md:flex flex-col overflow-hidden px-10 py-10 relative flex-1"
      style={{
        background: "var(--gradient-primary)",
      }}
    >
      {/* Decorative background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Content wrapper with z-index */}
      <div className="relative z-10 flex flex-col h-full gap-6">
        {/* Main heading */}
        <div className="flex-shrink-0">
          <h1
            className="text-3xl font-bold text-white leading-tight mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Expert Database
            <br />
            <span className="text-white/90">Management System</span>
          </h1>
          <p
            className="text-white/80 text-xs leading-relaxed max-w-md"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Streamline your talent management, discover expert consultants, and
            unlock innovation across your organization.
          </p>
        </div>

        {/* Feature cards */}
        <div className="flex flex-col gap-2.5 flex-shrink-0">
          {[
            {
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              ),
              title: "Expert Directory",
              desc: "Access a comprehensive database of skilled consultants and specialists.",
            },
            {
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              ),
              title: "Smart Matching",
              desc: "Find the perfect expert for your project needs with intelligent search.",
            },
            {
              icon: (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              ),
              title: "Analytics & Insights",
              desc: "Track expertise distribution and make data-driven decisions.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <p
                  className="text-white font-bold text-sm mb-0.5"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {item.title}
                </p>
                <p
                  className="text-white/75 text-xs leading-snug"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        {/* <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4">
          <div className="text-center">
            <p
              className="text-xl font-bold text-white"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              500+
            </p>
            <p
              className="text-white/70 text-xs"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Expert Profiles
            </p>
          </div>

          <div className="text-center">
            <p
              className="text-xl font-bold text-white"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              50+
            </p>
            <p
              className="text-white/70 text-xs"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Organizations
            </p>
          </div>

          <div className="text-center">
            <p
              className="text-xl font-bold text-white"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              30+
            </p>
            <p
              className="text-white/70 text-xs"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Countries
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default InfoSection;
