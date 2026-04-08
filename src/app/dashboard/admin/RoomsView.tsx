"use client";

import { useState, useEffect } from "react";
import { getAllRoomsAdmin, updateRoomAdvanced, deleteRoom } from "@/app/actions/admin";
import { UploadDropzone } from "@/lib/uploadthing";

export default function RoomsView() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editRoom, setEditRoom] = useState<any>(null);

    const fetchRooms = () => {
        setLoading(true);
        getAllRoomsAdmin()
            .then(data => { setRooms(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    };

    useEffect(() => { fetchRooms(); }, []);

    const handleRoomUpdate = async (e: any) => {
        e.preventDefault();
        try {
            await updateRoomAdvanced(editRoom.id, editRoom);
            setEditRoom(null);
            fetchRooms();
        } catch (err) {
            console.error("Failed to update room:", err);
            alert("Failed to update room.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you certain you want to delete this specific room? Active bookings will be compromised.')) return;
        try {
            await deleteRoom(id);
            fetchRooms();
        } catch (err) {
            console.error("Failed to delete room:", err);
        }
    };

    const filteredRooms = rooms.filter(r => 
        r.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.roomCategory.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all font-sans";
    const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                <div className="relative flex-1 w-full max-w-md">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all cursor-text font-medium"
                        placeholder="Search rooms by type, property name, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-4 pl-6 whitespace-nowrap">Room Identifier</th>
                                <th className="p-4 whitespace-nowrap">Property</th>
                                <th className="p-4 whitespace-nowrap">Economics</th>
                                <th className="p-4 whitespace-nowrap">Physical Layout</th>
                                <th className="p-4 whitespace-nowrap">Occupancy</th>
                                <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600 cursor-default">
                            {filteredRooms.length > 0 ? filteredRooms.map((room) => {
                                const activeBooking = room.bookings?.find((b:any) => b.status === "ACTIVE" || b.status === "CONFIRMED" || b.status === "PENDING");
                                return (
                                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4 pl-6 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${room.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                    <i className="fas fa-door-open text-lg"></i>
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800">{room.roomCategory}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5 border border-slate-200 px-2 py-0.5 rounded shadow-sm inline-block">{room.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-black text-slate-800 line-clamp-1">{room.property.title}</div>
                                            <div className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1"><i className="fas fa-map-marker-alt text-rose-400"></i> {room.property.city}</div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="text-sm font-black text-emerald-600">₹{room.rent.toLocaleString()}/mo</div>
                                            <div className="text-[11px] text-slate-400 font-bold mt-1">Dep: ₹{room.deposit.toLocaleString()}</div>
                                        </td>
                                        <td className="p-4 align-top space-y-1">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                                <i className="fas fa-bath text-slate-400 w-3"></i> {room.bathroomType}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                                <i className="fas fa-couch text-slate-400 w-3"></i> {room.furnishing}
                                            </div>
                                            {room.hasBalcony && (
                                                <div className="inline-flex items-center gap-1 bg-sky-50 border border-sky-100 text-sky-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1">
                                                    <i className="fas fa-sun text-sky-500"></i> Attached Balcony
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            {room.status === 'AVAILABLE' ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> VACANT
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black tracking-widest uppercase shadow-sm mb-1.5">
                                                        <i className="fas fa-lock text-[8px]"></i> OCCUPIED
                                                    </div>
                                                    {activeBooking && (
                                                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px]"><i className="fas fa-user"></i></div>
                                                            {activeBooking.tenant.name}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditRoom(room)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm" title="Advanced Edit">
                                                    <i className="far fa-edit" />
                                                </button>
                                                <button onClick={() => handleDelete(room.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center shadow-sm" title="Delete Room">
                                                    <i className="far fa-trash-alt" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center bg-slate-50/30">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                            <i className="fas fa-door-closed text-2xl text-slate-300"></i>
                                        </div>
                                        <div className="font-bold text-slate-600">No rooms found.</div>
                                        <div className="text-sm mt-1 text-slate-400">Add rooms via the specific property card.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-sm font-black text-slate-800">Advanced Room Matrix</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{editRoom.property.title}</p>
                            </div>
                            <button onClick={() => setEditRoom(null)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center">
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleRoomUpdate} className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {/* Basic Econ */}
                                <div className="col-span-2 md:col-span-3 pb-3 border-b border-slate-100 mb-2 font-black text-sm text-slate-800"><i className="fas fa-wallet text-slate-400 mr-2"></i>Economy & Type</div>
                                
                                <div>
                                    <label className={labelCls}>Lease Status</label>
                                    <select value={editRoom.status} onChange={e => setEditRoom({...editRoom, status: e.target.value})} className={inputCls + (editRoom.status === 'AVAILABLE' ? ' text-emerald-600' : ' text-rose-600')}>
                                        <option value="AVAILABLE">AVAILABLE (Vacant)</option>
                                        <option value="OCCUPIED">OCCUPIED</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Listing Type</label>
                                    <select value={editRoom.type} onChange={e => setEditRoom({...editRoom, type: e.target.value})} className={inputCls}>
                                        <option value="Single Room">Single Room</option><option value="Shared Storage">Shared Room</option><option value="1BHK">1BHK</option><option value="PG">PG Bed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Capacity (Beds)</label>
                                    <input type="number" min="1" value={editRoom.capacity} onChange={e => setEditRoom({...editRoom, capacity: e.target.value})} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Monthly Rent (₹)</label>
                                    <input type="number" value={editRoom.rent} onChange={e => setEditRoom({...editRoom, rent: e.target.value})} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Deposit Base (₹)</label>
                                    <input type="number" value={editRoom.deposit} onChange={e => setEditRoom({...editRoom, deposit: e.target.value})} className={inputCls} />
                                </div>

                                {/* Physical Traits */}
                                <div className="col-span-2 md:col-span-3 pt-4 pb-3 border-b border-slate-100 mb-2 mt-2 font-black text-sm text-slate-800"><i className="fas fa-bed text-slate-400 mr-2"></i>Physical Architecture</div>
                                
                                <div className="col-span-2">
                                    <label className={labelCls}>Room Category Designation</label>
                                    <select value={editRoom.roomCategory} onChange={e => setEditRoom({...editRoom, roomCategory: e.target.value})} className={inputCls}>
                                        <option value="Standard Room">Standard Room</option><option value="Master Bedroom">Master Bedroom</option><option value="Study Room">Study Room</option><option value="Balcony Room">Balcony Suite</option><option value="Servant Quarter">Servant Quarter</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Bathroom Config</label>
                                    <select value={editRoom.bathroomType} onChange={e => setEditRoom({...editRoom, bathroomType: e.target.value})} className={inputCls}>
                                        <option value="Shared">Shared Bathroom</option><option value="Attached Private">Attached Private</option><option value="Common Floor">Common Floor</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>Furnishing Status</label>
                                    <select value={editRoom.furnishing} onChange={e => setEditRoom({...editRoom, furnishing: e.target.value})} className={inputCls}>
                                        <option value="Unfurnished">Unfurnished</option><option value="Semi-Furnished">Semi-Furnished</option><option value="Fully Furnished">Fully Furnished</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-5 pl-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={editRoom.hasBalcony} onChange={e => setEditRoom({...editRoom, hasBalcony: e.target.checked})} className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500" />
                                        <span className="text-sm font-bold text-slate-700">Has Private Balcony</span>
                                    </label>
                                </div>

                                {/* Gallery Section */}
                                <div className="col-span-2 md:col-span-3 pt-4 pb-3 border-b border-slate-100 mb-2 mt-2 font-black text-sm text-slate-800"><i className="fas fa-images text-slate-400 mr-2"></i>Gallery & Visuals</div>
                                
                                <div className="col-span-2 md:col-span-3">
                                    <label className={labelCls}>Current Images</label>
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {editRoom.images?.split(',').filter(Boolean).map((img: string, idx: number) => (
                                            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group/img">
                                                <img src={img} alt="Room" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const current = editRoom.images.split(',').filter(Boolean);
                                                        const updated = current.filter((_:any, i:any) => i !== idx).join(',');
                                                        setEditRoom({...editRoom, images: updated});
                                                    }}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-rose-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                >
                                                    <i className="fas fa-times text-[10px]" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4">
                                        <UploadDropzone
                                            endpoint="roomImage"
                                            onClientUploadComplete={(res) => {
                                                const newUrls = res.map(f => f.url).join(',');
                                                const current = editRoom.images ? editRoom.images + ',' : '';
                                                setEditRoom({...editRoom, images: current + newUrls});
                                                alert("Upload complete!");
                                            }}
                                            onUploadError={(error: Error) => {
                                                alert(`ERROR! ${error.message}`);
                                            }}
                                            appearance={{
                                                button: "bg-rose-600 text-sm font-bold rounded-xl px-6 py-2.5 shadow-md hover:bg-rose-700 transition-all",
                                                container: "border-none p-0",
                                                allowedContent: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2"
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-100">
                                <button type="button" onClick={() => setEditRoom(null)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors shadow-md">Deploy Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
