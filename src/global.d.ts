// Description: This module tracks scrolling metrics on a webpage, including scroll speed, direction, and engagement points.

// It also tracks user interactions such as mouse movements, clicks, and gestures.
declare global {

    // Navigation Interface
    interface Navigator {
        keyboard: any;
    }
    // <reference lib="dom" />
    interface KeyboardEvent extends UIEvent {
        readonly altKey: boolean;
        readonly code: string;
        readonly ctrlKey: boolean;
        readonly isComposing: boolean;
        readonly key: string;
        readonly location: number;
        readonly metaKey: boolean;
        readonly repeat: boolean;
        readonly shiftKey: boolean;
        readonly charCode: number;
        readonly keyCode: number;
        readonly which: number;
        getModifierState(keyArg: string): boolean;
    }

    // <reference lib="dom" />
    interface FocusEvent extends UIEvent {
        readonly relatedTarget: EventTarget | null;
    }
    
    interface KeyStrokeData {
        location: string,
        sessionStart: number,
        sessionEnd: number,
        avgTypingSpeed: number | string,
        avgReleaseTime: number | string,
        avgHoldTime: number | string,
        avgDigraphsTime: number | string,
        avgTrigraphsTime: number | string,
        avgTransitionTime: number | string,
        keyCounts: Record<string, number>,
        info: { [key : string] : string | null }
        keyCounts: Record<string, number>;
    }
    interface KeyInfo {
        id : String | null,
        keyStroke: KeyStrokeData
    }
    // Sense Behaviour Global Variables
    interface MouseData {
        movements:  { x: number, y: number }[]; // Declare that 'speed' is an array of strings
        clicks: { [button: string]: { x: number, y: number } }[]; // Declare that 'speed' is an array of strings
        speed: string[]; // Declare that 'speed' is an array of strings
        gesturePath: { x: number, y: number }[]; // Declare that 'speed' is an array of strings
        gestureType: string[]; // Declare that 'speed' is an array of strings
    }

    // Declare global variables for tracking user interactions
    var keyData : any = {}, keyStrokeData : any = [];
    var mouseData: MouseData = {
        movements : [],
        clicks : [],
        speed: [],
        gesturePath : [],
        gestureType : [],
    };
    var lastScrollPosition : number, lastSpeed : number, lastDirection: string | null = null, directionChanges : number, interactionPoints : string[] = [], scrollMetrics = {}, sessionStartTime : number, lastScrollTime : number;
    var lastX : number, lastY : number, lastTime : number, isMouseDown : boolean = false;
}
export {};// / This empty export statement is required to make this file a module