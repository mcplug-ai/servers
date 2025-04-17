import { extractYoutubeId, getTranscript } from "./utils";

const url = "https://www.youtube.com/watch?v=FUq9qRwrDrI";
const videoId = extractYoutubeId(url);

console.log(videoId);

const transcript = await getTranscript(videoId, "en");
console.log(transcript);
