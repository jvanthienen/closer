export default function Friends() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <h1 className="relative inline-block">
          Friends
          {/* Decorative underline */}
          <div
            className="absolute -bottom-1 left-0 h-[3px] w-16 rounded-full opacity-40"
            style={{
              background: 'linear-gradient(90deg, #C17B5C 0%, transparent 100%)',
            }}
          />
        </h1>
      </div>

      {/* Empty state */}
      <div
        className="relative group animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      >
        {/* Main card */}
        <div
          className="relative rounded-[28px] p-8 backdrop-blur-md border"
          style={{
            background: 'rgba(255, 252, 249, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 98, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          <p
            className="text-sm font-sans text-center opacity-60"
            style={{ color: '#8B624A' }}
          >
            Your friends will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
