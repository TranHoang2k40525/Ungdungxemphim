import React, { useContext, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { UserContext } from "../../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function Profile({ navigation: propNavigation }) {
  const { user, setUser: updateUser } = useContext(UserContext);
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState(user?.Avatar ? `data:image/png;base64,${user.Avatar}` : null);

  const handleLogout = async () => {
    updateUser(null, null);
    propNavigation.replace("Home");
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => propNavigation.navigate('Home')} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#ff4d6d" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Thành viên MTB</Text>
        <TouchableOpacity style={styles.menuBtn} />
      </View>
      <View style={styles.avatarSection}>
        <Image
          source={avatar ? { uri: avatar } : require('../../assets/images/icon.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.FullName}</Text>
        <Text style={styles.id}>ID: {user.UserID}</Text>
      </View>
      <View style={styles.menuList}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('WatchHistoryScreen')}
        >
          <Icon name="history" size={20} color="#ff4d6d" style={styles.menuIcon} />
          <Text style={styles.menuText}>Lịch sử xem phim</Text>
          <Icon name="chevron-right" size={18} color="#ff4d6d" style={styles.menuArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="user" size={20} color="#ff4d6d" style={styles.menuIcon} />
          <Text style={styles.menuText}>Thông tin tài khoản</Text>
          <Icon name="chevron-right" size={18} color="#ff4d6d" style={styles.menuArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="lock" size={20} color="#ff4d6d" style={styles.menuIcon} />
          <Text style={styles.menuText}>Thay đổi mật khẩu</Text>
          <Icon name="chevron-right" size={18} color="#ff4d6d" style={styles.menuArrow} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#fff" },
  headerText: { flex: 1, fontSize: 16, fontWeight: "bold", color: "#ff4d6d", textAlign: "center" },
  backBtn: { padding: 8 },
  menuBtn: { padding: 8 },
  avatarSection: { alignItems: "center", marginTop: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  id: { backgroundColor: "#ff4d6d", color: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 2, marginTop: 4, fontWeight: "bold" },
  menuList: { marginTop: 24, borderTopWidth: 1, borderColor: "#eee" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: "#eee" },
  menuIcon: { marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: "#333" },
  menuArrow: {},
  logoutBtn: { backgroundColor: "#ff4d6d", padding: 14, borderRadius: 24, alignItems: "center", margin: 24, shadowColor: "#ff4d6d", shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});