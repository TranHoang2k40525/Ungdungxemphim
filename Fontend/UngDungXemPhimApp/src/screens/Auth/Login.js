import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image,
  Dimensions,
  StatusBar 
} from "react-native";
import { UserContext } from "../../contexts/UserContext";
import { api } from "../../api/API";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/FontAwesome";

const { width, height } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setUser: updateUser } = useContext(UserContext); // Sử dụng updateUser từ UserProvider

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token } = res.data; // Giả sử backend trả về { user, token }
      await updateUser(user, token); // Lưu user và token vào context và AsyncStorage
      navigation.replace("Home");
    } catch (err) {
      console.log("Lỗi đăng nhập:", err, err.response?.data);
      Alert.alert("Đăng nhập thất bại", err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1a1a2e" barStyle="light-content" />
      
      {/* Header với background gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="arrow-left" size={20} color="#fff" />
            <Text style={styles.backText}>Đăng Nhập</Text>
          </TouchableOpacity>
        </View>
        
        {/* Movie poster card */}
        <View style={styles.posterContainer}>
          <View style={styles.posterCard}>
            <View style={styles.posterInner}>
              <Text style={styles.movieTitle}>Kho Phim</Text>
              <Text style={styles.movieCode}>MTB_67CS</Text>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Icon name="film" size={24} color="#ff4d6d" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email hoặc số điện thoại"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Mật khẩu"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? "eye" : "eye-slash"} 
                size={18} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu ?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerButtonText}>Đăng ký tài khoản MTB 67CS1</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: height * 0.25,
    backgroundColor: "#1a1a2e",
    position: "relative",
    overflow: "hidden",
  },
  headerContent: {
    paddingTop: StatusBar.currentHeight || 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  posterContainer: {
    position: "absolute",
    bottom: -50,
    left: width * 0.15,
    right: width * 0.15,
    alignItems: "center",
  },
  posterCard: {
    width: width * 0.4,
    height: width * 0.4 * 1.1,
    backgroundColor: "#ff4d6d",
    borderRadius: 15,
    padding: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  posterInner: {
    flex: 1,
    backgroundColor: "#ff4d6d",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  movieTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  movieCode: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 20,
  },
  logoContainer: {
    position: "absolute",
    bottom: 10,
    right: 5,
  },
  logo: {
    width: 35,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    bottom: 15,
    padding: 5,
  },
  loginButton: {
    backgroundColor: "#ff4d6d",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowColor: "#ff4d6d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#999",
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    color: "#999",
    marginHorizontal: 15,
    fontSize: 13,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: "#ff4d6d",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 30,
  },
  registerButtonText: {
    color: "#ff4d6d",
    fontSize: 13,
    fontWeight: "600",
  },
});