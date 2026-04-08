export default function SearchLoading() {
    return (
        <div className="container search-main">
            {/* Filter pills skeleton */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-bar" style={{ width: '110px', height: '38px', borderRadius: '50px' }}></div>
                ))}
            </div>

            {/* Results count skeleton */}
            <div className="skeleton-bar" style={{ width: '220px', height: '22px', marginBottom: '20px' }}></div>

            {/* Property cards skeleton grid */}
            <div className="properties-grid">
                {Array.from({ length: 6 }).map((_, i) => (
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
