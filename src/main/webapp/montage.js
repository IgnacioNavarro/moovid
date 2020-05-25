const fs = require('browserify-fs');
const ytdl = require('ytdl-core');
const concat = require('concat-stream');
/*const HttpsProxyAgent = require('https-proxy-agent');

const agent = HttpsProxyAgent({
    ip: 'cors-anywhere.herokuapp.com',
    port: 443,
  });*/

const YOUTUBE_ENDPOINT = "http://www.youtube.com/watch?v=";

function fitImage(contains)
{
    return (parentWidth, parentHeight, childWidth, childHeight, scale = 1, offsetX = 0.5, offsetY = 0.5) =>
    {
        const childRatio = childWidth / childHeight
        const parentRatio = parentWidth / parentHeight
        let width = parentWidth * scale
        let height = parentHeight * scale

        if (contains ? (childRatio > parentRatio) : (childRatio < parentRatio))
        {
            height = width / childRatio
        } else
        {
            width = height * childRatio
        }

        return {
            width,
            height,
            offsetX: (parentWidth - width) * offsetX,
            offsetY: (parentHeight - height) * offsetY
        }
    }
}

var blobToBase64 = function (blob, callback)
{
    var reader = new FileReader();
    reader.onload = function ()
    {
        var dataUrl = reader.result;
        var base64 = dataUrl.split(',')[1];
        callback(base64);
    };
    reader.readAsDataURL(blob);
};

function lpad(value, padding)
{
    var zeroes = new Array(padding + 1).join("0");
    return (zeroes + value).slice(-padding);
}

function getFormatForFile(i)
{
    var arg = "";
    arg += `-i ${"/test/" + filesArray[i]}`;
    var outString = "";

    const worker = new Worker("ffmpeg-worker-mp4.js");
    worker.onmessage = function (e)
    {
        const msg = e.data;
        switch (msg.type)
        {
            case "ready":
                var blobArray = [{ name: filesArray[i], data: sampleVideoData[i] }]
                worker.postMessage({
                    type: "run",
                    // MEMFS: memfsArray,
                    mounts: [{
                        type: "WORKERFS",
                        mountpoint: "/test",
                        opts: {
                            blobs: blobArray
                        }
                    }],
                    arguments: arg.split(" ")
                });
                break;
            case "stdout":
                console.log(msg.data);
                break;
            case "stderr":
                outString += msg.data;
                console.log(msg.data);
                break;
            case "done":
                break;
        }
    };
    setTimeout(() =>
    {
        var match = outString.match('Video: ([a-zA-Z0-9]*)')[1];
        console.log(match);
        formats[filesArray[i]] = match;
    }, 5000);
}

function getFilters()
{
    var arg = "";
    arg += `-filters`;

    var outString = "";

    const worker = new Worker("ffmpeg-worker-mp4.js");
    worker.onmessage = function (e)
    {
        const msg = e.data;
        switch (msg.type)
        {
            case "ready":
                worker.postMessage({
                    type: "run",
                    arguments: arg.split(" ")
                });
                break;
            case "stdout":
                console.log(msg.data);
                break;
            case "stderr":
                console.log(msg.data);
                break;
            case "done":
                break;
        }
    };
}

