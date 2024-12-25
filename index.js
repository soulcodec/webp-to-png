import express from 'express';
import webp from "webp-converter";
import multer from "multer";
import { dirname } from "path";
import {fileURLToPath} from "url";
import path from "path";
import fs from "fs";


const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: 'uploads/' })
const app = express();
const port = 3000;

webp.grant_permission();


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})

app.post('/convert', upload.single('file'), async (req, res) => {
    try {
        const uploadedFile = req.file;
        if (!uploadedFile) {
            return res.status(400).send("No file uploaded.");
        }

        const inputPath = uploadedFile.path; // Path to the uploaded WebP file
        const outputFilename = `${path.parse(uploadedFile.originalname).name}.png`; // Convert to PNG
        const outputPath = path.join(__dirname, "converted", outputFilename);

        // Ensure output directory exists
        fs.mkdirSync(path.join(__dirname, "converted"), { recursive: true });

        // Convert WebP to PNG
        await webp.dwebp(inputPath, outputPath, "-o");

        // Send the converted file back to the client
        res.download(outputPath, outputFilename, (err) => {
            if (err) {
                console.error("Error sending file:", err);
            }

            // Clean up files after sending
            fs.unlinkSync(inputPath); // Remove the uploaded file
            fs.unlinkSync(outputPath); // Remove the converted file
        });
    } catch (error) {
        console.error("Error during conversion:", error);
        res.status(500).send("An error occurred during file conversion.");
    }
});

// // Example of pre-converting a file (optional, can be removed if unnecessary)
// const result = webp.dwebp("nodejs_logo.webp", "nodejs_logo.png", "-o");
// result.then((response) => {
//     console.log(response);
// }).catch(err => {
//     console.error("Error pre-converting logo:", err);
// });
//
// // const result = webp.dwebp("nodejs_logo.webp","nodejs_logo.png","-o");
// // result.then((response) => {
// //     console.log(response);
// // });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});