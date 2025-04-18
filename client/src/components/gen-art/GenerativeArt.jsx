import { generateArtFromMood } from "../../utils/generateArtFromMood";

//lets keep it dead simple for now, just the first most basic version to not get overwhelmed

//each mood entry -> one shape
//use inline svg


const shapeToSvg = (shape, color, index) => {
    switch (shape) {
        case "bubble":
            return <circle key={index} cx={50 + index * 60} cy={60} r={25} fill={color} />;
        case "square":
            return <rect key={index} x={index * 60} y={30} width={50} height={50} fill={color} />;
        case "triangle":
            return (
                <polygon
                    key={index}
                    points={`${30 + index * 60},10 ${10 + index * 60},50 ${50 + index * 60},50`}
                    fill={color}
                />
            );
        case "fracturedLine":
            return (
                <polyline
                    key={index}
                    points={`${10 + index * 60},30 ${30 + index * 60},10 ${50 + index * 60},50`}
                    stroke={color}
                    fill="none"
                    strokeWidth="3"
                />
            );
        case "wave":
            return (
                <path
                    key={index}
                    d={`
                      M ${index * 60},60
                      q 10,-20 20,0
                      q 10,20 20,0
                    `}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                />
            );
        default:
            return null;
    }
};

export default function GenerativeArt({ moodLogs }) {
    const artConfigs = generateArtFromMood(moodLogs);

    return (
        <svg width="100%" height="150">
            {artConfigs.map((cfg, i) => shapeToSvg(cfg.shape, cfg.color, i))}
        </svg>
    );
}