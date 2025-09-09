import React, { useState, useEffect, useContext, useRef } from "react";
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
  ScrollView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { getMovies,BASE_URL } from "../../api/API";
import { UserContext } from "../../contexts/UserContext";
import icon from '../../assets/images/icon.png';

const { width } = Dimensions.get('window');

const genres = [
  { label: "Thể Loại", value: "all" },
  { label: "Phim bộ", value: "series" },
  { label: "Phim lẻ", value: "single" },
  { label: "Lịch sử", value: "history" },
];

export default function Home({ navigation }) {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchMovies();
  }, [user, selectedGenre]);

  useEffect(() => {
    if (!loading && movies.length === 0) {
      Alert.alert("Không có phim nào được hiển thị!", "Vui lòng kiểm tra lại dữ liệu hoặc thử làm mới.");
      console.log("Không có phim nào hiển thị trên giao diện, movies:", movies);
    }
  }, [loading, movies]);

  useEffect(() => {
    // Scroll to top when currentPage changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [currentPage]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const config = selectedGenre !== "all" ? { params: { filter: selectedGenre } } : {};
      const res = await getMovies(config);
      if (res.data.movies && res.data.movies.length > 0) {
        setMovies(res.data.movies);
        setFeaturedMovies(res.data.movies.slice(0, 5));
      } else {
        setMovies([]);
        setFeaturedMovies([]);
        console.log("Không có phim trả về từ backend:", res.data);
        Alert.alert("Không có dữ liệu phim từ backend!");
      }
    } catch (err) {
      setMovies([]);
      setFeaturedMovies([]);
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
    setCurrentPage(1);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setCurrentPage(1);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigation.replace("Login");
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.movieTitle?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderFeaturedMovie = ({ item }) => {
    const imageName = item.imageUrl ? item.imageUrl.split("\\").pop() : null;
    const imageUri = imageName
      ? `http://10.141.245.76:5016/Assets/Images/${imageName}`
      : require("../../assets/images/icon.png");

    return (
      <TouchableOpacity 
        style={styles.featuredCard}
        onPress={() => navigation.navigate('MovieDetailScreen', { movieId: item.movieID })}
      >
        <Image
          source={imageName ? { uri: imageUri } : require("../../assets/images/icon.png")}
          style={styles.featuredImage}
        />
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredTitle} numberOfLines={2}>{item.movieTitle}</Text>
          <Text style={styles.featuredGenre}>{item.movieType}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMovie = ({ item }) => {
    const imageName = item.imageUrl ? item.imageUrl.split("\\").pop() : null;
    const imageUri = imageName
      ? `http://10.141.245.76:5016/Assets/Images/${imageName}`
      : require("../../assets/images/icon.png");

    return (
      <TouchableOpacity 
        style={styles.movieCard}
        onPress={() => navigation.navigate('MovieDetailScreen', { movieId: item.movieID })}
      >
        <Image
          source={imageName ? { uri: imageUri } : require("../../assets/images/icon.png")}
          style={styles.movieImage}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>{item.movieTitle}</Text>
          <Text style={styles.movieDetail} numberOfLines={1}>Đạo diễn: {item.movieDirector}</Text>
          <Text style={styles.movieDetail} numberOfLines={1}>Thể loại: {item.movieType}</Text>
          <Text style={styles.movieDetail} numberOfLines={1}>Quốc gia: {item.movieCountry}</Text>
          <Text style={styles.movieDetail} numberOfLines={1}>Diễn viên: {item.movieActors}</Text>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={12} color="#fff" />
            <Text style={styles.playButtonText}>Xem Phim</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Trang chủ</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('WatchHistoryScreen')} style={styles.iconButton}>
            <Icon name="history" size={24} color="#ff4d6d" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleProfile} style={styles.avatarButton}>
            <Image source={user && user.avatarUrl ? { uri: user.avatarUrl } : icon} style={styles.avatar} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMenu} style={styles.menuButton}>
            <Icon name="bars" size={24} color="#ff4d6d" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Bạn có muốn đăng nhập không?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleLoginConfirm} style={[styles.modalButton, styles.confirmButton]}>
                <Text style={styles.confirmButtonText}>Có</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLoginCancel} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Không</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phim..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} onPress={handleMenu}>
          <View style={styles.menuContent}>
            {genres.map((g) => (
              <TouchableOpacity 
                key={g.value} 
                style={[
                  styles.menuItem,
                  selectedGenre === g.value && styles.selectedMenuItem
                ]} 
                onPress={() => handleGenre(g.value)}
              >
                <Text style={[
                  styles.menuItemText,
                  selectedGenre === g.value && styles.selectedMenuItemText
                ]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d6d" />
          <Text style={styles.loadingText}>Đang tải phim...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phim Nổi Bật</Text>
            <FlatList
              data={featuredMovies}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, idx) => `featured_${item?.movieID || idx}`}
              renderItem={renderFeaturedMovie}
              contentContainerStyle={styles.featuredList}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tất Cả Phim</Text>
            {paginatedMovies.length === 0 ? (
              <Text style={styles.noMoviesText}>Không có phim nào được hiển thị!</Text>
            ) : (
              paginatedMovies.map((item, index) => (
                <View key={`movie_${item?.movieID || index}`}>
                  {renderMovie({ item })}
                </View>
              ))
            )}
            {filteredMovies.length > moviesPerPage && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                  onPress={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <Icon name="chevron-left" size={14} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>
                  Trang {currentPage}/{totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <Icon name="chevron-right" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#efededff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff4d6d",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginRight: 10,
  },
  avatarButton: {
    marginRight: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#f0f0f0",
  },
  menuButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    backgroundColor: "#e4e4e4ff",
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 1,
    shadowColor: "#ffffffff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#817979ff",
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8a8a8aff",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  featuredList: {
    paddingHorizontal: 15,
  },
  featuredCard: {
    width: width * 0.45,
    height: 200,
    marginHorizontal: 5,
    borderRadius: 5,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#bababaff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  featuredGenre: {
    color: "#ff4d6d",
    fontSize: 12,
  },
  movieCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
  },
  movieImage: {
    width: 100,
    height: 130,
    resizeMode: "cover",
  },
  movieInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  movieDetail: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4d6d",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },
  menuContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    minWidth: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectedMenuItem: {
    backgroundColor: "#ffe6ec",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedMenuItemText: {
    color: "#ff4d6d",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    width: width * 0.8,
    maxWidth: 300,
  },
  modalText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#ff4d6d",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButtonText: {
    color: "#ffffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noMoviesText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginVertical: 30,
    fontStyle: "italic",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 15,
  },
  paginationButton: {
    backgroundColor: "#ff4d6d",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  pageIndicator: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});
