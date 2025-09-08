import React, { useContext, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { UserContext } from "../../contexts/UserContext";
import icon from '../../assets/images/icon.png';
import { api } from "../../api/API";
import * as ImagePicker from 'expo-image-picker';

export default function Profile({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [avatar, setAvatar] = useState(user?.Avatar ? `data:image/png;base64,${user.Avatar}` : null);

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const img = result.assets[0];
      setAvatar(img.uri);
      // Gửi lên backend
      const response = await fetch(img.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      await api.put(`/users/${user.id}`, { ...user, Avatar: arrayBuffer });
      setUser({ ...user, Avatar: arrayBuffer });
      Alert.alert("Cập nhật ảnh đại diện thành công!");
    }
  };

  const handleLogout = async () => {
    setUser(null);
    navigation.replace("Home");
  };

  if (!user) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#ff4d6d" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Thành viên MTB</Text>
        <TouchableOpacity onPress={() => navigation.navigate('WatchHistoryScreen')} style={styles.menuBtn}>
          <Icon name="history" size={24} color="#ff4d6d" />
        </TouchableOpacity>
      </View>
      <View style={styles.avatarSection}>
        <Image source={avatar ? { uri: avatar } : icon} style={styles.avatar} />
        <TouchableOpacity style={styles.avatarEdit} onPress={pickAvatar}>
          <Icon name="camera" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.id}>ID: {user.id}</Text>
      </View>
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="list" size={20} color="#ff4d6d" style={styles.menuIcon} />
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
  avatarEdit: { position: 'absolute', left: 60, top: 60, backgroundColor: '#ff4d6d', borderRadius: 16, padding: 4, zIndex: 2 },
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
