const Gpio = require('onoff').Gpio;

function initGPIO(pin) {
    try {
        // await new Promise(resolve => setTimeout(resolve, 5000));

        const gpio = new Gpio(pin, 'out');

        console.log(`GPIO ${pin} configured as output.`);
        return gpio;
    } catch (error) {
        if (error.code === "EEXIST") {
            console.log(`ERROR: Pin already exported as ${pin}`, error);

        } else {
            console.log(`ERROR: Failed to configure GPIO ${pin}`, error);
            process.exit(1);
        }
    }
}

function writeGPIO(gpio, value) {
    try {
        gpio.writeSync(value ? 1 : 0);
    } catch (error) {
        console.error(`ERROR: Failed to write to GPIO ${pin}`, error);
        process.exit(1);
    }
}

async function unexportGPIO(gpio) {
    try {
        gpio.unexport();
        console.log(`Cleaned up pin ${pin}`);
    } catch (error) {
        console.error(`ERROR: Failed to cleaup GPIO ${pin}:`, error);
        process.exit(1);
    }
}

module.exports = { initGPIO, writeGPIO, unexportGPIO }