import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { getMovies } from "../../api/API";
import { UserContext } from "../../contexts/UserContext";
import icon from '../../assets/images/icon.png';

const genres = [
  { label: "Thể Loại", value: "all" },
  { label: "Phim bộ", value: "series" },
  { label: "Phim lẻ", value: "single" },
  { label: "Lịch sử", value: "history" },
];

export default function Home({ navigation }) {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, [user, selectedGenre]);

  useEffect(() => {
    if (!loading && movies.length === 0) {
      Alert.alert("Không có phim nào được hiển thị!", "Vui lòng kiểm tra lại dữ liệu hoặc thử làm mới.");
      console.log("Không có phim nào hiển thị trên giao diện, movies:", movies);
    }
  }, [loading, movies]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const config = selectedGenre !== "all" ? { params: { filter: selectedGenre } } : {};
      const res = await getMovies(config);
      if (res.data.movies && res.data.movies.length > 0) {
        setMovies(res.data.movies);
      } else {
        setMovies([]);
        console.log("Không có phim trả về từ backend:", res.data);
        Alert.alert("Không có dữ liệu phim từ backend!");
      }
    } catch (err) {
      setMovies([]);
      console.log("Lỗi kết nối backend:", err);
      Alert.alert("Lỗi mạng hoặc không kết nối được backend!\n" + err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMovies();
    setRefreshing(false);
  };

  const handleProfile = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      navigation.navigate("Profile");
    }
  };

  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleGenre = (genre) => {
    setSelectedGenre(genre);
    setShowMenu(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigation.replace("Login");
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.MovieTitle?.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMovie = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetailScreen', { movieId: item.MovieID })}>
      <View style={styles.movieCard}>
        <Image source={item.ImageUrl ? { uri: `${BASE_URL.replace('/api','')}/Assets/Images/${item.ImageUrl}` } : require("../../assets/images/icon.png")} style={styles.movieImage} />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>{item.MovieTitle}</Text>
          <Text style={styles.movieDirector}>Đạo diễn: {item.MovieDirector}</Text>
          <Text style={styles.movieGenre}>Thể loại: {item.MovieGenre?.join(', ')}</Text>
          <Text style={styles.movieCountry}>Quốc gia: {item.MovieCountry}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMenu} style={styles.menuButton}>
          <Icon name="bars" size={28} color="#ff4d6d" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Trang chủ</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('WatchHistoryScreen')} style={{ marginRight: 10 }}>
            <Icon name="history" size={28} color="#ff4d6d" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleProfile} style={styles.avatarButton}>
            <Image source={user && user.avatarUrl ? { uri: user.avatarUrl } : icon} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal xác nhận đăng nhập */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 24, alignItems: "center", width: 280 }}>
            <Text style={{ fontSize: 18, color: "#ff4d6d", fontWeight: "bold", marginBottom: 16 }}>Bạn có muốn đăng nhập không?</Text>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity onPress={handleLoginConfirm} style={{ backgroundColor: "#ff4d6d", padding: 10, borderRadius: 8, marginRight: 10 }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Có</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLoginCancel} style={{ backgroundColor: "#eee", padding: 10, borderRadius: 8 }}>
                <Text style={{ color: "#333" }}>Không</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Search box */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phim..."
          value={searchText}
          onChangeText={handleSearch}
        />
        <Icon name="search" size={22} color="#888" style={styles.searchIcon} />
      </View>
      {/* Menu thể loại */}
      <Modal visible={showMenu} transparent animationType="fade">
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            {genres.map((g) => (
              <TouchableOpacity key={g.value} style={styles.menuItem} onPress={() => handleGenre(g.value)}>
                <Text style={styles.menuItemText}>{g.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.menuClose} onPress={handleMenu}>
              <Text style={styles.menuCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Danh sách phim */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff4d6d" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={movies}
            keyExtractor={(item, idx) => (item?.MovieID ? item.MovieID.toString() : idx.toString())}
            renderItem={renderMovie}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={<Text style={styles.noMoviesText}>Không có phim nào được hiển thị!</Text>}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#ff4d6d" },
  menuButton: { padding: 8 },
  avatarButton: { padding: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#eee" },
  searchContainer: { flexDirection: "row", alignItems: "center", margin: 16, backgroundColor: "#ffe6ec", borderRadius: 10, paddingHorizontal: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333", paddingVertical: 10 },
  searchIcon: { marginLeft: 8 },
  list: { padding: 16 },
  movieCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 10, marginBottom: 20, elevation: 2, shadowColor: "#ccc", shadowOpacity: 0.2, shadowRadius: 4 },
  movieImage: { width: 100, height: 140, borderRadius: 8, margin: 10 },
  movieInfo: { flex: 1, justifyContent: "center", padding: 10 },
  movieTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  movieDirector: { fontSize: 14, color: "#666", marginTop: 4 },
  movieGenre: { fontSize: 14, color: "#666", marginTop: 2 },
  watchButton: { backgroundColor: "#ff4d6d", padding: 10, borderRadius: 8, marginTop: 10, alignItems: "center" },
  watchButtonText: { color: "#fff", fontWeight: "bold" },
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  menuContent: { backgroundColor: "#fff", borderRadius: 10, padding: 20, width: 220, alignItems: "center" },
  menuItem: { padding: 12, width: "100%", alignItems: "center" },
  menuItemText: { fontSize: 16, color: "#333" },
  menuClose: { marginTop: 10, padding: 8 },
  menuCloseText: { color: "#ff4d6d", fontWeight: "bold" },
  listContainer: { flex: 1 },
  movieDate: { fontSize: 14, color: "#666", marginTop: 2 },
  noMoviesText: { textAlign: "center", color: "#666", marginTop: 20 },
  movieCountry: { fontSize: 14, color: "#666", marginTop: 2 },
});