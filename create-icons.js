const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Icon sizes
const sizes = [16, 48, 128];

// Input and output paths
const svgPath = path.join(__dirname, "extension/assets/icons/icon.svg");
const outputDir = path.join(__dirname, "extension/assets/icons");

// Check if SVG file exists
if (!fs.existsSync(svgPath)) {
    console.error(`SVG file not found at ${svgPath}`);
    process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Install sharp package if not already installed
try {
    require.resolve("sharp");
    console.log("sharp package is already installed");
} catch (e) {
    console.log("Installing sharp package...");
    execSync("npm install sharp --save-dev");
    console.log("sharp package installed successfully");
}

// Now that we're sure sharp is installed, require it
const sharp = require("sharp");

// Create PNG icons from SVG
async function createIcons() {
    try {
        // Read the SVG file
        const svgBuffer = fs.readFileSync(svgPath);

        // Create icons for each size
        for (const size of sizes) {
            const outputPath = path.join(outputDir, `icon${size}.png`);

            // Use sharp to resize the SVG and convert to PNG
            await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

            console.log(`Created icon: ${outputPath}`);
        }

        console.log("All icons created successfully!");
    } catch (error) {
        console.error("Error creating icons:", error);
        process.exit(1);
    }
}

// Run the function
createIcons();
