/*/
 * METADATA
 * GENERAL FUNCTIONS
 * GENERATE GIF
 * RUN
/*/

import * as dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import utils from "./utils/utils";
dotenv.config();

// ************* METADATA ************* //

async function getFileMetadata(uri) {
  const metadata = await new Promise((resolve) => {
    return ffmpeg(uri).ffprobe((err, data) => resolve(data));
  });

  const stream1 = metadata?.streams[0];
  const stream2 = metadata?.streams[1];
  console.log({ uri, stream1, stream2, metadata });
}

// ************* GENERATE GIF ************* //

async function generateGif(uri) {
  const filename = uri.split("/").pop();
  const splitname = filename.split(".");
  const name = splitname[0];

  const finalname = `${name}-compressed.gif`;
  const endFilePath = `../tmp/${finalname}`;

  const metadata = await new Promise((resolve) => {
    return ffmpeg(uri).ffprobe((err, data) => resolve(data));
  });

  const { duration } = metadata.format;
  const setDuration = duration > 5 ? "5" : `${duration}`;

  const response = await new Promise((resolve) => {
    return ffmpeg(uri)
      .setStartTime("00:00:00")
      .setDuration(setDuration)
      .fps(3)
      .complexFilter(["scale=iw/4:ih/4"])
      .on("progress", ({ percent }) => utils.logProgress(percent))
      .on("end", (e, stdout, stderr) => resolve(endFilePath))
      .on("error", (e, stdout, stderr) => utils.logError(e))
      .save(endFilePath);
  });

  return response;
}

// ************* RUN ************* //

async function run() {
  const file1 = process.env.LOCAL_FILE_URI;
  const file2 = process.env.LOCAL_FILE_URI2;
  const vodOutputDir = process.env.LOCAL_VOD_OUTPUT_DIR;

  const value = file1;

  // await getFileMetadata(value); // Works
  // await generateGif(value); // Works

  console.log("Done");
}

run();
