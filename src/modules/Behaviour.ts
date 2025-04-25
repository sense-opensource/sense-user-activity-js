import { analyzeGesture } from "../utils/Gesture";
import { KeyBinding } from "../utils/KeyBinding";
import { detectKeyboardLayout } from "../utils/KeyboardLayouts";
import { trackScroll } from "../utils/scrollingMetrics";

// This file is responsible for tracking user behaviour such as mouse movements, clicks, and keyboard strokes.
// It also includes functions to analyze gestures and detect keyboard layouts.
// It uses the globalThis object to store data that can be accessed throughout the application.
globalThis.lastX = 0;
globalThis.lastY = 0;
globalThis.lastTime = 0;
globalThis.isMouseDown = false;
globalThis.mouseData = {
    movements : [],
    clicks : [],
    speed: [],
    gesturePath : [],
    gestureType : [],
}
globalThis.keyData = {};
globalThis.keyStrokeData = [];
/* * 
 * @description This function initializes the sense behaviour by calling the initSenseBehaviour function from the Behaviour module.
 * @returns {void}
 */
export const initSenseBehaviour = async () => {

    // Scroll Metrics
    window.addEventListener("scroll", trackScroll);

    // Mouse and Gesture Tracking
    document.querySelectorAll("[data-behaviour]").forEach(input => {
        const element = input as HTMLInputElement;
        let lastKeyTime : any = null;
        let lastKeyTimeSpeed : any = {}; 
        let totalKeyHoldTime = 0;
        let totalKeyReleaseTime = 0;
        let keyPressCount = 0;
        let typingStartTime : any = null;
        let typingSpeed = 0;
        let typingEndTime = null;
        let lastKeyReleaseTime : any = null;
        let transitionTime : any = null;
        let lastTwoTimestamps: number[] = [];
        let lastThreeTimestamps: number[] = [];
        let keyCounts : { [key: string]: number } = {
            Control: 0,
            Shift: 0,
            Meta: 0,
            Tab: 0,
            Delete: 0,
            Backspace: 0,
            ArrowUp: 0,
            ArrowDown: 0,
            ArrowLeft: 0,
            ArrowRight: 0,
            CapsLock: 0,
            Enter: 0,
            Alt: 0
        };

        /**
         * Adds a keydown event listener to the element.
         * Triggered whenever a key is pressed while the element is focused.
         *
         * @param event - The KeyboardEvent triggered on key press.
         */
        element.addEventListener("keydown", function (event : KeyboardEvent) {
            const key = event.key;
            const currentTime = Date.now();
            const now = performance.now(); 
            if (lastTwoTimestamps.length === 2) {
                lastTwoTimestamps.shift();
            }
            lastTwoTimestamps.push(currentTime);
            if (lastThreeTimestamps.length === 3) {
                lastThreeTimestamps.shift();
            }
            lastThreeTimestamps.push(currentTime);
            if (lastKeyReleaseTime) {
                transitionTime = now - lastKeyReleaseTime;
            }
            lastKeyTime = currentTime;
            keyData[element.id] ??= {};
            if (!keyData[element.id][key]) {
                keyData[element.id][key] = { pressTime: now, releaseTime: null, duration: null };
            } else {
            keyData[element.id][key].pressTime = now;
            }
            typingStartTime ??= Date.now();
            lastKeyTime = now;
        });

        /**
         * Listens for the 'keyup' event on the document and logs the released key.
         *
         * @param event - The KeyboardEvent triggered when a key is released.
         * 
         * This function is useful for tracking user keyboard input,
         * such as detecting form submission, shortcut keys, or general key logging (for UX features).
         */
        element.addEventListener("keyup", function (event) {
            const key = event.key;
            const now = performance.now();
            const currentTime = Date.now();
            typingSpeed = lastKeyTimeSpeed[key] ? (currentTime - lastKeyTimeSpeed[key]) : 0;
            lastKeyTimeSpeed[key] = currentTime;
            if (keyData[element.id]?.[key]) {
                keyData[element.id][key].releaseTime = now;
                keyData[element.id][key].duration = now - keyData[element.id][key].pressTime;
            }
            if (lastKeyTime) {
                totalKeyHoldTime += now - lastKeyTime;
                keyPressCount++;
            }
            if (keyPressCount > 1) {
                totalKeyReleaseTime += (now - lastKeyTime);
            }
            lastKeyReleaseTime = now;
            if(keyCounts.hasOwnProperty(event.key)) {
                keyCounts[event.key]++;
            }
        });

        
        /**
         * Adds a blur event listener to the given element.
         * Triggered when the element loses focus (e.g., when the user clicks outside of an input).
         *
         * @param event - The FocusEvent triggered when the element loses focus.
         */
        element.addEventListener("blur", async function (event : FocusEvent) {
            const key = element.getAttribute("data-behaviour");
            typingEndTime = Date.now();
            let intervalTwoKeystrokes = null;
            let intervalThreeKeystrokes = null;
            if (keyPressCount > 0) {
                if (lastTwoTimestamps.length === 2) {
                    intervalTwoKeystrokes = lastTwoTimestamps[1] - lastTwoTimestamps[0];
                    intervalThreeKeystrokes = lastThreeTimestamps.length === 3 ? lastThreeTimestamps[2] - lastThreeTimestamps[0] : null;
                }
                let avgHoldTime = (totalKeyHoldTime / keyPressCount).toFixed(2);
                let avgReleaseTime = (totalKeyReleaseTime / (keyPressCount - 1)).toFixed(2);
                const KeyInfo : KeyInfo = {
                    id: key,
                    keyStroke: {
                        location: event.view?.location.toString() ?? "",
                        sessionStart: typingStartTime,
                        sessionEnd: typingEndTime,
                        avgTypingSpeed: typingSpeed,
                        avgReleaseTime: parseFloat(avgReleaseTime) || 0,
                        avgHoldTime: parseFloat(avgHoldTime) || 0,
                        avgDigraphsTime: intervalTwoKeystrokes ? parseFloat(intervalTwoKeystrokes.toFixed(2)) : 0,
                        avgTrigraphsTime: intervalThreeKeystrokes ? parseFloat(intervalThreeKeystrokes.toFixed(2)) : 0,
                        avgTransitionTime: transitionTime?.toFixed(2) ?? 0,
                        keyCounts: keysToLowerCase(keyCounts),
                        info: {
                            layout: await detectKeyboardLayout() || "Unknown Layout",
                            language: navigator.language
                        }
                    }
                };

                const _index : number = keyStrokeData.findIndex((item : KeyInfo | null) => item?.id === key);
                if(_index < 0){
                    keyStrokeData.push(KeyInfo);
                }else {
                    KeyBinding(keyStrokeData[_index], KeyInfo);
                }
                
            }
        });
    });

    
    /**
     * Adds a mousemove event listener to the document.
     * Triggered every time the user moves the mouse over the page.
     * Useful for tracking cursor position, calculating speed, or analyzing user behavior.
     *
     * @param event - The MouseEvent object containing details about the mouse movement,
     *                including coordinates (clientX, clientY), movement deltas, and more.
     */
    document.addEventListener("mousemove", (event : MouseEvent) => {
        
        let now = Date.now();
        let dx = event.clientX - lastX;
        let dy = event.clientY - lastY;
        let dt = now - lastTime;
        const speed : number = Math.sqrt(dx * dx + dy * dy) / dt;
        mouseData['speed'].push(speed.toFixed(3))
        lastX = event.clientX;
        lastY = event.clientY;
        lastTime = now;
        if (isMouseDown) {
            mouseData["gesturePath"].push({ x: event.clientX, y: event.clientY });
        }
        mouseData['movements'].push({ x: event.clientX, y: event.clientY}); 
    });

    /**
     * Adds a mousedown event listener to the document.
     * Triggered when the user presses any mouse button.
     * Useful for detecting user interaction, starting drag events, or tracking mouse actions.
     *
     * @param event - The MouseEvent object containing details about the mouse press,
     *                such as button pressed, coordinates, and modifier keys.
     */
    document.addEventListener("mousedown", (event : MouseEvent) => {
        let button;
        if (event.button === 0) { button = "Left"; } 
        else if (event.button === 1) { button = "Middle"; } 
        else { button = "Right"; }
        isMouseDown = true;
        mouseData["gesturePath"] = [];
        mouseData['clicks'].push({
            [button]: {
            x: event.clientX,
            y: event.clientY
            }
        })
    });

    /**
     * Adds a mouseup event listener to the document.
     * Triggered when the user releases a mouse button.
     * Commonly used to end drag operations or record mouse release coordinates.
     *
     * @param event - The MouseEvent object containing details about the mouse release,
     *                such as button released, screen/client coordinates, and modifier keys.
     */    
    document.addEventListener("mouseup", () => {
        isMouseDown = false;
        mouseData["gestureType"].push(analyzeGesture(mouseData["gesturePath"]));
    });
}

const keysToLowerCase = (obj : {[key: string]: number}) => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value])
    );
}