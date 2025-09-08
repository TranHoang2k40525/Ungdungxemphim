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
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await getWatchHistory(token);
      setHistory(res.data.history);
    } catch (err) {
      console.log("Lỗi lấy lịch sử xem phim:", err, err.response?.data);
      // Có thể hiển thị Alert nếu muốn
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ padding: 8 }}>
          <Text style={{ color: '#ff4d6d', fontWeight: 'bold' }}>{'< Quay về Home'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Lịch sử xem phim</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.time}>Thời gian xem: {item.watchedAt}</Text>
              <Text style={styles.episode}>Tập: {item.episode || "Phim lẻ"}</Text>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  time: { color: "#888", marginTop: 4 },
  episode: { color: "#FF6666", marginTop: 2 },
});
