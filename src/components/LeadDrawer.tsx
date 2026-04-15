"use client";

import { useEffect, useState, useCallback } from "react";
import {
    getInquiryById,
    addInquiryActivity,
    updateInquiryDetails,
    updateInquiryStatus,
    archiveLead,
    convertLeadToTenant,
    getEmployees,
    getAvailableRooms,
} from "@/app/actions/admin";

// ─── Constants ────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
    { id: "NEW",       label: "New Lead",   color: "#3b82f6", bg: "#eff6ff",  border: "#bfdbfe" },
    { id: "CONTACTED", label: "Contacted",  color: "#d97706", bg: "#fffbeb",  border: "#fde68a" },
    { id: "VISITED",   label: "Visited",    color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
    { id: "APPROVED",  label: "Approved",   color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0" },
    { id: "ONBOARDED", label: "Onboarded",  color: "#475569", bg: "#f8fafc",  border: "#cbd5e1" },
    { id: "ARCHIVED",  label: "Archived",   color: "#9ca3af", bg: "#f9fafb",  border: "#e5e7eb" },
];

const SOURCES = [
    { id: "WEBSITE",   label: "Website",   icon: "fa-globe" },
    { id: "WHATSAPP",  label: "WhatsApp",  icon: "fa-whatsapp" },
    { id: "WALKIN",    label: "Walk-in",   icon: "fa-walking" },
    { id: "INSTAGRAM", label: "Instagram", icon: "fa-instagram" },
    { id: "REFERRAL",  label: "Referral",  icon: "fa-users" },
];

const ACTIVITY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
    NOTE:             { icon: "fa-sticky-note",   color: "#6366f1", label: "Note" },
    STATUS_CHANGE:    { icon: "fa-exchange-alt",  color: "#f59e0b", label: "Stage Change" },
    CALL_LOGGED:      { icon: "fa-phone-alt",     color: "#10b981", label: "Call Logged" },
    VISIT_SCHEDULED:  { icon: "fa-calendar-check",color: "#8b5cf6", label: "Visit Scheduled" },
    ASSIGNED:         { icon: "fa-user-tag",      color: "#3b82f6", label: "Assigned" },
    SYSTEM:           { icon: "fa-cog",           color: "#94a3b8", label: "System" },
};