function generateVid(doneCallback, progressCallback, errorCallback)
{
    progressCallback("Montando vídeo...", 20);
    console.log("generating video");

    var blobsArray = [
        { name: "audio.webm", data: audioData }
    ]
    for (let i = 0; i < sampleVideoData.length; i++)
    {
        blobsArray.push({ name: filesArray[i], data: sampleVideoData[i] })
    }

    var videoLength = (blobsArray.length - 1) * 1; // 1 second duration each photo, at the moment
    var totalVideoFrames = videoLength * 25; // 25 fps

    var arg = "";
    //arg += '-i img0.png -hide_banner';
    //arg += "-loop 1 ";
    //arg += ""
    // ss ===== fast forward 35s
    arg += "-ss 35 -vn -i /test/audio.webm "; // Added vn for webm only use audio
    /*filesArray.forEach(name => {
        arg += `-framerate 1/3 -vcodec ${formats[name]} -i ${"/test/"+name} `;
    });
    arg += "-filter_complex "
    for (let i = 0; i < 10; i++) {
        arg += "["+(i+1)+":v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1[v"+(i)+"];";
    }*/
    //arg += ';'
    /*for (let i = 0; i < 10; i++) {
        arg += `[v${i}]`;
    }
    arg += `concat=n=${10}[v];`
    arg += "[0:a]aresample=44100[a] "
    arg += "-map [v] -map [a] "*/
    arg += "-reinit_filter 0 -framerate 1 "
    arg += "-pattern_type glob -i /test/*.jpg "
    arg += "-c:v libx264 ";
    arg += "-pix_fmt yuv420p ";
    arg += "-vf fps=25,scale=1280:720:force_original_aspect_ratio=decrease,setsar=1,pad=1280:720:(ow-iw)/2:(oh-ih)/2," // TODO: FADEOUT FPS 
    arg += `fade=out:st=${videoLength - 3}:d=3 ` //zoompan=d=(1+0.3)/0.3:s=1280x720:fps=1/0.3,
    //arg += "-af afade=d=0.5,areverse,afade=d=0.5,areverse "
    arg += `-af afade=in:st=0:d=3,afade=out:st=${videoLength - 3}:d=3 `
    arg += "-shortest ";
    //arg += "-maxrate 5M ";
    arg += "-framerate 25 "
    arg += "-vb 3M ";
    arg += "-b:a 192k "
    arg += "-tune stillimage -profile:v baseline -preset ultrafast "
    //arg += "-r 5 "
    //arg += "-vf scale=320:240 ";
    // arg += "-filter_complex '[0:]'"
    arg += "out.mp4";

    console.log("final ffmpeg arguments:")
    console.log(arg)

    const worker = new Worker("ffmpeg-worker-mp4.js");
    worker.onmessage = function (e)
    {
        const msg = e.data;
        switch (msg.type)
        {
            case "ready":
                //console.log(blobsArray);
                worker.postMessage({
                    type: "run",
                    TOTAL_MEMORY: 256 * 1024 * 1024,
                    //MEMFS: blobsArray,
                    mounts: [{
                        type: "WORKERFS",
                        mountpoint: "/test",
                        opts: {
                            blobs: blobsArray
                        }
                    }],
                    arguments: arg.split(" ")
                });
                break;
            case "stdout":
                console.log(msg.data);
                break;
            case "stderr":
                console.log(msg.data);
                var msgData = msg.data;
                if (msgData.indexOf("frame=") == 0)
                {
                    var regx = /^frame= *([0-9]+)/g;
                    var progMatch = regx.exec(msgData);
                    if (progMatch.length > 0)
                        progressCallback("Montando vídeo...", 20 + (progMatch[1] / totalVideoFrames) * 80);
                }
                break;
            case "done":
                sampleVideoData = undefined;
                audioData = undefined;
                console.log("done");
                console.log(msg.data);
                // Write out.webm to disk.
                if (msg.data === undefined || msg.data.MEMFS[0] === undefined)
                {
                    errorCallback("ffmpeg-failed");
                }
                else
                {
                    var blob = new Blob([msg.data.MEMFS[0].data]);
                    doneCallback(blob);
                }
                break;
        }
    };
}


//$(document).ready(() =>
//{
var imagesLoaded = 0;
var audioLoaded = false;
var retrievingFormats = false;
var montageErrored = false;

var canvas = document.createElement('canvas');
canvas.width = 1280;
canvas.height = 720;

var canvasCtx = canvas.getContext('2d');

const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

function retrieveSampleVideo(urlArray, errorCallback)
{
    // TODO: Do error handling

    console.log("retrieving photo list:");
    console.log(urlArray);
    filesArray = [];
    for (let k = 0; k < urlArray.length; k++)
    {
        filesArray.push(`file${k}.jpg`);
    }
    sampleVideoData = [];
    var oreqs = []
    for (let i = 0; i < urlArray.length; i++)
    {
        console.log("downloading " + i);
        oreqs.push(new XMLHttpRequest());
        oreqs[i].open("GET", `${PROXY_URL + urlArray[i]}`, true);
        oreqs[i].responseType = "blob";

        oreqs[i].onload = function (oEvent)
        {
            var blob = oreqs[i].response;
            if (blob)
            {
                var img = new Image();

                img.onload = function ()
                {
                    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                    var imageData = fitImage(true)(canvas.width, canvas.height, this.width, this.height);
                    canvasCtx.drawImage(img, imageData.offsetX, imageData.offsetY, imageData.width, imageData.height);
                    canvasCtx.canvas.toBlob((finalBlob) =>
                    {
                        sampleVideoData[i] = finalBlob;
                        console.log("loaded " + i);
                        imagesLoaded++;
                    }, "image/jpeg", 1);

                }
                img.src = URL.createObjectURL(blob);
            }
        };

        oreqs[i].send(null);
    }
}

