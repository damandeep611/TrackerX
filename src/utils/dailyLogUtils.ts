export const MINUTES_PER_DAY = 1440
export const OUTER_RADIUS = 180
export const INNER_RADIUS = 115
export const CENTER = 260 // SVG Center (width/height 520)
export const CLOCK_SIZE = 520

export const minutesToDegrees = (minutes: number) => {
  // 0 minutes = -90 degrees (12 AM at top)
  // 1440 minutes = 360 degrees
  return (minutes / MINUTES_PER_DAY) * 360 - 90
}

export const degreesToMinutes = (degrees: number) => {
  // Adjust for -90 offset
  let adjusted = degrees + 90
  if (adjusted < 0) adjusted += 360
  // Normalize to 0-360
  adjusted = adjusted % 360
  return Math.round((adjusted / 360) * MINUTES_PER_DAY)
}

export const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export const describeDonut = (x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, endAngle);
    const startInner = polarToCartesian(x, y, innerRadius, startAngle);
    const endInner = polarToCartesian(x, y, innerRadius, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", startOuter.x, startOuter.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
        "Z"
    ].join(" ");
}
