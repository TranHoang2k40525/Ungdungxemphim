import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from "react-native";
import { getWatchHistory, BASE_URL } from "../../api/API";
import { UserContext } from "../../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function WatchHistoryScreen() {
  const { user, token } = useContext(UserContext);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (user && token) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchHistory = async () => {
    try {
      console.log("=== FETCH WATCH HISTORY ===");
      console.log("User:", user?.FullName);
      console.log("Token exists:", !!token);
      
      const res = await getWatchHistory(token);
      
      console.log("API Response status:", res.status);
      console.log("API Response data:", res.data);
      
      // Xử lý response data - API trả về array trực tiếp
      let historyData = [];
      
      if (res.data) {
        if (Array.isArray(res.data)) {
          historyData = res.data;
        } else if (res.data.history) {
          historyData = res.data.history;
        } else if (res.data.data && res.data.data.history) {
          historyData = res.data.data.history;
        }
      }
      
      console.log("Processed history data:", historyData);
      console.log("History count:", historyData.length);
      
      setHistory(historyData);
    } catch (err) {
      console.log("=== WATCH HISTORY ERROR ===");
      console.log("Error:", err.message);
      console.log("Status:", err.response?.status);
      console.log("Response data:", err.response?.data);
      
      setHistory([]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    // Lấy tên phim từ nested object
    const movieTitle = item.episode?.movie?.title || "Không có tên phim";
    const episodeTitle = item.episode?.title || "Phim lẻ";
    const episodeNumber = item.episode?.episodeNumber;
    const imagePath = item.episode?.movie?.imagePath;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MovieDetailScreen', { movieId: item.movieID })}
      >
        <Image 
          source={{ 
            uri: imagePath 
              ? `${BASE_URL.replace('/api', '')}/Assets/Images/${imagePath}`
              : 'https://via.placeholder.com/80x80?text=No+Image'
          }} 
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{movieTitle}</Text>
          <Text style={styles.episode}>
            {episodeNumber > 1 ? `Tập ${episodeNumber}` : "Phim lẻ"}
          </Text>
          <Text style={styles.time}>
            Xem lúc: {new Date(item.watchedDate).toLocaleString('vi-VN')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>{'< Quay lại'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6666" />
          <Text style={styles.loadingText}>Đang tải lịch sử xem phim...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'< Quay lại'}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.title}>Lịch sử xem phim của {user?.FullName}</Text>
      
      <FlatList
        data={history}
        keyExtractor={(item, index) => item.historyID ? item.historyID.toString() : `history_${index}`}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.centerContainer}>
            <Text style={styles.noHistory}>Bạn chưa xem phim nào.</Text>
            <TouchableOpacity onPress={fetchHistory} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tải lại</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 10 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  backButton: { 
    padding: 8 
  },
  backText: { 
    color: '#ff4d6d', 
    fontWeight: 'bold' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 50
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  card: { 
    flexDirection: "row", 
    marginBottom: 12, 
    backgroundColor: "#f9f9f9", 
    borderRadius: 8, 
    padding: 8 
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: 8 
  },
  info: { 
    flex: 1, 
    marginLeft: 10 
  },
  name: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  type: { 
    color: "#888", 
    marginTop: 4 
  },
  genre: { 
    color: "#666", 
    marginTop: 2 
  },
  time: { 
    color: "#888", 
    marginTop: 2 
  },
  episode: { 
    color: "#FF6666", 
    marginTop: 2,
    fontWeight: "bold"
  },
  description: {
    color: "#666",
    marginTop: 2,
    fontSize: 12
  },
  noHistory: { 
    textAlign: "center", 
    color: "#666", 
    fontSize: 16, 
    marginBottom: 20 
  },
  loadingText: { 
    textAlign: "center", 
    color: "#666", 
    fontSize: 16, 
    marginTop: 10 
  },
  retryButton: { 
    backgroundColor: "#FF6666", 
    padding: 12, 
    borderRadius: 8,
    marginTop: 10
  },
  retryButtonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
});
