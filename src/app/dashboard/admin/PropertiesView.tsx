"use client";

import { useState, useEffect } from "react";
import { getProperties, updatePropertyStatus, deleteProperty, updatePropertyDetails, addRoom, deleteRoom, updateRoomStatus } from "@/app/actions/admin";

export default function PropertiesView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewRoomsProperty, setViewRoomsProperty] = useState<any>(null);
    const [editProperty, setEditProperty] = useState<any>(null);
    
    // Add Room state
    const [newRoomData, setNewRoomData] = useState({ type: '1BHK', rent: '', deposit: '' });

    const fetchProperties = () => {
        getProperties()
            .then((data) => {
                setProperties(data);
                
                // If a modal is open, refresh its data too
                if (viewRoomsProperty) {
                    const refreshed = data.find((p: any) => p.id === viewRoomsProperty.id);
                    if (refreshed) setViewRoomsProperty(refreshed);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleEditPropertySubmit = async (e: any) => {
        e.preventDefault();
        try {
            await updatePropertyDetails(editProperty.id, {
                title: editProperty.title,
                city: editProperty.city,
                area: editProperty.area,
                address: editProperty.address,
                masterRent: editProperty.masterRent,
                masterDeposit: editProperty.masterDeposit,
                leaseStartDate: editProperty.leaseStartDate,
                leaseEndDate: editProperty.leaseEndDate
            });
            setEditProperty(null);
            fetchProperties();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddRoomSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await addRoom(viewRoomsProperty.id, {
                type: newRoomData.type,
                rent: Number(newRoomData.rent),
                deposit: Number(newRoomData.deposit) || 0
            });
            setNewRoomData({ type: '1BHK', rent: '', deposit: '' });
            fetchProperties();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        try {
            await deleteRoom(roomId);
            fetchProperties();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleRoomStatus = async (roomId: string, currentStatus: string) => {
        try {
            await updateRoomStatus(roomId, currentStatus === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE');
            fetchProperties();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await updatePropertyStatus(id, newStatus);
            setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to completely delete this property and all its rooms?')) return;
        try {
            await deleteProperty(id);
            setProperties(properties.filter(p => p.id !== id));
        } catch (err) {
            console.error("Failed to delete property", err);
            alert("Delete failed. Please try again.");
        }
    };

    const filteredProperties = properties.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.area.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        placeholder="Search properties by name, city or area..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => onNavigate && onNavigate('New Listing')}
                    className="flex-shrink-0 w-full sm:w-auto px-6 h-[46px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <i className="fas fa-plus" /> Add New Property
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProperties.length > 0 ? (
                    filteredProperties.map((property, index) => {
                        const totalRooms = property.rooms.length;
                        const availableRooms = property.rooms.filter((r: any) => r.status === 'AVAILABLE').length;
                        const occupiedRooms = totalRooms - availableRooms;
                        
                        const expectedRevenue = property.rooms.reduce((acc: number, r: any) => acc + (r.rent || 0), 0);
                        const masterRent = property.masterRent || 0;
                        const profitMargin = masterRent ? (expectedRevenue - masterRent) : null;

                        return (
                            <div key={property.id} className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col hover:-translate-y-1 transition-all duration-300">
                                <div className="p-5 border-b border-slate-100 relative">
                                    {property.status === 'PENDING' && (
                                        <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-amber-200 shadow-sm animate-pulse">
                                            Needs Approval
                                        </div>
                                    )}
                                    {property.status === 'REJECTED' && (
                                        <div className="absolute top-4 right-4 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-rose-200 shadow-sm">
                                            Rejected
                                        </div>
                                    )}
                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 pr-24">{property.title}</h3>
                                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
                                        <i className="fas fa-map-marker-alt text-rose-500" />
                                        {property.area}, {property.city}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 space-y-5">
                                    <div className="flex justify-between items-center text-sm">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Primary Owner</span>
                                            <span className="font-semibold text-slate-800">{property.owner.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Unique ID</span>
                                            <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                                #{property.id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <div className="flex-1 text-center">
                                            <span className="block text-xl font-black text-slate-800 leading-none mb-1">{totalRooms}</span>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                                        </div>
                                        <div className="w-[1px] bg-slate-200 mx-2" />
                                        <div className="flex-1 text-center">
                                            <span className="block text-xl font-black text-emerald-600 leading-none mb-1">{availableRooms}</span>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available</span>
                                        </div>
                                        <div className="w-[1px] bg-slate-200 mx-2" />
                                        <div className="flex-1 text-center">
                                            <span className="block text-xl font-black text-rose-600 leading-none mb-1">{occupiedRooms}</span>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupied</span>
                                        </div>
                                    </div>

                                    {/* Profitability Block */}
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Room Revenue</span>
                                            <span className="font-black text-slate-800 text-sm">₹{expectedRevenue.toLocaleString()}/mo</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Master Rent</span>
                                            <span className="font-black text-slate-600 text-sm">{masterRent ? `₹${masterRent.toLocaleString()}/mo` : 'N/A'}</span>
                                        </div>
                                        {profitMargin !== null && (
                                            <div className="text-right pl-3 ml-3 border-l border-slate-200">
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Est. Profit</span>
                                                <span className={`font-black text-sm ${profitMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {profitMargin >= 0 ? '+' : '-'}₹{Math.abs(profitMargin).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50 rounded-b-2xl">
                                    {property.status === 'PENDING' ? (
                                        <div className="flex gap-2 w-full">
                                            <button onClick={() => handleUpdateStatus(property.id, 'APPROVED')} className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 text-emerald-700 hover:text-white font-bold text-[13px] rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
                                                <i className="fas fa-check-circle" /> Approve
                                            </button>
                                            <button onClick={() => handleUpdateStatus(property.id, 'REJECTED')} className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-600 border border-rose-200 text-rose-700 hover:text-white font-bold text-[13px] rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
                                                <i className="fas fa-times-circle" /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button onClick={() => setViewRoomsProperty(property)} className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-[13px] rounded-xl transition-all shadow-sm">
                                                View Rooms
                                            </button>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditProperty(property)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm" title="Edit Property">
                                                    <i className="far fa-edit" />
                                                </button>
                                                <button onClick={() => handleDelete(property.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center shadow-sm" title="Delete Property">
                                                    <i className="far fa-trash-alt" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
                            <i className="fas fa-building text-3xl text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-1">No properties found</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Adjust your search filters or click "Add New Property" to create a new listing.</p>
                    </div>
                )}
            </div>

            {/* Edit Property Modal */}
            {editProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                         <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="text-sm font-black text-slate-800">Edit Property Details</h2>
                            <button onClick={() => setEditProperty(null)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center">
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>
                        <form onSubmit={handleEditPropertySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title</label>
                                <input type="text" value={editProperty.title} onChange={e => setEditProperty({...editProperty, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">City</label>
                                    <input type="text" value={editProperty.city} onChange={e => setEditProperty({...editProperty, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Area</label>
                                    <input type="text" value={editProperty.area} onChange={e => setEditProperty({...editProperty, area: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Address</label>
                                <textarea value={editProperty.address} onChange={e => setEditProperty({...editProperty, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all resize-none h-20" required />
                            </div>
                            <div className="border-t border-slate-100 pt-3 mt-3">
                                <h3 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-widest">Master Lease Econ</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1">MASTER RENT (₹)</label>
                                        <input type="number" value={editProperty.masterRent || ''} onChange={e => setEditProperty({...editProperty, masterRent: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1">MASTER DEPOSIT (₹)</label>
                                        <input type="number" value={editProperty.masterDeposit || ''} onChange={e => setEditProperty({...editProperty, masterDeposit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditProperty(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Rooms Modal */}
            {viewRoomsProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-sm font-black text-slate-800">Rooms Inventory</h2>
                                <p className="text-[11px] font-bold text-slate-500">{viewRoomsProperty.title}</p>
                            </div>
                            <button onClick={() => setViewRoomsProperty(null)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center">
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Room List */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Existing Rooms ({viewRoomsProperty.rooms.length})</h3>
                                    {viewRoomsProperty.rooms.length === 0 ? (
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                                            <p className="text-sm font-bold text-slate-500">No rooms listed yet.</p>
                                        </div>
                                    ) : (
                                        viewRoomsProperty.rooms.map((room: any) => (
                                            <div key={room.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-800">{room.type}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${room.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                            {room.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-500">
                                                        ₹{room.rent.toLocaleString()}/mo • Dep: ₹{room.deposit.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleToggleRoomStatus(room.id, room.status)} className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border border-slate-200 transition-colors">
                                                        Toggle Status
                                                    </button>
                                                    <button onClick={() => handleDeleteRoom(room.id)} className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 transition-all flex items-center justify-center">
                                                        <i className="far fa-trash-alt text-[10px]" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Room Form */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Add New Room</h3>
                                    <form onSubmit={handleAddRoomSubmit} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Room Type</label>
                                            <select value={newRoomData.type} onChange={e => setNewRoomData({...newRoomData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all font-sans">
                                                <option value="1BHK">1BHK</option>
                                                <option value="2BHK">2BHK</option>
                                                <option value="Single Room">Single Room</option>
                                                <option value="Shared Storage">Shared Room</option>
                                                <option value="PG">PG</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Rent (₹)</label>
                                            <input type="number" required value={newRoomData.rent} onChange={e => setNewRoomData({...newRoomData, rent: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deposit (₹)</label>
                                            <input type="number" required value={newRoomData.deposit} onChange={e => setNewRoomData({...newRoomData, deposit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all" />
                                        </div>
                                        <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors flex justify-center items-center gap-2">
                                            <i className="fas fa-plus" /> Add to Property
                                        </button>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
