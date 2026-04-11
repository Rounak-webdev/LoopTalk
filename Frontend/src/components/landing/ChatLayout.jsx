import { motion } from "framer-motion";
import SidebarContacts from "./SidebarContacts";
import ChatWindow from "./ChatWindow";

const MotionSection = motion.section;

const ChatLayout = ({
  contacts,
  conversation,
  hasContactPermission,
  isSidebarExpanded,
  onAllowContacts,
  onDeniedContacts,
  onSelectContact,
  onSidebarExpand,
  onSidebarCollapse,
  onSidebarToggle,
  onSendMessage,
  selectedContactId,
}) => {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-[36px] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.28)]"
    >
      <div className="flex h-[78vh] min-h-[620px] w-full overflow-hidden rounded-[30px] border border-[var(--border)] bg-[color:var(--sidebar)]">
        <SidebarContacts
          contacts={contacts}
          hasContactPermission={hasContactPermission}
          isExpanded={isSidebarExpanded}
          onAllowContacts={onAllowContacts}
          onDeniedContacts={onDeniedContacts}
          onExpand={onSidebarExpand}
          onCollapse={onSidebarCollapse}
          onSelectContact={onSelectContact}
          onToggle={onSidebarToggle}
          selectedContactId={selectedContactId}
        />
        <ChatWindow
          conversation={conversation}
          hasContactPermission={hasContactPermission}
          isSidebarExpanded={isSidebarExpanded}
          onSendMessage={onSendMessage}
          onSidebarToggle={onSidebarToggle}
        />
      </div>
    </MotionSection>
  );
};

export default ChatLayout;