function timeAgo(date: string | Date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name?: string | null) {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function fmtDate(d?: string | Date | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Convert Modal ────────────────────────────────────────────────────────────

interface ConvertModalProps {
    lead: any;
    onClose: () => void;
    onDone: () => void;
}

function ConvertModal({ lead, onClose, onDone }: ConvertModalProps) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [lockedRent, setLockedRent]     = useState("");
    const [deposit, setDeposit]           = useState("");
    const [startDate, setStartDate]       = useState(new Date().toISOString().split("T")[0]);
    const [converting, setConverting]     = useState(false);

    useEffect(() => {
        getAvailableRooms()
            .then(setRooms)
            .catch(console.error)
            .finally(() => setLoadingRooms(false));
    }, []);

    // Pre-fill rent/deposit when room is selected
    useEffect(() => {
        const room = rooms.find(r => r.id === selectedRoom);
        if (room) {
            setLockedRent(String(room.rent || ""));
            setDeposit(String(room.deposit || ""));
        }
    }, [selectedRoom, rooms]);

    const handleConvert = async () => {
        setConverting(true);
        try {
            await convertLeadToTenant(lead.id, {
                roomId: selectedRoom || undefined,
                lockedRentAmount: lockedRent ? parseInt(lockedRent) : 0,
                depositHolding: deposit ? parseInt(deposit) : 0,
                startDate,
            });
            onDone();
        } catch (e: any) {
            alert(e.message || "Conversion failed");
            setConverting(false);
        }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)",
            padding: 24,
        }}>
            <div style={{
                background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480,
                boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
                overflow: "hidden",
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    background: "linear-gradient(135deg, #ecfdf5, #fff)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>
                                <i className="fas fa-bolt" style={{ color: "#059669", marginRight: 8 }} />
                                Convert Lead to Tenant
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: 3 }}>
                                {lead.user?.name || lead.name || "Guest Lead"}
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            width: 34, height: 34, borderRadius: 10,
                            border: "1px solid #e2e8f0", background: "#f8fafc",
                            cursor: "pointer", display: "flex", alignItems: "center",
                            justifyContent: "center", color: "#64748b", fontSize: 13,
                        }}>
                            <i className="fas fa-times" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Room Selection */}
                    <div>
                        <label style={labelStyle}>Assign a Room <span style={{ color: "#94a3b8", fontWeight: 600 }}>(optional)</span></label>
                        {loadingRooms ? (
                            <div style={{ ...inputStyle, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
                                <i className="fas fa-spinner fa-spin" /> Loading rooms...
                            </div>
                        ) : (
                            <div style={{ position: "relative", marginTop: 6 }}>
                                <select
                                    value={selectedRoom}
                                    onChange={e => setSelectedRoom(e.target.value)}
                                    style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 32 }}
                                >
                                    <option value="">— No room assignment yet —</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.property?.title} · {r.type} · ₹{r.rent?.toLocaleString()}/mo
                                        </option>
                                    ))}
                                </select>
                                <i className="fas fa-chevron-down" style={{
                                    position: "absolute", right: 12, top: "50%",
                                    transform: "translateY(-50%)", color: "#94a3b8",
                                    pointerEvents: "none", fontSize: 11
                                }} />
                            </div>
                        )}
                        {rooms.length === 0 && !loadingRooms && (
                            <p style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginTop: 6 }}>
                                ⚠️ No available rooms right now. You can still convert; assign a room later from Tenants.
                            </p>
                        )}
                    </div>

                    {/* Lease Details */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Locked Rent (₹/mo)</label>
                            <input
                                type="number"
                                value={lockedRent}
                                onChange={e => setLockedRent(e.target.value)}
                                placeholder="e.g. 8000"
                                style={{ ...inputStyle, marginTop: 6 }}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Security Deposit (₹)</label>
                            <input
                                type="number"
                                value={deposit}
                                onChange={e => setDeposit(e.target.value)}
                                placeholder="e.g. 16000"
                                style={{ ...inputStyle, marginTop: 6 }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Move-In / Lease Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={{ ...inputStyle, marginTop: 6 }}
                        />
                    </div>

                    {/* Impact notice */}
                    <div style={{
                        padding: "12px 14px", borderRadius: 12,
                        background: "#fffbeb", border: "1px solid #fde68a",
                        fontSize: 12, fontWeight: 600, color: "#92400e", lineHeight: 1.6
                    }}>
                        <i className="fas fa-info-circle" style={{ marginRight: 6, color: "#f59e0b" }} />
                        This will create a Tenant account, mark the inquiry as <strong>Onboarded</strong>
                        {selectedRoom && ", and mark the selected room as Occupied"}.
                        {!lead.userId && " A guest account will be auto-created."}
                    </div>
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: "14px 24px", borderTop: "1px solid #f1f5f9",
                    display: "flex", gap: 10, background: "#fafafa"
                }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: "10px 0", background: "#fff",
                        color: "#64748b", border: "1px solid #e2e8f0",
                        borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleConvert}
                        disabled={converting}
                        style={{
                            flex: 2, padding: "10px 0",
                            background: converting ? "#a7f3d0" : "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff", border: "none", borderRadius: 12,
                            fontSize: 13, fontWeight: 800, cursor: converting ? "not-allowed" : "pointer",
                            boxShadow: converting ? "none" : "0 4px 14px rgba(5,150,105,0.35)",
                            transition: "all 0.2s"
                        }}
                    >
                        {converting
                            ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} />Converting...</>
                            : <><i className="fas fa-bolt" style={{ marginRight: 6 }} />Confirm Conversion</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LeadDrawerProps {
    inquiryId: string | null;
    onClose:   () => void;
    onUpdate:  () => void;
}

