"use client";

import { useState, useEffect } from 'react';
import { getOwners, createProperty } from '@/app/actions/admin';
import { UploadDropzone } from '@/lib/uploadthing';

const AMENITIES_LIST = [
    { id: 'wifi', icon: 'fa-wifi', label: 'High-Speed WiFi' },
    { id: 'ac', icon: 'fa-snowflake', label: 'Air Conditioning' },
    { id: 'power', icon: 'fa-bolt', label: 'Power Backup' },
    { id: 'security', icon: 'fa-shield-alt', label: '24/7 Security' },
    { id: 'parking', icon: 'fa-parking', label: 'Parking Space' },
    { id: 'gym', icon: 'fa-dumbbell', label: 'Fitness Center' },
    { id: 'laundry', icon: 'fa-tshirt', label: 'Laundry Service' },
    { id: 'housekeeping', icon: 'fa-broom', label: 'Housekeeping' },
    { id: 'food', icon: 'fa-utensils', label: 'Meal Service' },
    { id: 'gaming', icon: 'fa-gamepad', label: 'Gaming Zone' }
];

export default function NewListingView() {
    const [step, setStep] = useState(1);
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [propertyData, setPropertyData] = useState({
        title: '', city: '', area: '', address: '', ownerId: '', 
        description: '', whyChoose: '',
        masterRent: '', masterDeposit: '', leaseStartDate: '', leaseEndDate: '',
        amenities: [] as string[],
        rooms: [{ type: 'Single Room', rent: '', deposit: '', amenities: [], images: [] as string[] }]
    });

    useEffect(() => { getOwners().then(setOwners).catch(console.error); }, []);

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handlePropertyChange = (e: any) => setPropertyData({ ...propertyData, [e.target.name]: e.target.value });

    const toggleAmenity = (id: string) => {
        const updated = propertyData.amenities.includes(id) ? propertyData.amenities.filter(a => a !== id) : [...propertyData.amenities, id];
        setPropertyData({ ...propertyData, amenities: updated });
    };

    const addRoom = () => setPropertyData({ ...propertyData, rooms: [...propertyData.rooms, { type: 'Shared Room', rent: '', deposit: '', amenities: [], images: [] }] });
    const removeRoom = (index: number) => {
        const updated = [...propertyData.rooms];
        updated.splice(index, 1);
        setPropertyData({ ...propertyData, rooms: updated });
    };

    const handleRoomChange = (index: number, field: string, value: any) => {
        const updated = [...propertyData.rooms];
        (updated[index] as any)[field] = value;
        setPropertyData({ ...propertyData, rooms: updated });
    };

    const removeImage = (roomIndex: number, imageIndex: number) => {
        const updated = [...propertyData.rooms];
        updated[roomIndex].images.splice(imageIndex, 1);
        setPropertyData({ ...propertyData, rooms: updated });
    };

    const handleSubmit = async () => {
        if (!propertyData.title || !propertyData.city || !propertyData.area || !propertyData.address) {
            alert("Please fill in all basic property details.");
            return;
        }
        if (!propertyData.ownerId) {
            alert("Please assign an Owner to the property.");
            return;
        }
        for (const room of propertyData.rooms) {
            if (!room.rent || isNaN(Number(room.rent)) || Number(room.rent) <= 0) {
                alert("Please enter a valid monthly rent for all rooms.");
                return;
            }
        }

        setLoading(true);
        try {
            await createProperty(propertyData); 
            setSuccess(true);
        } catch (err) { 
            console.error("Failed to create property:", err);
            alert("Failed to create property. Please try again."); 
        } finally { 
            setLoading(false); 
        }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 outline-none focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-semibold text-slate-800 text-sm";
    const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    if (success) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 text-center max-w-2xl mx-auto mt-10 animate-fadeUp">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                    <i className="fas fa-check text-4xl text-emerald-500"></i>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Property Published Successfully!</h2>
                <p className="text-slate-500 font-medium mb-10">Your new premium listing is now live and visible to potential tenants across the platform.</p>
                <button className="px-8 py-4 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-md" onClick={() => window.location.reload()}>
                    Add Another Property
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Stepper */}
            <div className="flex items-center justify-between relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-full before:h-1 before:bg-slate-100 before:-z-10">
                {[
                    { num: 1, label: 'Basic Info' },
                    { num: 2, label: 'Amenities' },
                    { num: 3, label: 'Rooms' },
                    { num: 4, label: 'Review' }
                ].map(s => (
                    <div key={s.num} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                            step >= s.num ? (step > s.num ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white shadow-[0_0_0_4px_rgba(225,29,72,0.1)]') : 'bg-white text-slate-300 border-2 border-slate-100'
                        }`}>
                            {step > s.num ? <i className="fas fa-check"></i> : s.num}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                {step === 1 && (
                    <div className="animate-fadeInAdmin space-y-6">
                        <div className="border-b border-slate-100 pb-5">
                            <h2 className="text-2xl font-black text-slate-900">Property Details</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Tell us about the property's identity and location.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelCls}>Property Title</label>
                                <input name="title" value={propertyData.title} onChange={handlePropertyChange} className={inputCls} placeholder="e.g. Royal Living Residences" />
                            </div>
                            <div>
                                <label className={labelCls}>City</label>
                                <select name="city" value={propertyData.city} onChange={handlePropertyChange} className={inputCls}>
                                    <option value="">Select City</option><option value="Gurgaon">Gurgaon</option><option value="Noida">Noida</option><option value="Delhi">Delhi</option><option value="Bangalore">Bangalore</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Area / Sector</label>
                                <input name="area" value={propertyData.area} onChange={handlePropertyChange} className={inputCls} placeholder="e.g. Sector 56" />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Full Address</label>
                                <textarea name="address" value={propertyData.address} onChange={handlePropertyChange} rows={2} className={inputCls} placeholder="Complete building address..."></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>About Property (Description)</label>
                                <textarea name="description" value={(propertyData as any).description} onChange={handlePropertyChange} rows={3} className={inputCls} placeholder="Describe the property, vibe, surroundings..."></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Why Choose Roomefy at this Property?</label>
                                <textarea name="whyChoose" value={(propertyData as any).whyChoose} onChange={handlePropertyChange} rows={3} className={inputCls} placeholder="Key highlights, safety, community, convenience..."></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Assign Owner (Landlord)</label>
                                <select name="ownerId" value={propertyData.ownerId} onChange={handlePropertyChange} className={inputCls}>
                                    <option value="">Select an Owner</option>
                                    {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                                <h3 className="text-sm font-black text-slate-800 mb-4">Master Lease Economics (Optional)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Master Rent Per Month</label>
                                        <input type="number" name="masterRent" value={propertyData.masterRent} onChange={handlePropertyChange} className={inputCls} placeholder="₹ Amount paid to landlord" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Master Security Deposit</label>
                                        <input type="number" name="masterDeposit" value={propertyData.masterDeposit} onChange={handlePropertyChange} className={inputCls} placeholder="₹ Amount given to landlord" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Lease Start Date</label>
                                        <input type="date" name="leaseStartDate" value={propertyData.leaseStartDate} onChange={handlePropertyChange} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Lease End Date</label>
                                        <input type="date" name="leaseEndDate" value={propertyData.leaseEndDate} onChange={handlePropertyChange} className={inputCls} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fadeInAdmin space-y-6">
                        <div className="border-b border-slate-100 pb-5">
                            <h2 className="text-2xl font-black text-slate-900">Common Amenities</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Select the premium facilities shared across all rooms.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {AMENITIES_LIST.map(amenity => {
                                const selected = propertyData.amenities.includes(amenity.id);
                                return (
                                    <div key={amenity.id} className={`flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all border-2 text-center aspect-square ${selected ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-[0_4px_12px_rgba(225,29,72,0.1)]' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-600'}`} onClick={() => toggleAmenity(amenity.id)}>
                                        <i className={`fas ${amenity.icon} text-2xl mb-3`}></i>
                                        <span className="text-[11px] font-black uppercase tracking-wider">{amenity.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fadeInAdmin space-y-6">
                        <div className="border-b border-slate-100 pb-5">
                            <h2 className="text-2xl font-black text-slate-900">Room Inventory</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Define individual rooms or shared accommodation types.</p>
                        </div>
                        <div className="space-y-6">
                            {propertyData.rooms.map((room, index) => (
                                <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group">
                                    {index > 0 && (
                                        <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors" onClick={() => removeRoom(index)}>
                                            <i className="fas fa-trash-alt text-xs" />
                                        </button>
                                    )}
                                    <h3 className="text-sm font-black text-slate-800 mb-5 pb-3 border-b border-slate-200/50">Room Configuration #{index + 1}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Room Category</label>
                                            <select value={room.type} onChange={(e) => handleRoomChange(index, 'type', e.target.value)} className={inputCls + " !bg-white"}>
                                                <option value="Single Room">Single Private Room</option>
                                                <option value="Double Sharing">Double Sharing (Premium)</option>
                                                <option value="Triple Sharing">Triple Sharing (Budget)</option>
                                                <option value="Master Suite">Master Suite (Super-premium)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Status</label>
                                            <select disabled className={inputCls + " opacity-50 cursor-not-allowed"}>
                                                <option>Available Immediately</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Monthly Rent (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input type="number" value={room.rent} onChange={(e) => handleRoomChange(index, 'rent', e.target.value)} className={inputCls + " !bg-white pl-8"} placeholder="15000" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Security Deposit (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input type="number" value={room.deposit} onChange={(e) => handleRoomChange(index, 'deposit', e.target.value)} className={inputCls + " !bg-white pl-8"} placeholder="15000" />
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2 pt-4">
                                            <label className={labelCls}>Room Photos</label>
                                            
                                            {room.images && room.images.length > 0 && (
                                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                                                    {room.images.map((url: string, imgIdx: number) => (
                                                        <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const updated = [...room.images];
                                                                    updated.splice(imgIdx, 1);
                                                                    handleRoomChange(index, 'images', updated);
                                                                }}
                                                                className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <i className="fas fa-times text-[8px]" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6">
                                                <UploadDropzone
                                                    endpoint="roomImage"
                                                    onClientUploadComplete={(res) => {
                                                        const urls = res.map(f => f.url);
                                                        handleRoomChange(index, 'images', [...room.images, ...urls]);
                                                    }}
                                                    appearance={{
                                                        button: "bg-slate-900 text-xs font-bold rounded-lg px-6 py-2 shadow-sm",
                                                        container: "border-none p-0",
                                                        allowedContent: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-rose-400 hover:text-rose-600 text-slate-500 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2" onClick={addRoom}>
                            <i className="fas fa-plus"></i> Add Another Room Type
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fadeInAdmin space-y-6">
                        <div className="border-b border-slate-100 pb-5">
                            <h2 className="text-2xl font-black text-slate-900">Review & Publish</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Verify all details before making this property public.</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 text-sm">
                                <div>
                                    <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Property Name</span>
                                    <span className="font-bold text-slate-800 text-base">{propertyData.title || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Location</span>
                                    <span className="font-bold text-slate-800 text-base">{propertyData.area}, {propertyData.city}</span>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Amenities</span>
                                    <div className="flex flex-wrap gap-2">
                                        {propertyData.amenities.map(a => (
                                            <span key={a} className="bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-slate-200">
                                                {AMENITIES_LIST.find(al => al.id === a)?.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-1 sm:col-span-2 mt-2 pt-6 border-t border-slate-200">
                                    <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">Room Summary</span>
                                    <div className="space-y-3">
                                        {propertyData.rooms.map((r, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white px-5 py-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100">
                                                <span className="font-black text-slate-800">{r.type}</span>
                                                <span className="text-rose-600 font-black">₹{parseInt(r.rent || '0').toLocaleString()} / mo</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                            <i className="fas fa-info-circle text-amber-500 mt-0.5 text-lg"></i>
                            <p className="text-xs text-amber-800 font-semibold leading-relaxed">By clicking submit, this property will be live on the tenant search portal. Ensure the address, amenities, and room pricing are accurate before proceeding.</p>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button className={`px-6 py-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-xl transition-all ${step === 1 ? 'invisible' : 'visible'}`} onClick={prevStep}>
                        Back
                    </button>
                    {step < 4 ? (
                        <button className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-md ml-auto" onClick={nextStep}>
                            Next Step
                        </button>
                    ) : (
                        <button className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-600/20 ml-auto flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait" onClick={handleSubmit} disabled={loading}>
                            {loading ? <><i className="fas fa-spinner fa-spin" /> Publishing...</> : <><i className="fas fa-paper-plane" /> Publish Listing</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
