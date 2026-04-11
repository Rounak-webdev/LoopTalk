const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`flex gap-3 ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
          {idx % 2 === 0 && (
            <div className="size-10 rounded-2xl bg-white/10" />
          )}

          <div className={`max-w-[70%] ${idx % 2 === 0 ? "" : "items-end"}`}>
            <div className={`mb-2 h-3 rounded-full bg-white/10 ${idx % 2 === 0 ? "w-24" : "ml-auto w-20"}`} />
            <div
              className={`rounded-[24px] ${
                idx % 2 === 0 ? "bg-white/8" : "bg-[var(--accent)]/25"
              } px-4 py-4`}
            >
              <div className="h-3 w-48 rounded-full bg-white/12" />
              <div className="mt-3 h-3 w-32 rounded-full bg-white/12" />
              {idx % 3 === 0 && (
                <div className="mt-4 h-32 w-full rounded-[18px] bg-white/12" />
              )}
            </div>
            <div className={`mt-2 h-3 rounded-full bg-white/10 ${idx % 2 === 0 ? "w-[72px]" : "ml-auto w-24"}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
