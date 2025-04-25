import { initSenseBehaviour } from "./modules/Behaviour";

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
	} catch (error) {
		console.error("Error in getBehaviour:", error);
		return null; // Return null in case of an error
	}
};

export { initSenseBehaviour, getBehaviour};//Exporting the function to be used in other modules
