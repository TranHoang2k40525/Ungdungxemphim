import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, Alert, RefreshControl, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import * as ScreenOrientation from 'expo-screen-orientation';
import { getMovieDetail, getEpisodes, BASE_URL } from "../../api/API";

export default function MovieDetailScreen({ route, navigation }) {
  const params = route.params || {};
  const movieId = params.movieId;
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const handleDimensionChange = ({ window }) => {
      setScreenDimensions(window);
    };
    const subscription = Dimensions.addEventListener('change', handleDimensionChange);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    if (!movieId || isNaN(movieId)) {
      console.log("Route params:", params);
      Alert.alert("Lỗi", "Không nhận được ID phim hợp lệ từ tham số.");
      navigation.goBack();
      return;
    }
    fetchData();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, [movieId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const movieRes = await getMovieDetail(movieId);
      setMovie(movieRes.data || {});
      const initialVideoPath = movieRes.data?.videoPath || "";
      setVideoUrl(initialVideoPath);
      console.log("Phản hồi getMovieDetail:", movieRes.data);
      console.log("Đường dẫn video ban đầu:", `${BASE_URL.replace('/api', '')}/Assets/Video/${initialVideoPath}`);

      const epRes = await getEpisodes(movieId);
      console.log("Phản hồi getEpisodes:", epRes.data);
      setEpisodes(epRes.data.episodes || []);
      if (epRes.data.episodes && epRes.data.episodes.length > 0) {
        setSelectedEpisode(epRes.data.episodes[0]);
        if (!initialVideoPath) {
          setVideoUrl(epRes.data.episodes[0]?.videoPath || "");
          console.log("Đường dẫn video tập phim:", `${BASE_URL.replace('/api', '')}/Assets/Video/${epRes.data.episodes[0]?.videoPath}`);
        }
      } else if (!initialVideoPath) {
        setVideoUrl("");
        Alert.alert("Thông báo", "Phim này chưa có tập phim hoặc video. Vui lòng kiểm tra lại.");
      }
    } catch (err) {
      console.log("Lỗi lấy chi tiết phim:", err, err.response?.data);
      setMovie({});
      Alert.alert("Lỗi lấy chi tiết phim", err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleTrailerPress = async () => {
    if (!videoUrl) {
      Alert.alert("Lỗi", "Không tìm thấy nguồn video cho phim này. Vui lòng kiểm tra lại dữ liệu hoặc liên hệ hỗ trợ.");
      return;
    }
    console.log("Đường dẫn video khi nhấn xem:", `${BASE_URL.replace('/api', '')}/Assets/Video/${videoUrl}`);
    setShowTrailer(true);
  };

  const handleEpisodeSelect = async (ep) => {
    setSelectedEpisode(ep);
    setVideoUrl(ep.videoPath || "");
    console.log("Đường dẫn video tập được chọn:", `${BASE_URL.replace('/api', '')}/Assets/Video/${ep.videoPath}`);
    setShowTrailer(true);
  };

  const renderTrailer = () => {
    if (!showTrailer || !videoUrl) return null;
    const fullVideoUrl = videoUrl.startsWith('http') ? videoUrl : `${BASE_URL.replace('/api', '')}/Assets/Video/${videoUrl}`;
    const videoStyle = { width: '100%', height: 200 };

    return (
      <View style={styles.trailerContainer}>
        <WebView
          source={{ uri: fullVideoUrl }}
          style={videoStyle}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log("Lỗi WebView:", nativeEvent);
            Alert.alert("Lỗi", "Không thể tải video. Vui lòng kiểm tra lại.");
          }}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (!movie) {
      return <Text style={styles.loadingText}>Không có dữ liệu phim</Text>;
    }

    return (
      <View>
        {!showTrailer && (
          <Image
            source={{ uri: movie.imageUrl ? `${BASE_URL.replace('/api', '')}/Assets/Images/${movie.imageUrl}` : undefined }}
            style={styles.movieImage}
          />
        )}
        {renderTrailer()}
        <Text style={styles.movieTitle}>{movie.movieTitle || "Không có tiêu đề"}</Text>
        <Text style={styles.movieDescription}>{movie.movieDescription || "Không có mô tả"}</Text>
        <Text style={styles.movieInfo}>
          Thể loại: {(movie.movieGenre || []).join(", ") || "Không xác định"} | Diễn viên: {movie.movieActors || "Không xác định"} | Đạo diễn: {movie.movieDirector || "Không xác định"} | Quốc gia: {movie.movieCountry || "Không xác định"}
        </Text>
        {!showTrailer && (
          <TouchableOpacity onPress={handleTrailerPress} style={styles.playButton}>
            <Text style={styles.playButtonText}>Xem phim</Text>
          </TouchableOpacity>
        )}
        <View style={styles.episodeContainer}>
          {episodes.map((ep) => (
            <TouchableOpacity
              key={ep.episodeID}
              style={[styles.episodeButton, selectedEpisode?.episodeID === ep.episodeID && styles.selectedEpisodeButton]}
              onPress={() => handleEpisodeSelect(ep)}
            >
              <Text style={[styles.episodeText, selectedEpisode?.episodeID === ep.episodeID && styles.selectedEpisodeText]}>
                {ep.title || `Tập ${ep.episodeNumber}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6666" />
        <Text style={styles.loadingText}>Đang tải chi tiết phim...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[{}]}
        renderItem={() => (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                <Text style={styles.backText}>{'< Quay về Home'}</Text>
              </TouchableOpacity>
            </View>
            {renderContent()}
          </>
        )}
        keyExtractor={() => "main_content"}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={<View />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flatListContent: { paddingBottom: 80 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 },
  backButton: { padding: 8 },
  backText: { color: '#ff4d6d', fontWeight: 'bold' },
  movieImage: { width: "100%", height: 200, resizeMode: 'cover' },
  movieTitle: { fontSize: 24, fontWeight: "bold", margin: 10 },
  movieDescription: { marginHorizontal: 10, color: "#333" },
  movieInfo: { marginHorizontal: 10, color: "#666" },
  playButton: { backgroundColor: "#FF6666", padding: 10, margin: 10, borderRadius: 8 },
  playButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  episodeContainer: { flexDirection: "row", margin: 10, flexWrap: "wrap" },
  episodeButton: { backgroundColor: "#eee", padding: 8, borderRadius: 6, marginRight: 5, marginBottom: 5 },
  selectedEpisodeButton: { backgroundColor: "#FF6666" },
  episodeText: { color: "#333" },
  selectedEpisodeText: { color: "#fff" },
  trailerContainer: { position: "relative", marginTop: 10 },
  loadingText: { textAlign: 'center', marginVertical: 20, color: '#666' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
