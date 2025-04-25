
/**
 * Represents a point in the gesture path with x and y coordinates.
 */
type Point = { x: number; y: number };

/**
 * Analyzes the gesture path and determines the type of gesture.
 * @param path - An array of points representing the gesture path.
 * @returns A string indicating the type of gesture.
 */

export const analyzeGesture = (path: Point[]): string => {
    // Return early if the path is too short to be a valid gesture
    if (path.length < 20) return "Too Short";

    const dx = path[path.length - 1].x - path[0].x;
    const dy = path[path.length - 1].y - path[0].y;

    if (isCircleGesture(path)) return "Circle";
    if (isSquareGesture(path)) return "Square";

    // Determine swipe direction based on displacement
    let direction;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            direction = "Swipe Right";
        } else {
            direction = "Swipe Left";
        }
    } else if (dy > 0) {
        direction = "Swipe Down";
    } else {
        direction = "Swipe Up";
    }
    return direction;
};

/**
 * Determines if the gesture path resembles a circle.
 * @param path - An array of points representing the gesture path.
 * @returns A boolean indicating whether the gesture is a circle.
 */ 
const isCircleGesture = (path: Point[]): boolean => {
    const { minX, maxX, minY, maxY } = getBoundingBox(path);
    const width = maxX - minX;
    const height = maxY - minY;
    const aspectRatio = width / height;

    if (aspectRatio < 0.8 || aspectRatio > 1.2) return false;

    let directionChanges = 0;
    for (let i = 1; i < path.length - 1; i++) {
        const dx1 = path[i].x - path[i - 1].x;
        const dy1 = path[i].y - path[i - 1].y;
        const dx2 = path[i + 1].x - path[i].x;
        const dy2 = path[i + 1].y - path[i].y;
        if (dx1 * dx2 < 0 || dy1 * dy2 < 0) directionChanges++;
    }
    // Return true if there are sufficient direction changes for a circle
    return directionChanges > 10;
};

/**
 * Determines if the gesture path resembles a square.
 * @param path - An array of points representing the gesture path.
 * @returns A boolean indicating whether the gesture is a square.
 */
const isSquareGesture = (path: Point[]): boolean => {
    const { minX, maxX, minY, maxY } = getBoundingBox(path);
    const width = maxX - minX;
    const height = maxY - minY;
    const aspectRatio = width / height;

    if (aspectRatio < 0.9 || aspectRatio > 1.1) return false;

    let directionChanges = 0;
    for (let i = 1; i < path.length - 1; i++) {
        const dx1 = path[i].x - path[i - 1].x;
        const dy1 = path[i].y - path[i - 1].y;
        const dx2 = path[i + 1].x - path[i].x;
        const dy2 = path[i + 1].y - path[i].y;
        if ((dx1 === 0 && dy2 !== 0) || (dy1 === 0 && dx2 !== 0)) {
        directionChanges++;
        }
    }

    return directionChanges >= 4;
};

/**
 * Calculates the bounding box of the gesture path.
 * @param path - An array of points representing the gesture path.
 * @returns An object containing the minimum and maximum x and y coordinates.
 */
const getBoundingBox = (path: Point[]): { minX: number; maxX: number; minY: number; maxY: number } => {
    const xs = path.map(p => p.x);
    const ys = path.map(p => p.y);
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys)
    };
};
