import sharp from "sharp";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";

export async function convertToWebP(req, res, next) {
  //verifica tipo de arquivo enviado como "image"
  if (!req?.file || !req.file.mimetype.startsWith("image/")) {
    return res.status(400).send("Only image files allowed!");
  }

  const inputFilePath = req.file.path;
  const outputDirectory = "./uploads";
  const outputFileName = path.basename(inputFilePath, path.extname(inputFilePath)) + ".webp";
  const outputFilePath = path.join(outputDirectory, outputFileName);

  //verifica existencia do diretório
  fs.mkdirSync(outputDirectory, { recursive: true });
  try {
    await new Promise((resolve, reject) => {
      sharp(inputFilePath)
        .resize({ width: 800 })
        .toFormat("webp")
        .toFile(outputFilePath, (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
    });
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Erro ao excluir o arquivo temporário:", err);
        }
      });
    }
    const file = {
      filename: outputFileName,
      path: outputFilePath,
    };
    res.locals.file = file;
    next();
  } catch (err) {}
}
