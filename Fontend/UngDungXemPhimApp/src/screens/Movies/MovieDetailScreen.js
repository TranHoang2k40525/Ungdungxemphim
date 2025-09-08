import React, { useState, useEffect, useContext } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, TextInput, Alert, RefreshControl } from "react-native";
import VideoPlayer from "react-native-video-controls";
import { getMovieDetail, getEpisodes, postComment, getComments, postRating, getRatings } from "../../api/API";
import { UserContext } from "../../contexts/UserContext";

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const { user, token } = useContext(UserContext);
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMovie();
    fetchComments();
    fetchRatings();
  }, [movieId]);

  const fetchMovie = async () => {
    try {
      const res = await getMovieDetail(movieId);
      setMovie(res.data);
      if (res.data.MovieType === "Phim tập") {
        const epRes = await getEpisodes(movieId);
        setEpisodes(epRes.data.episodes);
        setSelectedEpisode(epRes.data.episodes[0]);
        setVideoUrl(epRes.data.episodes[0].videoUrl);
      } else {
        setVideoUrl(res.data.videoUrl);
      }
    } catch (err) {
      console.log("Lỗi lấy chi tiết phim:", err, err.response?.data);
      Alert.alert("Lỗi lấy chi tiết phim", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await getComments(movieId);
      setComments(res.data.comments);
    } catch (err) {
      console.log("Lỗi lấy bình luận:", err, err.response?.data);
      Alert.alert("Lỗi lấy bình luận", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await getRatings(movieId);
      setRating(res.data.rating);
    } catch (err) {
      console.log("Lỗi lấy đánh giá:", err, err.response?.data);
      Alert.alert("Lỗi lấy đánh giá", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMovie();
    await fetchComments();
    await fetchRatings();
    setRefreshing(false);
  };

  const handlePlay = () => setShowVideo(true);

  const handleEpisodeSelect = (ep) => {
    setSelectedEpisode(ep);
    setVideoUrl(ep.videoUrl);
    setShowVideo(false);
  };

  const handleComment = async () => {
    if (!user) {
      Alert.alert("Bạn cần đăng nhập để bình luận!");
      return;
    }
    try {
      await postComment(movieId, commentText, token);
      setCommentText("");
      fetchComments();
    } catch (err) {
      console.log("Lỗi gửi bình luận:", err, err.response?.data);
      Alert.alert("Lỗi gửi bình luận", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const handleRate = async (value) => {
    if (!user) {
      Alert.alert("Bạn cần đăng nhập để đánh giá!");
      return;
    }
    try {
      await postRating(movieId, value, token);
      fetchRatings();
    } catch (err) {
      console.log("Lỗi gửi đánh giá:", err, err.response?.data);
      Alert.alert("Lỗi gửi đánh giá", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {movie && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ padding: 8 }}>
              <Text style={{ color: '#ff4d6d', fontWeight: 'bold' }}>{'< Quay về Home'}</Text>
            </TouchableOpacity>
          </View>
          <Image source={{ uri: movie.ImageUrl ? `${BASE_URL.replace('/api','')}/assets/images/${movie.ImageUrl}` : undefined }} style={{ width: "100%", height: 200 }} />
          <Text style={{ fontSize: 24, fontWeight: "bold", margin: 10 }}>{movie.MovieTitle}</Text>
          <Text style={{ marginHorizontal: 10 }}>{movie.MovieDescription}</Text>
          <Text style={{ marginHorizontal: 10 }}>Diễn viên: {movie.MovieActors}</Text>
          <Text style={{ marginHorizontal: 10 }}>Đạo diễn: {movie.MovieDirector}</Text>
          <Text style={{ marginHorizontal: 10 }}>Quốc gia: {movie.MovieCountry}</Text>
          <Text style={{ marginHorizontal: 10 }}>Thể loại: {movie.MovieGenre?.join(', ')}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", margin: 10 }}>
            <Text>Đánh giá: </Text>
            <Text style={{ fontWeight: "bold", color: "#FFD700" }}>{rating} ★</Text>
            <TouchableOpacity onPress={() => handleRate(5)} style={{ marginLeft: 10 }}>
              <Text>Đánh giá 5★</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ backgroundColor: "#FF6666", padding: 10, margin: 10, borderRadius: 8 }} onPress={handlePlay}>
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Xem Phim</Text>
          </TouchableOpacity>
          {movie.MovieType === "Phim tập" && (
            <View style={{ flexDirection: "row", margin: 10 }}>
              {episodes.map((ep, idx) => (
                <TouchableOpacity
                  key={ep.id}
                  style={{
                    backgroundColor: selectedEpisode?.id === ep.id ? "#FF6666" : "#eee",
                    padding: 8,
                    borderRadius: 6,
                    marginRight: 5,
                  }}
                  onPress={() => handleEpisodeSelect(ep)}
                >
                  <Text style={{ color: selectedEpisode?.id === ep.id ? "#fff" : "#333" }}>Tập {idx + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {showVideo && (
            <VideoPlayer
              source={{ uri: selectedEpisode ? `${BASE_URL.replace('/api','')}/assets/video/${selectedEpisode.videoUrl}` : movie.videoUrl ? `${BASE_URL.replace('/api','')}/assets/video/${movie.videoUrl}` : undefined }}
              style={{ width: "100%", height: 250 }}
              fullscreen
              resizeMode="contain"
              rate={playbackRate}
              onBack={() => setShowVideo(false)}
              onRateChange={setPlaybackRate}
              disableBack={false}
              disableFullscreen={false}
              seekColor="#FF6666"
            />
          )}
          <View style={{ margin: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Bình luận</Text>
            {user ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Nhập bình luận..."
                  style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8 }}
                />
                <TouchableOpacity onPress={handleComment} style={{ marginLeft: 8, backgroundColor: "#FF6666", padding: 8, borderRadius: 6 }}>
                  <Text style={{ color: "#fff" }}>Gửi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={{ color: "#888" }}>Đăng nhập để bình luận</Text>
            )}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={{ marginVertical: 4, padding: 8, backgroundColor: "#f9f9f9", borderRadius: 6 }}>
                  <Text style={{ fontWeight: "bold" }}>{item.userName}</Text>
                  <Text>{item.text}</Text>
                </View>
              )}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
