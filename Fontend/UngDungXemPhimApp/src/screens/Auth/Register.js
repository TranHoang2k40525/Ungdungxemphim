import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { api } from "../../api/API";
import Icon from "react-native-vector-icons/FontAwesome";
import logo from '../../assets/images/icon.png';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

export default function Register({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState(null);

  const pickAvatar = async () => {
    let result = await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !gender) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      let avatarData = null;
      if (avatar && avatar.uri) {
        const response = await fetch(avatar.uri);
        const blob = await response.blob();
        avatarData = await blob.arrayBuffer();
      }
      // Chuyển birthday về đúng kiểu date yyyy-MM-dd
      let birthdayValue = birthday ? new Date(birthday).toISOString().slice(0, 10) : null;
      await api.post("/auth/register", { name, phone, email, password, birthday: birthdayValue, gender, location, avatar: avatarData });
      Alert.alert("Đăng ký thành công!", "Bạn có thể đăng nhập.");
      navigation.replace("Login");
    } catch (err) {
      console.log("Lỗi đăng ký:", err, err.response?.data);
      Alert.alert("Đăng ký thất bại", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={avatar ? { uri: avatar.uri } : logo} style={styles.logo} />
        <TouchableOpacity style={styles.avatarEdit} onPress={pickAvatar}>
          <Icon name="camera" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>MTB 67CS1</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Đăng ký</Text>
      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} placeholder="Nhập họ và tên" value={name} onChangeText={setName} />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} placeholder="Nhập số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} placeholder="Nhập email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Mật khẩu <Text style={styles.required}>*</Text></Text>
          <View style={styles.passwordRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Nhập mật khẩu" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputRow2}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={birthday} onChangeText={setBirthday} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Giới tính <Text style={styles.required}>*</Text></Text>
            <View style={styles.genderRow}>
              <TouchableOpacity style={[styles.genderBtn, gender === 'Nam' && styles.genderSelected]} onPress={() => setGender('Nam')}><Text style={styles.genderText}>Nam</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.genderBtn, gender === 'Nữ' && styles.genderSelected]} onPress={() => setGender('Nữ')}><Text style={styles.genderText}>Nữ</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.genderBtn, gender === 'Khác' && styles.genderSelected]} onPress={() => setGender('Khác')}><Text style={styles.genderText}>Khác</Text></TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Khu vực</Text>
          <TextInput style={styles.input} placeholder="Khu vực" value={location} onChangeText={setLocation} />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 0 },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#ff4d6d", paddingVertical: 10, paddingHorizontal: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  logo: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  avatarEdit: { position: 'absolute', left: 32, top: 32, backgroundColor: '#ff4d6d', borderRadius: 16, padding: 4, zIndex: 2 },
  headerText: { flex: 1, fontSize: 18, fontWeight: "bold", color: "#fff" },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: "bold", color: "#ff4d6d", alignSelf: "center", marginVertical: 12 },
  form: { paddingHorizontal: 24, marginTop: 8 },
  inputRow: { marginBottom: 16 },
  inputRow2: { flexDirection: "row", marginBottom: 16 },
  label: { fontSize: 15, color: "#333", marginBottom: 4 },
  required: { color: "#ff4d6d" },
  input: { borderBottomWidth: 1, borderColor: "#ccc", borderRadius: 0, padding: 10, fontSize: 15, backgroundColor: "#fff" },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { padding: 8 },
  button: { backgroundColor: "#ff4d6d", padding: 14, borderRadius: 24, alignItems: "center", marginTop: 24, shadowColor: "#ff4d6d", shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  genderRow: { flexDirection: 'row', marginTop: 4 },
  genderBtn: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', marginHorizontal: 2 },
  genderSelected: { backgroundColor: '#ff4d6d', borderColor: '#ff4d6d' },
  genderText: { color: '#333', fontWeight: 'bold' },
});
