import React, { useState, useEffect, useContext } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, TextInput, Alert, RefreshControl, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from 'expo-screen-orientation';
import { getMovieDetail, getEpisodes, postComment, getComments, postRating, getRatings, BASE_URL } from "../../api/API";
import { UserContext } from "../../contexts/UserContext";

export default function MovieDetailScreen({ route, navigation }) {
  const params = route.params || {};
  const movieId = params.movieId;
  const { user, token } = useContext(UserContext);
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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

      const epRes = await getEpisodes(movieId);
      console.log("Phản hồi getEpisodes:", epRes.data);
      setEpisodes(epRes.data.episodes || []);
      if (epRes.data.episodes && epRes.data.episodes.length > 0) {
        setSelectedEpisode(epRes.data.episodes[0]);
        if (!initialVideoPath) {
          setVideoUrl(epRes.data.episodes[0]?.videoPath || "");
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

    await fetchComments();
    await fetchRatings();
  };

  const fetchComments = async () => {
    try {
      const res = await getComments(movieId);
      setComments(res.data.comments || []);
    } catch (err) {
      console.log("Lỗi lấy bình luận:", err, err.response?.data);
      Alert.alert("Lỗi lấy bình luận", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await getRatings(movieId);
      setRating(res.data.rating || 0);
    } catch (err) {
      console.log("Lỗi lấy đánh giá:", err, err.response?.data);
      Alert.alert("Lỗi lấy đánh giá", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleTrailerPress = () => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để xem phim!", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    if (!videoUrl) {
      Alert.alert("Lỗi", "Không tìm thấy nguồn video cho phim này. Vui lòng kiểm tra lại dữ liệu hoặc liên hệ hỗ trợ.");
      return;
    }
    setShowTrailer(true);
  };

  const handleEpisodeSelect = (ep) => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để xem phim!", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    setSelectedEpisode(ep);
    setVideoUrl(ep.videoPath || "");
    setShowTrailer(true);
  };

  const handleComment = async () => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để bình luận!", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    if (!commentText.trim() && rating === 0) {
      Alert.alert("Thông báo", "Nội dung bình luận hoặc đánh giá phải được cung cấp!");
      return;
    }
    try {
      await postComment(movieId, { text: commentText, rating: rating || null }, token);
      setCommentText("");
      setRating(0);
      fetchComments();
      fetchRatings();
    } catch (err) {
      console.log("Lỗi gửi bình luận:", err, err.response?.data);
      Alert.alert("Lỗi gửi bình luận", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const handleRate = async (value) => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để đánh giá!", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    try {
      await postRating(movieId, { value }, token);
      setRating(value);
      fetchRatings();
    } catch (err) {
      console.log("Lỗi gửi đánh giá:", err, err.response?.data);
      Alert.alert("Lỗi gửi đánh giá", err.response?.data?.message || "Lỗi hệ thống");
    }
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
          onError={(e) => console.log("Lỗi tải video:", e.nativeEvent.description)}
        />
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (!item) return null;

    // Xử lý danh sách thể loại
    const genresDisplay = item.movieGenre && Array.isArray(item.movieGenre)
      ? item.movieGenre.join(', ')
      : "Không có thể loại";

    return (
      <View>
        {!showTrailer && (
          <Image
            source={{ uri: item.imageUrl ? `${BASE_URL.replace('/api', '')}/Assets/Images/${item.imageUrl}` : undefined }}
            style={styles.movieImage}
            onError={() => console.log("Lỗi tải hình ảnh:", `${BASE_URL.replace('/api', '')}/Assets/Images/${item.imageUrl}`)}
          />
        )}
        {showTrailer && renderTrailer()}
        <Text style={styles.movieTitle}>{item.movieTitle || "Không có tiêu đề"}</Text>
        <Text style={styles.movieDescription}>{item.movieDescription || "Không có mô tả"}</Text>
        <Text style={styles.movieInfo}>Loại phim: {item.movieType || "Không xác định"}</Text>
        <Text style={styles.movieInfo}>Diễn viên: {item.movieActors || "Không có thông tin"}</Text>
        <Text style={styles.movieInfo}>Đạo diễn: {item.movieDirector || "Không có thông tin"}</Text>
        <Text style={styles.movieInfo}>Quốc gia: {item.movieCountry || "Không có thông tin"}</Text>
        <Text style={styles.movieInfo}>Thể loại: {genresDisplay}</Text>
        <View style={styles.ratingContainer}>
          <Text>Đánh giá: </Text>
          <Text style={styles.ratingText}>{rating.toFixed(1)} ★</Text>
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => handleRate(value)} style={[styles.rateButton, rating === value && styles.selectedRateButton]}>
                <Text style={styles.rateButtonText}>{value}★</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {!showTrailer && (
          <TouchableOpacity style={styles.playButton} onPress={handleTrailerPress}>
            <Text style={styles.playButtonText}>Xem Phim</Text>
          </TouchableOpacity>
        )}
        {episodes.length > 1 && (
          <View style={styles.episodeContainer}>
            {episodes.map((ep, idx) => (
              <TouchableOpacity
                key={ep.episodeID ? ep.episodeID.toString() : `ep_${idx}`}
                style={[styles.episodeButton, selectedEpisode?.episodeID === ep.episodeID && styles.selectedEpisodeButton]}
                onPress={() => handleEpisodeSelect(ep)}
              >
                <Text style={[styles.episodeText, selectedEpisode?.episodeID === ep.episodeID && styles.selectedEpisodeText]}>
                  Tập {idx + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>Bình luận</Text>
          {user ? (
            <View>
              <View style={styles.commentInputContainer}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Nhập bình luận..."
                  style={styles.commentInput}
                />
                <TouchableOpacity onPress={handleComment} style={styles.commentButton}>
                  <Text style={styles.commentButtonText}>Gửi</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.ratingPrompt}>Đánh giá phim (1-5 sao):</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.loginPromptButton}>
              <Text style={styles.loginPrompt}>Đăng nhập để bình luận hoặc đánh giá</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id ? item.id.toString() : `comment_${Math.random().toString()}`}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Text style={styles.commentUser}>{item.userName || "Ẩn danh"}</Text>
                <Text>{item.text || "Không có nội dung"}</Text>
                {item.rating && <Text style={styles.commentRating}>Đánh giá: {item.rating} ★</Text>}
              </View>
            )}
            style={styles.commentListContainer}
          />
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
    <FlatList
      data={movie ? [movie] : []}
      renderItem={renderItem}
      keyExtractor={(item) => item?.movieID ? item.movieID.toString() : `movie_${Date.now()}`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
              <Text style={styles.backText}>{'< Quay về Home'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text style={styles.loadingText}>Không có dữ liệu phim</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 },
  backButton: { padding: 8 },
  backText: { color: '#ff4d6d', fontWeight: 'bold' },
  movieImage: { width: "100%", height: 200 },
  movieTitle: { fontSize: 24, fontWeight: "bold", margin: 10 },
  movieDescription: { marginHorizontal: 10, color: "#333" },
  movieInfo: { marginHorizontal: 10, color: "#666" },
  ratingContainer: { flexDirection: "row", alignItems: "center", margin: 10 },
  ratingText: { fontWeight: "bold", color: "#FFD700", marginLeft: 5 },
  ratingButtons: { flexDirection: 'row', marginLeft: 10 },
  rateButton: { padding: 8, marginHorizontal: 4, backgroundColor: "#f0f0f0", borderRadius: 6 },
  selectedRateButton: { backgroundColor: "#FF6666" },
  rateButtonText: { color: "#333" },
  playButton: { backgroundColor: "#FF6666", padding: 10, margin: 10, borderRadius: 8 },
  playButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  episodeContainer: { flexDirection: "row", margin: 10, flexWrap: "wrap" },
  episodeButton: { backgroundColor: "#eee", padding: 8, borderRadius: 6, marginRight: 5, marginBottom: 5 },
  selectedEpisodeButton: { backgroundColor: "#FF6666" },
  episodeText: { color: "#333" },
  selectedEpisodeText: { color: "#fff" },
  trailerContainer: { position: "relative", marginTop: 10 },
  commentSection: { margin: 10 },
  commentTitle: { fontWeight: "bold", fontSize: 18 },
  commentInputContainer: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8 },
  commentButton: { marginLeft: 8, backgroundColor: "#FF6666", padding: 8, borderRadius: 6 },
  commentButtonText: { color: "#fff" },
  ratingPrompt: { marginTop: 10, color: "#666" },
  loginPromptButton: { padding: 8 },
  loginPrompt: { color: "#ff4d6d", textAlign: "center", fontWeight: "bold" },
  commentListContainer: { height: 200 },
  commentItem: { marginVertical: 4, padding: 8, backgroundColor: "#f9f9f9", borderRadius: 6 },
  commentUser: { fontWeight: "bold" },
  commentRating: { color: "#FFD700" },
  loadingText: { textAlign: 'center', marginVertical: 20, color: '#666' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});