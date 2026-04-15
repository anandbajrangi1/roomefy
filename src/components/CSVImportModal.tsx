"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bulkCreateInquiries, getProperties } from "@/app/actions/admin";

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
    const lines = text.trim().split(/\r?\n/);
    return lines.map(line => {
        const cols: string[] = [];
        let cur = "", inQ = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQ = !inQ; }
            else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; }
            else { cur += ch; }
        }
        cols.push(cur.trim());
        return cols;
    });
}

// Expected CSV columns (case-insensitive)
const EXPECTED_COLS = ["name", "phone", "property_id", "source", "message", "preferred_move_in", "follow_up_date"];

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImported: () => void;
}

type ImportResult = { success: number; failed: number; errors: string[] } | null;

export default function CSVImportModal({ isOpen, onClose, onImported }: CSVImportModalProps) {
    const [properties, setProperties]   = useState<any[]>([]);
    const [rows, setRows]               = useState<any[]>([]);
    const [headers, setHeaders]         = useState<string[]>([]);
    const [fileName, setFileName]       = useState("");
    const [importing, setImporting]     = useState(false);
    const [result, setResult]           = useState<ImportResult>(null);
    const [dragOver, setDragOver]       = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        getProperties().then(setProperties).catch(console.error);
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const handleClose = () => {
        if (importing) return;
        setRows([]); setHeaders([]); setFileName(""); setResult(null);
        onClose();
    };

    const processFile = (file: File) => {
        if (!file.name.endsWith(".csv")) { alert("Please upload a .csv file."); return; }
        setFileName(file.name);
        setResult(null);
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target?.result as string;
            const parsed = parseCSV(text);
            if (parsed.length < 2) { alert("CSV has no data rows."); return; }
            const hdrs = parsed[0].map(h => h.toLowerCase().replace(/\s+/g, "_"));
            const dataRows = parsed.slice(1).filter(r => r.some(c => c.trim()));
            setHeaders(hdrs);
            // Map rows to objects
            setRows(dataRows.map(cols => {
                const obj: Record<string, string> = {};
                hdrs.forEach((h, i) => { obj[h] = cols[i] ?? ""; });
                return obj;
            }));
        };
        reader.readAsText(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    }, []);

    const getPropertyId = (row: any) => {
        // Try exact ID match first, then title match
        if (row.property_id) {
            const byId = properties.find(p => p.id === row.property_id);
            if (byId) return byId.id;
        }
        if (row.property_name) {
            const byName = properties.find(p => p.title?.toLowerCase() === row.property_name?.toLowerCase());
            if (byName) return byName.id;
        }
        return "";
    };

    const handleImport = async () => {
        if (!rows.length) return;
        setImporting(true);
        try {
            // Use first available property as fallback if none matched
            const fallbackPropId = properties[0]?.id || "";
            const mapped = rows.map(row => ({
                name: row.name || row.full_name || "",
                phone: row.phone || row.mobile || row.phone_number || "",
                propertyId: getPropertyId(row) || fallbackPropId,
                source: (row.source || "WALKIN").toUpperCase(),
                message: row.message || row.notes || row.requirement || "",
                preferredMoveIn: row.preferred_move_in || row.move_in_date || "",
                followUpDate: row.follow_up_date || row.follow_up || "",
            }));
            const res = await bulkCreateInquiries(mapped);
            setResult(res);
            if (res.success > 0) onImported();
        } catch (e: any) {
            setResult({ success: 0, failed: rows.length, errors: [e.message] });
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const header = "Name,Phone,Property_ID,Source,Message,Preferred_Move_In,Follow_Up_Date";
        const exampleRow = properties[0]
            ? `"Rahul Sharma",9876543210,${properties[0].id},WHATSAPP,"Looking for AC room",2026-05-01,2026-04-20`
            : `"Rahul Sharma",9876543210,PROPERTY_ID_HERE,WHATSAPP,"Looking for AC room",2026-05-01,2026-04-20`;
        const blob = new Blob([header + "\n" + exampleRow], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "roomefy_leads_template.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    const hasData = rows.length > 0;

    return (
        <>
            <div onClick={handleClose} style={{
                position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
                zIndex: 60, backdropFilter: "blur(4px)"
            }} />

            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 70, width: "min(680px, 96vw)",
                background: "#fff", borderRadius: 24,
                boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
                display: "flex", flexDirection: "column",
                maxHeight: "90vh", overflow: "hidden"
            }}>
                {/* Header */}
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", flexShrink: 0, background: "linear-gradient(135deg, #fafafa, #fff)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>
                                    <i className="fas fa-file-import" />
                                </span>
                                Import Leads from CSV
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginTop: 4 }}>
                                Upload a CSV file to bulk-import leads. Download the template to get started.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={downloadTemplate} style={{
                                padding: "6px 12px", borderRadius: 10, border: "1px solid #e2e8f0",
                                background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#64748b",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                            }}>
                                <i className="fas fa-download" /> Template
                            </button>
                            <button onClick={handleClose} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", color: "#64748b", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fas fa-times" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Drop Zone */}
                    {!hasData && !result && (
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: `2px dashed ${dragOver ? "#6366f1" : "#e2e8f0"}`,
                                borderRadius: 16, padding: "40px 24px", textAlign: "center",
                                cursor: "pointer", background: dragOver ? "#eef2ff" : "#fafafa",
                                transition: "all 0.2s"
                            }}
                        >
                            <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={onFileChange} />
                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: 36, color: dragOver ? "#6366f1" : "#cbd5e1", marginBottom: 12 }} />
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                                {dragOver ? "Drop it!" : "Drag & drop your CSV or click to browse"}
                            </p>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>
                                Supported columns: Name, Phone, Property_ID, Source, Message, Move-In, Follow-Up
                            </p>
                        </div>
                    )}

                    {/* File loaded — preview table */}
                    {hasData && !result && (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className="fas fa-file-csv" style={{ color: "#059669", fontSize: 18 }} />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{fileName}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                                        background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0"
                                    }}>
                                        {rows.length} rows detected
                                    </span>
                                </div>
                                <button onClick={() => { setRows([]); setHeaders([]); setFileName(""); }} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                                    <i className="fas fa-times" style={{ marginRight: 4 }} />Clear
                                </button>
                            </div>

                            {/* Column mapping info */}
                            <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "#92400e" }}>
                                <i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }} />
                                Make sure your CSV has a <strong>Property_ID</strong> column matching the IDs in Roomefy. No match = first available property used.
                            </div>

                            {/* Preview table */}
                            <div style={{ border: "1px solid #f1f5f9", borderRadius: 12, overflow: "hidden", overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                            {["#", "Name", "Phone", "Property", "Source", "Notes"].map(h => (
                                                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 800, fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.slice(0, 8).map((row, i) => {
                                            const propId = getPropertyId(row);
                                            const prop = properties.find(p => p.id === propId);
                                            return (
                                                <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                                                    <td style={{ padding: "8px 12px", color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                                                    <td style={{ padding: "8px 12px", fontWeight: 700, color: row.name ? "#0f172a" : "#fca5a5" }}>
                                                        {row.name || row.full_name || <span style={{ color: "#e11d48" }}>⚠️ Missing</span>}
                                                    </td>
                                                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#334155" }}>
                                                        {row.phone || row.mobile || <span style={{ color: "#e11d48" }}>⚠️ Missing</span>}
                                                    </td>
                                                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                                                        {prop ? (
                                                            <span style={{ color: "#059669" }}>{prop.title}</span>
                                                        ) : (
                                                            <span style={{ color: "#f59e0b" }}>⚠️ No match</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#64748b" }}>{row.source || "WALKIN"}</td>
                                                    <td style={{ padding: "8px 12px", color: "#94a3b8", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {row.message || row.notes || "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {rows.length > 8 && (
                                    <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "#f8fafc", textAlign: "center" }}>
                                        + {rows.length - 8} more rows not shown
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Import result */}
                    {result && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div style={{ padding: "16px", borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", textAlign: "center" }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: "#059669" }}>{result.success}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", textTransform: "uppercase", marginTop: 4 }}>Imported ✅</div>
                                </div>
                                <div style={{ padding: "16px", borderRadius: 12, background: result.failed ? "#fff1f2" : "#f8fafc", border: `1px solid ${result.failed ? "#fecdd3" : "#e2e8f0"}`, textAlign: "center" }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: result.failed ? "#e11d48" : "#94a3b8" }}>{result.failed}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: result.failed ? "#9f1239" : "#64748b", textTransform: "uppercase", marginTop: 4 }}>Failed {result.failed ? "❌" : ""}</div>
                                </div>
                            </div>
                            {result.errors.length > 0 && (
                                <div style={{ padding: "12px 14px", background: "#fff1f2", borderRadius: 10, border: "1px solid #fecdd3" }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: "#e11d48", marginBottom: 6, textTransform: "uppercase" }}>Error Details</div>
                                    {result.errors.slice(0, 5).map((err, i) => (
                                        <div key={i} style={{ fontSize: 12, fontWeight: 600, color: "#9f1239", marginBottom: 3 }}>• {err}</div>
                                    ))}
                                    {result.errors.length > 5 && (
                                        <div style={{ fontSize: 11, color: "#94a3b8" }}>+ {result.errors.length - 5} more errors</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, background: "#fafafa", flexShrink: 0 }}>
                    {result ? (
                        <button onClick={handleClose} style={{
                            flex: 1, padding: "10px 0", background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer"
                        }}>
                            <i className="fas fa-check" style={{ marginRight: 6 }} />Done — View in CRM
                        </button>
                    ) : (
                        <>
                            <button onClick={handleClose} style={{
                                flex: 1, padding: "10px 0", background: "#fff",
                                color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer"
                            }}>
                                Cancel
                            </button>
                            <button
                                onClick={hasData ? handleImport : () => fileInputRef.current?.click()}
                                disabled={importing}
                                style={{
                                    flex: 2, padding: "10px 0",
                                    background: importing ? "#bae6fd" : hasData ? "linear-gradient(135deg, #0ea5e9, #6366f1)" : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                                    color: importing || !hasData ? "#94a3b8" : "#fff",
                                    border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800,
                                    cursor: importing ? "not-allowed" : "pointer",
                                    boxShadow: hasData && !importing ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
                                    transition: "all 0.2s"
                                }}
                            >
                                {importing
                                    ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} />Importing {rows.length} rows...</>
                                    : hasData
                                    ? <><i className="fas fa-file-import" style={{ marginRight: 6 }} />Import {rows.length} Leads</>
                                    : <><i className="fas fa-folder-open" style={{ marginRight: 6 }} />Select CSV File</>
                                }
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
