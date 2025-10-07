const { initGPIO, writeGPIO, unexportGPIO } = require('./gpio-control');

class TrafficLight {
    #red_led;
    #yellow_led;
    #green_led;
    #active_led;
    #moved_orange;
    #next_led;
    constructor(red_led, yellow_led, green_led, active_led) {
        // if (!(red_led instanceof Number) && !(yellow_led instanceof Number) && !(green_led instanceof Number) && !(active_led instanceof String)) {
        //     console.log("ERROR: invalid parameters passed to TrafficLight.");
        //     return;
        // }

        this.#red_led = initGPIO(red_led);;
        this.#yellow_led = initGPIO(yellow_led);
        this.#green_led = initGPIO(green_led);
        this.#setActiveLED(active_led)
        this.#turnOnLED(this.#active_led);
        console.log(`Startup LED is set to ${this.#getCurrentActiveLED()}.`);
    }


    #getCurrentActiveLED() {
        return this.#active_led;
    }

    #setActiveLED(led) {
        switch (String(led).toLowerCase()) {
            case "yellow":
                this.#moved_orange = true;
                this.#next_led = "green";
                this.#active_led = active_led;
                break;

            case "red":
                this.#moved_orange = false;
                this.#next_led = "green";
                this.#active_led = "red";
                break;

            case "green":
                this.#moved_orange = false;
                this.#next_led = "red";
                this.#active_led = "green";
                break;

            default:
                this.#moved_orange = false;
                this.#next_led = "green";
                this.#active_led = "red";
                break;
        }
    }

    turnNextLEDOn() {
        console.log(`Current active LED is ${this.#getCurrentActiveLED()}`);
        switch (this.#getCurrentActiveLED()) {
            case "red":
                if (this.#moved_orange === false) {
                    this.#turnOnLED("yellow");
                    this.#moved_orange = true;
                    this.#next_led = 'green';
                    return;
                } else {
                    //green
                    this.#moved_orange = false;
                    this.#turnOnLED("green");
                    this.#next_led = 'red';
                    return;
                }

                console.log(`Active LED is now ${this.#getCurrentActiveLED()}.`);
                break;
            case "yellow":
                //get next led and set it
                //set next led to red
                if (this.#next_led === "green") {
                    this.#moved_orange = false;
                    this.#turnOnLED("green");
                    this.#next_led = 'red';
                } else if (this.#next_led === "red") {
                    this.#moved_orange = false;
                    this.#turnOnLED("red");
                    this.#next_led = 'green';
                }
                console.log(`Active LED is now ${this.#getCurrentActiveLED()}.`);
                break;
            case "green":
                if (this.#moved_orange === false) {
                    this.#turnOnLED("yellow");
                    this.#moved_orange = true;
                    this.#next_led = 'red';
                    return;
                } else {
                    //red
                    this.#moved_orange = false;
                    this.#turnOnLED("red");
                    this.#next_led = 'green';
                    return;
                }

                console.log(`Active LED is now ${this.#getCurrentActiveLED()}.`);
                break;

            default: // Make red led active
                this.#moved_orange = false;
                this.#turnOnLED("red");
                this.#next_led = 'green';
                return;
                console.log(`Active LED is now ${this.#getCurrentActiveLED()}.`);
                break;
        }
    }

    #turnOnLED(led) {
        switch (String(led).toLowerCase()) {
            case "red":
                writeGPIO(this.#yellow_led, 0);
                writeGPIO(this.#green_led, 0);
                writeGPIO(this.#red_led, 1);
                break;
            case "yellow":
                writeGPIO(this.#green_led, 0);
                writeGPIO(this.#red_led, 0);
                writeGPIO(this.#yellow_led, 1);
                break;
            case "green":
                writeGPIO(this.#yellow_led, 0);
                writeGPIO(this.#red_led, 0);
                writeGPIO(this.#green_led, 1);
                break;

            default: // Make red led active
                console.log(`Invalid startup active LED found. Will now default to red.`);
                writeGPIO(this.#yellow_led, 0);
                writeGPIO(this.#green_led, 0);
                writeGPIO(this.#red_led, 1);
                break;
        }
        this.#active_led = String(led).toLowerCase();
        console.log(`Set active LED to ${this.#active_led}`);

    }

    async cleanUpLights() {
        this.#clearAllLights();
        this.#releasePins();
    }

    async #clearAllLights() {
        console.log("Turning off all lights...");
        writeGPIO(this.#yellow_led, 0);
        writeGPIO(this.#green_led, 0);
        writeGPIO(this.#red_led, 0);
        this.#active_led = "";
        this.#next_led = "";
        this.#moved_orange = false;
    }

    #releasePins() {
        console.log("Releasing pins...");
        unexportGPIO(this.#yellow_led);
        unexportGPIO(this.#green_led);
        unexportGPIO(this.#red_led);
    }
}

module.exports = TrafficLight;