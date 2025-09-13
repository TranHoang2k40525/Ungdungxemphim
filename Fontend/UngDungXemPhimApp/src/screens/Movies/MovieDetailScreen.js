import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, TextInput, Alert, RefreshControl, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from 'expo-screen-orientation';
import { getMovieDetail, getEpisodes, postComment, getComments, postRating, getRatings, deleteComment, BASE_URL } from "../../api/API";
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
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [showDeleteButton, setShowDeleteButton] = useState({});
  const scrollViewRef = useRef(null);
  const existingCommentIds = useRef(new Set());

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

    await fetchComments(true);
    await fetchRatings();
  };

  const fetchComments = async (reset = false) => {
    try {
      const page = reset ? 1 : commentPage;
      const res = await getComments(movieId, page, 10); // pageSize=10
      const newComments = res.data.comments || [];
      console.log("New comments fetched:", newComments);
      if (reset) {
        existingCommentIds.current = new Set(newComments.map(c => c.id));
        setComments(newComments);
        setShowDeleteButton({});
      } else {
        const filteredNewComments = newComments.filter(c => !existingCommentIds.current.has(c.id));
        filteredNewComments.forEach(c => existingCommentIds.current.add(c.id));
        setComments(prevComments => [...prevComments, ...filteredNewComments]);
      }
      setHasMoreComments(newComments.length === 10);
      setCommentPage(page + 1);
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
    console.log("Đường dẫn video khi nhấn xem:", `${BASE_URL.replace('/api', '')}/Assets/Video/${videoUrl}`);
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
    console.log("Đường dẫn video tập được chọn:", `${BASE_URL.replace('/api', '')}/Assets/Video/${ep.videoPath}`);
  };

  const handleComment = async () => {
    if (!user || !token) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để bình luận!", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    if (!commentText && rating === 0) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung bình luận hoặc chọn đánh giá!");
      return;
    }
    try {
      if (commentText) {
        console.log("Gửi bình luận với dữ liệu:", { text: commentText });
        await postComment(movieId, commentText, token);
      }
      if (rating > 0) {
        console.log("Gửi đánh giá với dữ liệu:", { value: rating });
        await postRating(movieId, rating, token);
      }
      setCommentText("");
      setRating(0);
      await fetchComments(true);
      await fetchRatings();
    } catch (err) {
      console.log("Lỗi gửi bình luận/đánh giá:", err, err.response?.data);
      Alert.alert("Lỗi gửi bình luận/đánh giá", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user || !token) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để xóa bình luận!", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa bình luận này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Xóa bình luận với ID:", commentId);
              await deleteComment(movieId, commentId, token);
              existingCommentIds.current.delete(commentId);
              setShowDeleteButton(prev => ({ ...prev, [commentId]: false }));
              await fetchComments(true);
              Alert.alert("Thành công", "Bình luận đã được xóa.");
            } catch (err) {
              console.log("Lỗi xóa bình luận:", err, err.response?.data);
              Alert.alert("Lỗi xóa bình luận", err.response?.data?.message || "Lỗi hệ thống");
            }
          }
        }
      ]
    );
  };

  const handleRating = async (value) => {
    setRating(value);
  };

  const loadMoreComments = () => {
    if (hasMoreComments) {
      console.log("Loading more comments, page:", commentPage);
      fetchComments();
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
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>Đánh giá: {rating ? rating.toFixed(1) : 0} ★</Text>
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={[styles.rateButton, rating === star && styles.selectedRateButton]}
                onPress={() => handleRating(star)}
              >
                <Text style={styles.rateButtonText}>{star} ★</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>Bình luận</Text>
          {user ? (
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
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.loginPromptButton}>
              <Text style={styles.loginPrompt}>Đăng nhập để bình luận hoặc đánh giá</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.ratingPrompt}>Đánh giá phim (1-5 sao):</Text>
          <View style={styles.commentListInnerContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.commentList}
              contentContainerStyle={styles.commentListContent}
              showsVerticalScrollIndicator={true}
              onMomentumScrollEnd={({ nativeEvent }) => {
                const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
                console.log("ScrollView:", { contentOffset, contentSize, layoutMeasurement });
                if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 20) {
                  loadMoreComments();
                }
              }}
              nestedScrollEnabled={true}
              bounces={true}
            >
              {comments.map((item) => (
                <TouchableOpacity
                  key={item.id ? item.id.toString() : `comment_${Math.random().toString()}`}
                  style={styles.commentItem}
                  onLongPress={() => {
                    console.log("onLongPress triggered", { user, userId: item.userId, commentId: item.id });
                    if (user && item.userId === user.id) {
                      setShowDeleteButton(prev => ({ ...prev, [item.id]: true }));
                    }
                  }}
                  delayLongPress={5000}
                >
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{item.userName || "Ẩn danh"}</Text>
                    {user && item.userId === user.id && showDeleteButton[item.id] && (
                      <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#FF6666" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.commentText}>{item.text || "Không có nội dung"}</Text>
                  {item.rating && <Text style={styles.commentRating}>Đánh giá: {item.rating} ★</Text>}
                </TouchableOpacity>
              ))}
              {hasMoreComments && <ActivityIndicator size="small" color="#FF6666" style={styles.loadingIndicator} />}
            </ScrollView>
          </View>
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
  flatListContent: { paddingBottom: 80 }, // Tăng paddingBottom cho thiết bị tràn viền
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 },
  backButton: { padding: 8 },
  backText: { color: '#ff4d6d', fontWeight: 'bold' },
  movieImage: { width: "100%", height: 200, resizeMode: 'cover' },
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
  commentSection: { margin: 10, paddingBottom: 20 },
  commentTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 10 },
  commentInputContainer: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8 },
  commentButton: { marginLeft: 8, backgroundColor: "#FF6666", padding: 8, borderRadius: 6 },
  commentButtonText: { color: "#fff" },
  ratingPrompt: { marginTop: 10, marginBottom: 10, color: "#666" },
  loginPromptButton: { padding: 8 },
  loginPrompt: { color: "#ff4d6d", textAlign: "center", fontWeight: "bold" },
  commentListInnerContainer: {
    height: 400, // Chiều cao cố định cho khung trong
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    padding: 10, // Padding để nội dung không sát viền
    overflow: 'hidden', // Cắt nội dung tràn ra ngoài
  },
  commentListContent: { paddingBottom: 20 }, // Khoảng trống khi cuộn
  commentList: { 
    flexGrow: 0, // Ngăn ScrollView mở rộng quá khung cha
    width: '100%', // Giới hạn chiều rộng
  },
  commentItem: { 
    marginVertical: 4, 
    padding: 8, 
    backgroundColor: "#fff", 
    borderRadius: 6, 
    width: '100%', // Đảm bảo không tràn chiều rộng
    flexShrink: 1, // Co lại nếu nội dung quá dài
  },
  commentHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4,
    flexWrap: 'wrap', // Đảm bảo header không tràn
  },
  commentUser: { 
    fontWeight: "bold", 
    flex: 1,
    flexWrap: 'wrap', // Đảm bảo tên người dùng xuống dòng
  },
  commentText: { 
    color: "#333", 
    flexWrap: 'wrap', // Văn bản tự xuống dòng
    maxWidth: '100%', // Giới hạn chiều rộng văn bản
  },
  commentRating: { 
    color: "#FFD700", 
    marginTop: 4,
  },
  loadingText: { textAlign: 'center', marginVertical: 20, color: '#666' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingIndicator: { marginVertical: 10 },
});