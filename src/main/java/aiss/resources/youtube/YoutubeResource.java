package aiss.resources.youtube;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.restlet.resource.ClientResource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.kiulian.downloader.YoutubeDownloader;
import com.github.kiulian.downloader.YoutubeException;
import com.github.kiulian.downloader.model.Extension;
import com.github.kiulian.downloader.model.YoutubeVideo;
import com.github.kiulian.downloader.model.formats.AudioFormat;
public class YoutubeResource {
	
	private static final Logger log = Logger.getLogger(YoutubeResource.class.getName());
	private static final String PATH = "./temp/music";
	
	private static String getIdFromJson(String json) {
		JsonNode query = null;
		String id = null;
		try {
			query = new ObjectMapper().readTree(json);
			id = query.get("items").elements().next().get("id")
					.get("videoId").textValue();
		} catch (IOException e) {
			log.log(Level.WARNING, "Error parsing Youtube query JSON file");
		}
		return id;
	}
	
	public static String getVideoId(String query) {
		String path = "./keys/YoutubeKey.txt";
		String key = null;
		try {
			key = Files.lines(Paths.get(path)).findFirst().get();
		} catch (IOException e) {
			log.log(Level.INFO, "Couldnt find YoutubeKey.txt");
		}
		String uri = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=";
		uri += query + "&key=" + key;
		log.log(Level.FINE, "Searching videos at endpoint: " + uri);
		ClientResource cr = new ClientResource(uri);
		String json = cr.get(String.class);
		return getIdFromJson(json);
	}
	
	public static String downloadVideo(String id) {
		return downloadVideo(id, 1);
	}
	
	private static String downloadVideo(String id, int retry) {
		if (retry == 4) {
			log.log(Level.WARNING, "Couldnt download video with id (" + id + "): Reached maximum number of attempts");
			return null;
		}
		YoutubeDownloader downloader = new YoutubeDownloader(); 
		YoutubeVideo video = null;
		
		try {
			video = downloader.getVideo(id);
		} catch (YoutubeException | IOException e1) {
			log.log(Level.WARNING, "Error at video download with id (" + id + "): " + e1.getMessage());
			log.log(Level.INFO, "Failed download attempt (" + retry + "/3)");
			return downloadVideo(id, retry++);
		}
		
		List<AudioFormat> audios = video.findAudioWithExtension(Extension.MP4);
		if (audios.isEmpty()) {
			log.log(Level.WARNING, "Error at video download with id (" + id + "): No audio files with .mp4 extension found");
			log.log(Level.INFO, "Failed download attempt (" + retry + "/3)");
			return downloadVideo(id, retry++);
		}
			
		log.log(Level.FINE, "Number of available audio downloads: " + audios.size());
		AudioFormat f;
		Comparator<AudioFormat> cmp = new Comparator<AudioFormat>() {
			@Override
			public int compare(AudioFormat x, AudioFormat y) {
				return x.bitrate().compareTo(y.bitrate());
			}
		};
		Predicate<AudioFormat> pred = new Predicate<AudioFormat>() {
			@Override
			public boolean test(AudioFormat x) {
				return x.bitrate() >= 160000;
			}
		};
		if (audios.stream().filter(pred).findFirst().isPresent())
			f = audios.stream().filter(pred).min(cmp).get();
		else
			f = audios.stream().max(cmp).get();
		log.log(Level.FINE, "Chosen audio download with bitrate of: " + f.bitrate());
		
		File outputDir = new File(PATH);
		File file = null;
		try {
			file = video.download(f, outputDir);
		} catch (IOException | YoutubeException e) {
			log.log(Level.WARNING, "Error at file creation from video (" + video.details().title() + "): " + e.getMessage());
			log.log(Level.INFO, "Failed download attempt (" + retry + "/3)");
			return downloadVideo(id, retry++);
		}
		log.log(Level.INFO, "Succesfully downloaded song at " + PATH + " : " + video.details().title());
		return file.getName();
	}
	
}