"use client";

import { useEffect, useState } from "react";
import { createManualInquiry, getProperties, getEmployees } from "@/app/actions/admin";

const SOURCES = [
    { id: "WEBSITE",   label: "Website",   icon: "fa-globe" },
    { id: "WHATSAPP",  label: "WhatsApp",  icon: "fa-whatsapp" },
    { id: "WALKIN",    label: "Walk-in",   icon: "fa-walking" },
    { id: "INSTAGRAM", label: "Instagram", icon: "fa-instagram" },
    { id: "REFERRAL",  label: "Referral",  icon: "fa-users" },
];

interface ManualLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function ManualLeadModal({ isOpen, onClose, onCreated }: ManualLeadModalProps) {
    const [properties, setProperties] = useState<any[]>([]);
    const [employees, setEmployees]   = useState<any[]>([]);
    const [saving, setSaving]         = useState(false);
    const [error, setError]           = useState("");

    // Form state
    const [name, setName]               = useState("");
    const [phone, setPhone]             = useState("");
    const [propertyId, setPropertyId]   = useState("");
    const [source, setSource]           = useState("WALKIN");
    const [message, setMessage]         = useState("");
    const [moveIn, setMoveIn]           = useState("");
    const [followUp, setFollowUp]       = useState("");
    const [assignedToId, setAssignedId] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        Promise.all([getProperties(), getEmployees()])
            .then(([props, emps]) => {
                setProperties(props);
                setEmployees(emps);
            })
            .catch(console.error);
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const handleClose = () => {
        if (saving) return;
        setName(""); setPhone(""); setPropertyId(""); setSource("WALKIN");
        setMessage(""); setMoveIn(""); setFollowUp(""); setAssignedId("");
        setError("");
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name.trim() || !phone.trim() || !propertyId) {
            setError("Name, phone, and property are required.");
            return;
        }
        setSaving(true);
        try {
            await createManualInquiry({
                name, phone, propertyId, source, message,
                preferredMoveIn: moveIn || null,
                followUpDate: followUp || null,
                assignedToId: assignedToId || null,
            });
            onCreated();
            handleClose();
        } catch (e: any) {
            setError(e.message || "Failed to create lead.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
                    zIndex: 60, backdropFilter: "blur(4px)"
                }}
            />

            {/* Modal */}
            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 70, width: "min(560px, 96vw)",
                background: "#fff", borderRadius: 24,
                boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
                display: "flex", flexDirection: "column",
                maxHeight: "90vh", overflow: "hidden"
            }}>
                {/* Header */}
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    background: "linear-gradient(135deg, #fafafa, #fff)",
                    flexShrink: 0
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontSize: 14
                                }}>
                                    <i className="fas fa-user-plus" />
                                </span>
                                Add Manual Lead
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginTop: 4 }}>
                                Manually enter a lead from a call, walk-in, or offline source.
                            </p>
                        </div>
                        <button onClick={handleClose} style={{
                            width: 34, height: 34, borderRadius: 10,
                            border: "1px solid #e2e8f0", background: "#f8fafc",
                            cursor: "pointer", color: "#64748b", fontSize: 14,
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <i className="fas fa-times" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Name + Phone */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <label style={lbl}>Full Name <span style={{ color: "#e11d48" }}>*</span></label>
                                <input
                                    type="text" value={name} onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    required style={inp}
                                />
                            </div>
                            <div>
                                <label style={lbl}>Phone <span style={{ color: "#e11d48" }}>*</span></label>
                                <input
                                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                    placeholder="e.g. 9876543210"
                                    required style={inp}
                                />
                            </div>
                        </div>

                        {/* Property */}
                        <div>
                            <label style={lbl}>Target Property <span style={{ color: "#e11d48" }}>*</span></label>
                            <div style={{ position: "relative", marginTop: 6 }}>
                                <select value={propertyId} onChange={e => setPropertyId(e.target.value)} required style={{ ...inp, appearance: "none", cursor: "pointer", paddingRight: 32 }}>
                                    <option value="">— Select a property —</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} · {p.city}
                                        </option>
                                    ))}
                                </select>
                                <i className="fas fa-chevron-down" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 11 }} />
                            </div>
                        </div>

                        {/* Source */}
                        <div>
                            <label style={lbl}>Lead Source</label>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                                {SOURCES.map(s => (
                                    <button
                                        type="button" key={s.id} onClick={() => setSource(s.id)}
                                        style={{
                                            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                            cursor: "pointer", border: "1px solid",
                                            borderColor: source === s.id ? "#6366f1" : "#e2e8f0",
                                            background: source === s.id ? "#eef2ff" : "#fff",
                                            color: source === s.id ? "#4f46e5" : "#64748b",
                                            transition: "all 0.15s"
                                        }}
                                    >
                                        <i className={`fab ${s.icon}`} style={{ marginRight: 4 }} />{s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label style={lbl}>Requirement / Notes</label>
                            <textarea
                                value={message} onChange={e => setMessage(e.target.value)}
                                rows={3}
                                placeholder="e.g. Looking for AC single room, preferred ground floor..."
                                style={{ ...inp, height: "auto", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
                            />
                        </div>

                        {/* Dates */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <label style={lbl}>Preferred Move-In</label>
                                <input type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)} style={{ ...inp, marginTop: 6 }} />
                            </div>
                            <div>
                                <label style={lbl}>Follow-up Date</label>
                                <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} style={{ ...inp, marginTop: 6 }} />
                            </div>
                        </div>

                        {/* Assign Agent */}
                        <div>
                            <label style={lbl}>Assign Agent <span style={{ color: "#94a3b8", fontWeight: 600 }}>(optional)</span></label>
                            <div style={{ position: "relative", marginTop: 6 }}>
                                <select value={assignedToId} onChange={e => setAssignedId(e.target.value)} style={{ ...inp, appearance: "none", cursor: "pointer", paddingRight: 32 }}>
                                    <option value="">— Unassigned —</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                    ))}
                                </select>
                                <i className="fas fa-user-circle" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 12 }} />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ padding: "10px 14px", background: "#fff1f2", borderRadius: 10, border: "1px solid #fecdd3", fontSize: 12, fontWeight: 700, color: "#e11d48", display: "flex", alignItems: "center", gap: 8 }}>
                                <i className="fas fa-exclamation-circle" />
                                {error}
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, background: "#fafafa", flexShrink: 0 }}>
                    <button type="button" onClick={handleClose} style={{
                        flex: 1, padding: "10px 0", background: "#fff",
                        color: "#64748b", border: "1px solid #e2e8f0",
                        borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer"
                    }}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{
                            flex: 2, padding: "10px 0",
                            background: saving ? "#c7d2fe" : "linear-gradient(135deg, #4f46e5, #6366f1)",
                            color: "#fff", border: "none", borderRadius: 12,
                            fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer",
                            boxShadow: saving ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
                            transition: "all 0.2s"
                        }}
                    >
                        {saving
                            ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} />Adding Lead...</>
                            : <><i className="fas fa-plus" style={{ marginRight: 6 }} />Add to CRM</>
                        }
                    </button>
                </div>
            </div>
        </>
    );
}

const lbl: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 0
};
const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", marginTop: 6,
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 13, fontWeight: 600, color: "#334155",
    background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit"
};