export default function LeadDrawer({ inquiryId, onClose, onUpdate }: LeadDrawerProps) {
    const [lead, setLead]               = useState<any>(null);
    const [employees, setEmployees]     = useState<any[]>([]);
    const [loading, setLoading]         = useState(false);
    const [activeTab, setActiveTab]     = useState<"details" | "activity">("details");

    // Activity log state
    const [noteInput, setNoteInput]     = useState("");
    const [noteType, setNoteType]       = useState("NOTE");
    const [savingNote, setSavingNote]   = useState(false);

    // Visit scheduling
    const [visitDate, setVisitDate]     = useState("");
    const [visitTime, setVisitTime]     = useState("11:00");

    // CRM fields
    const [localSource, setLocalSource] = useState("");
    const [localMoveIn, setLocalMoveIn] = useState("");
    const [localFollowUp, setLocalFollowUp] = useState("");

    // Convert modal
    const [showConvert, setShowConvert] = useState(false);

    const isOpen = !!inquiryId;

    const loadLead = useCallback(async () => {
        if (!inquiryId) return;
        setLoading(true);
        try {
            const [data, emps] = await Promise.all([
                getInquiryById(inquiryId),
                getEmployees(),
            ]);
            setLead(data);
            setEmployees(emps);
            setLocalSource(data?.source || "");
            setLocalMoveIn(
                data?.preferredMoveIn
                    ? new Date(data.preferredMoveIn).toISOString().split("T")[0]
                    : ""
            );
            setLocalFollowUp(
                data?.followUpDate
                    ? new Date(data.followUpDate).toISOString().split("T")[0]
                    : ""
            );
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [inquiryId]);

    useEffect(() => {
        if (inquiryId) {
            setActiveTab("details");
            setNoteInput("");
            setNoteType("NOTE");
            setVisitDate("");
            setVisitTime("11:00");
            setShowConvert(false);
            loadLead();
        } else {
            setLead(null);
        }
    }, [inquiryId, loadLead]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (showConvert) setShowConvert(false); else onClose(); } };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, showConvert]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleStageChange = async (newStatus: string) => {
        if (!lead) return;
        try {
            setLead({ ...lead, status: newStatus });
            await updateInquiryStatus(lead.id, newStatus);
            await loadLead();
            onUpdate();
        } catch (e: any) { alert(e.message); }
    };

    const handleAgentChange = async (employeeId: string) => {
        if (!lead) return;
        const val = employeeId === "UNASSIGNED" ? null : employeeId;
        try {
            await updateInquiryDetails(lead.id, { assignedToId: val });
            await loadLead();
            onUpdate();
        } catch (e: any) { alert(e.message); }
    };

    const handleSaveDetails = async () => {
        if (!lead) return;
        try {
            await updateInquiryDetails(lead.id, {
                source: localSource || undefined,
                preferredMoveIn: localMoveIn || null,
                followUpDate: localFollowUp || null,
            });
            await loadLead();
            onUpdate();
        } catch (e: any) { alert(e.message); }
    };

    const handleAddNote = async () => {
        if (!lead) return;

        // Visit scheduling: requires a date
        if (noteType === "VISIT_SCHEDULED") {
            if (!visitDate) { alert("Please select a visit date."); return; }
            const dateLabel = new Date(`${visitDate}T${visitTime}`).toLocaleString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            });
            const content = `Visit scheduled for ${dateLabel}${noteInput.trim() ? ` — ${noteInput.trim()}` : ""}`;
            setSavingNote(true);
            try {
                await addInquiryActivity(lead.id, "VISIT_SCHEDULED", content);
                // Auto-advance stage to VISITED if still NEW or CONTACTED
                if (["NEW", "CONTACTED"].includes(lead.status)) {
                    await updateInquiryStatus(lead.id, "VISITED");
                    onUpdate();
                }
                setNoteInput(""); setVisitDate(""); setVisitTime("11:00");
                await loadLead();
            } catch (e: any) { alert(e.message); }
            finally { setSavingNote(false); }
            return;
        }

        if (!noteInput.trim()) return;
        setSavingNote(true);
        try {
            await addInquiryActivity(lead.id, noteType, noteInput.trim());
            setNoteInput("");
            await loadLead();
        } catch (e: any) { alert(e.message); }
        finally { setSavingNote(false); }
    };

    const handleArchive = async () => {
        if (!lead || !confirm("Archive this lead? It will be removed from the active pipeline.")) return;
        try {
            await archiveLead(lead.id);
            onUpdate(); onClose();
        } catch (e: any) { alert(e.message); }
    };

    const handleConvertDone = async () => {
        setShowConvert(false);
        await loadLead();
        onUpdate();
        alert("✅ Lead converted to Tenant! You can now manage them in the Tenants module.");
    };

    const stage = PIPELINE_STAGES.find((s) => s.id === lead?.status) || PIPELINE_STAGES[0];
    const isOverdue = lead?.followUpDate && new Date(lead.followUpDate) < new Date();
    const canAdvance = lead && !["ONBOARDED", "ARCHIVED", "APPROVED"].includes(lead.status);

    return (
        <>
            {/* Convert Modal */}
            {showConvert && lead && (
                <ConvertModal lead={lead} onClose={() => setShowConvert(false)} onDone={handleConvertDone} />
            )}

            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)",
                zIndex: 40, opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? "auto" : "none",
                backdropFilter: "blur(4px)",
                transition: "opacity 0.3s ease"
            }} />

            {/* Drawer */}
            <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "min(580px, 100vw)",
                background: "#fff", zIndex: 50,
                display: "flex", flexDirection: "column",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.14)",
                transform: isOpen ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)"
            }}>
                {loading || !lead ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                width: 40, height: 40, border: "3px solid #f1f5f9",
                                borderTop: "3px solid #e11d48", borderRadius: "50%",
                                animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
                            }} />
                            <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Loading lead...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Zone A: Header ────────────────────────────────── */}
                        <div style={{
                            padding: "20px 24px 16px",
                            borderBottom: "1px solid #f1f5f9",
                            background: "linear-gradient(135deg, #fafafa 0%, #fff 100%)",
                            flexShrink: 0
                        }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16,
                                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#fff", fontSize: 18, fontWeight: 900, letterSpacing: -0.5
                                    }}>
                                        {getInitials(lead.user?.name || lead.name)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
                                            {lead.user?.name || lead.name || "Guest Lead"}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                                                letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 20,
                                                color: stage.color, background: stage.bg, border: `1px solid ${stage.border}`
                                            }}>{stage.label}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", fontFamily: "monospace" }}>
                                                #{lead.id.slice(-6).toUpperCase()}
                                            </span>
                                            {lead.user?.verificationStatus === "VERIFIED" && (
                                                <span style={{
                                                    fontSize: 10, fontWeight: 800, color: "#059669",
                                                    background: "#ecfdf5", border: "1px solid #a7f3d0",
                                                    padding: "2px 8px", borderRadius: 20
                                                }}>✓ Verified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    border: "1px solid #e2e8f0", background: "#f8fafc",
                                    cursor: "pointer", display: "flex", alignItems: "center",
                                    justifyContent: "center", color: "#64748b", fontSize: 14
                                }}>
                                    <i className="fas fa-times" />
                                </button>
                            </div>

                            {/* Quick meta */}
                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                                    <i className="fas fa-clock" style={{ color: "#cbd5e1" }} />
                                    {timeAgo(lead.createdAt)}
                                </span>
                                {lead.phone && (
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <a href={`tel:${lead.phone}`} style={quickBtn("#6366f1")}>
                                            <i className="fas fa-phone-alt" /> {lead.phone}
                                        </a>
                                        <a href={`https://wa.me/91${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={quickBtn("#25d366")}>
                                            <i className="fab fa-whatsapp" />
                                        </a>
                                    </div>
                                )}
                                {lead.source && (
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                                        <i className={`fab ${SOURCES.find(s => s.id === lead.source)?.icon || "fa-link"}`} style={{ color: "#cbd5e1", marginRight: 4 }} />
                                        {SOURCES.find(s => s.id === lead.source)?.label || lead.source}
                                    </span>
                                )}
                                {isOverdue && (
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "#e11d48", display: "flex", alignItems: "center", gap: 4 }}>
                                        <i className="fas fa-bell" /> Follow-up overdue!
                                    </span>
                                )}
                            </div>

                            {/* Tabs */}
                            <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
                                {(["details", "activity"] as const).map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                        flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
                                        cursor: "pointer", fontSize: 12, fontWeight: 800,
                                        background: activeTab === tab ? "#fff" : "transparent",
                                        color: activeTab === tab ? "#0f172a" : "#64748b",
                                        boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                        transition: "all 0.2s"
                                    }}>
                                        <i className={`fas ${tab === "details" ? "fa-id-card" : "fa-history"}`} style={{ marginRight: 6 }} />
                                        {tab === "details" ? "Details" : "Activity Log"}
                                        {tab === "activity" && lead.activities?.length > 0 && (
                                            <span style={{
                                                marginLeft: 6, fontSize: 10, background: "#e11d48",
                                                color: "#fff", borderRadius: 20, padding: "1px 6px", fontWeight: 800
                                            }}>{lead.activities.length}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Scrollable Body ────────────────────────────────── */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

                            {/* ════ DETAILS TAB ════ */}
                            {activeTab === "details" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                                    {/* Contact */}
                                    <SectionCard title="Contact Details" icon="fa-address-card">
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <InfoRow icon="fa-user"    label="Name"  value={lead.user?.name || lead.name || "—"} />
                                            <InfoRow icon="fa-envelope" label="Email" value={lead.user?.email || "—"} />
                                            <div>
                                                <span style={labelStyle}>Phone</span>
                                                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                                    {lead.phone ? (
                                                        <>
                                                            <a href={`tel:${lead.phone}`} style={actionBtn("#6366f1")}>
                                                                <i className="fas fa-phone-alt" /> Call
                                                            </a>
                                                            <a href={`https://wa.me/91${lead.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={actionBtn("#25d366")}>
                                                                <i className="fab fa-whatsapp" /> WhatsApp
                                                            </a>
                                                        </>
                                                    ) : <span style={valueStyle}>—</span>}
                                                </div>
                                            </div>
                                            <InfoRow icon="fa-shield-alt" label="Account"
                                                value={lead.userId ? "Registered User" : "Guest Lead"}
                                                valueColor={lead.userId ? "#059669" : "#d97706"}
                                            />
                                        </div>
                                    </SectionCard>

                                    {/* Enquiry Interest */}
                                    <SectionCard title="Enquiry Interest" icon="fa-building">
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <InfoRow icon="fa-building" label="Property" value={lead.property?.title || "—"} />
                                            <InfoRow icon="fa-map-marker-alt" label="Location"
                                                value={[lead.property?.city, lead.property?.area].filter(Boolean).join(", ") || "—"}
                                            />
                                            <InfoRow icon="fa-bed" label="Room Type"
                                                value={lead.property?.rooms?.find((r: any) => r.id === lead.roomId)?.type || "Any Available"}
                                            />
                                            <InfoRow icon="fa-rupee-sign" label="Quoted Rent"
                                                value={
                                                    lead.property?.rooms?.find((r: any) => r.id === lead.roomId)?.rent
                                                        ? `₹${lead.property.rooms.find((r: any) => r.id === lead.roomId).rent.toLocaleString()}/mo`
                                                        : "—"
                                                }
                                            />
                                            <InfoRow icon="fa-venus-mars" label="Gender Match" value={lead.property?.genderPreference || "—"} />
                                            <InfoRow icon="fa-calendar"   label="Preferred Move-In" value={fmtDate(lead.preferredMoveIn)} />
                                        </div>
                                        {lead.message && (
                                            <div style={{
                                                marginTop: 12, padding: "12px 14px",
                                                background: "#f8fafc", borderRadius: 10,
                                                border: "1px solid #e2e8f0",
                                                fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 1.6
                                            }}>
                                                <i className="fas fa-quote-left" style={{ color: "#cbd5e1", marginRight: 6 }} />
                                                {lead.message}
                                            </div>
                                        )}
                                    </SectionCard>

                                    {/* CRM Details */}
                                    <SectionCard title="CRM Details" icon="fa-sliders-h">
                                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                            {/* Source picker */}
                                            <div>
                                                <label style={labelStyle}>Lead Source</label>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                                                    {SOURCES.map(s => (
                                                        <button key={s.id} onClick={() => setLocalSource(s.id)} style={{
                                                            padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                            cursor: "pointer", border: "1px solid",
                                                            borderColor: localSource === s.id ? "#6366f1" : "#e2e8f0",
                                                            background: localSource === s.id ? "#eef2ff" : "#fff",
                                                            color: localSource === s.id ? "#4f46e5" : "#64748b",
                                                            transition: "all 0.15s"
                                                        }}>
                                                            <i className={`fab ${s.icon}`} style={{ marginRight: 4 }} />{s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                                <div>
                                                    <label style={labelStyle}>Preferred Move-In</label>
                                                    <input type="date" value={localMoveIn} onChange={e => setLocalMoveIn(e.target.value)} style={{ ...inputStyle, marginTop: 6 }} />
                                                </div>
                                                <div>
                                                    <label style={{ ...labelStyle, color: isOverdue ? "#e11d48" : undefined }}>
                                                        {isOverdue ? "⚠️ Follow-up Overdue" : "Next Follow-up"}
                                                    </label>
                                                    <input type="date" value={localFollowUp} onChange={e => setLocalFollowUp(e.target.value)} style={{
                                                        ...inputStyle, marginTop: 6,
                                                        borderColor: isOverdue ? "#fca5a5" : undefined,
                                                        background: isOverdue ? "#fff1f2" : undefined,
                                                    }} />
                                                </div>
                                            </div>

                                            <button onClick={handleSaveDetails} style={{
                                                padding: "9px 0", background: "#0f172a", color: "#fff",
                                                border: "none", borderRadius: 10, fontSize: 12, fontWeight: 800,
                                                cursor: "pointer", width: "100%"
                                            }}>
                                                <i className="fas fa-save" style={{ marginRight: 6 }} />Save CRM Details
                                            </button>
                                        </div>
                                    </SectionCard>

                                    {/* Pipeline Management */}
                                    <SectionCard title="Pipeline Management" icon="fa-tasks">
                                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                            {/* Stage buttons */}
                                            <div>
                                                <label style={labelStyle}>Pipeline Stage</label>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                                                    {PIPELINE_STAGES.filter(s => s.id !== "ARCHIVED").map(s => (
                                                        <button key={s.id} onClick={() => handleStageChange(s.id)} style={{
                                                            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800,
                                                            textTransform: "uppercase", letterSpacing: "0.06em",
                                                            cursor: "pointer", border: `1px solid ${s.border}`,
                                                            background: lead.status === s.id ? s.bg : "#fff",
                                                            color: lead.status === s.id ? s.color : "#94a3b8",
                                                            boxShadow: lead.status === s.id ? `0 0 0 2px ${s.border}` : "none",
                                                            transition: "all 0.15s"
                                                        }}>
                                                            {lead.status === s.id && <i className="fas fa-check" style={{ marginRight: 5 }} />}
                                                            {s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Agent */}
                                            <div>
                                                <label style={labelStyle}>Assigned Agent</label>
                                                <div style={{ position: "relative", marginTop: 6 }}>
                                                    <select
                                                        value={lead.assignedToId || "UNASSIGNED"}
                                                        onChange={e => handleAgentChange(e.target.value)}
                                                        style={{ ...inputStyle, appearance: "none", paddingRight: 32, cursor: "pointer" }}
                                                    >
                                                        <option value="UNASSIGNED">— Unassigned —</option>
                                                        {employees.map(e => (
                                                            <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                                        ))}
                                                    </select>
                                                    <i className="fas fa-chevron-down" style={{
                                                        position: "absolute", right: 12, top: "50%",
                                                        transform: "translateY(-50%)", color: "#94a3b8",
                                                        pointerEvents: "none", fontSize: 11
                                                    }} />
                                                </div>
                                                {lead.assignedTo && (
                                                    <div style={{
                                                        marginTop: 8, display: "flex", alignItems: "center", gap: 10,
                                                        padding: "10px 12px", borderRadius: 10,
                                                        background: "#f0fdf4", border: "1px solid #bbf7d0"
                                                    }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: 10,
                                                            background: "#4ade80", display: "flex", alignItems: "center",
                                                            justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#14532d"
                                                        }}>
                                                            {getInitials(lead.assignedTo.name)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 800, color: "#14532d" }}>{lead.assignedTo.name}</div>
                                                            <div style={{ fontSize: 11, fontWeight: 600, color: "#22c55e" }}>
                                                                {lead.assignedTo.role} · {lead.assignedTo.phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </SectionCard>
                                </div>
                            )}

                            {/* ════ ACTIVITY LOG TAB ════ */}
                            {activeTab === "activity" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                                    {/* Log Entry Panel */}
                                    <SectionCard title="Log an Entry" icon="fa-pen">
                                        {/* Type selector */}
                                        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                                            {["NOTE", "CALL_LOGGED", "VISIT_SCHEDULED"].map(type => (
                                                <button key={type} onClick={() => setNoteType(type)} style={{
                                                    padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                    cursor: "pointer", border: "1px solid",
                                                    borderColor: noteType === type ? "#6366f1" : "#e2e8f0",
                                                    background: noteType === type ? "#eef2ff" : "#fff",
                                                    color: noteType === type ? "#4f46e5" : "#64748b",
                                                    transition: "all 0.15s"
                                                }}>
                                                    <i className={`fas ${ACTIVITY_CONFIG[type]?.icon}`} style={{ marginRight: 5 }} />
                                                    {type === "NOTE" ? "Internal Note" : type === "CALL_LOGGED" ? "Log Call" : "Schedule Visit"}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Visit scheduler — date + time pickers */}
                                        {noteType === "VISIT_SCHEDULED" && (
                                            <div style={{
                                                padding: "14px", borderRadius: 12, marginBottom: 12,
                                                background: "#f5f3ff", border: "1px solid #ddd6fe"
                                            }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                    <i className="fas fa-calendar-check" style={{ marginRight: 6 }} />Visit Details
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                                    <div>
                                                        <label style={{ ...labelStyle, color: "#7c3aed" }}>Date *</label>
                                                        <input
                                                            type="date"
                                                            value={visitDate}
                                                            min={new Date().toISOString().split("T")[0]}
                                                            onChange={e => setVisitDate(e.target.value)}
                                                            style={{ ...inputStyle, marginTop: 5, borderColor: "#ddd6fe" }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ ...labelStyle, color: "#7c3aed" }}>Time</label>
                                                        <input
                                                            type="time"
                                                            value={visitTime}
                                                            onChange={e => setVisitTime(e.target.value)}
                                                            style={{ ...inputStyle, marginTop: 5, borderColor: "#ddd6fe" }}
                                                        />
                                                    </div>
                                                </div>
                                                {["NEW", "CONTACTED"].includes(lead.status) && (
                                                    <div style={{
                                                        marginTop: 10, fontSize: 11, fontWeight: 700, color: "#5b21b6",
                                                        background: "#ede9fe", padding: "6px 10px", borderRadius: 8
                                                    }}>
                                                        <i className="fas fa-magic" style={{ marginRight: 5 }} />
                                                        Stage will auto-advance to <strong>Visited</strong> on save
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Text area */}
                                        <textarea
                                            rows={3}
                                            value={noteInput}
                                            onChange={e => setNoteInput(e.target.value)}
                                            placeholder={
                                                noteType === "CALL_LOGGED"
                                                    ? "Call outcome: e.g. 'Called, very interested, wants to visit Saturday 10am'"
                                                    : noteType === "VISIT_SCHEDULED"
                                                    ? "Additional notes: e.g. 'Meet at reception, bring ID'"
                                                    : "Internal note visible only to the admin team..."
                                            }
                                            style={{ ...inputStyle, height: "auto", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                                        />

                                        <button
                                            onClick={handleAddNote}
                                            disabled={savingNote || (noteType !== "VISIT_SCHEDULED" && !noteInput.trim())}
                                            style={{
                                                marginTop: 10, width: "100%", padding: "10px 0",
                                                background: savingNote ? "#e2e8f0" : "linear-gradient(135deg, #4f46e5, #6366f1)",
                                                color: savingNote ? "#94a3b8" : "#fff",
                                                border: "none", borderRadius: 10, fontSize: 12, fontWeight: 800,
                                                cursor: savingNote ? "not-allowed" : "pointer",
                                                boxShadow: savingNote ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {savingNote
                                                ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} />Saving...</>
                                                : <><i className="fas fa-plus" style={{ marginRight: 6 }} />
                                                    {noteType === "VISIT_SCHEDULED" ? "Confirm Visit" : "Add Entry"}
                                                </>
                                            }
                                        </button>
                                    </SectionCard>

                                    {/* Timeline */}
                                    <SectionCard title="Activity Timeline" icon="fa-history">
                                        {!lead.activities?.length ? (
                                            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                                                <i className="fas fa-inbox" style={{ fontSize: 28, marginBottom: 10, display: "block" }} />
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>No activity yet</div>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                {lead.activities?.map((act: any, i: number) => {
                                                    const cfg = ACTIVITY_CONFIG[act.type] || ACTIVITY_CONFIG.SYSTEM;
                                                    const isLast = i === lead.activities.length - 1;
                                                    return (
                                                        <div key={act.id} style={{ display: "flex", gap: 12, position: "relative" }}>
                                                            {!isLast && (
                                                                <div style={{
                                                                    position: "absolute", left: 15, top: 34,
                                                                    bottom: 0, width: 2, background: "#f1f5f9"
                                                                }} />
                                                            )}
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: 10,
                                                                background: `${cfg.color}15`,
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                flexShrink: 0, border: `1px solid ${cfg.color}30`, zIndex: 1
                                                            }}>
                                                                <i className={`fas ${cfg.icon}`} style={{ color: cfg.color, fontSize: 12 }} />
                                                            </div>
                                                            <div style={{ paddingBottom: 18, flex: 1 }}>
                                                                <div style={{ fontSize: 10, fontWeight: 800, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                                    {cfg.label}
                                                                </div>
                                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginTop: 2, lineHeight: 1.5 }}>
                                                                    {act.content}
                                                                </div>
                                                                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginTop: 4 }}>
                                                                    {timeAgo(act.createdAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </SectionCard>
                                </div>
                            )}
                        </div>

                        {/* ── Zone D: Action Footer ──────────────────────────── */}
                        <div style={{
                            padding: "14px 24px", borderTop: "1px solid #f1f5f9",
                            background: "#fafafa", display: "flex", gap: 8,
                            flexShrink: 0, flexWrap: "wrap"
                        }}>
                            {lead.status === "APPROVED" && (
                                <button
                                    onClick={() => setShowConvert(true)}
                                    style={{
                                        flex: 1, padding: "10px 0",
                                        background: "linear-gradient(135deg, #059669, #10b981)",
                                        color: "#fff", border: "none", borderRadius: 12,
                                        fontSize: 12, fontWeight: 800, cursor: "pointer",
                                        letterSpacing: "0.04em",
                                        boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
                                    }}
                                >
                                    <i className="fas fa-bolt" style={{ marginRight: 6 }} />Convert to Tenant
                                </button>
                            )}

                            {lead.status === "ONBOARDED" && (
                                <span style={{
                                    flex: 1, padding: "10px 0", textAlign: "center",
                                    background: "#f0fdf4", color: "#059669",
                                    border: "1px solid #a7f3d0", borderRadius: 12,
                                    fontSize: 12, fontWeight: 800
                                }}>
                                    <i className="fas fa-check-circle" style={{ marginRight: 6 }} />Tenant Onboarded
                                </span>
                            )}

                            {canAdvance && (
                                <button
                                    onClick={() => {
                                        const stages = PIPELINE_STAGES.filter(s => !["ARCHIVED", "ONBOARDED"].includes(s.id));
                                        const idx = stages.findIndex(s => s.id === lead.status);
                                        if (idx < stages.length - 1) handleStageChange(stages[idx + 1].id);
                                    }}
                                    style={{
                                        flex: 1, padding: "10px 0",
                                        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                                        color: "#fff", border: "none", borderRadius: 12,
                                        fontSize: 12, fontWeight: 800, cursor: "pointer",
                                        letterSpacing: "0.04em",
                                        boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                                    }}
                                >
                                    <i className="fas fa-arrow-right" style={{ marginRight: 6 }} />Advance Stage
                                </button>
                            )}

                            {!["ARCHIVED", "ONBOARDED"].includes(lead.status) && (
                                <button onClick={handleArchive} style={{
                                    padding: "10px 16px", background: "#fff",
                                    color: "#94a3b8", border: "1px solid #e2e8f0",
                                    borderRadius: 12, fontSize: 12, fontWeight: 800,
                                    cursor: "pointer", transition: "all 0.15s"
                                }}>
                                    <i className="fas fa-archive" style={{ marginRight: 5 }} />Archive
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
            `}</style>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: "#fff", border: "1px solid #f1f5f9",
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
            <div style={{
                padding: "12px 16px", borderBottom: "1px solid #f8fafc",
                display: "flex", alignItems: "center", gap: 8, background: "#fafafa"
            }}>
                <i className={`fas ${icon}`} style={{ color: "#94a3b8", fontSize: 13 }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {title}
                </span>
            </div>
            <div style={{ padding: 16 }}>{children}</div>
        </div>
    );
}

function InfoRow({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={labelStyle}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <i className={`fas ${icon}`} style={{ color: "#cbd5e1", fontSize: 11, width: 14 }} />
                <span style={{ ...valueStyle, color: valueColor || valueStyle.color }}>{value}</span>
            </div>
        </div>
    );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.08em"
};
const valueStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: "#334155"
};
const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 13, fontWeight: 600, color: "#334155",
    background: "#fff", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit"
};
function actionBtn(bg: string): React.CSSProperties {
    return {
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: bg, color: "#fff", textDecoration: "none",
        border: "none", cursor: "pointer"
    };
}
function quickBtn(bg: string): React.CSSProperties {
    return {
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: bg, color: "#fff", textDecoration: "none",
        border: "none", cursor: "pointer", opacity: 0.9
    };
}
