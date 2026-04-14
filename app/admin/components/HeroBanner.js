export default function HeroBanner({ title, subtitle }) {
    return (
        <div
            style={{
                background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
                borderRadius: 24,
                padding: "40px 36px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Decorative circles */}
            <div
                style={{
                    position: "absolute",
                    top: -40,
                    right: -20,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: -60,
                    right: 120,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 20,
                    right: 200,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                }}
            />
            <h1
                style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: 8,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {title}
            </h1>
            <p
                style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 400,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {subtitle}
            </p>
        </div>
    );
}
