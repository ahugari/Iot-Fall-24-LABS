const TrafficLight = require('./traffic-light');

const PDC_RED_PIN = 529; // Pedestrian Crossing Red Light pin - GPIO 17
const PDC_YELLOW_PIN = 539; // Pedestrian Crossing Yellow Light pin - GPIO 27
const PDC_GREEN_PIN = 534; // Pedestrian Crossing Green Light pin - GPIO 22

const RD1_RED_PIN = 517; // Road Red Light pin - GPIO 5
const RD1_YELLOW_PIN = 518; // Road Yellow Light pin - GPIO 6
const RD1_GREEN_PIN = 538; // Road Green Light pin - GPIO 26

const SWITCH_INTERVAL = 300; // Delay time in milliseconds

try {
    // Initial state has Road on green LED and Pedestrian Crossing on red LED
    const pedestrian_crossing_lights = new TrafficLight(PDC_RED_PIN, PDC_YELLOW_PIN, PDC_GREEN_PIN, "red");

    console.log(`Pedestrian red LED initialized on Gpio ${PDC_RED_PIN}`);
    console.log(`Pedestrian yellow LED initialized on Gpio ${PDC_YELLOW_PIN}`);
    console.log(`Pedestrian green LED initialized on Gpio ${PDC_GREEN_PIN}`);

    const road_lights = new TrafficLight(RD1_RED_PIN, RD1_YELLOW_PIN, RD1_GREEN_PIN, "green");

    console.log(`Road red LED initialized on Gpio ${RD1_RED_PIN}`);
    console.log(`Road yellow LED initialized on Gpio ${RD1_YELLOW_PIN}`);
    console.log(`Road green LED initialized on Gpio ${RD1_GREEN_PIN}`);

    console.log("Starting traffic lights system...");

    // Setup and start interval
    const toggleLEDs = setInterval(() => {
        console.log("Processing pedestrian crossing lights...");
        pedestrian_crossing_lights.turnNextLEDOn();

        console.log("Processing road lights...");
        road_lights.turnNextLEDOn();
    }, SWITCH_INTERVAL);

    // Clean up
    const cleanup = () => {
        console.log("Cleaning up GPIO pins...");
        clearInterval(toggleLEDs);
        pedestrian_crossing_lights.cleanUpLights();
        road_lights.cleanUpLights();

        console.log("Clean up successful. Exiting.");
        process.exit();
    };

    process.on('SIGINT', cleanup);

} catch (error) {
    console.log("ERROR: An error occured during GPIO setup.", error);
}
