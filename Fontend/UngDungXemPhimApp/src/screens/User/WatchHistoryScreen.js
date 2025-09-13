import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { getWatchHistory } from "../../api/API";
import { UserContext } from "../../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function WatchHistoryScreen() {
  const { user, token } = useContext(UserContext);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (user && token) {
      fetchHistory();
    }
  }, [user, token]);

  const fetchHistory = async () => {
    try {
      const res = await getWatchHistory(token);
      setHistory(res.data.history || []);
    } catch (err) {
      console.log("Lỗi lấy lịch sử xem phim:", err, err.response?.data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MovieDetailScreen', { movieId: item.movieId })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.title || "Không có tiêu đề"}</Text>
        <Text style={styles.type}>Loại: {item.type || "Không xác định"}</Text>
        <Text style={styles.genre}>Thể loại: {item.genres?.join(", ") || "Không có"}</Text>
        <Text style={styles.time}>Thời gian xem: {item.watchedAt ? new Date(item.watchedAt).toLocaleString() : "Không rõ"}</Text>
        <Text style={styles.episode}>Tập: {item.episode || "Phim lẻ"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Text style={{ color: '#ff4d6d', fontWeight: 'bold' }}>{'< Quay lại'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Lịch sử xem phim của {user?.FullName}</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <Text style={styles.noHistory}>Bạn chưa xem phim nào.</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { flexDirection: "row", marginBottom: 12, backgroundColor: "#f9f9f9", borderRadius: 8, padding: 8 },
  image: { width: 80, height: 80, borderRadius: 8 },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 16, fontWeight: "bold" },
  type: { color: "#888", marginTop: 4 },
  genre: { color: "#666", marginTop: 2 },
  time: { color: "#888", marginTop: 2 },
  episode: { color: "#FF6666", marginTop: 2 },
  noHistory: { textAlign: "center", color: "#666", fontSize: 16, marginVertical: 20 },
});