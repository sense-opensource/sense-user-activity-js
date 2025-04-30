/**
 * Type representing the supported keyboard layouts.
 */
type Layout = "AZERTY" | "QWERTY" | "DVORAK" | "COLEMAK" | "ЙЦУКЕН (Russian)" | "Unknown Layout";

/**
 * Type representing the key-value pairs for a keyboard layout.
 */
type LayoutKeys = Record<string, string>;

/**
 * Array of known keyboard layouts with their corresponding key mappings.
 */
const layouts: { name: Layout; keys: LayoutKeys }[] = [
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
export const detectKeyboardLayout = async (): Promise<Layout> => {
    if (!navigator.keyboard?.getLayoutMap) {
        return "Unknown Layout";
    }

    const keyboardLayoutMap = await navigator.keyboard.getLayoutMap();
    const sampleKeys: LayoutKeys = {
        KeyQ: keyboardLayoutMap.get("KeyQ") ?? "",
        KeyW: keyboardLayoutMap.get("KeyW") ?? "",
        KeyZ: keyboardLayoutMap.get("KeyZ") ?? "",
        KeyA: keyboardLayoutMap.get("KeyA") ?? "",
        KeyM: keyboardLayoutMap.get("KeyM") ?? "",
    };

    for (const { name, keys } of layouts) {
        const isMatch = Object.entries(keys).every(
            ([key, value]: [string, string]) => sampleKeys[key] === value
        );
        if (isMatch) {
        return name;
        }
    }

    return "Unknown Layout";
};