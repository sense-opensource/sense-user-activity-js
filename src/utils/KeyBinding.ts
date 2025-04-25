
// 🔒 Tell TypeScript what keys are safe to average
type AveragableKey = | "avgTypingSpeed" | "avgReleaseTime" | "avgHoldTime" | "avgDigraphsTime" | "avgTrigraphsTime" | "avgTransitionTime";

export const KeyBinding = (initial : KeyInfo, current : KeyInfo) => {

    if (initial.keyStroke && current.keyStroke) {
        const keysToAverage : AveragableKey [] = ["avgTypingSpeed","avgReleaseTime","avgHoldTime","avgDigraphsTime","avgTrigraphsTime","avgTransitionTime"];
      
        // Averaging keyStroke values
        keysToAverage.forEach((key) => {
            initial.keyStroke[key] = (Number(initial.keyStroke[key]) + Number(current.keyStroke[key])) / 2;
        });
      
        // Summing up key counts
        const keysToCount = ["control","shift","meta","tab","delete","backspace","arrowup","arrowdown","arrowleft","arrowright","capslock","enter","alt"];
      
        keysToCount.forEach((key) => {
          initial.keyStroke.keyCounts[key] = (initial.keyStroke.keyCounts[key] || 0) + (current.keyStroke.keyCounts[key] || 0);
        });
      
        // Updating sessionEnd
        initial.keyStroke["sessionEnd"] = current.keyStroke["sessionEnd"];
      }
      
}