export default function HomeLoading() {
    return (
        <div className="container" style={{ paddingTop: '20px' }}>
            {/* Search skeleton */}
            <div className="skeleton-bar" style={{ height: '52px', borderRadius: '50px', marginBottom: '24px' }}></div>

            {/* Tagline skeleton */}
            <div className="skeleton-bar" style={{ height: '28px', width: '60%', margin: '0 auto 24px' }}></div>

            {/* Amenities skeleton */}
            <div style={{ display: 'flex', gap: '15px', overflowX: 'hidden', marginBottom: '30px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-bar" style={{ minWidth: '100px', height: '110px', borderRadius: '20px', flexShrink: 0 }}></div>
                ))}
            </div>

            {/* Section header skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div className="skeleton-bar" style={{ width: '160px', height: '22px' }}></div>
                <div className="skeleton-bar" style={{ width: '60px', height: '22px' }}></div>
            </div>

            {/* Property cards skeleton grid */}
            <div className="properties-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="property-card">
                        <div className="skeleton-bar" style={{ height: '160px' }}></div>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="skeleton-bar" style={{ height: '18px', width: '50%' }}></div>
                            <div className="skeleton-bar" style={{ height: '16px', width: '80%' }}></div>
                            <div className="skeleton-bar" style={{ height: '14px', width: '65%' }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .skeleton-bar {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s infinite;
                    border-radius: 8px;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
