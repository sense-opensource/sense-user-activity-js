// Description: This module tracks scrolling metrics on a webpage, including scroll speed, direction, and engagement points.
// It calculates various metrics such as scroll depth, pause duration, and device-specific information.
globalThis.scrollMetrics = {};
globalThis.lastScrollTime = Date.now();
globalThis.sessionStartTime = Date.now();
globalThis.lastScrollPosition = 0;
globalThis.lastSpeed = 0;
globalThis.directionChanges = 0;
globalThis.interactionPoints = [];
globalThis.lastDirection = null;

/**
 * Function to track scrolling metrics
 * @returns {void}
 * @description This function tracks the scrolling metrics of the webpage, including scroll speed, direction, and engagement points.
*/
export const trackScroll = () => {

    const currentTime = Date.now();
    const scrollPosition = window.scrollY;
    const deltaTime = (currentTime - lastScrollTime) / 1000;
    const scrollDistance = scrollPosition - lastScrollPosition;
    const timeDepth = scrollDistance / deltaTime;
    const scrollSpeed : string = timeDepth.toFixed(2);
    const acceleration : string = ((timeDepth - lastSpeed) / deltaTime).toFixed(2);
    const direction = scrollDistance > 0 ? "down" : "up";

    if (lastDirection && lastDirection !== direction) {
        directionChanges++;
    }
    lastDirection = direction;
    if (Math.abs(scrollDistance) > 50) {
        interactionPoints.push(`section${Math.floor(secureRandomInt()) + 1} at position X:0px Y:${scrollPosition}px (${new Date().toLocaleTimeString()})`);
        if (interactionPoints.length > 4) interactionPoints.shift();
    }
    const scrollStyle = Math.abs(parseFloat(acceleration)) > 5000 ? "Jerky" : "Smooth";
    const engagementMetrics = {
        name: "Engagement Metrics",
        data: {
            scrollDepth: getScrollDepth(),
            pauseDuration: `${((currentTime - lastScrollTime) / 1000).toFixed(0)}s`,
            InteractionPoints: interactionPoints
        }
    };
    scrollMetrics = {
        name: "Scroll Metrics",
        data: {
            timestamp: new Date().toISOString(),
            scrollPosition: `${scrollPosition}px`,
            positionX: "0px",
            positionY: `${scrollPosition}px`,
            scrollSpeed: `${scrollSpeed}px/s`,
            acceleration: `${acceleration} px/s²`,
            direction: direction,
            scrollFrequency: Math.round(1 / deltaTime)
        },
        engagementMetrics: engagementMetrics,
        behavioralPatterns: {
            name: "Behavioral Patterns",
            data: {
                directionChanges: directionChanges,
                sessionDuration: `${((currentTime - sessionStartTime) / 60000).toFixed(2)} minutes`,
                scrollStyle: scrollStyle
            }
        },
        deviceSpecificMetrics: {
            name: "Device Specific Metrics",
            data: {
                deviceType: getDeviceType(),
                inputMethod: getInputMethod(),
                deviceOrientation: getDeviceOrientation()
            }
        },
        pageInteractionContext: {
            name: "Page Interaction Context",
            data: {
                contentFocus: `section${Math.floor(secureRandomInt()) + 1}`,
                engagementPoints: interactionPoints.map(p => p.split(" at ")[0]).join(", "),
                engagementExample: `Scrolled to ${getScrollDepth()} of the page, focusing on Section ${Math.floor(secureRandomInt()) + 1}`
            }
        }
    };
    lastScrollPosition = scrollPosition;
    lastScrollTime = currentTime;
    lastSpeed = parseFloat(scrollSpeed);
}

/**
 * Function to get the input method of the user
 * @returns {string} - The input method of the user (Touchscreen or Mouse/Trackpad)
 * @description This function checks if the user is using a touchscreen or a mouse/trackpad.
 */
const getInputMethod = () => navigator.maxTouchPoints > 0 ? "Touchscreen" : "Mouse/Trackpad";
const getDeviceOrientation = () => screen.width > screen.height ? "Landscape" : "Portrait";

const getScrollDepth = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? `${Math.round((scrollTop / docHeight) * 100)}%` : "0%";
}
const getDeviceType = () => {
    const ua : string = navigator.userAgent;
    if (/mobile/i.test(ua)) return "Mobile";
    if (/tablet/i.test(ua)) return "Tablet";
    if (/desktop/i.test(ua)) return "Desktop";
    return "Unknown";
}
// Genarate secure random integer
const secureRandomInt = (max = 5) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return Math.floor((array[0] / (0xFFFFFFFF + 1)) * max);
}