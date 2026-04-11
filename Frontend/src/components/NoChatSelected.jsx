import { ArrowRight, ImagePlus, MessageSquareText, PanelLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const NoChatSelected = ({ onOpenSidebar }) => {
  return (
    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <div className="mesh-orb left-20 top-20 size-40 bg-[var(--accent)]" />
      <div className="mesh-orb bottom-20 right-12 size-48 bg-[var(--accent-strong)]" />

      <MotionDiv
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl text-center"
      >
        <div className="mx-auto flex size-20 items-center justify-center rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <MessageSquareText className="size-9 text-[var(--accent)]" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Figma concept</p>
        <h2 className="section-title mt-3 text-4xl font-bold sm:text-5xl">
          Calm, premium chat that still feels alive.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--text-soft)] sm:text-lg">
          The new LoopTalk home centers focus: strong hierarchy, spacious message lanes, richer avatars,
          warm motion, and a layout that works equally well on desktop and mobile.
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {[
            {
              icon: PanelLeft,
              title: "Structured sidebar",
              text: "Search, online filter, recent-ready contact cards, and smooth mobile access.",
            },
            {
              icon: ImagePlus,
              title: "Visual composer",
              text: "Emoji tray, drag-and-drop uploads, image preview, and polished send affordance.",
            },
            {
              icon: Sparkles,
              title: "Premium states",
              text: "Skeletons, glass surfaces, grouped messages, and subtle motion throughout.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <item.icon className="size-5 text-[var(--accent)]" />
              <p className="mt-4 font-semibold text-[var(--text-strong)]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg md:hidden"
            onClick={onOpenSidebar}
          >
            <span>Browse conversations</span>
            <ArrowRight className="size-4" />
          </button>
          <p className="text-sm text-[var(--text-muted)]">
            Select a contact to open the redesigned conversation canvas.
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default NoChatSelected;