function retrieveAudio(audioUrls, errorCallback)
{
    // We take a list of audioUrls and pick the first one that works
    console.log("downloading audio");

    var triesPerSong = 2;
    for (let i = 0; i < audioUrls.length * triesPerSong; i++) // 2 tries per song, total 6 tries
    {

        let idx = Math.floor(i / 2);
        const audioId = audioUrls[idx];
        const finalUrl = YOUTUBE_ENDPOINT + audioId;


        var concatStream = concat((arrayBuffer) =>
        {
            console.log('file downloaded');
            var blob = new Blob([arrayBuffer]);
            //let arraybuffer = Uint8Array.from(buffer).buffer;

            if (audioLoaded)
            {
                console.log("Thanks but we've already loaded audio");
                return; // Already loaded
            }
            if (!blob || blob.size < 100) // less than 100 bytes is not really an audio file...
            {
                if (i == audioUrls.length * triesPerSong - 1)
                {
                    console.log("error loading audio alternative " + idx);
                    montageErrored = true;
                    errorCallback("audio-dl-failed") // Throw error if all tries were used
                }
                return;
            }
            else
            {
                console.log("audio loaded");
                audioData = blob;
                audioLoaded = true;
            }
        });
      /*  var audioStream = fs.createWriteStream(`video${i}.flv`);
        audioStream.on('close', function ()
        {
            
        });*/

        /*audioStream.on('error', function ()
        {
            if (i == audioUrls.length * triesPerSong - 1)
            {
                console.log("error loading audio alternative " + idx);
                montageErrored = true;
                errorCallback("audio-dl-failed") // Throw error if all tries were used
            }
        });*/

        ytdl(finalUrl,
            {
                requestOptions: {
                    transform: (parsed) =>
                    {
                        //parsed.host = 'cors-anywhere.herokuapp.com'
                        //parsed.path = `/https://www.youtube.com/watch?v=${audioId}`
                        //console.log(parsed);    
                        var parsedHeaders = parsed.headers;
                        //parsedHeaders.Accept = "application/json";
                        return {
                            host: 'cors-anywhere.herokuapp.com/', //body.ip contains the ip adress of the proxy (which is random everytime)
                           // protocol: 'https:',
                            //port: 80, //body.port contains the port of the proxy (which is random everytime, is matching for the proxy ip)
                            path: "http://youtube.com" + parsed.path,
                            //href: "cors-anywhere.herokuapp.com/" + parsed.href,
                            maxRedirects: 10,
                            headers: parsedHeaders
                        }
                    },
                },
            }).pipe(concatStream);


        /* fetch(PROXY_URL + finalUrl).then(r => 
         {
             return r.blob();
         }).then((blob) =>
         {
             if (audioLoaded)
             {
                 console.log("Thanks but we've already loaded audio");
                 return; // Already loaded
             }
             if (blob.size < 100) // less than 100 bytes is not really an audio file...
             {
                 if (i == audioUrls.length * triesPerSong - 1)
                 {
                     console.log("error loading audio alternative " + idx);
                     montageErrored = true;
                     errorCallback("audio-dl-failed") // Throw error if all tries were used
                 }
                 return;
             }
             else
             {
                 console.log("audio loaded");
                 audioData = blob;
                 audioLoaded = true;
             }
         }).catch(() =>
         {
             console.log("error loading audio alternative " + idx);
             if (i == audioUrls.length * triesPerSong - 1)
             {
                 montageErrored = true;
                 errorCallback("audio-dl-failed") // Throw error if all tries were used
             }
         });*/
    }
}

function makeMontage(imageUrlList, audioUrls, doneCallback, progressCallback, errorCallback)
{
    audioLoaded = false;
    imagesLoaded = 0;
    //getFilters();
    retrieveSampleVideo(imageUrlList, errorCallback);
    retrieveAudio(audioUrls, errorCallback);
    var interval = setInterval(function ()
    {
        var progressPct = 5 + (((audioLoaded ? 1 : 0) + imagesLoaded) / (1 + imageUrlList.length)) * 15; // We know it starts at 5 here
        if (montageErrored)
        {
            montageErrored = false;
            clearInterval(interval); // Reset montage processor state after failed montage
        }
        if (!audioLoaded && imagesLoaded == imageUrlList.length)
        {
            progressCallback("Descargando audio...", progressPct);
        }
        else 
        {
            progressCallback("Descargando imágenes...", progressPct);
        }

        if (audioLoaded && imagesLoaded == imageUrlList.length)
        {
            generateVid(doneCallback, progressCallback, errorCallback);
            clearInterval(interval);
            /*  if (!retrievingFormats)
              {
                  retrievingFormats = true;
                  formats = [];
                  for (let i = 0; i < filesArray.length; i++) {
                      getFormatForFile(i);
                  }
              }
             
              if (Object.keys(formats).length == 10)
              {
                  generateVid();
                  clearInterval(interval);
              }*/
        }
    }, 500)
}

module.exports = { makeMontage: makeMontage };
//});