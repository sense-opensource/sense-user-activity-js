var SenseOS = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    /**
     * Analyzes the gesture path and determines the type of gesture.
     * @param path - An array of points representing the gesture path.
     * @returns A string indicating the type of gesture.
     */
    const analyzeGesture = (path) => {
        // Return early if the path is too short to be a valid gesture
        if (path.length < 20)
            return "Too Short";
        const dx = path[path.length - 1].x - path[0].x;
        const dy = path[path.length - 1].y - path[0].y;
        if (isCircleGesture(path))
            return "Circle";
        if (isSquareGesture(path))
            return "Square";
        // Determine swipe direction based on displacement
        let direction;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                direction = "Swipe Right";
            }
            else {
                direction = "Swipe Left";
            }
        }
        else if (dy > 0) {
            direction = "Swipe Down";
        }
        else {
            direction = "Swipe Up";
        }
        return direction;
    };
    /**
     * Determines if the gesture path resembles a circle.
     * @param path - An array of points representing the gesture path.
     * @returns A boolean indicating whether the gesture is a circle.
     */
    const isCircleGesture = (path) => {
        const { minX, maxX, minY, maxY } = getBoundingBox(path);
        const width = maxX - minX;
        const height = maxY - minY;
        const aspectRatio = width / height;
        if (aspectRatio < 0.8 || aspectRatio > 1.2)
            return false;
        let directionChanges = 0;
        for (let i = 1; i < path.length - 1; i++) {
            const dx1 = path[i].x - path[i - 1].x;
            const dy1 = path[i].y - path[i - 1].y;
            const dx2 = path[i + 1].x - path[i].x;
            const dy2 = path[i + 1].y - path[i].y;
            if (dx1 * dx2 < 0 || dy1 * dy2 < 0)
                directionChanges++;
        }
        // Return true if there are sufficient direction changes for a circle
        return directionChanges > 10;
    };
    /**
     * Determines if the gesture path resembles a square.
     * @param path - An array of points representing the gesture path.
     * @returns A boolean indicating whether the gesture is a square.
     */
    const isSquareGesture = (path) => {
        const { minX, maxX, minY, maxY } = getBoundingBox(path);
        const width = maxX - minX;
        const height = maxY - minY;
        const aspectRatio = width / height;
        if (aspectRatio < 0.9 || aspectRatio > 1.1)
            return false;
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
    const getBoundingBox = (path) => {
        const xs = path.map(p => p.x);
        const ys = path.map(p => p.y);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    };

    const KeyBinding = (initial, current) => {
        if (initial.keyStroke && current.keyStroke) {
            const keysToAverage = ["avgTypingSpeed", "avgReleaseTime", "avgHoldTime", "avgDigraphsTime", "avgTrigraphsTime", "avgTransitionTime"];
            // Averaging keyStroke values
            keysToAverage.forEach((key) => {
                initial.keyStroke[key] = (Number(initial.keyStroke[key]) + Number(current.keyStroke[key])) / 2;
            });
            // Summing up key counts
            const keysToCount = ["control", "shift", "meta", "tab", "delete", "backspace", "arrowup", "arrowdown", "arrowleft", "arrowright", "capslock", "enter", "alt"];
            keysToCount.forEach((key) => {
                initial.keyStroke.keyCounts[key] = (initial.keyStroke.keyCounts[key] || 0) + (current.keyStroke.keyCounts[key] || 0);
            });
            // Updating sessionEnd
            initial.keyStroke["sessionEnd"] = current.keyStroke["sessionEnd"];
        }
    };

    /**
     * Array of known keyboard layouts with their corresponding key mappings.
     */
    const layouts = [
        { name: "AZERTY", keys: { KeyQ: "a", KeyA: "q", KeyZ: "w" } },
        { name: "QWERTY", keys: { KeyQ: "q", KeyA: "a", KeyZ: "z" } },
        { name: "DVORAK", keys: { KeyQ: "'", KeyA: "a", KeyZ: ";" } },
        { name: "COLEMAK", keys: { KeyQ: "q", KeyA: "a", KeyZ: "z", KeyW: "w", KeyM: "m" } },
        { name: "ЙЦУКЕН (Russian)", keys: { KeyQ: "Й", KeyW: "Ц" } }
    ];
    /**
     * Detects the current keyboard layout based on the key mappings.
     * @returns {Promise<Layout>} The detected keyboard layout.
     */
    const detectKeyboardLayout = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if (!((_a = navigator.keyboard) === null || _a === void 0 ? void 0 : _a.getLayoutMap)) {
            return "Unknown Layout";
        }
        const keyboardLayoutMap = yield navigator.keyboard.getLayoutMap();
        const sampleKeys = {
            KeyQ: (_b = keyboardLayoutMap.get("KeyQ")) !== null && _b !== void 0 ? _b : "",
            KeyW: (_c = keyboardLayoutMap.get("KeyW")) !== null && _c !== void 0 ? _c : "",
            KeyZ: (_d = keyboardLayoutMap.get("KeyZ")) !== null && _d !== void 0 ? _d : "",
            KeyA: (_e = keyboardLayoutMap.get("KeyA")) !== null && _e !== void 0 ? _e : "",
            KeyM: (_f = keyboardLayoutMap.get("KeyM")) !== null && _f !== void 0 ? _f : "",
        };
        for (const { name, keys } of layouts) {
            const isMatch = Object.entries(keys).every(([key, value]) => sampleKeys[key] === value);
            if (isMatch) {
                return name;
            }
        }
        return "Unknown Layout";
    });

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
    const trackScroll = () => {
        const currentTime = Date.now();
        const scrollPosition = window.scrollY;
        const deltaTime = (currentTime - lastScrollTime) / 1000;
        const scrollDistance = scrollPosition - lastScrollPosition;
        const timeDepth = scrollDistance / deltaTime;
        const scrollSpeed = timeDepth.toFixed(2);
        const acceleration = ((timeDepth - lastSpeed) / deltaTime).toFixed(2);
        const direction = scrollDistance > 0 ? "down" : "up";
        if (lastDirection && lastDirection !== direction) {
            directionChanges++;
        }
        lastDirection = direction;
        if (Math.abs(scrollDistance) > 50) {
            interactionPoints.push(`section${Math.floor(secureRandomInt()) + 1} at position X:0px Y:${scrollPosition}px (${new Date().toLocaleTimeString()})`);
            if (interactionPoints.length > 4)
                interactionPoints.shift();
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
    };
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
    };
    const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua))
            return "Mobile";
        if (/tablet/i.test(ua))
            return "Tablet";
        if (/desktop/i.test(ua))
            return "Desktop";
        return "Unknown";
    };
    // Genarate secure random integer
    const secureRandomInt = (max = 5) => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return Math.floor((array[0] / (0xFFFFFFFF + 1)) * max);
    };

    // This file is responsible for tracking user behaviour such as mouse movements, clicks, and keyboard strokes.
    // It also includes functions to analyze gestures and detect keyboard layouts.
    // It uses the globalThis object to store data that can be accessed throughout the application.
    globalThis.lastX = 0;
    globalThis.lastY = 0;
    globalThis.lastTime = 0;
    globalThis.isMouseDown = false;
    globalThis.mouseData = {
        movements: [],
        clicks: [],
        speed: [],
        gesturePath: [],
        gestureType: [],
    };
    globalThis.keyData = {};
    globalThis.keyStrokeData = [];
    /* *
     * @description This function initializes the sense behaviour by calling the initSenseBehaviour function from the Behaviour module.
     * @returns {void}
     */
    const initSenseBehaviour = () => __awaiter(void 0, void 0, void 0, function* () {
        // Scroll Metrics
        window.addEventListener("scroll", trackScroll);
        // Mouse and Gesture Tracking
        document.querySelectorAll("[data-behaviour]").forEach(input => {
            const element = input;
            let lastKeyTime = null;
            let lastKeyTimeSpeed = {};
            let totalKeyHoldTime = 0;
            let totalKeyReleaseTime = 0;
            let keyPressCount = 0;
            let typingStartTime = null;
            let typingSpeed = 0;
            let typingEndTime = null;
            let lastKeyReleaseTime = null;
            let transitionTime = null;
            let lastTwoTimestamps = [];
            let lastThreeTimestamps = [];
            let keyCounts = {
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
            element.addEventListener("keydown", function (event) {
                var _a;
                var _b;
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
                (_a = keyData[_b = element.id]) !== null && _a !== void 0 ? _a : (keyData[_b] = {});
                if (!keyData[element.id][key]) {
                    keyData[element.id][key] = { pressTime: now, releaseTime: null, duration: null };
                }
                else {
                    keyData[element.id][key].pressTime = now;
                }
                typingStartTime !== null && typingStartTime !== void 0 ? typingStartTime : (typingStartTime = Date.now());
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
                var _a;
                const key = event.key;
                const now = performance.now();
                const currentTime = Date.now();
                typingSpeed = lastKeyTimeSpeed[key] ? (currentTime - lastKeyTimeSpeed[key]) : 0;
                lastKeyTimeSpeed[key] = currentTime;
                if ((_a = keyData[element.id]) === null || _a === void 0 ? void 0 : _a[key]) {
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
                if (keyCounts.hasOwnProperty(event.key)) {
                    keyCounts[event.key]++;
                }
            });
            /**
             * Adds a blur event listener to the given element.
             * Triggered when the element loses focus (e.g., when the user clicks outside of an input).
             *
             * @param event - The FocusEvent triggered when the element loses focus.
             */
            element.addEventListener("blur", function (event) {
                return __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
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
                        const KeyInfo = {
                            id: key,
                            keyStroke: {
                                location: (_b = (_a = event.view) === null || _a === void 0 ? void 0 : _a.location.toString()) !== null && _b !== void 0 ? _b : "",
                                sessionStart: typingStartTime,
                                sessionEnd: typingEndTime,
                                avgTypingSpeed: typingSpeed,
                                avgReleaseTime: parseFloat(avgReleaseTime) || 0,
                                avgHoldTime: parseFloat(avgHoldTime) || 0,
                                avgDigraphsTime: intervalTwoKeystrokes ? parseFloat(intervalTwoKeystrokes.toFixed(2)) : 0,
                                avgTrigraphsTime: intervalThreeKeystrokes ? parseFloat(intervalThreeKeystrokes.toFixed(2)) : 0,
                                avgTransitionTime: (_c = transitionTime === null || transitionTime === void 0 ? void 0 : transitionTime.toFixed(2)) !== null && _c !== void 0 ? _c : 0,
                                keyCounts: keysToLowerCase(keyCounts),
                                info: {
                                    layout: (yield detectKeyboardLayout()) || "Unknown Layout",
                                    language: navigator.language
                                }
                            }
                        };
                        const _index = keyStrokeData.findIndex((item) => (item === null || item === void 0 ? void 0 : item.id) === key);
                        if (_index < 0) {
                            keyStrokeData.push(KeyInfo);
                        }
                        else {
                            KeyBinding(keyStrokeData[_index], KeyInfo);
                        }
                    }
                });
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
        document.addEventListener("mousemove", (event) => {
            let now = Date.now();
            let dx = event.clientX - lastX;
            let dy = event.clientY - lastY;
            let dt = now - lastTime;
            const speed = Math.sqrt(dx * dx + dy * dy) / dt;
            mouseData['speed'].push(speed.toFixed(3));
            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = now;
            if (isMouseDown) {
                mouseData["gesturePath"].push({ x: event.clientX, y: event.clientY });
            }
            mouseData['movements'].push({ x: event.clientX, y: event.clientY });
        });
        /**
         * Adds a mousedown event listener to the document.
         * Triggered when the user presses any mouse button.
         * Useful for detecting user interaction, starting drag events, or tracking mouse actions.
         *
         * @param event - The MouseEvent object containing details about the mouse press,
         *                such as button pressed, coordinates, and modifier keys.
         */
        document.addEventListener("mousedown", (event) => {
            let button;
            if (event.button === 0) {
                button = "Left";
            }
            else if (event.button === 1) {
                button = "Middle";
            }
            else {
                button = "Right";
            }
            isMouseDown = true;
            mouseData["gesturePath"] = [];
            mouseData['clicks'].push({
                [button]: {
                    x: event.clientX,
                    y: event.clientY
                }
            });
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
    });
    const keysToLowerCase = (obj) => {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value]));
    };

    /**
     * @description This function initializes the sense behaviour by calling the initSenseBehaviour function from the Behaviour module.
     * @returns {void}
     */
    const getBehaviour = () => {
        try {
            return {
                "keyStrokeData": keyStrokeData,
                "mouseMovements": mouseData,
                "scrollMetrics": scrollMetrics
            };
        }
        catch (error) {
            console.error("Error in getBehaviour:", error);
            return null; // Return null in case of an error
        }
    };

    exports.getBehaviour = getBehaviour;
    exports.initSenseBehaviour = initSenseBehaviour;

    return exports;

})({});
