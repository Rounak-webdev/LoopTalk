import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { formatCallDuration } from "../lib/chat-ui";

const MotionDiv = motion.div;

const CallOverlay = () => {
  const {
    acceptIncomingCall,
    activeCall,
    finishCall,
    incomingCall,
    rejectIncomingCall,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
  } = useChatStore();
  const [now, setNow] = useState(Date.now());
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!activeCall?.startedAt) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeCall?.startedAt]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = activeCall?.localStream || null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = activeCall?.remoteStream || null;
    }
  }, [activeCall?.localStream, activeCall?.remoteStream]);

  const duration = useMemo(() => {
    if (!activeCall?.startedAt) return "00:00";
    return formatCallDuration(now - activeCall.startedAt);
  }, [activeCall?.startedAt, now]);

  if (!activeCall && !incomingCall) return null;

  if (incomingCall && !activeCall) {
    const isVideoIncoming = incomingCall.callType === "video";

    return (
      <MotionDiv
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md"
      >
        <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-[30px] border border-[var(--border-strong)] bg-[color:var(--bg-elevated)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="bg-[radial-gradient(circle_at_top,rgba(37,211,102,0.18),transparent_40%)] px-6 py-8 text-center">
            <div className="mx-auto flex size-24 items-center justify-center rounded-[30px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-3xl font-bold text-white">
              {incomingCall.from.fullName?.[0] || "U"}
            </div>
            <p className="section-title mt-5 text-3xl font-bold text-[var(--text-strong)]">
              {incomingCall.from.fullName}
            </p>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              {isVideoIncoming ? "Incoming video call" : "Incoming voice call"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 px-6 pb-6 pt-2">
            <button
              type="button"
              onClick={() => rejectIncomingCall()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 font-semibold text-[var(--text-strong)]"
            >
              <PhoneOff className="size-4" />
              Decline
            </button>
            <button
              type="button"
              onClick={acceptIncomingCall}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 font-semibold text-slate-950"
            >
              <Phone className="size-4" />
              Accept
            </button>
          </div>
        </div>
      </MotionDiv>
    );
  }

  if (!activeCall) return null;

  const participant = activeCall.participant;
  const isVideo = activeCall.callType === "video";


  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 14 }}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md sm:p-6"
    >
      <div className="pointer-events-auto relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[color:var(--bg-elevated)] shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,211,102,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(18,140,126,0.2),transparent_30%)]" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="rounded-[28px] border border-[var(--border)] bg-black/20 p-4">
            {isVideo ? (
              <div className="relative min-h-[340px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,rgba(37,211,102,0.18),rgba(18,140,126,0.16)),linear-gradient(135deg,#1f2937,#111827)]">
                <div className="absolute inset-0 floating-grid opacity-10" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-sm text-white/80">
                  <span>{activeCall.status}</span>
                  <span>{duration}</span>
                </div>
                {activeCall.remoteStream?.getTracks?.().length ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="min-h-[340px] w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[340px] items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex size-24 items-center justify-center rounded-[30px] bg-white/12 text-3xl font-bold text-white">
                        {participant?.fullName?.[0] || "U"}
                      </div>
                      <p className="section-title mt-5 text-3xl font-bold text-white">{participant?.fullName}</p>
                      <p className="mt-2 text-sm text-white/70">{activeCall.status}</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 w-28 overflow-hidden rounded-[22px] border border-white/10 bg-black/35 p-2">
                  {activeCall.isVideoEnabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-32 w-full rounded-[18px] bg-white/8 object-cover"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-[18px] bg-white/8 text-xs font-medium text-white/80">
                      Camera off
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,rgba(37,211,102,0.16),rgba(18,140,126,0.08)),linear-gradient(135deg,#111827,#0f172a)] text-center">
                <div className="flex size-28 items-center justify-center rounded-[34px] bg-white/10 text-4xl font-bold text-white">
                  {participant?.fullName?.[0] || "U"}
                </div>
                <p className="section-title mt-6 text-3xl font-bold text-white">{participant?.fullName}</p>
                <p className="mt-2 text-sm text-white/70">{activeCall.status}</p>
                <p className="mt-4 text-2xl font-semibold text-[#86efac]">{duration}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                {isVideo ? "Video Call" : "Voice Call"}
              </p>
              <h3 className="section-title mt-3 text-3xl font-bold text-[var(--text-strong)]">
                {participant?.fullName}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                {activeCall.direction === "outgoing"
                  ? "Connecting through Loop Talk secure calling. Keep this window open while audio and video channels settle."
                  : "You answered the call. Audio and video will continue inside this overlay until one side hangs up."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${
                  activeCall.isMuted
                    ? "border-[var(--danger)]/50 bg-[var(--danger)]/10 text-[var(--text-strong)]"
                    : "border-[var(--border)] bg-[color:var(--surface)] text-[var(--text-strong)]"
                }`}
              >
                {activeCall.isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                <p className="mt-3 font-semibold">{activeCall.isMuted ? "Muted" : "Microphone"}</p>
              </button>
              <button
                type="button"
                onClick={toggleSpeaker}
                className="rounded-[22px] border border-[var(--border)] bg-[color:var(--surface)] px-4 py-4 text-left text-[var(--text-strong)] transition"
              >
                {activeCall.isSpeakerEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                <p className="mt-3 font-semibold">{activeCall.isSpeakerEnabled ? "Speaker On" : "Speaker Off"}</p>
              </button>
              <button
                type="button"
                onClick={toggleVideo}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${
                  activeCall.isVideoEnabled
                    ? "border-[var(--border-strong)] bg-[rgba(37,211,102,0.12)] text-[var(--text-strong)]"
                    : "border-[var(--border)] bg-[color:var(--surface)] text-[var(--text-strong)]"
                }`}
              >
                {activeCall.isVideoEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                <p className="mt-3 font-semibold">{activeCall.isVideoEnabled ? "Camera On" : "Camera Off"}</p>
              </button>
              <button
                type="button"
                className="rounded-[22px] border border-[var(--border)] bg-[color:var(--surface)] px-4 py-4 text-left text-[var(--text-strong)] transition"
              >
                <Phone className="size-5" />
                <p className="mt-3 font-semibold">{activeCall.direction === "outgoing" ? "Ringing" : "Live Call"}</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => finishCall("Call ended")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--danger)] px-5 py-4 font-semibold text-white shadow-[0_18px_40px_rgba(251,113,133,0.28)]"
            >
              <PhoneOff className="size-4" />
              End Call
            </button>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default CallOverlay;
