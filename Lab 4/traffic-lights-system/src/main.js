/*
  traffic-light-system.js - main control program for the Raspberry Pi Traffic Light System
  =======================================================================================

  This program is for Lab 04-645 A: Internet of Things (IoT) at Carnegie Mellon University Africa.

  Functionality:
  --------------
  This Node.js application controls a simple traffic light system using the Raspberry Pi's GPIO pins.
  It alternates red, yellow (amber), and green LEDs to simulate traffic and pedestrian lights on a one-way road.
  The lights switch states on a timed cycle, allowing cars and pedestrians to move alternately.
  
  The system uses three sets of lights:
    - Pedestrian Crossing (Red, Yellow, Green)
    - Road 1 (Red, Yellow, Green)
    - Road 2 (Red, Yellow, Green)

  GPIO Pin Mapping:
  -----------------
  Pedestrian Crossing:
    - Red: GPIO 17 (Pin 529)
    - Yellow: GPIO 27 (Pin 539)
    - Green: GPIO 22 (Pin 534)

  Road 1:
    - Red: GPIO 5  (Pin 517)
    - Yellow: GPIO 6 (Pin 518)
    - Green: GPIO 26 (Pin 538)

  Road 2:
    - Red: GPIO 23 (Pin 535)
    - Yellow: GPIO 24 (Pin 536)
    - Green: GPIO 25 (Pin 537)

  Input:
  ------
  - No direct user input during runtime.
  - LED GPIO pins are toggled programmatically on the Raspberry Pi via pigpio library.
  - Timing for light cycles is configured in code.

  Output:
  -------
  - LEDs connected to the above GPIO pins turn ON and OFF in correct sequence representing traffic and pedestrian signals.
  - Optional console logs for debugging/status.

  Dependencies:
  -------------
  - Node.js runtime environment on Raspberry Pi.
  - 'pigpio' Node.js package for GPIO control.
  - Raspberry Pi hardware with LEDs connected to specified GPIO pins.

  Usage:
  ------
  1. Ensure Node.js and pigpio library are installed on the Pi.
  2. Connect LEDs to Raspberry Pi GPIO pins as mapped above using resistors.
  3. Run with: `node main.js`
  4. The program cycles the traffic lights indefinitely until stopped using Ctl + C.

  Design Strategy:
  ----------------
  Uses interval functions to cycle through light states.
  The program enforces a traffic light sequence where pedestrian and road lights alternate states with red, yellow, and green phases.
  Hardware GPIO pin abstractions are defined as constants to ease code readability and maintainability.

  Author:
  -------
  Mark Iraguha, Carnegie Mellon University Africa
  Date: 10/07/2025

  Audit Trail:
  ------------
  Initial version created for Lab 04 traffic light system assignment. Updated with precise GPIO pin mappings.
*/
const TrafficLight = require('./traffic-light');

const PDC_RED_PIN = 529; // Pedestrian Crossing Red Light pin - GPIO 17
const PDC_YELLOW_PIN = 539; // Pedestrian Crossing Yellow Light pin - GPIO 27
const PDC_GREEN_PIN = 534; // Pedestrian Crossing Green Light pin - GPIO 22

const RD1_RED_PIN = 517; // Road Red Light pin - GPIO 5
const RD1_YELLOW_PIN = 518; // Road Yellow Light pin - GPIO 6
const RD1_GREEN_PIN = 538; // Road Green Light pin - GPIO 26

const RD2_RED_PIN = 535; // Road Red Light pin - GPIO 23
const RD2_YELLOW_PIN = 536; // Road Yellow Light pin - GPIO 24
const RD2_GREEN_PIN = 537; // Road Green Light pin - GPIO 25


const SWITCH_INTERVAL = 3000; // Delay time in milliseconds

try {
    // Initial state has Road on green LED and Pedestrian Crossing on red LED
    const pedestrian_crossing_lights = new TrafficLight(PDC_RED_PIN, PDC_YELLOW_PIN, PDC_GREEN_PIN, "red");

    console.log(`Pedestrian red LED initialized on Gpio ${PDC_RED_PIN}`);
    console.log(`Pedestrian yellow LED initialized on Gpio ${PDC_YELLOW_PIN}`);
    console.log(`Pedestrian green LED initialized on Gpio ${PDC_GREEN_PIN}`);

    const road_lights_1 = new TrafficLight(RD1_RED_PIN, RD1_YELLOW_PIN, RD1_GREEN_PIN, "green");

    console.log(`Road 1 red LED initialized on Gpio ${RD1_RED_PIN}`);
    console.log(`Road 1 yellow LED initialized on Gpio ${RD1_YELLOW_PIN}`);
    console.log(`Road 1 green LED initialized on Gpio ${RD1_GREEN_PIN}`);

    const road_lights_2 = new TrafficLight(RD2_RED_PIN, RD2_YELLOW_PIN, RD2_GREEN_PIN, "green");

    console.log(`Road 2 red LED initialized on Gpio ${RD2_RED_PIN}`);
    console.log(`Road 2 yellow LED initialized on Gpio ${RD2_YELLOW_PIN}`);
    console.log(`Road 2 green LED initialized on Gpio ${RD2_GREEN_PIN}`);


    console.log("Starting traffic lights system...");

    // Setup and start interval
    const toggleLEDs = setInterval(() => {
        console.log("Processing pedestrian crossing lights...");
        pedestrian_crossing_lights.turnNextLEDOn();

        console.log("Processing road lights...");
        road_lights_1.turnNextLEDOn();
        road_lights_2.turnNextLEDOn();
    }, SWITCH_INTERVAL);

    // Clean up
    const cleanup = () => {
        console.log("Cleaning up GPIO pins...");
        clearInterval(toggleLEDs);
        pedestrian_crossing_lights.cleanUpLights();
        road_lights_1.cleanUpLights();
        road_lights_2.cleanUpLights();

        console.log("Clean up successful. Exiting.");
        process.exit();
    };

    process.on('SIGINT', cleanup);

} catch (error) {
    console.log("ERROR: An error occured during GPIO setup.", error);
}
